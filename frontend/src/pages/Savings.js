import { useState } from 'react';
import { format } from 'date-fns';
import { useForm } from 'react-hook-form';
import { useSavings, useSavingsBalance, useCreateSavings, useDeleteSavings } from '../hooks/useSavings';
import CurrencyInput from '../components/CurrencyInput';
import './Savings.css';

export default function Savings() {
  const [showForm, setShowForm] = useState(false);
  const { data: entries, isLoading } = useSavings();
  const { data: balanceData } = useSavingsBalance();
  const createEntry = useCreateSavings();
  const deleteEntry = useDeleteSavings();

  const { register, control, handleSubmit, reset, formState: { isSubmitting } } = useForm();

  const onSubmit = async (data) => {
    await createEntry.mutateAsync({
      ...data,
      amount: data.amount,
    });
    reset();
    setShowForm(false);
  };

  const totalDeposit = entries?.filter((e) => e.type === 'DEPOSIT').reduce((s, e) => s + Number(e.amount), 0) || 0;
  const totalWithdraw = entries?.filter((e) => e.type === 'WITHDRAWAL').reduce((s, e) => s + Number(e.amount), 0) || 0;
  const balance = balanceData?.balance || 0;

  return (
    <div className="savings-page">
      <div className="page-header">
        <h1>Savings</h1>
        <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
          + Add Entry
        </button>
      </div>

      {/* Summary Cards */}
      <div className="savings-cards">
        <div className="savings-card balance">
          <span>Total Balance</span>
          <h2>Rp {balance.toLocaleString('id-ID')}</h2>
        </div>
        <div className="savings-card deposit">
          <span>Total Deposited</span>
          <h2>Rp {totalDeposit.toLocaleString('id-ID')}</h2>
        </div>
        <div className="savings-card withdraw">
          <span>Total Withdrawn</span>
          <h2>Rp {totalWithdraw.toLocaleString('id-ID')}</h2>
        </div>
      </div>

      {/* Add Form */}
      {showForm && (
        <div className="form-card">
          <h3>New Savings Entry</h3>
          <form onSubmit={handleSubmit(onSubmit)} className="savings-form">
            <select {...register('type', { required: true })}>
              <option value="DEPOSIT">Deposit</option>
              <option value="WITHDRAWAL">Withdrawal</option>
            </select>
            <CurrencyInput name="amount" control={control} rules={{ required: true, min: 1 }} placeholder="Jumlah" />
            <input
              type="date"
              defaultValue={format(new Date(), 'yyyy-MM-dd')}
              {...register('date', { required: true })}
            />
            <input
              placeholder="Description (optional)"
              {...register('description')}
            />
            <button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save'}
            </button>
          </form>
        </div>
      )}

      {/* Entries List */}
      <div className="savings-list">
        {isLoading && <p className="no-data">Loading...</p>}
        {!isLoading && entries?.length === 0 && (
          <p className="no-data">No savings entries yet. Start by adding a deposit!</p>
        )}
        {entries?.map((entry) => (
          <div key={entry.id} className={`savings-item ${entry.type.toLowerCase()}`}>
            <div className="savings-item-left">
              <div className="savings-icon-wrap">
                {entry.type === 'DEPOSIT' ? '⬆️' : '⬇️'}
              </div>
              <div>
                <p className="savings-desc">{entry.description || (entry.type === 'DEPOSIT' ? 'Deposit' : 'Withdrawal')}</p>
                <p className="savings-date">{format(new Date(entry.date), 'dd MMM yyyy')}</p>
              </div>
            </div>
            <div className="savings-item-right">
              <span className="savings-amount">
                {entry.type === 'DEPOSIT' ? '+' : '-'}Rp {Number(entry.amount).toLocaleString('id-ID')}
              </span>
              <button onClick={() => deleteEntry.mutate(entry.id)} className="btn-delete">✕</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
