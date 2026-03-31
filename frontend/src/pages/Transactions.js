import { useState } from 'react';
import { format } from 'date-fns';
import { useTransactions, useCreateTransaction, useDeleteTransaction } from '../hooks/useTransactions';
import { useCategories } from '../hooks/useCategories';
import { useForm } from 'react-hook-form';
import CurrencyInput from '../components/CurrencyInput';
import PaymentBadge, { PM_CONFIG } from '../components/PaymentBadge';
import './Transactions.css';

export default function Transactions() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [showForm, setShowForm] = useState(false);
  const [filterCategory, setFilterCategory] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterPayment, setFilterPayment] = useState('');

  const { data, isLoading } = useTransactions({
    month, year,
    ...(filterCategory && { categoryId: filterCategory }),
    ...(filterType && { type: filterType }),
    ...(filterPayment && { paymentMethod: filterPayment }),
  });

  const { data: categories } = useCategories();
  const createTx = useCreateTransaction();
  const deleteTx = useDeleteTransaction();

  const { register, control, handleSubmit, reset, formState: { isSubmitting } } = useForm();

  const onSubmit = async (formData) => {
    await createTx.mutateAsync({
      ...formData,
      categoryId: Number.parseInt(formData.categoryId),
      paymentMethod: formData.paymentMethod || null,
    });
    reset();
    setShowForm(false);
  };

  const hasFilter = filterCategory || filterType || filterPayment;
  const totalShown = data?.transactions?.length || 0;
  const totalAmount = data?.transactions?.reduce((s, t) =>
    t.type === 'EXPENSE' ? s - Number(t.amount) : s + Number(t.amount), 0) || 0;

  return (
    <div className="transactions-page">
      <div className="page-header">
        <div>
          <h1>Transactions</h1>
          {totalShown > 0 && (
            <p className="tx-summary-line">
              {totalShown} transaksi ·{' '}
              <span className={totalAmount >= 0 ? 'pos' : 'neg'}>
                {totalAmount >= 0 ? '+' : ''}Rp {totalAmount.toLocaleString('id-ID')}
              </span>
            </p>
          )}
        </div>
        <div className="header-controls">
          <select value={month} onChange={(e) => setMonth(Number.parseInt(e.target.value))}>
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i + 1} value={i + 1}>{format(new Date(year, i, 1), 'MMMM')}</option>
            ))}
          </select>
          <select value={year} onChange={(e) => setYear(Number.parseInt(e.target.value))}>
            {[2023, 2024, 2025, 2026].map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
          <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
            <option value="">All Type</option>
            <option value="INCOME">Income</option>
            <option value="EXPENSE">Expense</option>
          </select>
          <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
            <option value="">All Category</option>
            {categories?.map((c) => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
          </select>
          <select value={filterPayment} onChange={(e) => setFilterPayment(e.target.value)}>
            <option value="">All Payment</option>
            {Object.entries(PM_CONFIG).map(([key, val]) => (
              <option key={key} value={key}>{val.icon} {val.label}</option>
            ))}
          </select>
          {hasFilter && (
            <button className="btn-reset" onClick={() => { setFilterType(''); setFilterCategory(''); setFilterPayment(''); }}>
              ✕ Reset
            </button>
          )}
          <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
            {showForm ? '✕ Close' : '+ Add'}
          </button>
        </div>
      </div>

      {showForm && (
        <div className="form-card">
          <h3>New Transaction</h3>
          <form onSubmit={handleSubmit(onSubmit)} className="tx-form">
            <div className="tx-form-field">
              <label>Type</label>
              <select {...register('type', { required: true })}>
                <option value="INCOME">Income</option>
                <option value="EXPENSE">Expense</option>
              </select>
            </div>
            <div className="tx-form-field">
              <label>Amount</label>
              <CurrencyInput name="amount" control={control} rules={{ required: true }} placeholder="0" />
            </div>
            <div className="tx-form-field">
              <label>Category</label>
              <select {...register('categoryId', { required: true })}>
                <option value="">Select category</option>
                {categories?.map((c) => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
              </select>
            </div>
            <div className="tx-form-field">
              <label>Payment Method</label>
              <select {...register('paymentMethod')}>
                <option value="">— Select —</option>
                {Object.entries(PM_CONFIG).map(([key, val]) => (
                  <option key={key} value={key}>{val.icon} {val.label}</option>
                ))}
              </select>
            </div>
            <div className="tx-form-field">
              <label>Date</label>
              <input type="date" {...register('date', { required: true })} defaultValue={format(new Date(), 'yyyy-MM-dd')} />
            </div>
            <div className="tx-form-field tx-form-desc">
              <label>Description</label>
              <input placeholder="Optional note..." {...register('description')} />
            </div>
            <div className="tx-form-actions">
              <button type="submit" className="btn-save" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : 'Save Transaction'}
              </button>
              <button type="button" className="btn-cancel-form" onClick={() => { reset(); setShowForm(false); }}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="tx-list">
        {isLoading && <div className="tx-skeleton-wrap">{[...Array(5)].map((_, i) => <div key={i} className="tx-skeleton" />)}</div>}
        {!isLoading && totalShown === 0 && <p className="no-data">No transactions found.</p>}
        {data?.transactions?.map((tx) => (
          <div key={tx.id} className={`tx-item ${tx.type.toLowerCase()}`}>
            <div className="tx-left">
              <div className="tx-icon-wrap">{tx.category?.icon}</div>
              <div className="tx-info">
                <p className="tx-desc">{tx.description || tx.category?.name}</p>
                <div className="tx-meta">
                  <span className="tx-date">{format(new Date(tx.date), 'dd MMM yyyy')}</span>
                  <span className="tx-dot">·</span>
                  <span className="tx-cat">{tx.category?.name}</span>
                  {tx.paymentMethod && (
                    <>
                      <span className="tx-dot">·</span>
                      <PaymentBadge method={tx.paymentMethod} />
                    </>
                  )}
                </div>
              </div>
            </div>
            <div className="tx-right">
              <span className="tx-amount">
                {tx.type === 'INCOME' ? '+' : '-'}Rp {Number(tx.amount).toLocaleString('id-ID')}
              </span>
              <button onClick={() => deleteTx.mutate(tx.id)} className="btn-delete" title="Delete">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
