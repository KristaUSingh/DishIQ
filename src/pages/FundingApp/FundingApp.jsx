import React, { useState, useRef, useEffect } from 'react';
import { CreditCard, Wallet, AlertTriangle, CheckCircle, Banknote, Landmark } from 'lucide-react';
import { supabase } from '../../api/supabaseClient'; // Make sure this path is correct

const fundingMethods = [
  { key: 'debit', label: 'Debit Card', icon: CreditCard },
  { key: 'credit', label: 'Credit Card', icon: CreditCard },
  { key: 'bank', label: 'Bank Transfer (ACH)', icon: Banknote },
];

const App = () => {
  const numberInputRef = useRef(null);
  const expiryInputRef = useRef(null);

  const [balance, setBalance] = useState(0.00);
  const [amountInCents, setAmountInCents] = useState('');
  const [selectedMethod, setSelectedMethod] = useState('debit'); 
  const [cardDetails, setCardDetails] = useState({ number: '', expiry: '', cvc: '', name: '' });
  const [bankDetails, setBankDetails] = useState({ routing: '', account: '' });
  const [message, setMessage] = useState({ type: '', text: '' });

  const auth = JSON.parse(localStorage.getItem('auth'));

  // Load current balance on mount
  useEffect(() => {
    const fetchBalance = async () => {
      if (!auth?.user_id) return;

      const { data, error } = await supabase
        .from("finance")
        .select("balance")
        .eq("customer_id", auth.user_id)
        .single();

      if (!error) {
        setBalance(data?.balance ?? 0);
      }
    };

    fetchBalance();
  }, []);

  const formatCentsToDisplay = (centsString) => {
    if (!centsString || centsString.length === 0) return '0.00';
    const len = centsString.length;
    let paddedValue = centsString;
    if (len < 3) paddedValue = '0'.repeat(3 - len) + centsString;
    const dollars = paddedValue.slice(0, -2);
    const cents = paddedValue.slice(-2);
    const displayDollars = dollars === '0' ? '0' : String(parseInt(dollars, 10));
    return `${displayDollars}.${cents}`;
  };

  const handleFundWallet = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    const amountInDollarsString = formatCentsToDisplay(amountInCents);
    const amount = parseFloat(amountInDollarsString);

    if (isNaN(amount) || amount <= 0) {
      setMessage({ type: 'error', text: 'Please enter a valid amount greater than $0.00.' });
      return;
    }

    let validationError = '';

    if (selectedMethod === 'debit' || selectedMethod === 'credit') {
      if (cardDetails.number.replace(/\s/g, '').length < 16 || cardDetails.cvc.length < 3 || cardDetails.expiry.length !== 5 || cardDetails.name.trim() === '') {
        validationError = 'Please complete all card details correctly.';
      }
    } else if (selectedMethod === 'bank') {
      if (bankDetails.routing.length !== 9 || bankDetails.account.length < 5) {
        validationError = 'Please enter valid Routing and Account Numbers.';
      }
    }

    if (validationError) {
      setMessage({ type: 'error', text: validationError });
      return;
    }

    try {
      // Fetch current balance from Supabase
      const { data: financeData, error: fetchError } = await supabase
        .from('finance')
        .select('balance')
        .eq('customer_id', auth.user_id)
        .single();

      if (fetchError) throw fetchError;

      const currentBalance = financeData?.balance ?? 0;
      const updatedBalance = Math.round((currentBalance + amount) * 100) / 100;

      // Update balance in Supabase
      const { error: updateError } = await supabase
        .from('finance')
        .update({ balance: updatedBalance })
        .eq('customer_id', auth.user_id);

      if (updateError) throw updateError;

      setBalance(updatedBalance);
      setAmountInCents('');
      setCardDetails({ number: '', expiry: '', cvc: '', name: '' });
      setBankDetails({ routing: '', account: '' });

      setMessage({
        type: 'success',
        text: `$${amount.toFixed(2)} transferred successfully via ${selectedMethod === 'bank' ? 'Bank Transfer' : 'Card'}. New balance is $${updatedBalance.toFixed(2)}.`,
      });

    } catch (err) {
      console.error('Error updating wallet balance:', err);
      setMessage({ type: 'error', text: 'Failed to update balance. Please try again.' });
    }
  };

  const handleAmountChange = (e) => {
    const inputValue = e.target.value.replace(/[^0-9]/g, ''); 
    setAmountInCents(inputValue);
  };

  const handleCardInputChange = (e) => {
    const { name, value } = e.target;
    let formattedValue = value;
    let cursorPosition = e.target.selectionStart;

    if (name === 'number') {
      const originalLength = cardDetails.number.length;
      formattedValue = value.replace(/\s/g, '').replace(/[^0-9]/g, '').replace(/(\d{4})/g, '$1 ').trim();
      formattedValue = formattedValue.substring(0, 19);
      const newLength = formattedValue.length;
      if (newLength > originalLength && newLength === cursorPosition && (newLength === 5 || newLength === 10 || newLength === 15)) {
        cursorPosition++;
      }
    } else if (name === 'expiry') {
      const cleanValue = value.replace(/\//g, '').replace(/[^0-9]/g, '');
      formattedValue = cleanValue;
      if (cleanValue.length > 2) formattedValue = cleanValue.substring(0, 2) + '/' + cleanValue.substring(2, 4);
      formattedValue = formattedValue.substring(0, 5);
      if (value.length === 2 && formattedValue.length === 3) cursorPosition = 3;
    } else if (name === 'cvc') formattedValue = value.replace(/[^0-9]/g, '').substring(0, 4);
    else if (name === 'name') formattedValue = value;

    setCardDetails(prev => ({ ...prev, [name]: formattedValue }));

    const inputRef = name === 'number' ? numberInputRef : (name === 'expiry' ? expiryInputRef : null);
    if (inputRef && inputRef.current) {
      requestAnimationFrame(() => {
        if (inputRef.current) inputRef.current.setSelectionRange(cursorPosition, cursorPosition);
      });
    }
  };

  const handleBankInputChange = (e) => {
    const { name, value } = e.target;
    const numericValue = value.replace(/[^0-9]/g, ''); 
    setBankDetails(prev => ({ ...prev, [name]: numericValue }));
  };

  const CardDetailsForm = () => (
    <div className="space-y-4">
      <div className="flex flex-col space-y-1">
        <label htmlFor="number" className="text-sm font-medium">Card Number</label>
        <input
          id="number"
          name="number"
          type="text"
          inputMode="numeric"
          placeholder="XXXX XXXX XXXX XXXX"
          value={cardDetails.number}
          onChange={handleCardInputChange}
          ref={numberInputRef} 
          className="p-3 border rounded-lg focus:ring-2 focus:ring-opacity-50"
          style={{ borderColor: '#a3c4f3', focus: { ringColor: '#a3c4f3' } }}
          required
        />
      </div>

      <div className="flex space-x-4">
        <div className="flex flex-col space-y-1 w-1/3">
          <label htmlFor="expiry" className="text-sm font-medium">Expiry</label>
          <input
            id="expiry"
            name="expiry"
            type="text"
            inputMode="numeric"
            placeholder="MM/YY"
            value={cardDetails.expiry}
            onChange={handleCardInputChange}
            ref={expiryInputRef}
            className="p-3 border rounded-lg focus:ring-2 focus:ring-opacity-50"
            style={{ borderColor: '#a3c4f3', focus: { ringColor: '#a3c4f3' } }}
            required
          />
        </div>
        <div className="flex flex-col space-y-1 w-1/3">
          <label htmlFor="cvc" className="text-sm font-medium">CVC</label>
          <input
            id="cvc"
            name="cvc"
            type="password"
            inputMode="numeric"
            placeholder="***"
            value={cardDetails.cvc}
            onChange={handleCardInputChange}
            className="p-3 border rounded-lg focus:ring-2 focus:ring-opacity-50"
            style={{ borderColor: '#a3c4f3', focus: { ringColor: '#a3c4f3' } }}
            required
          />
        </div>
        <div className="flex flex-col space-y-1 w-1/3">
          <label htmlFor="name" className="text-sm font-medium">Cardholder Name</label>
          <input
            id="name"
            name="name"
            type="text"
            placeholder="Enter cardholder name"
            value={cardDetails.name}
            onChange={handleCardInputChange} 
            className="p-3 border rounded-lg focus:ring-2 focus:ring-opacity-50" 
            style={{ borderColor: '#a3c4f3', focus: { ringColor: '#a3c4f3' } }} 
            required
          />
        </div>
      </div>
    </div>
  );

  const BankDetailsForm = () => (
    <div className="space-y-4">
      <div className="flex flex-col space-y-1">
        <label htmlFor="routing" className="text-sm font-medium">Routing Number (9 Digits)</label>
        <input
          id="routing"
          name="routing"
          type="text"
          inputMode="numeric"
          placeholder="XXXXXXXXX"
          maxLength="9"
          value={bankDetails.routing}
          onChange={handleBankInputChange}
          className="p-3 border rounded-lg focus:ring-2 focus:ring-opacity-50"
          style={{ borderColor: '#a3c4f3', focus: { ringColor: '#a3c4f3' } }}
          required
        />
      </div>
      <div className="flex flex-col space-y-1">
        <label htmlFor="account" className="text-sm font-medium">Account Number</label>
        <input
          id="account"
          name="account"
          type="text"
          inputMode="numeric"
          placeholder="Bank Account Number"
          maxLength="17"
          value={bankDetails.account}
          onChange={handleBankInputChange}
          className="p-3 border rounded-lg focus:ring-2 focus:ring-opacity-50"
          style={{ borderColor: '#a3c4f3', focus: { ringColor: '#a3c4f3' } }}
          required
        />
      </div>
      <p className="text-xs italic text-gray-500 flex items-center pt-2" style={{ color: '#657080' }}>
        <Landmark className="mr-2" size={16} />
        Bank transfers usually take 1-3 business days to clear.
      </p>
    </div>
  );

  return (
    <div 
      className="min-h-screen p-4 sm:p-8 flex flex-col items-center" 
      style={{ backgroundColor: '#f8f7f3' }}
    >
      <div 
        className="w-full max-w-lg shadow-2xl rounded-xl p-6 space-y-8" 
        style={{ backgroundColor: 'white', color: '#657080' }}
      >
        <div 
          className="p-6 rounded-xl flex flex-col justify-between"
          style={{ backgroundColor: '#a3c4f3' }}
        >
          <div className="flex justify-between items-center text-white">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              DishIQ Wallet
            </h1>
            <Wallet size={32} />
          </div>
          
          <div className="mt-6">
            <p className="text-sm uppercase opacity-80">Current Balance</p>
            <p className="text-4xl sm:text-5xl font-extrabold text-white">
              ${balance.toFixed(2)}
            </p>
          </div>
        </div>

        {message.text && (
          <div 
            className={`p-3 rounded-lg flex items-center transition-all duration-300 ${
              message.type === 'success' ? 'bg-green-100' : 'bg-red-100'
            }`}
            style={{ 
                color: '#657080',
                backgroundColor: message.type === 'error' ? '#ffe59d' : '#cde8d5' 
            }}
          >
            {message.type === 'success' ? <CheckCircle className="mr-3" size={20} /> : <AlertTriangle className="mr-3" size={20} />}
            <p className="text-sm font-medium">{message.text}</p>
          </div>
        )}

        <div className="space-y-4">
          <h2 className="text-xl font-semibold" style={{ color: '#657080' }}>
            1. Select Funding Method
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {fundingMethods.map((method) => {
              const Icon = method.icon;
              const isSelected = selectedMethod === method.key;
              return (
                <div
                  key={method.key}
                  className={`p-4 rounded-xl border-2 flex flex-col items-center justify-center cursor-pointer transition duration-200 shadow-md ${isSelected ? 'shadow-lg' : 'shadow-sm'}`}
                  style={{ 
                    borderColor: isSelected ? '#a3c4f3' : '#cde8d5', 
                    backgroundColor: isSelected ? '#cde8d5' : 'white',
                  }}
                  onClick={() => setSelectedMethod(method.key)}
                >
                  <Icon size={28} className="mb-2" style={{ color: isSelected ? '#a3c4f3' : '#657080' }} />
                  <span className="text-sm font-medium text-center">{method.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        <form onSubmit={handleFundWallet} className="space-y-6">
          <h2 className="text-xl font-semibold" style={{ color: '#657080' }}>
            2. Enter Transfer Details
          </h2>
          
          {(selectedMethod === 'debit' || selectedMethod === 'credit') && <CardDetailsForm />}
          {selectedMethod === 'bank' && <BankDetailsForm />}
          
          <div className="flex flex-col space-y-1 pt-4">
            <label htmlFor="amount" className="text-lg font-medium">Amount to Transfer</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-xl font-bold">$</span>
              <input
                id="amount"
                name="amount"
                type="text"
                inputMode="numeric" 
                placeholder="0.00"
                value={formatCentsToDisplay(amountInCents)}
                onChange={handleAmountChange}
                className="w-full p-4 pl-8 border-2 rounded-xl text-2xl font-semibold text-center focus:ring-4 focus:ring-opacity-50"
                style={{ borderColor: '#ffe59d', color: '#657080', focus: { ringColor: '#ffe59d' } }}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full p-4 rounded-xl text-xl font-bold text-white shadow-lg transition duration-300 ease-in-out transform hover:scale-[1.01] active:scale-[0.99] focus:outline-none focus:ring-4 focus:ring-opacity-50"
            style={{ backgroundColor: '#a3c4f3', focus: { ringColor: '#a3c4f3' } }}
          >
            Transfer Funds to Wallet
          </button>
        </form>
        
        <button
          onClick={async () => {
            if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
              try {
                const { error } = await supabase
                  .from('users')
                  .update({ role: 'close-account' })
                  .eq('user_id', auth.user_id);
                
                if (error) throw error;
                
                setMessage({ type: 'success', text: 'Account closure requested successfully.' });
              } catch (err) {
                console.error('Error closing account:', err);
                setMessage({ type: 'error', text: 'Failed to close account. Please try again.' });
              }
            }
          }}
          className="w-full p-3 rounded-xl text-sm font-semibold text-white shadow-md transition duration-300 ease-in-out hover:opacity-90 focus:outline-none focus:ring-4 focus:ring-opacity-50"
          style={{ backgroundColor: '#ff6b6b', focus: { ringColor: '#ff6b6b' } }}
        >
          Delete Account
        </button>

      </div>
      </div>
  );
};

export default App;
