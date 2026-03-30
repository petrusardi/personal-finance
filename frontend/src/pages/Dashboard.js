import { useState } from 'react';
import { format } from 'date-fns';
import { useSummary, useByCategory, useDailyExpenses, useYearlySummary } from '../hooks/useTransactions';
import { useSavingsBalance } from '../hooks/useSavings';
import { Doughnut, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS, ArcElement, Tooltip, Legend,
  CategoryScale, LinearScale, BarElement, Title,
} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import './Dashboard.css';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title, ChartDataLabels);

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const chartOptions = {
  responsive: true,
  plugins: { legend: { display: false }, datalabels: { display: false } },
  scales: {
    x: { grid: { display: false }, ticks: { font: { size: 11 } } },
    y: {
      grid: { color: '#f1f5f9' },
      ticks: {
        font: { size: 11 },
        callback: (v) => v >= 1_000_000 ? `${(v / 1_000_000).toFixed(1)}jt` : v >= 1000 ? `${(v / 1000).toFixed(0)}rb` : v,
      },
    },
  },
};

export default function Dashboard() {
  const now = new Date();
  const [view, setView] = useState('monthly'); // 'monthly' | 'yearly'
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());

  // Monthly data
  const { data: summary } = useSummary(month, year);
  const { data: byCategory } = useByCategory(month, year);
  const { data: dailyData } = useDailyExpenses(month, year);

  // Yearly data
  const { data: yearlyData } = useYearlySummary(year);

  // Savings (always shown)
  const { data: savingsData } = useSavingsBalance();
  const savingsBalance = savingsData?.balance || 0;
  const monthlyBalance = summary?.balance || 0;
  const netWorth = monthlyBalance + savingsBalance;

  // Yearly summary totals
  const yearlyIncome = yearlyData?.reduce((s, m) => s + m.income, 0) || 0;
  const yearlyExpense = yearlyData?.reduce((s, m) => s + m.expense, 0) || 0;
  const yearlyBalance = yearlyIncome - yearlyExpense;

  // Chart data: daily expenses
  const dailyChartData = {
    labels: dailyData?.map((d) => d.day) || [],
    datasets: [{
      label: 'Pengeluaran',
      data: dailyData?.map((d) => d.expense) || [],
      backgroundColor: dailyData?.map((d) => d.expense > 0 ? 'rgba(239,68,68,0.7)' : 'rgba(226,232,240,0.5)') || [],
      borderRadius: 4,
      borderSkipped: false,
    }],
  };

  // Chart data: doughnut
  const categoryTotal = byCategory?.reduce((s, d) => s + d.total, 0) || 0;

  const doughnutData = {
    labels: byCategory?.map((d) => d.category?.name) || [],
    datasets: [{
      data: byCategory?.map((d) => d.total) || [],
      backgroundColor: byCategory?.map((d) => d.category?.color || '#94a3b8') || [],
      borderWidth: 2,
      borderColor: '#fff',
    }],
  };

  const doughnutOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'bottom', labels: { font: { size: 11 }, usePointStyle: true, padding: 12 } },
      tooltip: {
        callbacks: {
          label: (ctx) => {
            const pct = categoryTotal > 0 ? ((ctx.parsed / categoryTotal) * 100).toFixed(1) : 0;
            return ` ${ctx.label}: Rp ${ctx.parsed.toLocaleString('id-ID')} (${pct}%)`;
          },
        },
      },
      datalabels: {
        color: '#fff',
        font: { weight: 'bold', size: 12 },
        formatter: (value) => {
          const pct = categoryTotal > 0 ? ((value / categoryTotal) * 100).toFixed(1) : 0;
          return pct >= 5 ? `${pct}%` : '';  // hanya tampil kalau >= 5% supaya tidak terlalu penuh
        },
        textShadowBlur: 4,
        textShadowColor: 'rgba(0,0,0,0.4)',
      },
    },
  };

  // Chart data: yearly income vs expense
  const yearlyChartData = {
    labels: MONTHS,
    datasets: [
      {
        label: 'Income',
        data: yearlyData?.map((m) => m.income) || [],
        backgroundColor: 'rgba(34,197,94,0.75)',
        borderRadius: 4,
        borderSkipped: false,
      },
      {
        label: 'Expense',
        data: yearlyData?.map((m) => m.expense) || [],
        backgroundColor: 'rgba(239,68,68,0.75)',
        borderRadius: 4,
        borderSkipped: false,
      },
    ],
  };

  const yearlyChartOptions = {
    ...chartOptions,
    plugins: { legend: { display: true, position: 'top', labels: { font: { size: 12 }, usePointStyle: true } }, datalabels: { display: false } },
  };

  return (
    <div className="dashboard">
      {/* ── Header ── */}
      <div className="dashboard-header">
        <div className="dashboard-title-row">
          <h1>Dashboard</h1>
          <div className="view-toggle">
            <button className={view === 'monthly' ? 'active' : ''} onClick={() => setView('monthly')}>Monthly</button>
            <button className={view === 'yearly' ? 'active' : ''} onClick={() => setView('yearly')}>Yearly</button>
          </div>
        </div>
        <div className="month-picker">
          {view === 'monthly' && (
            <select value={month} onChange={(e) => setMonth(parseInt(e.target.value))}>
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i + 1} value={i + 1}>{format(new Date(year, i, 1), 'MMMM')}</option>
              ))}
            </select>
          )}
          <select value={year} onChange={(e) => setYear(parseInt(e.target.value))}>
            {[2023, 2024, 2025, 2026].map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>

      {/* ── MONTHLY VIEW ── */}
      {view === 'monthly' && (
        <>
          <div className="summary-cards">
            <div className="card income">
              <span>Total Income</span>
              <h2>Rp {(summary?.income || 0).toLocaleString('id-ID')}</h2>
            </div>
            <div className="card expense">
              <span>Total Expense</span>
              <h2>Rp {(summary?.expense || 0).toLocaleString('id-ID')}</h2>
            </div>
            <div className={`card balance ${monthlyBalance >= 0 ? 'positive' : 'negative'}`}>
              <span>Balance This Month</span>
              <h2>Rp {monthlyBalance.toLocaleString('id-ID')}</h2>
            </div>
          </div>

          <div className="summary-cards-wide">
            <div className="card savings">
              <span>Savings Balance</span>
              <h2>Rp {savingsBalance.toLocaleString('id-ID')}</h2>
              <p className="card-sub">Total across all deposits &amp; withdrawals</p>
            </div>
            <div className={`card net-worth ${netWorth >= 0 ? 'positive' : 'negative'}`}>
              <span>Total Net Worth</span>
              <h2>Rp {netWorth.toLocaleString('id-ID')}</h2>
              <p className="card-sub">Monthly balance + savings balance</p>
            </div>
          </div>

          {/* Daily expense bar chart — full width */}
          <div className="chart-card chart-full">
            <h3>Daily Expenses — {format(new Date(year, month - 1, 1), 'MMMM yyyy')}</h3>
            {dailyData?.some((d) => d.expense > 0)
              ? <Bar data={dailyChartData} options={chartOptions} />
              : <p className="no-data">No expense data this month</p>
            }
          </div>

          <div className="charts-grid">
            <div className="chart-card">
              <h3>Expense by Category</h3>
              {byCategory?.length > 0
                ? <Doughnut data={doughnutData} options={doughnutOptions} />
                : <p className="no-data">No data for this month</p>
              }
            </div>
            <div className="chart-card">
              <h3>Top Expenses</h3>
              {byCategory?.length > 0 ? (
                <div className="category-list">
                  {byCategory.slice(0, 6).map((item) => (
                    <div key={item.category?.id} className="category-row">
                      <span>{item.category?.icon} {item.category?.name}</span>
                      <span>Rp {item.total.toLocaleString('id-ID')}</span>
                    </div>
                  ))}
                </div>
              ) : <p className="no-data">No data for this month</p>}
            </div>
          </div>
        </>
      )}

      {/* ── YEARLY VIEW ── */}
      {view === 'yearly' && (
        <>
          <div className="summary-cards">
            <div className="card income">
              <span>Total Income {year}</span>
              <h2>Rp {yearlyIncome.toLocaleString('id-ID')}</h2>
            </div>
            <div className="card expense">
              <span>Total Expense {year}</span>
              <h2>Rp {yearlyExpense.toLocaleString('id-ID')}</h2>
            </div>
            <div className={`card balance ${yearlyBalance >= 0 ? 'positive' : 'negative'}`}>
              <span>Yearly Balance</span>
              <h2>Rp {yearlyBalance.toLocaleString('id-ID')}</h2>
            </div>
          </div>

          <div className="summary-cards-wide">
            <div className="card savings">
              <span>Savings Balance</span>
              <h2>Rp {savingsBalance.toLocaleString('id-ID')}</h2>
              <p className="card-sub">Total across all deposits &amp; withdrawals</p>
            </div>
            <div className={`card net-worth ${(yearlyBalance + savingsBalance) >= 0 ? 'positive' : 'negative'}`}>
              <span>Total Net Worth</span>
              <h2>Rp {(yearlyBalance + savingsBalance).toLocaleString('id-ID')}</h2>
              <p className="card-sub">Yearly balance + savings balance</p>
            </div>
          </div>

          {/* Monthly income vs expense bar chart — full width */}
          <div className="chart-card chart-full">
            <h3>Income vs Expense — {year}</h3>
            {yearlyData?.some((m) => m.income > 0 || m.expense > 0)
              ? <Bar data={yearlyChartData} options={yearlyChartOptions} />
              : <p className="no-data">No data for {year}</p>
            }
          </div>

          {/* Monthly breakdown table */}
          <div className="chart-card chart-full">
            <h3>Monthly Breakdown</h3>
            <div className="yearly-table">
              <div className="yearly-table-head">
                <span>Month</span>
                <span>Income</span>
                <span>Expense</span>
                <span>Balance</span>
              </div>
              {yearlyData?.map((m) => (
                <div key={m.month} className={`yearly-table-row ${m.balance < 0 ? 'negative' : ''}`}>
                  <span>{MONTHS[m.month - 1]}</span>
                  <span className="amount-income">Rp {m.income.toLocaleString('id-ID')}</span>
                  <span className="amount-expense">Rp {m.expense.toLocaleString('id-ID')}</span>
                  <span className={`amount-balance ${m.balance >= 0 ? 'pos' : 'neg'}`}>
                    Rp {m.balance.toLocaleString('id-ID')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
