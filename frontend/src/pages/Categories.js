import { useCategories, useCreateCategory, useDeleteCategory } from '../hooks/useCategories';
import { useForm } from 'react-hook-form';
import './Categories.css';

export default function Categories() {
  const { data: categories } = useCategories();
  const createCat = useCreateCategory();
  const deleteCat = useDeleteCategory();
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm();

  const onSubmit = async (data) => {
    await createCat.mutateAsync(data);
    reset();
  };

  const income = categories?.filter((c) => c.type === 'INCOME') || [];
  const expense = categories?.filter((c) => c.type === 'EXPENSE') || [];

  return (
    <div className="categories-page">
      <h1>Categories</h1>

      <div className="cat-form-card">
        <h3>Add Category</h3>
        <form onSubmit={handleSubmit(onSubmit)} className="cat-form">
          <input placeholder="Name" {...register('name', { required: true })} />
          <select {...register('type', { required: true })}>
            <option value="INCOME">Income</option>
            <option value="EXPENSE">Expense</option>
          </select>
          <input placeholder="Icon (emoji)" {...register('icon')} />
          <input type="color" defaultValue="#3b82f6" {...register('color')} />
          <button type="submit" disabled={isSubmitting}>Add</button>
        </form>
      </div>

      <div className="cat-grid">
        <div className="cat-section">
          <div className="cat-section-header">
            <h3>Income</h3>
            <span className="cat-section-badge income">Income</span>
          </div>
          {income.length === 0 && <p className="empty-cat">No income categories yet.</p>}
          {income.map((c) => (
            <div key={c.id} className="cat-item" style={{ borderLeftColor: c.color }}>
              <span>{c.icon} {c.name}</span>
              <button onClick={() => deleteCat.mutate(c.id)}>✕</button>
            </div>
          ))}
        </div>
        <div className="cat-section">
          <div className="cat-section-header">
            <h3>Expense</h3>
            <span className="cat-section-badge expense">Expense</span>
          </div>
          {expense.length === 0 && <p className="empty-cat">No expense categories yet.</p>}
          {expense.map((c) => (
            <div key={c.id} className="cat-item" style={{ borderLeftColor: c.color }}>
              <span>{c.icon} {c.name}</span>
              <button onClick={() => deleteCat.mutate(c.id)}>✕</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
