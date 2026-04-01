import { useState } from 'react';
import { format } from 'date-fns';
import { useRecurring, useCreateRecurring, useDeleteRecurring, useApplyRecurring } from '../hooks/useRecurring';
import { useCategories } from '../hooks/useCategories';
import { PM_CONFIG } from '../components/PaymentBadge';
import './Recurring.css';

export default function Recurring() {
  const { data: templates = [], isLoading } = useRecurring();
  const { data: categories } = useCategories();
  const createRecurring = useCreateRecurring();
  const deleteRecurring = useDeleteRecurring();
  const applyRecurring = useApplyRecurring();

  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('EXPENSE');
  const [categoryId, setCategoryId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [applyingId, setApplyingId] = useState(null);
  const [applyDate, setApplyDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  const handleCreate = async (e) => {
    e.preventDefault();
    const numeric = parseFloat(amount.replace(/\./g, '').replace(',', '.'));
    if (!numeric || !name || !categoryId) return;
    await createRecurring.mutateAsync({
      name, amount: numeric, type,
      categoryId: parseInt(categoryId),
      paymentMethod: paymentMethod || null,
    });
    setName(''); setAmount(''); setCategoryId(''); setPaymentMethod('');
    setShowForm(false);
  };

  const handleApply = async (template) => {
    setApplyingId(template.id);
    await applyRecurring.mutateAsync({ id: template.id, date: applyDate });
    setApplyingId(null);
  };

  const filteredCategories = categories?.filter((c) => c.type === type) || [];

  return (
    <div className="recurring-page">
      <div className="page-header">
        <div>
          <h1>Recurring</h1>
          <p className="recurring-subtitle">Template transaksi berulang — gaji, cicilan, langganan.</p>
        </div>
        <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? '✕ Close' : '+ Tambah'}
        </button>
      </div>

      {showForm && (
        <div className="form-card">
          <h3>Template Baru</h3>
          <form onSubmit={handleCreate} className="recurring-form">
            <div className="tx-form-field">
              <label>Nama</label>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Gaji, Netflix, Cicilan KPR..." required />
            </div>
            <div className="tx-form-field">
              <label>Type</label>
              <select value={type} onChange={(e) => { setType(e.target.value); setCategoryId(''); }}>
                <option value="INCOME">Income</option>
                <option value="EXPENSE">Expense</option>
              </select>
            </div>
            <div className="tx-form-field">
              <label>Amount</label>
              <input value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Nominal (Rp)" required />
            </div>
            <div className="tx-form-field">
              <label>Category</label>
              <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} required>
                <option value="">Pilih kategori</option>
                {filteredCategories.map((c) => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
              </select>
            </div>
            <div className="tx-form-field">
              <label>Payment Method</label>
              <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                <option value="">— None —</option>
                {Object.entries(PM_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.icon} {v.label}</option>)}
              </select>
            </div>
            <div className="tx-form-actions" style={{ gridColumn: 'span 3' }}>
              <button type="submit" className="btn-save" disabled={createRecurring.isPending}>
                {createRecurring.isPending ? 'Menyimpan...' : 'Simpan Template'}
              </button>
              <button type="button" className="btn-cancel-form" onClick={() => setShowForm(false)}>Batal</button>
            </div>
          </form>
        </div>
      )}

      <div className="recurring-apply-date">
        <label>Tanggal apply:</label>
        <input type="date" value={applyDate} onChange={(e) => setApplyDate(e.target.value)} />
      </div>

      {isLoading && <p className="no-data">Loading...</p>}
      {!isLoading && templates.length === 0 && (
        <p className="no-data">Belum ada template. Buat template untuk transaksi yang rutin tiap bulan.</p>
      )}

      <div className="recurring-list">
        {templates.map((t) => (
          <div key={t.id} className={`recurring-item ${t.type.toLowerCase()}`}>
            <div className="recurring-left">
              <div className="tx-icon-wrap">{t.category?.icon}</div>
              <div>
                <p className="recurring-name">{t.name}</p>
                <p className="recurring-meta">
                  <span className={`type-badge ${t.type.toLowerCase()}`}>{t.type === 'INCOME' ? 'Income' : 'Expense'}</span>
                  <span className="tx-dot">·</span>
                  <span>{t.category?.name}</span>
                  {t.paymentMethod && <><span className="tx-dot">·</span><span>{PM_CONFIG[t.paymentMethod]?.label}</span></>}
                </p>
              </div>
            </div>
            <div className="recurring-right">
              <span className={`recurring-amount ${t.type.toLowerCase()}`}>
                {t.type === 'INCOME' ? '+' : '-'}Rp {Number(t.amount).toLocaleString('id-ID')}
              </span>
              <button
                className="btn-apply"
                onClick={() => handleApply(t)}
                disabled={applyingId === t.id}
              >
                {applyingId === t.id ? '...' : '▶ Apply'}
              </button>
              <button className="btn-delete" onClick={() => deleteRecurring.mutate(t.id)} title="Hapus">
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
