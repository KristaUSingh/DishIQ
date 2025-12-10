import React, { useState, useRef} from "react";
import "./FoodFinder.css";

const FoodFinder = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const loadingRef = useRef(null);
  const resultsRef = useRef(null);

  // ======================================
  // HANDLE IMAGE FILE UPLOAD
  // ======================================
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setSelectedImage(file);
    setImagePreview(URL.createObjectURL(file));
  };

  // ======================================
  // SUBMIT IMAGE FILE TO FASTAPI
  // ======================================
  const submitImage = async () => {
    if (!selectedImage) return;
  
    const formData = new FormData();
    formData.append("file", selectedImage);
  
    setIsLoading(true);
  
    // Scroll to "Analyzing..."
    setTimeout(() => {
      loadingRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  
    const res = await fetch("http://127.0.0.1:8000/predict-food", {
      method: "POST",
      body: formData,
    });
  
    const data = await res.json();
    setResults(data.results || []);
  
    // Scroll to results
    setTimeout(() => {
      resultsRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 200);
  
    setIsLoading(false);
  };  

  // ======================================
  // SUBMIT IMAGE URL TO FASTAPI
  // ======================================
  const submitUrl = async () => {
    if (!imageUrl.trim()) return;
  
    setIsLoading(true);
  
    // Scroll to "Analyzing..."
    setTimeout(() => {
      loadingRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  
    const formData = new FormData();
    formData.append("url", imageUrl);
  
    const res = await fetch("http://127.0.0.1:8000/predict-food-url", {
      method: "POST",
      body: formData,
    });
  
    const data = await res.json();
    setResults(data.results || []);
  
    // Scroll to results
    setTimeout(() => {
      resultsRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 200);
  
    setIsLoading(false);
  };  

  return (
    <div className="finder-container">
      <h3 className="finder-title">Food Image Finder</h3>
      <p className="finder-subtitle">
        Upload a food photo or paste a food image URL.  
        DishIQ will find the closest menu items!
      </p>

      {/* =======================================
          UPLOAD SECTION
      ======================================== */}
      <div className="finder-box">
        <label className="finder-label">Upload a Food Image:</label>
        <input type="file" accept="image/*" onChange={handleImageUpload} />

        {imagePreview && (
          <img 
            src={imagePreview}
            className="finder-preview"
            alt="preview"
          />
        )}

        <button className="finder-btn" onClick={submitImage}>
          Analyze Image
        </button>
      </div>

      {/* =======================================
          OR URL INPUT
      ======================================== */}
      <div className="finder-box">
        <label className="finder-label">OR Paste Image URL:</label>
        <input
          type="text"
          className="finder-input"
          placeholder="https://example.com/food.jpg"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
        />

        <button className="finder-btn" onClick={submitUrl}>
          Analyze URL
        </button>
      </div>

      {isLoading && (
        <div ref={loadingRef}>
          <p className="loading-msg">Analyzing... 🔍</p>
        </div>
      )}

      {/* =======================================
          RESULTS
      ======================================== */}
      {results.length > 0 && (
        <div className="finder-results" ref={resultsRef}>
          <h4>Top Matches:</h4>

          {results.map((r, i) => (
            <div className="result-card" key={i}>
              <img src={r.image_url} alt="dish" className="result-img" />

              <div className="result-info">
                <p className="dish-name">{r.name}</p>
                <p className="restaurant-name">{r.restaurant_name}</p>
                <p className="similarity">
                  Match Score: <strong>{(r.similarity * 100).toFixed(1)}%</strong>
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FoodFinder;