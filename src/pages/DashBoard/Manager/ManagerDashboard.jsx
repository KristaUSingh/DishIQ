// src/components/pages/ManagerDashboard.jsx

import React from "react";
import { PermissionGate, PERMISSIONS } from "../../../roles.jsx";
import MenuItem from "../../../components/MenuItem.jsx";
import Rating from "../Chef/Feedback.jsx";
import ComplaintForm from "../../../components/ComplaintForm.jsx";

const ManagerDashboard = () => {
  const role = "MANAGER";

  return (
    <div>
      <h2>👔 Manager Dashboard</h2>

      <PermissionGate role={role} permission={PERMISSIONS.MANAGE_MENU}>
        <section>
          <h3>Manage Menu</h3>
          <MenuItem />
        </section>
      </PermissionGate>

      <PermissionGate role={role} permission={PERMISSIONS.REGISTRATION}>
        <section>
          <h3>Apply Registration</h3>
          <p>Manager can register new users or update credentials here.</p>
        </section>
      </PermissionGate>

      <PermissionGate role={role} permission={PERMISSIONS.RATING_SYSTEM}>
        <section>
          <h3>Rating System</h3>
          <Rating />
        </section>
      </PermissionGate>

      <PermissionGate role={role} permission={PERMISSIONS.COMPLAINT_SYSTEM}>
        <section>
          <h3>Complaints & Compliments</h3>
          <ComplaintForm />
        </section>
      </PermissionGate>
    </div>
  );
};

export default ManagerDashboard;
