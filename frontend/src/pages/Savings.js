import { useState } from 'react';
import { format } from 'date-fns';
import {
  useSavings, useCreateSavings, useDeleteSavings,
  useSavingsEntries, useAddSavingsEntry, useDeleteSavingsEntry,
} from '../hooks/useSavings';
import './Savings.css';

const ICONS = ['💰','🏦','📈','🛡️','🏠','🚗','✈️','🎓','💊','💍'];

function EntryModal({ saving, onClose }) {
  const entries = useSavingsEntries(saving.id);
  const addEntry = useAddSavingsEntry(saving.id);
  const deleteEntry = useDeleteSavingsEntry(saving.id);

  const [amount, setAmount] = useState('');
  const [type, setType] = useState(saving.type === 'TABUNGAN' ? 'DEPOSIT' : 'UPDATE');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  const handleAdd = async (e) => {
    e.preventDefault();
    const numeric = parseFloat(amount.replace(/\./g, '').replace(',', '.'));
    if (!numeric || numeric <= 0) return;
    await addEntry.mutateAsync({ amount: numeric, type, note, date });
    setAmount('');
    setNote('');
  };

  const data = entries.data || [];
  const typeOptions = saving.type === 'TABUNGAN'
    ? [{ value: 'DEPOSIT', label: '+ Setor' }, { value: 'WITHDRAWAL', label: '- Tarik' }]
    : [{ value: 'UPDATE', label: '✏️ Update Nilai' }];

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal sv-modal">
        <div className="modal-header">
          <div>
            <h2>{saving.icon} {saving.name}</h2>
            <p className="modal-sub">
              {saving.type === 'TABUNGAN' ? 'Tabungan — deposit & tarik' : 'Investasi — update nilai portfolio'}
            </p>
          </div>
          <button className="modal-close" onClick={onClose}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M2 2l12 12M14 2L2 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {/* Current balance */}
        <div className={`sv-modal-balance ${saving.balance >= 0 ? 'positive' : 'negative'}`}>
          <span>Saldo Saat Ini</span>
          <strong>Rp {saving.balance.toLocaleString('id-ID')}</strong>
        </div>

        {/* Add entry form */}
        <form onSubmit={handleAdd} className="sv-entry-form">
          <select value={type} onChange={(e) => setType(e.target.value)}>
            {typeOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <input
            type="text"
            placeholder="Nominal (Rp)"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
          <input
            type="text"
            placeholder="Catatan (opsional)"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
          <button type="submit" disabled={addEntry.isPending}>
            {addEntry.isPending ? '...' : 'Tambah'}
          </button>
        </form>

        {/* Entry history */}
        <div className="sv-entries">
          {data.length === 0 && <p className="sv-empty">Belum ada riwayat.</p>}
          {data.map((entry) => (
            <div key={entry.id} className={`sv-entry-row ${entry.type.toLowerCase()}`}>
              <div className="sv-entry-left">
                <span className={`sv-entry-type ${entry.type.toLowerCase()}`}>
                  {entry.type === 'DEPOSIT' ? '↑' : entry.type === 'WITHDRAWAL' ? '↓' : '≈'}
                </span>
                <div>
                  <p className="sv-entry-note">{entry.note || <span className="sv-muted">—</span>}</p>
                  <p className="sv-entry-date">{format(new Date(entry.date), 'dd MMM yyyy')}</p>
                </div>
              </div>
              <div className="sv-entry-right">
                <span className={`sv-entry-amount ${entry.type === 'WITHDRAWAL' ? 'neg' : 'pos'}`}>
                  {entry.type === 'WITHDRAWAL' ? '-' : entry.type === 'DEPOSIT' ? '+' : ''}
                  Rp {Number(entry.amount).toLocaleString('id-ID')}
                </span>
                <button
                  className="sv-entry-delete"
                  onClick={() => deleteEntry.mutate(entry.id)}
                  title="Hapus"
                >×</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function CreateModal({ onClose }) {
  const createSavings = useCreateSavings();
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('💰');
  const [type, setType] = useState('TABUNGAN');
  const [target, setTarget] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const targetNum = target ? parseFloat(target.replace(/\./g, '').replace(',', '.')) : null;
    await createSavings.mutateAsync({ name, icon, type, target: targetNum });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <div>
            <h2>Tambah Tabungan / Investasi</h2>
            <p className="modal-sub">Buat pot baru untuk tracking keuangan kamu</p>
          </div>
          <button className="modal-close" onClick={onClose}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M2 2l12 12M14 2L2 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="modal-row">
            <div className="tx-form-field">
              <label>Tipe</label>
              <select value={type} onChange={(e) => setType(e.target.value)}>
                <option value="TABUNGAN">Tabungan (deposit/tarik)</option>
                <option value="INVESTASI">Investasi (update nilai)</option>
              </select>
            </div>
            <div className="tx-form-field">
              <label>Icon</label>
              <select value={icon} onChange={(e) => setIcon(e.target.value)}>
                {ICONS.map((ic) => <option key={ic} value={ic}>{ic}</option>)}
              </select>
            </div>
          </div>
          <div className="modal-row">
            <div className="tx-form-field">
              <label>Nama</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Dana Darurat, Saham, dll."
                required
              />
            </div>
            <div className="tx-form-field">
              <label>Target (opsional)</label>
              <input
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                placeholder="Contoh: 50000000"
              />
            </div>
          </div>
          <div className="modal-actions">
            <button type="submit" className="btn-save" disabled={createSavings.isPending}>
              {createSavings.isPending ? 'Menyimpan...' : 'Buat'}
            </button>
            <button type="button" className="btn-cancel-form" onClick={onClose}>Batal</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function SavingsPage() {
  const { data: savings = [], isLoading } = useSavings();
  const deleteSavings = useDeleteSavings();
  const [selectedSaving, setSelectedSaving] = useState(null);
  const [showCreate, setShowCreate] = useState(false);

  const totalBalance = savings.reduce((s, sv) => s + sv.balance, 0);

  return (
    <div className="savings-page">
      {selectedSaving && (
        <EntryModal
          saving={selectedSaving}
          onClose={() => setSelectedSaving(null)}
        />
      )}
      {showCreate && <CreateModal onClose={() => setShowCreate(false)} />}

      <div className="page-header">
        <div>
          <h1>Savings</h1>
          {savings.length > 0 && (
            <p className="savings-subtitle">
              {savings.length} pot · Total Rp {totalBalance.toLocaleString('id-ID')}
            </p>
          )}
        </div>
        <button className="btn-primary" onClick={() => setShowCreate(true)}>+ Tambah</button>
      </div>

      {/* Total card */}
      {savings.length > 0 && (
        <div className="sv-total-card">
          <span>Total Semua Simpanan</span>
          <h2>Rp {totalBalance.toLocaleString('id-ID')}</h2>
        </div>
      )}

      {isLoading && (
        <div className="tx-skeleton-wrap">
          {[...Array(3)].map((_, i) => <div key={i} className="tx-skeleton" style={{ height: 120 }} />)}
        </div>
      )}

      {!isLoading && savings.length === 0 && (
        <div className="sv-empty-state">
          <p>💰</p>
          <p>Belum ada tabungan atau investasi.</p>
          <button className="btn-primary" onClick={() => setShowCreate(true)}>Buat Pertama</button>
        </div>
      )}

      <div className="sv-grid">
        {savings.map((sv) => {
          const pct = sv.target ? Math.min((sv.balance / sv.target) * 100, 100) : null;
          return (
            <div key={sv.id} className="sv-card" onClick={() => setSelectedSaving(sv)}>
              <div className="sv-card-header">
                <div className="sv-card-title">
                  <span className="sv-icon">{sv.icon}</span>
                  <div>
                    <p className="sv-name">{sv.name}</p>
                    <span className={`sv-type-badge ${sv.type.toLowerCase()}`}>
                      {sv.type === 'TABUNGAN' ? 'Tabungan' : 'Investasi'}
                    </span>
                  </div>
                </div>
                <button
                  className="sv-delete-btn"
                  onClick={(e) => { e.stopPropagation(); deleteSavings.mutate(sv.id); }}
                  title="Hapus"
                >×</button>
              </div>

              <p className="sv-balance">Rp {sv.balance.toLocaleString('id-ID')}</p>

              {sv.target && (
                <div className="sv-progress-wrap">
                  <div className="sv-progress-track">
                    <div className="sv-progress-fill" style={{ width: `${pct}%` }} />
                  </div>
                  <div className="sv-progress-label">
                    <span>{pct.toFixed(0)}%</span>
                    <span>Target: Rp {sv.target.toLocaleString('id-ID')}</span>
                  </div>
                </div>
              )}

              <p className="sv-entry-count">{sv.entryCount} entri · klik untuk detail</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
