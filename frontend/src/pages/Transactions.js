import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { useTransactions, useCreateTransaction, useUpdateTransaction, useDeleteTransaction } from '../hooks/useTransactions';
import { useCategories } from '../hooks/useCategories';
import { useForm } from 'react-hook-form';
import CurrencyInput from '../components/CurrencyInput';
import PaymentBadge, { PM_CONFIG } from '../components/PaymentBadge';
import './Transactions.css';

function EditModal({ tx, categories, onClose, onSave }) {
  const { register, control, handleSubmit, reset, formState: { isSubmitting } } = useForm();

  useEffect(() => {
    reset({
      type: tx.type,
      amount: Number(tx.amount),
      categoryId: String(tx.categoryId),
      paymentMethod: tx.paymentMethod || '',
      date: format(new Date(tx.date), 'yyyy-MM-dd'),
      description: tx.description || '',
    });
  }, [tx, reset]);

  const onSubmit = async (data) => {
    await onSave({
      id: tx.id,
      ...data,
      categoryId: Number.parseInt(data.categoryId),
      paymentMethod: data.paymentMethod || null,
    });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <div>
            <h2>Edit Transaction</h2>
            <p className="modal-sub">Update details for this transaction</p>
          </div>
          <button className="modal-close" onClick={onClose}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M2 2l12 12M14 2L2 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="modal-form">
          <div className="modal-row">
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
          </div>

          <div className="modal-row">
            <div className="tx-form-field">
              <label>Category</label>
              <select {...register('categoryId', { required: true })}>
                <option value="">Select category</option>
                {categories?.map((c) => (
                  <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
                ))}
              </select>
            </div>
            <div className="tx-form-field">
              <label>Payment Method</label>
              <select {...register('paymentMethod')}>
                <option value="">— None —</option>
                {Object.entries(PM_CONFIG).map(([key, val]) => (
                  <option key={key} value={key}>{val.icon} {val.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="modal-row">
            <div className="tx-form-field">
              <label>Date</label>
              <input type="date" {...register('date', { required: true })} />
            </div>
            <div className="tx-form-field">
              <label>Description</label>
              <input placeholder="Optional note..." {...register('description')} />
            </div>
          </div>

          <div className="modal-actions">
            <button type="submit" className="btn-save" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
            <button type="button" className="btn-cancel-form" onClick={onClose}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const LIMIT = 20;

export default function Transactions() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'table'
  const [showForm, setShowForm] = useState(false);
  const [editingTx, setEditingTx] = useState(null);
  const [filterCategory, setFilterCategory] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterPayment, setFilterPayment] = useState('');

  // Reset to page 1 when filters/month/year change
  useEffect(() => { setPage(1); }, [month, year, filterCategory, filterType, filterPayment]);

  const { data, isLoading } = useTransactions({
    month, year, page, limit: LIMIT,
    ...(filterCategory && { categoryId: filterCategory }),
    ...(filterType && { type: filterType }),
    ...(filterPayment && { paymentMethod: filterPayment }),
  });

  const { data: categories } = useCategories();
  const createTx = useCreateTransaction();
  const updateTx = useUpdateTransaction();
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
  const transactions = data?.transactions || [];
  const totalRecords = data?.total || 0;
  const totalPages = data?.pages || 1;

  const totalAmount = transactions.reduce((s, t) =>
    t.type === 'EXPENSE' ? s - Number(t.amount) : s + Number(t.amount), 0);

  return (
    <div className="transactions-page">
      {editingTx && (
        <EditModal
          tx={editingTx}
          categories={categories}
          onClose={() => setEditingTx(null)}
          onSave={(data) => updateTx.mutateAsync(data)}
        />
      )}

      <div className="page-header">
        <div>
          <h1>Transactions</h1>
          {totalRecords > 0 && (
            <p className="tx-summary-line">
              {totalRecords} transaksi ·{' '}
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

          {/* View toggle */}
          <div className="view-toggle-sm">
            <button className={viewMode === 'list' ? 'active' : ''} onClick={() => setViewMode('list')} title="List view">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <rect x="1" y="2" width="12" height="2" rx="1" fill="currentColor"/>
                <rect x="1" y="6" width="12" height="2" rx="1" fill="currentColor"/>
                <rect x="1" y="10" width="12" height="2" rx="1" fill="currentColor"/>
              </svg>
            </button>
            <button className={viewMode === 'table' ? 'active' : ''} onClick={() => setViewMode('table')} title="Table view">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <rect x="1" y="1" width="5" height="5" rx="1" fill="currentColor"/>
                <rect x="8" y="1" width="5" height="5" rx="1" fill="currentColor"/>
                <rect x="1" y="8" width="5" height="5" rx="1" fill="currentColor"/>
                <rect x="8" y="8" width="5" height="5" rx="1" fill="currentColor"/>
              </svg>
            </button>
          </div>

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

      {/* ── LIST VIEW ── */}
      {viewMode === 'list' && (
        <div className="tx-list">
          {isLoading && (
            <div className="tx-skeleton-wrap">
              {[...Array(5)].map((_, i) => <div key={i} className="tx-skeleton" />)}
            </div>
          )}
          {!isLoading && transactions.length === 0 && <p className="no-data">No transactions found.</p>}
          {transactions.map((tx) => (
            <div key={tx.id} className={`tx-item ${tx.type.toLowerCase()}`}>
              <div className="tx-left">
                <div className="tx-icon-wrap">{tx.category?.icon}</div>
                <div className="tx-info">
                  <p className="tx-desc">{tx.description || tx.category?.name}</p>
                  <div className="tx-meta">
                    <span className="tx-date">{format(new Date(tx.date), 'dd MMM yyyy')}</span>
                    <span className="tx-dot">·</span>
                    <span className="tx-cat">{tx.category?.name || <span className="tx-no-cat">No category</span>}</span>
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
                <div className="tx-actions">
                  <button onClick={() => setEditingTx(tx)} className="btn-edit" title="Edit">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M9.5 1.5l3 3L4 13H1v-3L9.5 1.5z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
                    </svg>
                  </button>
                  <button onClick={() => deleteTx.mutate(tx.id)} className="btn-delete" title="Delete">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── TABLE VIEW ── */}
      {viewMode === 'table' && (
        <div className="tx-table-wrap">
          {isLoading && (
            <div className="tx-skeleton-wrap">
              {[...Array(5)].map((_, i) => <div key={i} className="tx-skeleton" />)}
            </div>
          )}
          {!isLoading && transactions.length === 0 && <p className="no-data">No transactions found.</p>}
          {transactions.length > 0 && (
            <table className="tx-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Description</th>
                  <th>Category</th>
                  <th>Payment</th>
                  <th>Type</th>
                  <th className="col-amount">Amount</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx) => (
                  <tr key={tx.id} className={tx.type.toLowerCase()}>
                    <td className="col-date">{format(new Date(tx.date), 'dd MMM yyyy')}</td>
                    <td className="col-desc">{tx.description || <span className="tx-muted">—</span>}</td>
                    <td className="col-cat">
                      <span className="cat-pill">
                        {tx.category?.icon} {tx.category?.name || <span className="tx-muted">No category</span>}
                      </span>
                    </td>
                    <td className="col-pm">
                      {tx.paymentMethod ? <PaymentBadge method={tx.paymentMethod} /> : <span className="tx-muted">—</span>}
                    </td>
                    <td className="col-type">
                      <span className={`type-badge ${tx.type.toLowerCase()}`}>{tx.type === 'INCOME' ? 'Income' : 'Expense'}</span>
                    </td>
                    <td className={`col-amount ${tx.type.toLowerCase()}`}>
                      {tx.type === 'INCOME' ? '+' : '-'}Rp {Number(tx.amount).toLocaleString('id-ID')}
                    </td>
                    <td className="col-actions">
                      <button onClick={() => setEditingTx(tx)} className="btn-edit" title="Edit">
                        <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                          <path d="M9.5 1.5l3 3L4 13H1v-3L9.5 1.5z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
                        </svg>
                      </button>
                      <button onClick={() => deleteTx.mutate(tx.id)} className="btn-delete" title="Delete">
                        <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                          <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* ── PAGINATION ── */}
      {totalPages > 1 && (
        <div className="pagination">
          <span className="pagination-info">
            Page {page} of {totalPages} · {totalRecords} records
          </span>
          <div className="pagination-controls">
            <button
              className="btn-page"
              onClick={() => setPage(1)}
              disabled={page === 1}
              title="First page"
            >«</button>
            <button
              className="btn-page"
              onClick={() => setPage((p) => p - 1)}
              disabled={page === 1}
            >‹ Prev</button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 2)
              .reduce((acc, p, i, arr) => {
                if (i > 0 && p - arr[i - 1] > 1) acc.push('...');
                acc.push(p);
                return acc;
              }, [])
              .map((item, i) =>
                item === '...'
                  ? <span key={`ellipsis-${i}`} className="pagination-ellipsis">…</span>
                  : <button
                      key={item}
                      className={`btn-page ${item === page ? 'active' : ''}`}
                      onClick={() => setPage(item)}
                    >{item}</button>
              )
            }
            <button
              className="btn-page"
              onClick={() => setPage((p) => p + 1)}
              disabled={page === totalPages}
            >Next ›</button>
            <button
              className="btn-page"
              onClick={() => setPage(totalPages)}
              disabled={page === totalPages}
              title="Last page"
            >»</button>
          </div>
        </div>
      )}
    </div>
  );
}
