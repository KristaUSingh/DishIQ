// src/components/MenuItem.jsx

import React from "react";

const MenuItem = ({ item, onDelete }) => {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        margin: "0.5rem 0",
        borderBottom: "1px solid #ccc",
        paddingBottom: "0.3rem",
      }}
    >
      <span>
        {item.name} - ${item.price}
      </span>
      {onDelete && <button onClick={onDelete}>Delete</button>}
    </div>
  );
};

export default MenuItem;
