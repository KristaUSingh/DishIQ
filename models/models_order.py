# DishIQ Customer-Side Backend Framework (V3)
# Order Models
# Last Update: 11/13/2025

import logging
from dataclasses import dataclass, asdict
from datetime import datetime
from typing import List, Dict, Optional
from .enums import OrderStatus
from utils.exceptions import InvalidOrderException

logger = logging.getLogger(__name__)

@dataclass
class OrderItem:
    menu_item_id: str
    name: str
    price: float
    quantity: int

    def get_subtotal(self) -> float:
        return self.price * self.quantity

    def to_dict(self) -> Dict:
        return asdict(self)

class Order:
    """Represents a customer order with items, delivery details, and status."""
    def __init__(self, order_id: str, customer_id: str, items: List[OrderItem], 
                 delivery_fee: float, discount: float, delivery_address: str):
        if not items:
            raise InvalidOrderException("Order must contain at least one item")
        self.order_id = order_id
        self.customer_id = customer_id
        self.items = items
        self.delivery_fee = delivery_fee
        self.discount = discount
        self.delivery_address = delivery_address
        self.status = OrderStatus.PENDING
        self.timestamp = datetime.now()
        self.delivery_person_id: Optional[str] = None
        self.has_complaint = False
        self.subtotal = sum(item.get_subtotal() for item in items)
        self.total_amount = self.subtotal - discount + delivery_fee
        logger.info(f"Order {order_id} created for customer {customer_id}: ${self.total_amount:.2f}")

    def update_status(self, new_status: OrderStatus) -> None:
        old_status = self.status
        self.status = new_status
        logger.info(f"Order {self.order_id} status: {old_status.value} -> {new_status.value}")

    def assign_delivery_person(self, delivery_person_id: str) -> None:
        self.delivery_person_id = delivery_person_id
        self.update_status(OrderStatus.CONFIRMED)

    def mark_delivered(self) -> None:
        self.update_status(OrderStatus.DELIVERED)

    def cancel(self) -> None:
        if self.status == OrderStatus.DELIVERED:
            raise InvalidOrderException("Cannot cancel a delivered order")
        self.update_status(OrderStatus.CANCELLED)

    def file_complaint(self) -> None:
        self.has_complaint = True
        logger.info(f"Complaint filed for order {self.order_id}")

    def is_successful(self) -> bool:
        return self.status == OrderStatus.DELIVERED and not self.has_complaint

    def to_dict(self) -> Dict:
        return {
            "order_id": self.order_id,
            "customer_id": self.customer_id,
            "items": [item.to_dict() for item in self.items],
            "subtotal": round(self.subtotal,2),
            "delivery_fee": round(self.delivery_fee,2),
            "discount": round(self.discount,2),
            "total_amount": round(self.total_amount,2),
            "status": self.status.value,
            "timestamp": self.timestamp.isoformat(),
            "delivery_person_id": self.delivery_person_id,
            "has_complaint": self.has_complaint,
            "delivery_address": self.delivery_address
        }
