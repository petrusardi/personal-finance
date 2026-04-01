import { useState } from 'react';
import { useInitialBalance, useSetInitialBalance } from '../hooks/useBalance';
import './Savings.css';

export default function InitialBalance() {
  const { data: initialData } = useInitialBalance();
  const setInitial = useSetInitialBalance();

  const [inputValue, setInputValue] = useState('');
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(false);

  const initialAmount = initialData?.amount || 0;

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
      <h1>Saldo Awal</h1>
      <p className="savings-subtitle">
        Saldo rekening kamu sebelum mulai menggunakan aplikasi ini.
      </p>

      <div className="form-card">
        <h3>Set Saldo Awal</h3>
        <p className="field-hint">
          Masukkan nominal saldo rekening kamu sebelum mulai pakai app ini. Cukup diisi sekali, bisa diubah kapan saja.
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
