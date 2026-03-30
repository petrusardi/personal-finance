import { useState } from 'react';
import { format } from 'date-fns';
import { useTransactions, useCreateTransaction, useDeleteTransaction } from '../hooks/useTransactions';
import { useCategories } from '../hooks/useCategories';
import { useForm } from 'react-hook-form';
import CurrencyInput from '../components/CurrencyInput';
import './Transactions.css';

export default function Transactions() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [showForm, setShowForm] = useState(false);

  const { data, isLoading } = useTransactions({ month, year });
  const { data: categories } = useCategories();
  const createTx = useCreateTransaction();
  const deleteTx = useDeleteTransaction();

  const { register, control, handleSubmit, reset, formState: { isSubmitting } } = useForm();

  const onSubmit = async (formData) => {
    await createTx.mutateAsync({ ...formData, categoryId: Number.parseInt(formData.categoryId) });
    reset();
    setShowForm(false);
  };

  return (
    <div className="transactions-page">
      <div className="page-header">
        <h1>Transactions</h1>
        <div style={{ display: 'flex', gap: 8 }}>
          <select value={month} onChange={(e) => setMonth(Number.parseInt(e.target.value))}>
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i + 1} value={i + 1}>{format(new Date(year, i, 1), 'MMMM')}</option>
            ))}
          </select>
          <select value={year} onChange={(e) => setYear(Number.parseInt(e.target.value))}>
            {[2023, 2024, 2025, 2026].map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
          <button className="btn-primary" onClick={() => setShowForm(!showForm)}>+ Add</button>
        </div>
      </div>

      {showForm && (
        <div className="form-card">
          <h3>New Transaction</h3>
          <form onSubmit={handleSubmit(onSubmit)} className="tx-form">
            <select {...register('type', { required: true })}>
              <option value="INCOME">Income</option>
              <option value="EXPENSE">Expense</option>
            </select>
            <CurrencyInput name="amount" control={control} rules={{ required: true }} placeholder="Jumlah" />
            <select {...register('categoryId', { required: true })}>
              <option value="">Select category</option>
              {categories?.map((c) => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
            </select>
            <input type="date" {...register('date', { required: true })} defaultValue={format(new Date(), 'yyyy-MM-dd')} />
            <input placeholder="Description (optional)" {...register('description')} />
            <button type="submit" disabled={isSubmitting}>Save</button>
          </form>
        </div>
      )}

      <div className="tx-list">
        {isLoading && <p>Loading...</p>}
        {data?.transactions?.length === 0 && <p className="no-data">No transactions this month.</p>}
        {data?.transactions?.map((tx) => (
          <div key={tx.id} className={`tx-item ${tx.type.toLowerCase()}`}>
            <div className="tx-left">
              <div className="tx-icon-wrap">{tx.category?.icon}</div>
              <div>
                <p className="tx-desc">{tx.description || tx.category?.name}</p>
                <p className="tx-date">{format(new Date(tx.date), 'dd MMM yyyy')} · {tx.category?.name}</p>
              </div>
            </div>
            <div className="tx-right">
              <span className="tx-amount">
                {tx.type === 'INCOME' ? '+' : '-'}Rp {Number(tx.amount).toLocaleString('id-ID')}
              </span>
              <button onClick={() => deleteTx.mutate(tx.id)} className="btn-delete">✕</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
