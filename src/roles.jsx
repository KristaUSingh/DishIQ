// src/roles.jsx

// Define all permissions in one place (helps with scalability)
export const PERMISSIONS = {
  CREATE_MENU: "create_menu",
  MANAGE_MENU: "manage_menu",
  RATING_SYSTEM: "rating_system",
  COMPLAINT_SYSTEM: "complaint_system",
  REGISTRATION: "registration",
  BID_DELIVERY: "bid_delivery",
  TRANSPORT_ORDER: "transport_order",
};

// Define roles and their allowed permissions
export const ROLES = {
  CHEF: {
    name: "Chef",
    permissions: [
      PERMISSIONS.CREATE_MENU,
      PERMISSIONS.MANAGE_MENU,
      PERMISSIONS.RATING_SYSTEM,
      PERMISSIONS.COMPLAINT_SYSTEM,
    ],
  },
  MANAGER: {
    name: "Manager",
    permissions: [
      PERMISSIONS.CREATE_MENU,
      PERMISSIONS.MANAGE_MENU,
      PERMISSIONS.REGISTRATION,
      PERMISSIONS.RATING_SYSTEM,
      PERMISSIONS.COMPLAINT_SYSTEM,
    ],
  },
  DELIVERY_PERSON: {
    name: "Delivery Person",
    permissions: [
      PERMISSIONS.RATING_SYSTEM,
      PERMISSIONS.COMPLAINT_SYSTEM,
      PERMISSIONS.BID_DELIVERY,
      PERMISSIONS.TRANSPORT_ORDER,
    ],
  },
};

// 🔹 Utility: Check if a role has a specific permission
export const hasPermission = (role, permission) => {
  if (!role || !permission) return false;
  return ROLES[role]?.permissions.includes(permission);
};

// 🔹 Example React helper component for conditional rendering
// Usage:
// <PermissionGate role="CHEF" permission={PERMISSIONS.MANAGE_MENU}>
//   <MenuItem />
// </PermissionGate>

export const PermissionGate = ({ role, permission, children }) => {
  const allowed = hasPermission(role, permission);
  return allowed ? children : null;
};
