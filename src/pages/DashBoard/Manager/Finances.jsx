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
  const profitColor = financesData.summary.profit >= 0 ? "#52c41a" : "#ff4d4f";

  // Calculate max value for scaling monthly bars
  const maxRevenue = Math.max(...financesData.monthly.map(m => m.revenue));
  const maxExpenses = Math.max(...financesData.monthly.map(m => m.expenses));
  const maxValue = Math.max(maxRevenue, maxExpenses);

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
        <div className="finance-card" style={{ borderLeft: `6px solid ${profitColor}` }}>
          <h3>Profit</h3>
          <p style={{ color: profitColor }}>${financesData.summary.profit.toLocaleString()}</p>
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
          const profitCol = profit >= 0 ? "#52c41a" : "#ff4d4f";
          return (
            <div key={b.category} className="table-row">
              <span>{b.category}</span>
              <span>${b.revenue.toLocaleString()}</span>
              <span>${b.expenses.toLocaleString()}</span>
              <span style={{ color: profitCol }}>${profit.toLocaleString()}</span>
            </div>
          );
        })}
      </div>

      <h3>Monthly Performance</h3>
      <div className="monthly-chart">
        {financesData.monthly.map(m => (
          <div key={m.month} className="month-bar">
            <div
              className="revenue-bar"
              style={{ height: `${(m.revenue / maxValue) * 100}%` }}
              title={`Revenue: $${m.revenue}`}
            ></div>
            <div
              className="expenses-bar"
              style={{ height: `${(m.expenses / maxValue) * 100}%` }}
              title={`Expenses: $${m.expenses}`}
            ></div>
            <span className="month-label">{m.month}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Finances;
