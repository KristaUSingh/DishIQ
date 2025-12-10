import React from "react";
import './Finances.css';

// Sample realistic finance data
const financesData = {
  summary: {
    totalRevenue: 25400.75,
    totalExpenses: 18250.60,
    profit: 7150.15,
  },
  breakdown: [
    { category: "Food & Beverage", revenue: 18000, expenses: 9000 },
    { category: "Staff Salaries", revenue: 0, expenses: 5000 },
    { category: "Utilities", revenue: 0, expenses: 1500 },
    { category: "Maintenance", revenue: 0, expenses: 750 },
    { category: "Marketing", revenue: 0, expenses: 1000 },
  ],
  monthly: [
    { month: "Jan", revenue: 2100, expenses: 1500 },
    { month: "Feb", revenue: 2200, expenses: 1600 },
    { month: "Mar", revenue: 2500, expenses: 1800 },
    { month: "Apr", revenue: 2400, expenses: 1700 },
    { month: "May", revenue: 2600, expenses: 1900 },
    { month: "Jun", revenue: 2800, expenses: 2000 },
  ],
};

const Finances = () => {
  // Calculate monthly profits
  const monthlyProfits = financesData.monthly.map(m => ({
    month: m.month,
    profit: m.revenue - m.expenses
  }));

  // For scaling bars correctly
  const maxProfit = Math.max(...monthlyProfits.map(m => m.profit));

  return (
    <div className="finances-dashboard">
      <h2>Restaurant Finances</h2>

      <div className="finance-summary">
        <div className="finance-card">
          <h3>Total Revenue</h3>
          <p>${financesData.summary.totalRevenue.toLocaleString()}</p>
        </div>
        <div className="finance-card">
          <h3>Total Expenses</h3>
          <p>${financesData.summary.totalExpenses.toLocaleString()}</p>
        </div>
        <div className="finance-card">
          <h3>Total Profit</h3>
          <p style={{ color: "#52c41a" }}>
            ${financesData.summary.profit.toLocaleString()}
          </p>
        </div>
      </div>

      <h3>Category Breakdown</h3>
      <div className="breakdown-table">
        <div className="table-header">
          <span>Category</span>
          <span>Revenue</span>
          <span>Expenses</span>
          <span>Profit</span>
        </div>
        {financesData.breakdown.map(b => {
          const profit = b.revenue - b.expenses;
          return (
            <div key={b.category} className="table-row">
              <span>{b.category}</span>
              <span>${b.revenue.toLocaleString()}</span>
              <span>${b.expenses.toLocaleString()}</span>
              <span style={{ color: profit >= 0 ? "#52c41a" : "#ff4d4f" }}>
                ${profit.toLocaleString()}
              </span>
            </div>
          );
        })}
      </div>

      <h3>Monthly Profit</h3>

      <div className="monthly-chart">
        {monthlyProfits.map(m => (
          <div key={m.month} className="month-bar">
            <div
              className="profit-bar"
              style={{
                height: `${(m.profit / maxProfit) * 100}%`,
                backgroundColor: "#52c41a"
              }}
              title={`Profit: $${m.profit}`}
            ></div>
            <span className="month-label">{m.month}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Finances;
