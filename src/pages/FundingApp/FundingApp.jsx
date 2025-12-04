import React, { useState, useRef } from 'react';
import { CreditCard, Wallet, AlertTriangle, CheckCircle, Banknote, Landmark } from 'lucide-react';

// Color Palette from DishIQ Color Scheme:
// Primary/Accent: #a3c4f3 (light blue)
// Secondary/Accent: #cde8d5 (light green)
// Highlight/Warning: #ffe59d (pale yellow)
// Dark Text/Elements: #657080 (slate grey)
// Main Background: #f8f7f3 (off-white)

const fundingMethods = [
  { key: 'debit', label: 'Debit Card', icon: CreditCard },
  { key: 'credit', label: 'Credit Card', icon: CreditCard },
  { key: 'bank', label: 'Bank Transfer (ACH)', icon: Banknote },
];

const App = () => {
  // --- Refs for managing cursor position in formatted inputs ---
  const numberInputRef = useRef(null);
  const expiryInputRef = useRef(null);
  
  // State for the user's wallet balance (Initial balance set to 0.00 as requested)
  const [balance, setBalance] = useState(0.00);
  
  // State for the amount the user wants to transfer, stored as a raw string of cents (e.g., "123" for $1.23)
  const [amountInCents, setAmountInCents] = useState('');
  
  // State for the currently selected funding method key ('debit', 'credit', 'bank')
  const [selectedMethod, setSelectedMethod] = useState('debit'); 
  
  // State for card input fields (simulated)
  const [cardDetails, setCardDetails] = useState({
    number: '',
    expiry: '',
    cvc: '',
    name: '', // Now starts blank for user input
  });
  
  // State for bank transfer input fields (simulated)
  const [bankDetails, setBankDetails] = useState({
    routing: '',
    account: '',
  });
  // State for system messages (success/error)
  const [message, setMessage] = useState({ type: '', text: '' });

  // Helper function to format the raw cents string into a dollar display value (e.g., "123" -> "1.23")
  const formatCentsToDisplay = (centsString) => {
    // 1. Handle empty input (nothing typed)
    if (!centsString || centsString.length === 0) return '0.00';

    const len = centsString.length;

    // 2. Pad with leading zeros only up to the dollar sign if needed (e.g., '5' -> 0.05, '50' -> 0.50)
    let paddedValue = centsString;
    // We need at least 3 digits to separate cents from dollars (e.g., $X.XX).
    if (len < 3) {
      paddedValue = '0'.repeat(3 - len) + centsString;
    }

    // 3. Separate dollars and cents
    const dollars = paddedValue.slice(0, -2);
    const cents = paddedValue.slice(-2);
    
    // 4. Clean up leading zeros in the dollar part (e.g., "005" -> "5", "0123" -> "123")
    // Use parseInt() and toString() to remove leading zeros, then fallback to '0' if it was all zeros.
    const displayDollars = dollars === '0' ? '0' : String(parseInt(dollars, 10));

    // Combine and return
    return `${displayDollars}.${cents}`;
  };

  // Function to handle the funding transaction
  const handleFundWallet = (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' }); // Clear previous message

    // Convert the raw cents string to a decimal amount for calculation
    const amountInDollarsString = formatCentsToDisplay(amountInCents);
    const amount = parseFloat(amountInDollarsString);

    // Basic Amount Validation
    if (isNaN(amount) || amount <= 0) {
      setMessage({ type: 'error', text: 'Please enter a valid amount greater than $0.00.' });
      return;
    }

    let validationError = '';

    // Method-specific Validation
    if (selectedMethod === 'debit' || selectedMethod === 'credit') {
      if (cardDetails.number.replace(/\s/g, '').length < 16 || cardDetails.cvc.length < 3 || cardDetails.expiry.length !== 5 || cardDetails.name.trim() === '') {
        validationError = 'Please complete all card details correctly.';
      }
    } else if (selectedMethod === 'bank') {
      if (bankDetails.routing.length !== 9 || bankDetails.account.length < 5) {
        validationError = 'Please enter valid 9-digit Routing and Account Numbers.';
      }
    }

    if (validationError) {
      setMessage({ type: 'error', text: validationError });
      return;
    }

    // Simulate API call delay
    setTimeout(() => {
      // Simulate success
      const newBalance = (balance + amount).toFixed(2);
      setBalance(parseFloat(newBalance));
      
      // Clear inputs
      setAmountInCents(''); // Clear cents state
      setCardDetails(prev => ({ ...prev, number: '', expiry: '', cvc: '', name: '' })); // Clear card details including name
      setBankDetails({ routing: '', account: '' });

      // Display success message
      setMessage({ 
        type: 'success', 
        text: `$${amount.toFixed(2)} transferred successfully via ${selectedMethod === 'bank' ? 'Bank Transfer' : 'Card'}. New balance is $${newBalance}.` 
      });

    }, 1000); // 1 second delay
  };

  // Handler for continuous typing of currency without manual decimal
  const handleAmountChange = (e) => {
    // Strip all non-digit characters to get the raw cents string
    const inputValue = e.target.value.replace(/[^0-9]/g, ''); 
    
    // Update state with the raw number of cents (e.g., "123" for $1.23)
    setAmountInCents(inputValue);
  };

  // Handler for card detail inputs (formatting logic)
  const handleCardInputChange = (e) => {
    const { name, value } = e.target;
    let formattedValue = value;
    // Capture cursor position before state update and formatting change
    let cursorPosition = e.target.selectionStart;

    if (name === 'number') {
        const originalLength = cardDetails.number.length;
        
        // 1. Clean and format the new value
        formattedValue = value.replace(/\s/g, '').replace(/[^0-9]/g, '').replace(/(\d{4})/g, '$1 ').trim();
        formattedValue = formattedValue.substring(0, 19); // Max length XXXX XXXX XXXX XXXX
        
        // 2. Calculate the difference in length due to added/removed spaces
        const newLength = formattedValue.length;
        
        // If a space was just added (e.g., typing '4' when the input was '123'), advance the cursor by 1
        if (newLength > originalLength && newLength === cursorPosition && (newLength === 5 || newLength === 10 || newLength === 15)) {
            cursorPosition++;
        }
        
    } else if (name === 'expiry') {
        // Format MM/YY
        const cleanValue = value.replace(/\//g, '').replace(/[^0-9]/g, '');
        formattedValue = cleanValue;
        if (cleanValue.length > 2) {
            formattedValue = cleanValue.substring(0, 2) + '/' + cleanValue.substring(2, 4);
        }
        formattedValue = formattedValue.substring(0, 5); // Max length MM/YY
        
        // If '/' was just added (when typing the 3rd character), set the cursor position after the '/'
        if (value.length === 2 && formattedValue.length === 3) {
             cursorPosition = 3;
        }

    } else if (name === 'cvc') {
        // Limit CVC to 4 digits
        formattedValue = value.replace(/[^0-9]/g, '').substring(0, 4);
    } else if (name === 'name') {
        // Allow all characters for name
        formattedValue = value;
    }
    
    // Update the state
    setCardDetails(prev => ({ ...prev, [name]: formattedValue }));
    
    // --- CRITICAL FIX: Use the ref to imperatively set the cursor position ---
    const inputRef = name === 'number' ? numberInputRef : (name === 'expiry' ? expiryInputRef : null);

    // This ensures the cursor position is correctly set after the React re-render.
    if (inputRef && inputRef.current) {
        // We use requestAnimationFrame to ensure the DOM update happens before we set the selection.
        requestAnimationFrame(() => {
            if (inputRef.current) {
                inputRef.current.setSelectionRange(cursorPosition, cursorPosition);
            }
        });
    }
  };

  // Handler for bank detail inputs
  const handleBankInputChange = (e) => {
    const { name, value } = e.target;
    // Allow only numbers
    const numericValue = value.replace(/[^0-9]/g, ''); 

    setBankDetails(prev => ({ ...prev, [name]: numericValue }));
  };
  
  // Render function for the Card Details Form
  const CardDetailsForm = () => (
    <div className="space-y-4">
      {/* Card Number */}
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
          // ADDED: Ref attachment for cursor management
          ref={numberInputRef} 
          className="p-3 border rounded-lg focus:ring-2 focus:ring-opacity-50"
          style={{ borderColor: '#a3c4f3', focus: { ringColor: '#a3c4f3' } }}
          required
        />
      </div>

      <div className="flex space-x-4">
        {/* Expiry Date */}
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
            // ADDED: Ref attachment for cursor management
            ref={expiryInputRef}
            className="p-3 border rounded-lg focus:ring-2 focus:ring-opacity-50"
            style={{ borderColor: '#a3c4f3', focus: { ringColor: '#a3c4f3' } }}
            required
          />
        </div>
        {/* CVC */}
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
        {/* Cardholder Name - NOW EDITABLE */}
        <div className="flex flex-col space-y-1 w-1/3">
          <label htmlFor="name" className="text-sm font-medium">Cardholder Name</label>
          <input
            id="name"
            name="name"
            type="text"
            placeholder="Enter cardholder name" // Added placeholder
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

  // Render function for the Bank Details Form
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

        {/* --- Top Balance Display --- */}
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

        {/* --- Message Box --- */}
        {message.text && (
          <div 
            className={`p-3 rounded-lg flex items-center transition-all duration-300 ${
              message.type === 'success' ? 'bg-green-100' : 'bg-red-100'
            }`}
            style={{ 
                color: '#657080', // Dark text for readability
                backgroundColor: message.type === 'error' ? '#ffe59d' : '#cde8d5' 
            }}
          >
            {message.type === 'success' ? <CheckCircle className="mr-3" size={20} /> : <AlertTriangle className="mr-3" size={20} />}
            <p className="text-sm font-medium">{message.text}</p>
          </div>
        )}

        {/* --- Funding Method Selection --- */}
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

        {/* --- Transfer Details Form --- */}
        <form onSubmit={handleFundWallet} className="space-y-6">
          <h2 className="text-xl font-semibold" style={{ color: '#657080' }}>
            2. Enter Transfer Details
          </h2>
          
          {/* Conditional Form Rendering */}
          {(selectedMethod === 'debit' || selectedMethod === 'credit') && <CardDetailsForm />}
          {selectedMethod === 'bank' && <BankDetailsForm />}
          
          {/* Amount to Transfer - Always visible */}
          <div className="flex flex-col space-y-1 pt-4">
            <label htmlFor="amount" className="text-lg font-medium">Amount to Transfer</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-xl font-bold">$</span>
              <input
                id="amount"
                name="amount"
                // Changed type to text and inputMode to numeric for better control over display format
                type="text"
                inputMode="numeric" 
                placeholder="0.00"
                value={formatCentsToDisplay(amountInCents)} // Use formatted value for display
                onChange={handleAmountChange} // Use new handler for automatic decimal
                className="w-full p-4 pl-8 border-2 rounded-xl text-2xl font-semibold text-center focus:ring-4 focus:ring-opacity-50"
                style={{ borderColor: '#ffe59d', color: '#657080', focus: { ringColor: '#ffe59d' } }}
                required
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full p-4 rounded-xl text-xl font-bold text-white shadow-lg transition duration-300 ease-in-out transform hover:scale-[1.01] active:scale-[0.99] focus:outline-none focus:ring-4 focus:ring-opacity-50"
            style={{ backgroundColor: '#a3c4f3', focus: { ringColor: '#a3c4f3' } }}
          >
            Transfer Funds to Wallet
          </button>
        </form>

      </div>
    </div>
  );
};

export default App;