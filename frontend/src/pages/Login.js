import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import './Auth.css';

export default function Login() {
  const { login } = useAuth();
  const { register, handleSubmit, formState: { errors, isSubmitting }, setError } = useForm();

  const onSubmit = async (data) => {
    try {
      await login(data.email, data.password);
    } catch (err) {
      setError('root', { message: err.response?.data?.message || 'Login failed' });
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>Personal Finance</h1>
        <h2>Sign In</h2>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="field">
            <label>Email</label>
            <input type="email" {...register('email', { required: 'Email is required' })} />
            {errors.email && <span className="error">{errors.email.message}</span>}
          </div>
          <div className="field">
            <label>Password</label>
            <input type="password" {...register('password', { required: 'Password is required' })} />
            {errors.password && <span className="error">{errors.password.message}</span>}
          </div>
          {errors.root && <span className="error">{errors.root.message}</span>}
          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        <p>No account? <Link to="/register">Register</Link></p>
      </div>
    </div>
  );
}
