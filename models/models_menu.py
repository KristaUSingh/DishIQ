# DishIQ Customer-Side Backend Framework (V3)
# Menu Item Model
# Last Update: 11/13/2025

import logging
from dataclasses import dataclass, asdict
from typing import Dict
from utils.exceptions import InvalidRatingException

logger = logging.getLogger(__name__)

@dataclass
class MenuItem:
    """Represents a single dish available in the restaurant menu."""
    item_id: str
    name: str
    description: str
    price: float
    chef_id: str
    rating: float = 0.0
    total_ratings: int = 0
    is_early_access: bool = False
    low_rating_count: int = 0
    high_rating_count: int = 0

    def update_rating(self, new_rating: float, is_vip: bool = False) -> None:
        if not (0 <= new_rating <= 5):
            raise InvalidRatingException("Rating must be between 0 and 5")
        if new_rating < 2:
            self.low_rating_count += 1
        if new_rating > 4:
            self.high_rating_count += 1
        weight = 1.5 if is_vip else 1.0
        total_weight = self.total_ratings + weight
        self.rating = ((self.rating * self.total_ratings) + (new_rating * weight)) / total_weight
        self.total_ratings += 1
        logger.info(f"MenuItem {self.item_id} rating updated: {self.rating:.2f} (VIP: {is_vip})")

    def to_dict(self) -> Dict:
        return asdict(self)
