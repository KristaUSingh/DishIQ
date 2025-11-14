# DishIQ Customer-Side Backend Framework (V3)
# Chef Class
# Last Update: 11/13/2025

import logging
from typing import Dict, List, Optional
from .user import BaseUser
from .enums import UserRole, AccountStatus
from .menu import MenuItem
from utils.exceptions import InvalidOrderException

logger = logging.getLogger(__name__)

class Chef(BaseUser):
    """Restaurant chef who creates menu items, views feedback, and tracks performance."""
    def __init__(self, user_id: str, username: str, email: str):
        super().__init__(user_id, username, email, UserRole.CHEF)
        self.menu_items: Dict[str, MenuItem] = {}
        self.account_status = AccountStatus.ACTIVE
        self.feedback_received: List = []

    def create_menu_item(self, item_id: str, name: str, description: str, price: float, is_early_access: bool=False):
        menu_item = MenuItem(item_id, name, description, price, self.user_id, is_early_access=is_early_access)
        self.menu_items[item_id] = menu_item
        logger.info(f"Chef {self.user_id} created menu item {item_id}")
        return menu_item

    def update_menu_item(self, item_id: str, name: Optional[str]=None, description: Optional[str]=None, price: Optional[float]=None):
        item = self.menu_items.get(item_id)
        if not item:
            raise InvalidOrderException("Menu item not found")
        if name: 
            item.name = name
        if description: 
            item.description = description
        if price: 
            item.price = price
        logger.info(f"Chef {self.user_id} updated menu item {item_id}")
        return item

    def view_feedback(self) -> List[Dict]:
        return [f.to_dict() for f in self.feedback_received]

    def get_permissions(self) -> List[str]:
        return ["create_menu_item", "update_menu_item", "view_feedback"]
