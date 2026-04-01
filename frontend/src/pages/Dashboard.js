import { useState } from 'react';
import { format } from 'date-fns';
import { useSummary, useByCategory, useByPaymentMethod, useDailyExpenses, useYearlySummary } from '../hooks/useTransactions';
import { useTrend, useByWeekday } from '../hooks/useTransactions';
import { useBudgets } from '../hooks/useBudgets';
import { useSavings } from '../hooks/useSavings';
import { useCurrentBalance } from '../hooks/useBalance';
import { Doughnut, Bar } from 'react-chartjs-2';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS, ArcElement, Tooltip, Legend,
  CategoryScale, LinearScale, BarElement, Title,
} from 'chart.js';
import { LineElement, PointElement, Filler } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import PaymentBadge from '../components/PaymentBadge';
import './Dashboard.css';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title, ChartDataLabels, LineElement, PointElement, Filler);

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
  const { data: byPaymentMethod } = useByPaymentMethod(month, year);

  const { data: trendData } = useTrend();
  const { data: weekdayData } = useByWeekday(month, year);
  const { data: budgetsData } = useBudgets(month, year);
  const { data: savingsData = [] } = useSavings();

  // Savings (always shown)
  const { data: balanceData } = useCurrentBalance();
  const currentBalance = balanceData?.current || 0;
  const monthlyBalance = summary?.balance || 0;

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

  // Trend chart data
  const trendLabels = trendData?.map((d) => {
    const date = new Date(d.year, d.month - 1, 1);
    return date.toLocaleDateString('id-ID', { month: 'short', year: '2-digit' });
  }) || [];

  const trendChartData = {
    labels: trendLabels,
    datasets: [
      {
        label: 'Income',
        data: trendData?.map((d) => d.income) || [],
        borderColor: 'rgba(16,185,129,0.9)',
        backgroundColor: 'rgba(16,185,129,0.08)',
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointBackgroundColor: 'rgba(16,185,129,0.9)',
      },
      {
        label: 'Expense',
        data: trendData?.map((d) => d.expense) || [],
        borderColor: 'rgba(244,63,94,0.9)',
        backgroundColor: 'rgba(244,63,94,0.08)',
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointBackgroundColor: 'rgba(244,63,94,0.9)',
      },
    ],
  };

  const trendOptions = {
    responsive: true,
    plugins: {
      legend: { display: true, position: 'top', labels: { font: { size: 12 }, usePointStyle: true } },
      datalabels: { display: false },
    },
    scales: {
      x: { grid: { display: false }, ticks: { font: { size: 11 } } },
      y: {
        grid: { color: '#f1f5f9' },
        ticks: {
          font: { size: 11 },
          callback: (v) => v >= 1_000_000 ? `${(v/1_000_000).toFixed(1)}jt` : v >= 1000 ? `${(v/1000).toFixed(0)}rb` : v,
        },
      },
    },
  };

  // Weekday chart data
  const weekdayChartData = {
    labels: weekdayData?.map((d) => d.day) || [],
    datasets: [{
      label: 'Pengeluaran',
      data: weekdayData?.map((d) => d.total) || [],
      backgroundColor: weekdayData?.map((d) => d.total > 0 ? 'rgba(99,102,241,0.7)' : 'rgba(226,232,240,0.5)') || [],
      borderRadius: 4,
      borderSkipped: false,
    }],
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
            <div className={`card net-worth ${currentBalance >= 0 ? 'positive' : 'negative'}`}>
              <span>Saldo Rekening Saat Ini</span>
              <h2>Rp {currentBalance.toLocaleString('id-ID')}</h2>
              <p className="card-sub">Saldo awal + income debit − expense debit</p>
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

          {/* Payment Method Breakdown */}
          {byPaymentMethod?.length > 0 && (
            <div className="chart-card chart-full">
              <h3>Expense by Payment Method</h3>
              <div className="payment-method-grid">
                {byPaymentMethod.map((item) => {
                  const pmTotal = byPaymentMethod.reduce((s, d) => s + d.total, 0);
                  const pct = pmTotal > 0 ? ((item.total / pmTotal) * 100).toFixed(1) : 0;
                  return (
                    <div key={item.method} className="pm-stat-card">
                      <div className="pm-stat-top">
                        <PaymentBadge method={item.method} />
                        <span className="pm-pct">{pct}%</span>
                      </div>
                      <p className="pm-amount">Rp {item.total.toLocaleString('id-ID')}</p>
                      <div className="pm-bar-track">
                        <div className="pm-bar-fill" style={{ width: `${pct}%`, background: `var(--pm-${item.method === 'E_WALLET' ? 'ewallet' : item.method.toLowerCase()})` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Trend 6 bulan */}
          <div className="chart-card chart-full">
            <h3>Income vs Expense — 6 Bulan Terakhir</h3>
            {trendData?.some((d) => d.income > 0 || d.expense > 0)
              ? <Line data={trendChartData} options={trendOptions} />
              : <p className="no-data">Belum ada data</p>
            }
          </div>

          {/* Spending by weekday */}
          <div className="charts-grid" style={{ marginTop: 20 }}>
            <div className="chart-card">
              <h3>Pengeluaran per Hari</h3>
              {weekdayData?.some((d) => d.total > 0)
                ? <Bar data={weekdayChartData} options={chartOptions} />
                : <p className="no-data">Belum ada data bulan ini</p>
              }
            </div>

            {/* Budget vs Actual */}
            <div className="chart-card">
              <h3>Budget vs Aktual</h3>
              {budgetsData?.length > 0 ? (
                <div className="budget-vs-actual">
                  {budgetsData.map((b) => {
                    const pct = Math.min((b.spent / Number(b.limitAmount)) * 100, 100);
                    const over = b.spent > Number(b.limitAmount);
                    const warn = !over && pct >= 75;
                    return (
                      <div key={b.id} className="bva-row">
                        <div className="bva-label">
                          <span>{b.category?.icon} {b.category?.name}</span>
                          <span className={over ? 'bva-over' : warn ? 'bva-warn' : 'bva-safe'}>
                            {Math.round(pct)}%
                          </span>
                        </div>
                        <div className="bva-track">
                          <div
                            className={`bva-fill ${over ? 'over' : warn ? 'warn' : ''}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <div className="bva-amounts">
                          <span>Rp {b.spent.toLocaleString('id-ID')}</span>
                          <span className="bva-limit">/ Rp {Number(b.limitAmount).toLocaleString('id-ID')}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : <p className="no-data">Belum ada budget bulan ini</p>}
            </div>
          </div>

          {/* Savings progress */}
          {savingsData.length > 0 && (
            <div className="chart-card chart-full" style={{ marginTop: 20 }}>
              <h3>Savings Progress</h3>
              <div className="savings-overview-grid">
                {savingsData.map((sv) => {
                  const pct = sv.target ? Math.min((sv.balance / sv.target) * 100, 100) : null;
                  return (
                    <div key={sv.id} className="sov-card">
                      <div className="sov-top">
                        <span className="sov-icon">{sv.icon}</span>
                        <div>
                          <p className="sov-name">{sv.name}</p>
                          <span className={`sv-type-badge ${sv.type.toLowerCase()}`}>
                            {sv.type === 'TABUNGAN' ? 'Tabungan' : 'Investasi'}
                          </span>
                        </div>
                      </div>
                      <p className="sov-balance">Rp {sv.balance.toLocaleString('id-ID')}</p>
                      {pct !== null && (
                        <>
                          <div className="sv-progress-track" style={{ marginBottom: 4 }}>
                            <div className="sv-progress-fill" style={{ width: `${pct}%` }} />
                          </div>
                          <p className="sov-target">{pct.toFixed(0)}% dari Rp {sv.target.toLocaleString('id-ID')}</p>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
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
            <div className={`card net-worth ${currentBalance >= 0 ? 'positive' : 'negative'}`}>
              <span>Saldo Rekening Saat Ini</span>
              <h2>Rp {currentBalance.toLocaleString('id-ID')}</h2>
              <p className="card-sub">Saldo awal + income debit − expense debit</p>
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

          {/* Trend line chart */}
          <div className="chart-card chart-full">
            <h3>Income vs Expense — 6 Bulan Terakhir</h3>
            {trendData?.some((d) => d.income > 0 || d.expense > 0)
              ? <Line data={trendChartData} options={trendOptions} />
              : <p className="no-data">Belum ada data</p>
            }
          </div>
        </>
      )}
    </div>
  );
}
