import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import './Auth.css';

export default function Register() {
  const { register: registerUser } = useAuth();
  const { register, handleSubmit, formState: { errors, isSubmitting }, setError } = useForm();

  const onSubmit = async (data) => {
    try {
      await registerUser(data.name, data.email, data.password);
    } catch (err) {
      setError('root', { message: err.response?.data?.message || 'Registration failed' });
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>Personal Finance</h1>
        <h2>Create Account</h2>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="field">
            <label>Name</label>
            <input {...register('name', { required: 'Name is required' })} />
            {errors.name && <span className="error">{errors.name.message}</span>}
          </div>
          <div className="field">
            <label>Email</label>
            <input type="email" {...register('email', { required: 'Email is required' })} />
            {errors.email && <span className="error">{errors.email.message}</span>}
          </div>
          <div className="field">
            <label>Password</label>
            <input type="password" {...register('password', { required: true, minLength: { value: 6, message: 'Min 6 characters' } })} />
            {errors.password && <span className="error">{errors.password.message}</span>}
          </div>
          {errors.root && <span className="error">{errors.root.message}</span>}
          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Creating...' : 'Create Account'}
          </button>
        </form>
        <p>Have an account? <Link to="/login">Sign In</Link></p>
      </div>
    </div>
  );
}
