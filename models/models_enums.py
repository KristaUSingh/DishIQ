# DishIQ Customer-Side Backend Framework (V3)
# Enumerations and Constants
# Last Update: 11/13/2025

from enum import Enum

class UserRole(Enum):
    VISITOR = "visitor"
    CUSTOMER = "customer"
    VIP_CUSTOMER = "vip_customer"
    CHEF = "chef"
    MANAGER = "manager"

class OrderStatus(Enum):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    PREPARING = "preparing"
    OUT_FOR_DELIVERY = "out_for_delivery"
    DELIVERED = "delivered"
    CANCELLED = "cancelled"

class FeedbackType(Enum):
    COMPLAINT = "complaint"
    COMPLIMENT = "compliment"

class AccountStatus(Enum):
    ACTIVE = "active"
    SUSPENDED = "suspended"
    BLACKLISTED = "blacklisted"
    CLOSED = "closed"

# System Constants
VIP_SPENDING_THRESHOLD = 100.00  # Minimum spending for VIP promotion
VIP_ORDER_THRESHOLD = 3  # Minimum orders for VIP promotion
MAX_WARNINGS = 3  # Maximum warnings before suspension
BLACKLIST_ENABLED = True  # Enable blacklisting
