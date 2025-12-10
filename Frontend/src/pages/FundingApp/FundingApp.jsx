// src/pages/FundingApp/FundingApp.jsx

import React, { useState, useEffect } from "react";
import {
  CreditCard,
  Wallet,
  AlertTriangle,
  CheckCircle,
  Banknote,
  Landmark,
} from "lucide-react";
import "./FundingApp.css";
import { supabase } from "../../api/supabaseClient";

const fundingMethods = [
  { key: "debit", label: "Debit Card", icon: CreditCard },
  { key: "credit", label: "Credit Card", icon: CreditCard },
  { key: "bank", label: "Bank Transfer (ACH)", icon: Banknote },
];

const FundingApp = () => {
  const auth = JSON.parse(localStorage.getItem("auth"));

  const [balance, setBalance] = useState(0);
  const [amountInCents, setAmountInCents] = useState("");
  const [selectedMethod, setSelectedMethod] = useState("debit");

  const [cardDetails, setCardDetails] = useState({
    number: "",
    expiry: "",
    cvc: "",
    name: "",
  });

  const [bankDetails, setBankDetails] = useState({
    routing: "",
    account: "",
  });

  const [message, setMessage] = useState({ type: "", text: "" });

  // -------------------------------
  //  LOAD CURRENT BALANCE
  // -------------------------------
  useEffect(() => {
    const fetchBalance = async () => {
      if (!auth?.user_id) return;

      const { data, error } = await supabase
        .from("finance")
        .select("balance")
        .eq("customer_id", auth.user_id)
        .maybeSingle(); // returns null instead of throwing on no row

      if (error) {
        console.error("Error fetching balance:", error);
        return;
      }

      if (data) {
        setBalance(data.balance ?? 0);
      } else {
        // no finance row yet → keep balance at 0
        setBalance(0);
      }
    };

    fetchBalance();
  }, [auth?.user_id]);

  // -------------------------------
  //  FORMAT AMOUNT DISPLAY
  // -------------------------------
  const formatCentsToDisplay = (cents) => {
    if (!cents) return "0.00";

    const padded =
      cents.length < 3 ? "0".repeat(3 - cents.length) + cents : cents;

    const dollarsPart = padded.slice(0, -2);
    const centsPart = padded.slice(-2);

    const dollars = parseInt(dollarsPart || "0", 10);
    return `${dollars}.${centsPart}`;
  };

  const handleAmountChange = (e) => {
    setAmountInCents(e.target.value.replace(/\D/g, ""));
  };

  // -------------------------------
  //  CARD INPUT HANDLERS (SMOOTH)
  // -------------------------------
  const formatCardNumber = (digits) =>
    digits.replace(/(\d{4})(?=\d)/g, "$1 ").trim();

  const formatExpiry = (digits) => {
    if (digits.length <= 2) return digits;
    return digits.slice(0, 2) + "/" + digits.slice(2, 4);
  };

  const handleCardChange = (e) => {
    const { name, value } = e.target;

    if (name === "number") {
      const raw = value.replace(/\D/g, "").slice(0, 16);
      return setCardDetails((p) => ({ ...p, number: raw }));
    }

    if (name === "expiry") {
      const raw = value.replace(/\D/g, "").slice(0, 4);
      return setCardDetails((p) => ({ ...p, expiry: raw }));
    }

    if (name === "cvc") {
      return setCardDetails((p) => ({
        ...p,
        cvc: value.replace(/\D/g, "").slice(0, 4),
      }));
    }

    if (name === "name") {
      return setCardDetails((p) => ({ ...p, name: value }));
    }
  };

  // -------------------------------
  //  BANK INPUT HANDLER
  // -------------------------------
  const handleBankChange = (e) => {
    const { name, value } = e.target;
    setBankDetails((p) => ({ ...p, [name]: value.replace(/\D/g, "") }));
  };

  // -------------------------------
  //  SUBMIT - FUNDING WALLET
  // -------------------------------
  const handleFundWallet = async (e) => {
    e.preventDefault();
    setMessage({ type: "", text: "" });

    if (!auth?.user_id) {
      return setMessage({
        type: "error",
        text: "You must be logged in to fund your wallet.",
      });
    }

    const amount = parseFloat(formatCentsToDisplay(amountInCents));

    if (!amount || amount <= 0) {
      return setMessage({
        type: "error",
        text: "Please enter a valid amount greater than $0.00.",
      });
    }

    // ------------- VALIDATION -------------
    if (selectedMethod !== "bank") {
      if (
        cardDetails.number.length < 16 ||
        cardDetails.expiry.length < 4 ||
        cardDetails.cvc.length < 3 ||
        cardDetails.name.trim() === ""
      ) {
        return setMessage({
          type: "error",
          text: "Please complete all card details correctly.",
        });
      }
    } else {
      if (bankDetails.routing.length !== 9 || bankDetails.account.length < 5) {
        return setMessage({
          type: "error",
          text: "Invalid routing/account number.",
        });
      }
    }

    try {
      // Fetch existing finance row (if any)
      const { data: financeData, error: fetchError } = await supabase
        .from("finance")
        .select("balance")
        .eq("customer_id", auth.user_id)
        .maybeSingle();

      if (fetchError) {
        console.error("Error fetching finance row:", fetchError);
        throw fetchError;
      }

      const current = financeData?.balance ?? 0;
      const updated = Number((current + amount).toFixed(2));

      let dbError = null;

      if (financeData) {
        // Row exists → UPDATE balance
        const { error } = await supabase
          .from("finance")
          .update({ balance: updated })
          .eq("customer_id", auth.user_id);

        dbError = error;
      } else {
        // No row yet → INSERT new row with starting balance
        const { error } = await supabase.from("finance").insert([
          {
            customer_id: auth.user_id,
            balance: updated,
            // other columns if you have them can go here with defaults:
            // restaurant_name: null,
            // num_orders: 0,
            // total_spent: 0,
          },
        ]);

        dbError = error;
      }

      if (dbError) {
        console.error("Error writing finance row:", dbError);
        throw dbError;
      }

      // Update local state
      setBalance(updated);
      setAmountInCents("");
      setCardDetails({ number: "", expiry: "", cvc: "", name: "" });
      setBankDetails({ routing: "", account: "" });

      setMessage({
        type: "success",
        text: `Successfully added $${amount.toFixed(
          2
        )}. New balance: $${updated.toFixed(2)}.`,
      });
    } catch (err) {
      console.error(err);
      setMessage({
        type: "error",
        text: "Something went wrong while funding your wallet.",
      });
    }
  };

  // -------------------------------
  //  COMPONENT RENDER
  // -------------------------------
  return (
    <div className="funding-page">
      <div className="funding-container">
        {/* Wallet Header */}
        <div className="wallet-header">
          <div className="wallet-top">
            <h1>DishIQ Wallet</h1>
            <Wallet size={36} />
          </div>
          <p className="wallet-balance-label">Current Balance</p>
          <p className="wallet-balance">${balance.toFixed(2)}</p>
        </div>

        {/* Message */}
        {message.text && (
          <div
            className={`funding-message ${
              message.type === "error" ? "message-error" : "message-success"
            }`}
          >
            {message.type === "error" ? (
              <AlertTriangle className="mr-2" size={20} />
            ) : (
              <CheckCircle className="mr-2" size={20} />
            )}
            {message.text}
          </div>
        )}

        {/* Funding Method */}
        <h2 className="funding-section-title">1. Select Funding Method</h2>
        <div className="funding-method-grid">
          {fundingMethods.map(({ key, label, icon: Icon }) => (
            <div
              key={key}
              className={`funding-method-card ${
                selectedMethod === key ? "selected" : ""
              }`}
              onClick={() => setSelectedMethod(key)}
            >
              <Icon size={28} />
              <span>{label}</span>
            </div>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleFundWallet} className="space-y-6">
          <h2 className="funding-section-title">2. Enter Transfer Details</h2>

          {(selectedMethod === "debit" || selectedMethod === "credit") && (
            <div className="space-y-4">
              {/* CARD NUMBER */}
              <div>
                <label className="funding-input-label">Card Number</label>
                <input
                  name="number"
                  inputMode="numeric"
                  className="funding-input"
                  placeholder="XXXX XXXX XXXX XXXX"
                  value={formatCardNumber(cardDetails.number)}
                  onChange={handleCardChange}
                />
              </div>

              {/* ROW */}
              <div className="card-row">
                <div className="card-row-item">
                  <label className="funding-input-label">Expiry</label>
                  <input
                    name="expiry"
                    inputMode="numeric"
                    className="funding-input"
                    placeholder="MM/YY"
                    value={formatExpiry(cardDetails.expiry)}
                    onChange={handleCardChange}
                  />
                </div>

                <div className="card-row-item">
                  <label className="funding-input-label">CVC</label>
                  <input
                    name="cvc"
                    inputMode="numeric"
                    type="password"
                    className="funding-input"
                    placeholder="***"
                    value={cardDetails.cvc}
                    onChange={handleCardChange}
                  />
                </div>

                <div className="card-row-item">
                  <label className="funding-input-label">Name</label>
                  <input
                    name="name"
                    type="text"
                    className="funding-input"
                    placeholder="Name on card"
                    value={cardDetails.name}
                    onChange={handleCardChange}
                  />
                </div>
              </div>
            </div>
          )}

          {/* BANK FORM */}
          {selectedMethod === "bank" && (
            <div className="space-y-4">
              <div>
                <label className="funding-input-label">Routing Number</label>
                <input
                  name="routing"
                  maxLength={9}
                  className="funding-input"
                  inputMode="numeric"
                  value={bankDetails.routing}
                  onChange={handleBankChange}
                />
              </div>

              <div>
                <label className="funding-input-label">Account Number</label>
                <input
                  name="account"
                  maxLength={17}
                  className="funding-input"
                  inputMode="numeric"
                  value={bankDetails.account}
                  onChange={handleBankChange}
                />
              </div>

              <p className="funding-note">
                <Landmark size={16} /> Bank transfer takes 1–3 days.
              </p>
            </div>
          )}

          {/* AMOUNT */}
          <div>
            <label className="funding-input-label">Amount to Transfer</label>
            <div className="amount-wrapper">
              <span className="amount-dollar">$</span>
              <input
                type="text"
                inputMode="numeric"
                className="amount-input"
                value={formatCentsToDisplay(amountInCents)}
                onChange={handleAmountChange}
              />
            </div>
          </div>

          <button type="submit" className="funding-submit-btn">
            Transfer Funds to Wallet
          </button>
        </form>

        {/* DELETE ACCOUNT */}
        <button
          className="funding-delete-btn"
          onClick={async () => {
            if (!auth?.user_id) {
              return setMessage({
                type: "error",
                text: "You must be logged in to delete your account.",
              });
            }

            if (!window.confirm("Are you sure? This cannot be undone.")) return;

            const { error } = await supabase
              .from("users")
              .update({ role: "close-account" })
              .eq("user_id", auth.user_id);

            if (error) {
              console.error(error);
              return setMessage({
                type: "error",
                text: "Failed to request account deletion.",
              });
            }

            setMessage({
              type: "success",
              text: "Account closure request sent.",
            });
          }}
        >
          Delete Account
        </button>
      </div>
    </div>
  );
};

export default FundingApp;