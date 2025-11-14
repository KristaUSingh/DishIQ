# DishIQ Customer-Side Backend Framework (V3)
# Custom Exceptions
# Last Update: 11/13/2025

class DishIQException(Exception):
    """Base exception class for all DishIQ-related errors."""
    pass

class InsufficientFundsException(DishIQException):
    """Raised when a customer has insufficient funds for an operation."""
    pass

class UnauthorizedAccessException(DishIQException):
    """Raised when a user attempts an action they don't have permission for."""
    pass

class RegistrationException(DishIQException):
    """Raised when there's an issue with customer registration."""
    pass

class InvalidOrderException(DishIQException):
    """Raised when an order is invalid or cannot be processed."""
    pass

class InvalidRatingException(DishIQException):
    """Raised when a rating is outside the valid range."""
    pass

class BlacklistedUserException(DishIQException):
    """Raised when a blacklisted user attempts to register."""
    pass
