# DishIQ Customer-Side Backend Framework (V3)
# Feedback Model
# Last Update: 11/13/2025

import logging
from dataclasses import dataclass, asdict
from datetime import datetime
from typing import Optional, Dict
from .enums import FeedbackType

logger = logging.getLogger(__name__)

@dataclass
class Feedback:
    feedback_id: str
    customer_id: str
    feedback_type: FeedbackType
    target_type: str
    target_id: str
    content: str
    is_vip: bool = False
    timestamp: datetime = None
    response: Optional[str] = None
    is_resolved: bool = False
    can_cancel_complaint: bool = True

    def __post_init__(self):
        if self.timestamp is None:
            self.timestamp = datetime.now()
        logger.info(f"Feedback {self.feedback_id} created: {self.feedback_type.value} (VIP: {self.is_vip})")

    def add_response(self, response: str) -> None:
        self.response = response
        self.is_resolved = True
        logger.info(f"Feedback {self.feedback_id} responded to by manager")

    def cancel_with_compliment(self) -> bool:
        if self.feedback_type == FeedbackType.COMPLAINT and self.can_cancel_complaint and not self.is_resolved:
            self.is_resolved = True
            self.response = "Cancelled by compliment"
            logger.info(f"Complaint {self.feedback_id} cancelled by compliment")
            return True
        return False

    def to_dict(self) -> Dict:
        data = asdict(self)
        data['feedback_type'] = self.feedback_type.value
        data['timestamp'] = self.timestamp.isoformat()
        return data
