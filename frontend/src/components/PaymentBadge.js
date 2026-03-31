const PM_CONFIG = {
  CASH:     { label: 'Cash',     icon: '💵' },
  DEBIT:    { label: 'Debit',    icon: '💳' },
  CREDIT:   { label: 'Credit',   icon: '🏦' },
  E_WALLET: { label: 'E-Wallet', icon: '📱' },
};

export default function PaymentBadge({ method }) {
  if (!method) return null;
  const config = PM_CONFIG[method] || { label: method, icon: '💰' };
  return (
    <span className={`pm-badge ${method}`}>
      {config.icon} {config.label}
    </span>
  );
}

export { PM_CONFIG };
