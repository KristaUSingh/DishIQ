# DishIQ Customer-Side Backend Framework (V3)
# Base User and Visitor Classes
# Last Update: 11/13/2025

import hashlib
import logging
from abc import ABC, abstractmethod
from datetime import datetime
from typing import List, Dict, Optional
from .enums import UserRole
from utils.exceptions import RegistrationException, BlacklistedUserException

logger = logging.getLogger(__name__)

class BaseUser(ABC):
    """Abstract base class for all user types."""
    def __init__(self, user_id: str, username: str, email: str, role: UserRole):
        self.user_id = user_id
        self.username = username
        self.email = email
        self.role = role
        self.created_at = datetime.now()
        logger.info(f"User created: {role.value} - {username} ({user_id})")

    @abstractmethod
    def get_permissions(self) -> List[str]:
        pass

    def has_permission(self, action: str) -> bool:
        return action in self.get_permissions()

    def to_dict(self) -> Dict:
        return {
            "user_id": self.user_id,
            "username": self.username,
            "email": self.email,
            "role": self.role.value,
            "created_at": self.created_at.isoformat()
        }

class Visitor(BaseUser):
    """Non-registered user browsing menus."""
    def __init__(self, user_id: str, username: str, email: str):
        super().__init__(user_id, username, email, UserRole.VISITOR)
        self.registration_application: Optional[Dict] = None

    def browse_menu(self, menu_items: List) -> List[Dict]:
        visible_items = [item for item in menu_items if not item.is_early_access]
        logger.info(f"Visitor {self.user_id} browsing menu")
        return [item.to_dict() for item in visible_items]

    def apply_for_registration(self, full_name: str, phone: str, address: str, password: str, blacklist: List[str]) -> Dict:
        if self.registration_application:
            raise RegistrationException("Registration application already submitted")
        from .enums import BLACKLIST_ENABLED
        if BLACKLIST_ENABLED and self.email in blacklist:
            raise BlacklistedUserException("This email is blacklisted")
        password_hash = hashlib.sha256(password.encode()).hexdigest()
        self.registration_application = {
            "applicant_id": self.user_id,
            "username": self.username,
            "email": self.email,
            "full_name": full_name,
            "phone": phone,
            "address": address,
            "password_hash": password_hash,
            "application_date": datetime.now().isoformat(),
            "status": "pending"
        }
        logger.info(f"Visitor {self.user_id} submitted registration")
        return self.registration_application.copy()

    def get_permissions(self) -> List[str]:
        return ["browse_menu", "apply_for_registration"]
