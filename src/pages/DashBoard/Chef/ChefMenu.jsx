import React, { useState, useEffect } from "react";
import './ChefMenu.css';

const ChefMenu = () => {
  const [menuCategories, setMenuCategories] = useState([
    {
      id: 1,
      name: "Top Dishes Near You",
      items: [
        {
          id: 101,
          name: "Halal Chicken Sandwich & Fries",
          description: "Crispy chicken sandwich with golden fries",
          price: 8.99,
          image: "https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=400"
        },
        {
          id: 102,
          name: "Plant-Based Chicken Sandwich & Fries",
          description: "Delicious plant-based chicken with crispy fries",
          price: 9.49,
          image: "https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?w=400"
        },
        {
          id: 103,
          name: "Nashville Halal Hot Chicken Sandwich & Fries",
          description: "Spicy Nashville-style chicken with fries",
          price: 10.99,
          image: "https://images.unsplash.com/photo-1619740455993-9e303d8d0d6e?w=400"
        },
        {
          id: 104,
          name: "Halal Beef Hamburger & Fries",
          description: "Juicy beef burger with fresh toppings and fries",
          price: 9.99,
          image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400"
        },
        {
          id: 105,
          name: "Veggie Burger & Fries",
          description: "Hearty veggie patty with golden fries",
          price: 8.49,
          image: "https://images.unsplash.com/photo-1520072959219-c595dc870360?w=400"
        }
      ]
    },
    {
      id: 2,
      name: "Sides & Snacks",
      items: [
        {
          id: 201,
          name: "Chicken Tenders & Fries",
          description: "Crispy breaded chicken tenders with fries",
          price: 7.99,
          image: "https://images.unsplash.com/photo-1562967914-608f82629710?w=400"
        },
        {
          id: 202,
          name: "Fish & Chips",
          description: "Golden fried fish with crispy chips",
          price: 11.99,
          image: "https://images.unsplash.com/photo-1580217593608-61931cefc821?w=400"
        },
        {
          id: 203,
          name: "French Fries",
          description: "Crispy golden french fries",
          price: 3.99,
          image: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400"
        },
        {
          id: 204,
          name: "Mozzarella Sticks",
          description: "Crispy breaded mozzarella sticks",
          price: 5.99,
          image: "https://images.unsplash.com/photo-1531749668029-2db88e4276c7?w=400"
        },
      ]
    }
  ]);

  const [addingCategory, setAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");

  const [addingItemCategoryId, setAddingItemCategoryId] = useState(null);
  const [newItem, setNewItem] = useState({
    name: "",
    description: "",
    price: "",
    image: ""
  });

  const [role, setRole] = useState(null);

  useEffect(() => {
    const storedRole = localStorage.getItem("role");
    setRole(storedRole);
  }, []);

  const handleAddCategory = () => {
    if (!newCategoryName.trim()) return alert("Please enter a category name.");
    const newCat = {
      id: Date.now(),
      name: newCategoryName.trim(),
      items: []
    };
    setMenuCategories([...menuCategories, newCat]);
    setNewCategoryName("");
    setAddingCategory(false);
  };

  const handleAddItemClick = (catId) => {
    setAddingItemCategoryId(catId);
    setNewItem({ name: "", description: "", price: "", image: "" });
  };

  const handleNewItemChange = (field, value) => {
    setNewItem(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSaveNewItem = (catId) => {
    if (!newItem.name.trim() || !newItem.price) {
      alert("Name and price are required.");
      return;
    }
    const newItemToAdd = {
      id: Date.now(),
      name: newItem.name.trim(),
      description: newItem.description.trim(),
      price: parseFloat(newItem.price),
      image: newItem.image.trim()
    };
    setMenuCategories(menuCategories.map(cat =>
      cat.id === catId
        ? { ...cat, items: [...cat.items, newItemToAdd] }
        : cat
    ));
    setAddingItemCategoryId(null);
    setNewItem({ name: "", description: "", price: "", image: "" });
  };

  const handleCancelNewItem = () => {
    setAddingItemCategoryId(null);
    setNewItem({ name: "", description: "", price: "", image: "" });
  };

  return (
    <>
      <div className="chef-dashboard-container">
        <h2 className="dashboard-title">Chef Menu</h2>

        <div className="menu-container">
          {menuCategories.length === 0 && (
            <p className="empty-state-message">No menu sections yet.</p>
          )}

          {menuCategories.map(category => (
            <section key={category.id} className="category-section">
              <h3 className="category-title">{category.name}</h3>

              <div className="items-list">
                {category.items.map(item => (
                  <div key={item.id} className="menu-item">
                    <div className="item-text">
                      <h4 className="item-name">{item.name}</h4>
                      <p className="item-description">{item.description}</p>
                      <p className="item-price">${item.price.toFixed(2)}</p>
                    </div>
                    {item.image && (
                      <img className="item-image" src={item.image} alt={item.name} />
                    )}
                  </div>
                ))}

                {role === "CHEF" && addingItemCategoryId === category.id && (
                  <div className="menu-item add-item-form">
                    <div className="item-text">
                      <input
                        type="text"
                        value={newItem.name}
                        onChange={(e) => handleNewItemChange('name', e.target.value)}
                        className="input-field"
                        placeholder="Item name"
                      />
                      <textarea
                        value={newItem.description}
                        onChange={(e) => handleNewItemChange('description', e.target.value)}
                        className="input-field textarea-field"
                        placeholder="Description"
                        rows={2}
                      />
                      <input
                        type="number"
                        value={newItem.price}
                        onChange={(e) => handleNewItemChange('price', e.target.value)}
                        className="input-field"
                        placeholder="Price"
                        step="0.01"
                        min="0"
                      />
                      <input
                        type="text"
                        value={newItem.image}
                        onChange={(e) => handleNewItemChange('image', e.target.value)}
                        className="input-field"
                        placeholder="Image URL"
                      />
                      <div className="add-item-buttons">
                        <button className="btn save-btn" onClick={() => handleSaveNewItem(category.id)}>Save</button>
                        <button className="btn cancel-btn" onClick={handleCancelNewItem}>Cancel</button>
                      </div>
                    </div>
                  </div>
                )}

                {role === "CHEF" && addingItemCategoryId !== category.id && (
                  <button className="btn add-item-btn" onClick={() => handleAddItemClick(category.id)}>
                    + Add Item
                  </button>
                )}
              </div>
            </section>
          ))}

          {role === "CHEF" && (
            <div className="add-category-section">
              {addingCategory ? (
                <div className="add-category-form">
                  <input
                    type="text"
                    placeholder="New section name"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    className="input-field"
                  />
                  <div className="add-category-buttons">
                    <button className="btn save-btn" onClick={handleAddCategory}>Add Section</button>
                    <button className="btn cancel-btn" onClick={() => { setAddingCategory(false); setNewCategoryName(""); }}>Cancel</button>
                  </div>
                </div>
              ) : (
                <button className="btn add-category-btn" onClick={() => setAddingCategory(true)}>
                  + Add Section
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ChefMenu;
