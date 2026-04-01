import { useState } from 'react';
import { useInitialBalance, useCurrentBalance, useSetInitialBalance } from '../hooks/useBalance';
import './Savings.css';

export default function SaldoRekening() {
  const { data: initialData } = useInitialBalance();
  const { data: currentData } = useCurrentBalance();
  const setInitial = useSetInitialBalance();

  const [inputValue, setInputValue] = useState('');
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(false);

  const initialAmount = initialData?.amount || 0;
  const current = currentData?.current || 0;
  const totalIncome = currentData?.totalIncome || 0;
  const totalExpense = currentData?.totalExpense || 0;

  const handleSave = async () => {
    const numeric = parseFloat(inputValue.replace(/\./g, '').replace(',', '.'));
    if (isNaN(numeric) || numeric < 0) return;
    await setInitial.mutateAsync(numeric);
    setEditing(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleEdit = () => {
    setInputValue(initialAmount.toLocaleString('id-ID'));
    setEditing(true);
    setSaved(false);
  };

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

      <div className="form-card">
        <h3>Set Saldo Awal</h3>
        <p className="field-hint">
          Masukkan saldo rekening sebelum mulai pakai app ini. Cukup diisi sekali, bisa diubah kapan saja.
        </p>
        {editing ? (
          <div className="initial-balance-form">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Contoh: 5000000"
              autoFocus
            />
            <button onClick={handleSave} disabled={setInitial.isPending}>
              {setInitial.isPending ? 'Menyimpan...' : 'Simpan'}
            </button>
            <button className="btn-cancel" onClick={() => setEditing(false)}>Batal</button>
          </div>
        ) : (
          <div className="initial-balance-display">
            <span>Rp {initialAmount.toLocaleString('id-ID')}</span>
            <button onClick={handleEdit}>Edit</button>
            {saved && <span className="saved-badge">✓ Tersimpan</span>}
          </div>
        )}
      </div>
    </div>
  );
}
