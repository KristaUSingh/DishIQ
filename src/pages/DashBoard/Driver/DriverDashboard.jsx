import React from "react";
import { PermissionGate, PERMISSIONS } from "../../../roles.jsx";
import Rating from "../../../components/Rating.jsx";
import ComplaintForm from "../../../components/ComplaintForm.jsx";

const DriverDashboard = () => {
  const role = "DELIVERY_PERSON";

  return (
    <div>
      <h2>🚚 Delivery Dashboard</h2>

      <PermissionGate role={role} permission={PERMISSIONS.BID_DELIVERY}>
        <section>
          <h3>Bid on Deliveries</h3>
          <p>Here delivery persons can bid for available deliveries.</p>
        </section>
      </PermissionGate>

      <PermissionGate role={role} permission={PERMISSIONS.TRANSPORT_ORDER}>
        <section>
          <h3>Transport Orders</h3>
          <p>Manage and track current delivery orders.</p>
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

export default DriverDashboard;
