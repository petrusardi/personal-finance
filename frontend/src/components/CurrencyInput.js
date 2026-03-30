import { Controller } from 'react-hook-form';

/**
 * Currency input that auto-formats with id-ID thousand separators (e.g. 1.500.000)
 * while keeping the raw numeric value in react-hook-form state.
 */
export default function CurrencyInput({ name, control, rules, placeholder, className }) {
  const toDisplay = (val) => {
    if (val === '' || val === null || val === undefined) return '';
    const num = Number(String(val).replace(/\./g, ''));
    if (Number.isNaN(num)) return '';
    return num.toLocaleString('id-ID');
  };

  const fromInput = (raw) => {
    const digits = raw.replace(/[^\d]/g, '');
    return digits === '' ? '' : Number(digits);
  };

  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      defaultValue=""
      render={({ field }) => (
        <div className={`currency-input-wrap ${className || ''}`}>
          <span className="currency-prefix">Rp</span>
          <input
            type="text"
            inputMode="numeric"
            placeholder={placeholder || '0'}
            value={toDisplay(field.value)}
            onChange={(e) => field.onChange(fromInput(e.target.value))}
            onBlur={field.onBlur}
          />
        </div>
      )}
    />
  );
}
