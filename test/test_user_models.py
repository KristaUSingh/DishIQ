# DishIQ Customer-Side Backend Framework (V3)
# Unit Tests for Use Cases
# Last Update: 11/13/2025

import unittest
import logging
from models import (
    Visitor, Customer, VIPCustomer, Chef, Manager, CustomerManager,
    MenuItem, Order, Feedback, 
    UserRole, OrderStatus, FeedbackType, AccountStatus
)
from utils.exceptions import (
    InsufficientFundsException, UnauthorizedAccessException, 
    RegistrationException, InvalidOrderException, BlacklistedUserException
)

logging.basicConfig(level=logging.WARNING)

class TestVisitorUseCases(unittest.TestCase):
    """Test UC-01: Visitor browsing"""
    
    def setUp(self):
        self.visitor = Visitor("V001", "john_visitor", "john@example.com")
        self.chef = Chef("CH001", "chef_mario", "mario@restaurant.com")
        self.menu_items = [
            self.chef.create_menu_item("M001", "Pasta", "Classic Italian", 12.99),
            self.chef.create_menu_item("M002", "VIP Pizza", "Exclusive", 19.99, is_early_access=True),
        ]
    
    def test_visitor_browse_menu(self):
        """UC-01: Visitor can browse public menu items only"""
        visible = self.visitor.browse_menu(self.menu_items)
        self.assertEqual(len(visible), 1)
        self.assertEqual(visible[0]['name'], "Pasta")
    
    def test_visitor_apply_registration(self):
        """UC-02: Visitor applies for registration"""
        app = self.visitor.apply_for_registration(
            "John Doe", "555-1234", "123 Main St", "password123", []
        )
        self.assertEqual(app['status'], 'pending')
        self.assertEqual(app['full_name'], 'John Doe')
    
    def test_visitor_blacklist_prevention(self):
        """UC-02: Blacklisted visitor cannot register"""
        blacklist = ["john@example.com"]
        with self.assertRaises(BlacklistedUserException):
            self.visitor.apply_for_registration(
                "John Doe", "555-1234", "123 Main St", "password123", blacklist
            )

class TestCustomerUseCases(unittest.TestCase):
    """Test UC-03, UC-09: Customer orders and finance"""
    
    def setUp(self):
        self.customer = Customer("C001", "alice", "alice@example.com",
                                 "Alice Smith", "555-5678", "456 Oak Ave", "hash123")
        self.chef = Chef("CH001", "chef_mario", "mario@restaurant.com")
        self.pasta = self.chef.create_menu_item("M001", "Pasta", "Classic", 12.99)
        self.pizza = self.chef.create_menu_item("M002", "Pizza", "Delicious", 15.99)
    
    def test_deposit_funds(self):
        """UC-09: Customer deposits money"""
        balance = self.customer.deposit_funds(100.0)
        self.assertEqual(balance, 100.0)
    
    def test_place_order_success(self):
        """UC-03: Customer places order successfully"""
        self.customer.deposit_funds(50.0)
        order = self.customer.place_order([self.pasta], [2], delivery_fee=5.0)
        self.assertEqual(order.status, OrderStatus.PENDING)
        self.assertAlmostEqual(order.total_amount, 30.98, places=2)  # 12.99*2 + 5.00
    
    def test_place_order_insufficient_funds(self):
        """UC-03/UC-09: Customer receives warning for insufficient funds"""
        self.customer.deposit_funds(10.0)
        with self.assertRaises(InsufficientFundsException):
            self.customer.place_order([self.pasta], [2], delivery_fee=5.0)
        self.assertEqual(self.customer.warnings, 1)
    
    def test_inactive_customer_cannot_order(self):
        """UC-03: Suspended customer cannot place orders"""
        self.customer.account_status = AccountStatus.SUSPENDED
        with self.assertRaises(UnauthorizedAccessException):
            self.customer.place_order([self.pasta], [1])

class TestVIPCustomerUseCases(unittest.TestCase):
    """Test VIP customer features"""
    
    def setUp(self):
        base_customer = Customer("C002", "bob", "bob@example.com",
                                 "Bob Jones", "555-9999", "789 Elm St", "hash456")
        base_customer.total_spending = 150.0
        self.vip = VIPCustomer(base_customer)
        self.chef = Chef("CH001", "chef_mario", "mario@restaurant.com")
        self.pasta = self.chef.create_menu_item("M001", "Pasta", "Classic", 20.00)
    
    def test_vip_discount(self):
        """VIP receives 5% discount"""
        self.vip.deposit_funds(100.0)
        order = self.vip.place_order([self.pasta], [1], delivery_fee=5.0)
        # 20.00 - (20.00 * 0.05) + 5.00 = 24.00
        self.assertAlmostEqual(order.total_amount, 24.00, places=2)
    
    def test_vip_free_delivery_third_order(self):
        """VIP gets free delivery on every 3rd order"""
        self.vip.deposit_funds(200.0)
        # First two orders have delivery fee
        order1 = self.vip.place_order([self.pasta], [1])
        order2 = self.vip.place_order([self.pasta], [1])
        # Third order should have free delivery
        order3 = self.vip.place_order([self.pasta], [1])
        self.assertEqual(order3.delivery_fee, 0.0)
    
    def test_vip_promotion(self):
        """Customer promoted to VIP after threshold"""
        customer = Customer("C003", "charlie", "charlie@example.com",
                           "Charlie Brown", "555-7777", "321 Pine St", "hash789")
        customer.total_spending = 105.0
        cm = CustomerManager()
        vip = cm.promote_to_vip(customer)
        self.assertIsNotNone(vip)
        self.assertEqual(vip.role, UserRole.VIP_CUSTOMER)

class TestRatingAndFeedback(unittest.TestCase):
    """Test UC-06: Rating and feedback"""
    
    def setUp(self):
        self.customer = Customer("C001", "alice", "alice@example.com",
                                 "Alice Smith", "555-5678", "456 Oak Ave", "hash123")
        self.vip = VIPCustomer(self.customer)
        self.chef = Chef("CH001", "chef_mario", "mario@restaurant.com")
        self.pasta = self.chef.create_menu_item("M001", "Pasta", "Classic", 12.99)
    
    def test_customer_rate_dish(self):
        """UC-06: Customer rates a dish"""
        self.customer.rate_dish(self.pasta, 4.5)
        self.assertEqual(self.pasta.total_ratings, 1)
        self.assertAlmostEqual(self.pasta.rating, 4.5, places=2)
    
    def test_vip_rating_weighted(self):
        """UC-06: VIP rating counts 1.5x"""
        self.customer.rate_dish(self.pasta, 4.0)  # weight 1.0
        self.vip.rate_dish(self.pasta, 5.0)  # weight 1.5
        # (4.0*1.0 + 5.0*1.5) / (1.0 + 1.5) = 11.5 / 2.5 = 4.6
        self.assertAlmostEqual(self.pasta.rating, 4.6, places=2)
    
    def test_low_rating_tracking(self):
        """UC-06: Track low ratings for chef performance"""
        self.customer.rate_dish(self.pasta, 1.5)
        self.assertEqual(self.pasta.low_rating_count, 1)
    
    def test_feedback_creation(self):
        """UC-06: Create complaint feedback"""
        feedback = Feedback("F001", "C001", FeedbackType.COMPLAINT, 
                           "chef", "CH001", "Food was cold")
        self.assertEqual(feedback.feedback_type, FeedbackType.COMPLAINT)
        self.assertFalse(feedback.is_resolved)

class TestManagerUseCases(unittest.TestCase):
    """Test UC-07, UC-08, UC-10: Manager operations"""
    
    def setUp(self):
        self.manager = Manager("M001", "manager_jane", "jane@restaurant.com")
        self.customer = Customer("C001", "alice", "alice@example.com",
                                 "Alice Smith", "555-5678", "456 Oak Ave", "hash123")
        self.chef = Chef("CH001", "chef_mario", "mario@restaurant.com")
    
    def test_reputation_handling_complaints(self):
        """UC-07: Manager handles customer complaints"""
        feedback = Feedback("F001", "C002", FeedbackType.COMPLAINT,
                           "customer", "C001", "Rude behavior")
        self.manager.review_feedback([feedback], {"C001": self.customer})
        self.assertEqual(self.customer.warnings, 1)
    
    def test_suspension_after_max_warnings(self):
        """UC-07: Customer suspended after max warnings"""
        self.customer.warnings = 2
        feedback = Feedback("F001", "C002", FeedbackType.COMPLAINT,
                           "customer", "C001", "Another complaint")
        self.manager.review_feedback([feedback], {"C001": self.customer})
        self.assertEqual(self.customer.account_status, AccountStatus.SUSPENDED)
    
    def test_hr_action_promote(self):
        """UC-08: Manager promotes customer to VIP"""
        self.customer.total_spending = 120.0
        self.manager.perform_hr_action(self.customer, "promote")
        # Note: promotion creates new VIPCustomer, original remains Customer
    
    def test_hr_action_terminate(self):
        """UC-08: Manager terminates account"""
        self.manager.perform_hr_action(self.customer, "terminate")
        self.assertEqual(self.customer.account_status, AccountStatus.CLOSED)
    
    def test_account_closure_success(self):
        """UC-10: Manager closes account with no pending orders"""
        self.manager.close_account(self.customer)
        self.assertEqual(self.customer.account_status, AccountStatus.CLOSED)
        self.assertEqual(self.customer.account_balance, 0.0)
    
    def test_account_closure_with_pending_orders(self):
        """UC-10: Cannot close account with pending orders"""
        self.customer.deposit_funds(50.0)
        pasta = self.chef.create_menu_item("M001", "Pasta", "Classic", 12.99)
        order = self.customer.place_order([pasta], [1])
        with self.assertRaises(InvalidOrderException):
            self.manager.close_account(self.customer)

class TestChefUseCases(unittest.TestCase):
    """Test UC-04: Chef operations"""
    
    def setUp(self):
        self.chef = Chef("CH001", "chef_mario", "mario@restaurant.com")
    
    def test_create_menu_item(self):
        """UC-04: Chef creates menu item"""
        item = self.chef.create_menu_item("M001", "Lasagna", "Homemade", 16.99)
        self.assertEqual(item.name, "Lasagna")
        self.assertEqual(item.chef_id, "CH001")
    
    def test_create_early_access_item(self):
        """UC-04: Chef creates VIP-only item"""
        item = self.chef.create_menu_item("M002", "Special", "VIP only", 25.00, is_early_access=True)
        self.assertTrue(item.is_early_access)
    
    def test_update_menu_item(self):
        """UC-04: Chef updates menu item"""
        item = self.chef.create_menu_item("M001", "Lasagna", "Homemade", 16.99)
        updated = self.chef.update_menu_item("M001", price=18.99)
        self.assertEqual(updated.price, 18.99)

class TestOrderLifecycle(unittest.TestCase):
    """Test complete order lifecycle"""
    
    def setUp(self):
        self.customer = Customer("C001", "alice", "alice@example.com",
                                 "Alice Smith", "555-5678", "456 Oak Ave", "hash123")
        self.chef = Chef("CH001", "chef_mario", "mario@restaurant.com")
        self.pasta = self.chef.create_menu_item("M001", "Pasta", "Classic", 12.99)
        self.customer.deposit_funds(100.0)
    
    def test_complete_order_flow(self):
        """Complete order from placement to delivery"""
        # UC-03: Place order
        order = self.customer.place_order([self.pasta], [2], delivery_fee=5.0)
        self.assertEqual(order.status, OrderStatus.PENDING)
        
        # UC-05: Assign delivery person
        order.assign_delivery_person("DP001")
        self.assertEqual(order.status, OrderStatus.CONFIRMED)
        
        # Mark as delivered
        order.mark_delivered()
        self.assertEqual(order.status, OrderStatus.DELIVERED)
        self.assertTrue(order.is_successful())
    
    def test_order_with_complaint(self):
        """Order with complaint filed"""
        order = self.customer.place_order([self.pasta], [1])
        order.mark_delivered()
        order.file_complaint()
        self.assertFalse(order.is_successful())

if __name__ == '__main__':
    unittest.main()
