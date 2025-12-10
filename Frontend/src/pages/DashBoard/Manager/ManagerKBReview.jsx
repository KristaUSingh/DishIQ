import React, { useEffect, useState } from "react";
import "./ManagerKBReview.css";
import { supabase } from "../../../api/supabaseClient";

const ManagerKBReview = () => {
  const [flaggedItems, setFlaggedItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load ONLY items with disabled = true (flagged)
  const fetchFlagged = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("knowledge_base")
      .select(`
        kb_id,
        question,
        answer,
        category,
        disabled,
        created_at,
        kb_ratings ( rating )
      `)
      .eq("disabled", true)               // ⭐ only flagged items
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Fetch error:", error);
      setLoading(false);
      return;
    }

    setFlaggedItems(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchFlagged();
  }, []);

  // Manager deletes the item forever
  const deleteItem = async (kb_id) => {
    const ok = window.confirm(
      "Are you sure you want to permanently delete this flagged answer?"
    );
    if (!ok) return;

    await supabase.from("knowledge_base").delete().eq("kb_id", kb_id);
    fetchFlagged();
  };

  const handleKeep = async (kb_id) => {
    // Mark the KB answer as approved
    const { error } = await supabase
      .from("knowledge_base")
      .update({ disabled: false })
      .eq("kb_id", kb_id);
  
    if (error) {
      console.error("Error keeping entry:", error);
      return;
    }
  
    // OPTIONAL: clear all 0-star ratings (so it won't be flagged again)
    await supabase
      .from("kb_ratings")
      .delete()
      .eq("kb_id", kb_id)
      .eq("rating", 0);
  
    // Remove from UI
    setFlaggedItems((prev) => prev.filter((item) => item.kb_id !== kb_id));
  };
  

  return (
    <div className="kb-review-container">
      <h1 className="kb-title">Flagged Knowledge Base Answers</h1>
      <p className="kb-subtitle">
        These answers received a rating of <strong>0 (outrageous)</strong>.
      </p>

      {loading ? (
        <p className="kb-loading">Loading...</p>
      ) : flaggedItems.length === 0 ? (
        <p className="kb-none">No flagged items!</p>
      ) : (
        <div className="kb-list">
          {flaggedItems.map((item) => (
            <div key={item.kb_id} className="kb-card flagged">
              <div className="kb-header">
                <h3>{item.question}</h3>
                <span className="flag-badge">FLAGGED</span>
              </div>

              <p><strong>Answer:</strong> {item.answer}</p>
              <p><strong>Category:</strong> {item.category}</p>

              <p>
                <strong>Total Ratings:</strong>{" "}
                {item.kb_ratings?.length ?? 0}
              </p>
              

              <div className="kb-actions">
                <button className="keep-btn" onClick={() => handleKeep(item.kb_id)}>
                    Keep Entry
                </button>

                <button
                  onClick={() => deleteItem(item.kb_id)}
                  className="delete-btn"
                >
                  Delete Entry
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ManagerKBReview;