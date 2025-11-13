import React from "react";
import { PermissionGate, PERMISSIONS } from "../../../roles.jsx";
import MenuItem from "../MenuItem.jsx";
import ComplaintForm from "../../../components/ComplaintForm.jsx";
import Rating from "../../../components/Rating.jsx"; 

const ChefDashboard = () => {
  const role = "CHEF";

  return (
    <div>
      <h2>Chef Dashboard</h2>

      <PermissionGate role={role} permission={PERMISSIONS.MANAGE_MENU}>
        <MenuItem item={{ name: "Pizza", price: 10 }} />
        <MenuItem item={{ name: "Pasta", price: 12 }} />
        <MenuItem item={{ name: "Salad", price: 8 }} />
      </PermissionGate>

      <PermissionGate role={role} permission={PERMISSIONS.RATING_SYSTEM}>
        <Rating />
      </PermissionGate>

      <PermissionGate role={role} permission={PERMISSIONS.COMPLAINT_SYSTEM}>
        <ComplaintForm />
      </PermissionGate>
    </div>
  );
};

export default ChefDashboard;
