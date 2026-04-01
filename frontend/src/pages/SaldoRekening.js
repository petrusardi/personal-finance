import { useInitialBalance, useCurrentBalance } from '../hooks/useBalance';
import './Savings.css';

export default function Savings() {
  const { data: initialData } = useInitialBalance();
  const { data: currentData } = useCurrentBalance();

  const initialAmount = initialData?.amount || 0;
  const current = currentData?.current || 0;
  const totalIncome = currentData?.totalIncome || 0;
  const totalExpense = currentData?.totalExpense || 0;

  return (
    <div className="savings-page">
      <h1>Saldo Rekening</h1>
      <p className="savings-subtitle">
        Saldo dihitung dari saldo awal + income debit − expense debit (semua waktu).
      </p>

      <div className="current-balance-card">
        <span>Saldo Saat Ini</span>
        <h2 className={current >= 0 ? 'positive' : 'negative'}>
          Rp {current.toLocaleString('id-ID')}
        </h2>
        <div className="balance-breakdown">
          <div className="breakdown-item income">
            <span>Saldo Awal</span>
            <strong>Rp {initialAmount.toLocaleString('id-ID')}</strong>
          </div>
          <span className="breakdown-sep">+</span>
          <div className="breakdown-item income">
            <span>Income Debit</span>
            <strong>Rp {totalIncome.toLocaleString('id-ID')}</strong>
          </div>
          <span className="breakdown-sep">−</span>
          <div className="breakdown-item expense">
            <span>Expense Debit</span>
            <strong>Rp {totalExpense.toLocaleString('id-ID')}</strong>
          </div>
        </div>
      </div>
    </div>
  );
}
