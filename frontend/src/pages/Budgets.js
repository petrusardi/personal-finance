import { useState } from 'react';
import { format } from 'date-fns';
import { useBudgets, useUpsertBudget } from '../hooks/useBudgets';
import { useCategories } from '../hooks/useCategories';
import { useForm } from 'react-hook-form';
import CurrencyInput from '../components/CurrencyInput';
import './Budgets.css';

export default function Budgets() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());

  const { data: budgets } = useBudgets(month, year);
  const { data: categories } = useCategories();
  const upsert = useUpsertBudget();
  const { register, control, handleSubmit, reset } = useForm();

  const expenseCategories = categories?.filter((c) => c.type === 'EXPENSE') || [];

  const onSubmit = async (data) => {
    await upsert.mutateAsync({
      limitAmount: data.limitAmount,
      categoryId: Number.parseInt(data.categoryId),
      month,
      year,
    });
    reset();
  };

  return (
    <div className="budgets-page">
      <div className="page-header">
        <h1>Budgets</h1>
        <div style={{ display: 'flex', gap: 8 }}>
          <select value={month} onChange={(e) => setMonth(Number.parseInt(e.target.value))}>
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i + 1} value={i + 1}>{format(new Date(year, i, 1), 'MMMM')}</option>
            ))}
          </select>
          <select value={year} onChange={(e) => setYear(Number.parseInt(e.target.value))}>
            {[2023, 2024, 2025, 2026].map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>

      <div className="budget-form-card">
        <h3>Set Budget</h3>
        <form onSubmit={handleSubmit(onSubmit)} className="budget-form">
          <select {...register('categoryId', { required: true })}>
            <option value="">Select category</option>
            {expenseCategories.map((c) => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
          </select>
          <CurrencyInput name="limitAmount" control={control} rules={{ required: true }} placeholder="Batas budget" />
          <button type="submit">Save Budget</button>
        </form>
      </div>

      <div className="budget-list">
        {budgets?.length === 0 && <p className="no-data">No budgets set for this month.</p>}
        {budgets?.map((budget) => {
          const rawPct = (budget.spent / Number(budget.limitAmount)) * 100;
          const pct = Math.min(rawPct, 100);
          const over = budget.spent > Number(budget.limitAmount);
          const warning = !over && rawPct >= 75;
          let fillClass = '';
          if (over) fillClass = 'over';
          else if (warning) fillClass = 'warning';

          let pctClass = 'safe';
          if (over) pctClass = 'over';
          else if (warning) pctClass = 'warning';
          return (
            <div key={budget.id} className="budget-item">
              <div className="budget-top">
                <span className="budget-label">
                  {budget.category?.icon} {budget.category?.name}
                </span>
                <div className="budget-amounts">
                  <div className={over ? 'over' : ''}>
                    Rp {budget.spent.toLocaleString('id-ID')} / Rp {Number(budget.limitAmount).toLocaleString('id-ID')}
                  </div>
                  <div className={`budget-pct ${pctClass}`}>{Math.round(rawPct)}%</div>
                </div>
              </div>
              <div className="progress-bar">
                <div className={`progress-fill ${fillClass}`} style={{ width: `${pct}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
