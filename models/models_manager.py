# DishIQ Customer-Side Backend Framework (V3)
# Manager Class
# Last Update: 11/13/2025

import logging
from typing import Dict, List
from .user import BaseUser
from .customer import Customer, VIPCustomer, CustomerManager
from .chef import Chef
from .enums import UserRole, AccountStatus, FeedbackType, MAX_WARNINGS, OrderStatus
from utils.exceptions import UnauthorizedAccessException, InvalidOrderException

logger = logging.getLogger(__name__)

class Manager(BaseUser):
    """Manager handles reputation, HR actions, and account closure"""
    def __init__(self, user_id: str, username: str, email: str):
        super().__init__(user_id, username, email, role=UserRole.MANAGER)
        self.managed_customers: Dict[str, Customer] = {}
        self.managed_chefs: Dict[str, Chef] = {}

    # Reputation Handling (UC-07)
    def review_feedback(self, feedback_list: List, customer_dict: Dict[str, Customer]) -> None:
        for fb in feedback_list:
            if fb.target_type == "customer":
                customer = customer_dict.get(fb.target_id)
                if customer:
                    if fb.feedback_type == FeedbackType.COMPLAINT:
                        customer.warnings += 1
                        logger.info(f"Manager issued warning to customer {customer.user_id}")
                        if customer.warnings >= MAX_WARNINGS:
                            customer.account_status = AccountStatus.SUSPENDED
                            logger.warning(f"Customer {customer.user_id} suspended due to repeated complaints")
                    elif fb.feedback_type == FeedbackType.COMPLIMENT:
                        customer.compliments_received += 1
                        logger.info(f"Customer {customer.user_id} received compliment")

    # HR Actions (UC-08)
    def perform_hr_action(self, employee: BaseUser, action: str) -> None:
        if not isinstance(employee, (Customer, Chef)):
            raise UnauthorizedAccessException("HR actions only apply to Customer or Chef")
        if action == "promote":
            logger.info(f"Manager promoted {employee.user_id}")
            if isinstance(employee, Customer):
                vip_customer = CustomerManager().promote_to_vip(employee)
        elif action == "demote":
            logger.info(f"Manager demoted {employee.user_id}")
            if isinstance(employee, VIPCustomer):
                employee.role = UserRole.CUSTOMER
        elif action == "terminate":
            employee.account_status = AccountStatus.CLOSED
            logger.warning(f"Manager terminated account for {employee.user_id}")
        else:
            raise ValueError(f"Invalid HR action: {action}")

    # Account Closure (UC-10)
    def close_account(self, user: BaseUser) -> None:
        if isinstance(user, Customer):
            pending_orders = [o for o in user.order_history if o.status not in [OrderStatus.DELIVERED, OrderStatus.CANCELLED]]
            if pending_orders:
                raise InvalidOrderException(f"Cannot close account {user.user_id}, pending orders exist")
            user.account_status = AccountStatus.CLOSED
            user.account_balance = 0.0
            logger.warning(f"Customer {user.user_id} account closed")
        elif isinstance(user, Chef):
            user.menu_items.clear()
            user.account_status = AccountStatus.CLOSED
            logger.warning(f"Chef {user.user_id} account closed")
        else:
            raise UnauthorizedAccessException("Only Customer or Chef accounts can be closed")

    def get_permissions(self) -> List[str]:
        return ["review_feedback", "perform_hr_action", "close_account"]
