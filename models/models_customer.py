# DishIQ Customer-Side Backend Framework (V3)
# Customer and VIP Customer Classes
# Last Update: 11/13/2025

import logging
from datetime import datetime
from typing import List, Dict, Optional
from .user import BaseUser
from .enums import UserRole, AccountStatus, MAX_WARNINGS, VIP_SPENDING_THRESHOLD, VIP_ORDER_THRESHOLD
from .order import Order, OrderItem
from utils.exceptions import UnauthorizedAccessException, InsufficientFundsException, InvalidOrderException

logger = logging.getLogger(__name__)

class Customer(BaseUser):
    """Registered customer."""
    def __init__(self, user_id: str, username: str, email: str, 
                 full_name: str, phone: str, address: str, password_hash: str):
        super().__init__(user_id, username, email, UserRole.CUSTOMER)
        self.full_name = full_name
        self.phone = phone
        self.address = address
        self.password_hash = password_hash
        self.account_status = AccountStatus.ACTIVE
        self.account_balance = 0.0
        self.total_spending = 0.0
        self.order_history: List[Order] = []
        self.successful_orders = 0
        self.warnings = 0
        self.max_warnings = MAX_WARNINGS
        self.feedback_submitted: List = []
        self.complaints_received: int = 0
        self.compliments_received: int = 0

    def is_active(self) -> bool:
        return self.account_status == AccountStatus.ACTIVE

    def deposit_funds(self, amount: float) -> float:
        if not self.is_active():
            raise UnauthorizedAccessException(f"Account {self.account_status.value}")
        if amount <= 0:
            raise ValueError("Deposit must be positive")
        self.account_balance += amount
        logger.info(f"Customer {self.user_id} deposited ${amount:.2f}")
        return self.account_balance

    def withdraw_funds(self, amount: float) -> float:
        if amount > self.account_balance:
            raise InsufficientFundsException(f"Insufficient funds: ${self.account_balance:.2f}")
        self.account_balance -= amount
        logger.info(f"Customer {self.user_id} withdrew ${amount:.2f}")
        return self.account_balance

    def place_order(self, menu_items: List, quantities: List[int], delivery_fee: float = 5.0) -> Order:
        if not self.is_active():
            raise UnauthorizedAccessException(f"Account {self.account_status.value}")
        if len(menu_items) != len(quantities):
            raise InvalidOrderException("Items and quantities mismatch")
        order_id = f"ORD-{self.user_id}-{len(self.order_history)+1}-{int(datetime.now().timestamp())}"
        order_items = [OrderItem(i.item_id, i.name, i.price, q) for i, q in zip(menu_items, quantities)]
        discount = 0.0
        order = Order(order_id, self.user_id, order_items, delivery_fee, discount, self.address)
        if self.account_balance < order.total_amount:
            self.warnings += 1
            logger.warning(f"Customer {self.user_id} received warning for insufficient funds")
            raise InsufficientFundsException(f"Need ${order.total_amount:.2f}, have ${self.account_balance:.2f}")
        self.account_balance -= order.total_amount
        self.total_spending += order.total_amount
        self.order_history.append(order)
        logger.info(f"Customer {self.user_id} placed order {order_id}")
        return order

    def get_order_history(self) -> List[Dict]:
        return [o.to_dict() for o in self.order_history]

    def rate_dish(self, menu_item, rating: float, comment: Optional[str] = None) -> None:
        is_vip = isinstance(self, VIPCustomer)
        menu_item.update_rating(rating, is_vip)
        logger.info(f"Customer {self.user_id} rated {menu_item.item_id}: {rating}/5, comment={comment}")

    def get_permissions(self) -> List[str]:
        return ["place_order", "rate_dish", "deposit_funds", "withdraw_funds"]

class VIPCustomer(Customer):
    """VIP customer with discounts and early access."""
    def __init__(self, base_customer: Customer):
        super().__init__(base_customer.user_id, base_customer.username, base_customer.email,
                         base_customer.full_name, base_customer.phone, base_customer.address,
                         base_customer.password_hash)
        self.role = UserRole.VIP_CUSTOMER
        self.max_warnings = 2  # VIP max warning before demotion to regular customer
        self.account_balance = base_customer.account_balance
        self.total_spending = base_customer.total_spending
        self.order_history = base_customer.order_history
        self.successful_orders = base_customer.successful_orders
        self.warnings = base_customer.warnings
        self.feedback_submitted = base_customer.feedback_submitted
        self.complaints_received = base_customer.complaints_received
        self.compliments_received = base_customer.compliments_received

    def place_order(self, menu_items: List, quantities: List[int], delivery_fee: float = 0.0) -> Order:
        order_count = len(self.order_history) + 1
        if order_count % 3 == 0:  # Check for every 3rd order (free delivery)
            delivery_fee = 0.0 
        else:
            delivery_fee = 5.0  # Regular delivery fee
        discount = 0.05  # 5% discount for VIP 
        total_price = sum(i.price * q for i, q in zip(menu_items, quantities))
        discount_amount = total_price * discount
        order_id = f"ORD-{self.user_id}-{len(self.order_history)+1}-{int(datetime.now().timestamp())}"
        order_items = [OrderItem(i.item_id, i.name, i.price, q) for i, q in zip(menu_items, quantities)]
        order = Order(order_id, self.user_id, order_items, delivery_fee, discount_amount, self.address)
        if self.account_balance < order.total_amount:
            raise InsufficientFundsException(f"VIP order requires ${order.total_amount:.2f}, have ${self.account_balance:.2f}")
        self.account_balance -= order.total_amount
        self.total_spending += order.total_amount
        self.order_history.append(order)
        logger.info(f"VIPCustomer {self.user_id} placed order {order_id} with discount ${discount_amount:.2f}")
        return order

    def get_permissions(self) -> List[str]:
        return super().get_permissions() + ["vip_discount", "early_access"]

class CustomerManager:
    """Helper class to promote eligible customers to VIP."""
    def promote_to_vip(self, customer: Customer) -> Optional[VIPCustomer]:
        if customer.total_spending >= VIP_SPENDING_THRESHOLD or len(customer.order_history) >= VIP_ORDER_THRESHOLD:
            vip = VIPCustomer(customer)
            logger.info(f"Customer {customer.user_id} promoted to VIP")
            return vip
        return None
