import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Layout.css';

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="sidebar-logo">💰</div>
          <div className="sidebar-header-text">
            <h2>FinanceApp</h2>
            <p>Personal Finance</p>
          </div>
        </div>

        <nav>
          <span className="nav-label">Menu</span>
          <NavLink to="/" end>
            <span className="nav-icon">📊</span>Dashboard
          </NavLink>
          <NavLink to="/transactions">
            <span className="nav-icon">💳</span>Transactions
          </NavLink>
          <NavLink to="/categories">
            <span className="nav-icon">🏷️</span>Categories
          </NavLink>
          <NavLink to="/budgets">
            <span className="nav-icon">🎯</span>Budgets
          </NavLink>
          <NavLink to="/savings">
            <span className="nav-icon">🏦</span>Saldo Rekening
          </NavLink>
          <NavLink to="/initial-balance">
            <span className="nav-icon">💵</span>Saldo Awal
          </NavLink>
        </nav>

        <div className="sidebar-user">
          <div className="user-row">
            <div className="user-avatar">{initials}</div>
            <div className="user-info">
              <small>Logged in as</small>
              <strong>{user?.name || 'User'}</strong>
            </div>
          </div>
          <button onClick={handleLogout} className="logout-btn">
            <span>↩</span> Sign Out
          </button>
        </div>
      </aside>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
