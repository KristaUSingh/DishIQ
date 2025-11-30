import React, { useState } from "react";
import "./AIChatbot.css";
import { supabase } from "../../api/supabaseClient";
import { useAuth } from "../../context/useAuth";
import { FiMessageCircle } from "react-icons/fi";
import { getChatbotResponse } from "../../services/aiService";
import FoodFinder from "../foodfinder/FoodFinder";


const AIChatbot = () => {
  const { auth } = useAuth();

  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: "AI",
      text: "Hi! I’m DishIQ’s Assistant. Ask anything about restaurants, menus, allergens, hours, and more!",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("chat");
  const [tab, setTab] = useState("chat");



  // ========================================
  // SEND MESSAGE
  // ========================================
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();

    // Add user message
    setMessages((prev) => [...prev, { sender: "User", text: userMessage }]);
    setInput("");
    setIsLoading(true);

    // Call local KB → fallback to LLM
    const bot = await getChatbotResponse(userMessage);

    setMessages((prev) => [
      ...prev,
      {
        sender: "AI",
        text: bot.answer,
        source: bot.source,
        kb_id: bot.kb_id,
      },
    ]);

    setIsLoading(false);
  };

  // ========================================
  // RATE KB ANSWER
  // ========================================
  const handleRating = async (index, rating) => {
    const msg = messages[index];
    if (!msg.kb_id) return;
  
    await supabase.from("kb_ratings").insert({
      kb_id: msg.kb_id,
      rating: rating,
      user_id: auth?.user_id ?? null,
    });

    // If rating is 0, flag KB answer
    if (rating === 0) {
        await supabase
        .from("knowledge_base")
        .update({ disabled: true })
        .eq("kb_id", msg.kb_id);
    }

    const updated = [...messages];
    updated[index].rating = rating;
    setMessages(updated);
  };

  const handleImageSubmit = async () => {
    if (!imageFile) return;
  
    const formData = new FormData();
    formData.append("file", imageFile);
  
    const res = await fetch("http://localhost:8000/predict-food", {
      method: "POST",
      body: formData,
    });
  
    const data = await res.json();
    setResults(data.results);
  };
  

  return (
    <>
      <button className="chat-toggle-btn" onClick={() => setOpen(!open)}>
        <FiMessageCircle size={28} />
      </button>
  
      {open && (
        <div className="chatbot-container">
          <h3 className="chatbot-header">AI Assistant</h3>
  
          <div className="chatbot-tabs">
            <button 
              className={`chatbot-tab-btn ${tab === "chat" ? "active" : ""}`}
              onClick={() => setTab("chat")}
            >
              Chat
            </button>
  
            <button 
              className={`chatbot-tab-btn ${tab === "finder" ? "active" : ""}`}
              onClick={() => setTab("finder")}
            >
              Food Finder
            </button>
          </div>
  
          {/* ⭐ CONDITIONAL RENDER GOES HERE */}
          {tab === "chat" ? (
            <>
              <div className="chatbot-messages">
                {messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`chat-message ${
                      msg.sender === "User" ? "user-msg" : "ai-msg"
                    }`}
                  >
                    <strong>{msg.sender}: </strong>
                    {msg.text}
  
                    {msg.sender === "AI" &&
                      msg.source === "KB" &&
                      msg.rating === undefined && (
                        <div className="rating-row">
                          <small>Rate this answer:</small>
                          {[0, 1, 2, 3, 4, 5].map((r) => (
                            <button
                              key={r}
                              className="rating-btn"
                              onClick={() => handleRating(index, r)}
                            >
                              {r}⭐
                            </button>
                          ))}
                        </div>
                      )}
  
                    {msg.rating !== undefined && (
                      <small className="rated-text">
                        (Rated: {msg.rating}⭐)
                      </small>
                    )}
                  </div>
                ))}
  
                {isLoading && <div className="loading-dots">...</div>}
              </div>
  
              <form className="chat-input-area" onSubmit={handleSendMessage}>
                <input
                  type="text"
                  placeholder="Ask a question..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  disabled={isLoading}
                />
                <button disabled={isLoading}>Send</button>
              </form>
            </>
          ) : (
            <FoodFinder />
          )}
        </div>
      )}
    </>
  );  
};

export default AIChatbot;