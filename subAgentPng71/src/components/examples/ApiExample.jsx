/**
 * Example API Integration Component
 * Shows how to use apiService to fetch and display data
 * 
 * Usage:
 * import ApiExample from '@/components/examples/ApiExample';
 * <ApiExample />
 */

import { useEffect, useState } from 'react';
import apiService from '@/service/api';

export function UserListExample() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await apiService.getUsers();
        setUsers(data.data || data);
      } catch (err) {
        setError(err.message);
        console.error('Failed to fetch users:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  if (loading) return <div className="alert alert-info">Loading users...</div>;
  if (error) return <div className="alert alert-danger">Error: {error}</div>;

  return (
    <div>
      <h3>Users List</h3>
      <ul className="list-group">
        {users.map(user => (
          <li key={user._id} className="list-group-item">
            <strong>{user.name}</strong> - {user.email}
            <small className="d-block text-muted">{user.role}</small>
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * Example: Transactions List with Filtering
 */
export function TransactionsExample() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState({ status: 'all', limit: 10 });

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        const data = await apiService.getTransactions(filter);
        setTransactions(data.data || data);
      } catch (err) {
        console.error('Failed to fetch transactions:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [filter]);

  return (
    <div>
      <h3>Transactions</h3>
      <div className="mb-3">
        <select 
          className="form-select" 
          value={filter.status}
          onChange={(e) => setFilter({ ...filter, status: e.target.value })}
        >
          <option value="all">All</option>
          <option value="pending">Pending</option>
          <option value="completed">Completed</option>
          <option value="failed">Failed</option>
        </select>
      </div>

      {loading ? (
        <div className="alert alert-info">Loading...</div>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map(tx => (
              <tr key={tx._id}>
                <td>{tx._id}</td>
                <td>${tx.amount}</td>
                <td><span className="badge bg-success">{tx.status}</span></td>
                <td>{new Date(tx.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

/**
 * Example: Create New User Form
 */
export function CreateUserExample() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await apiService.createUser(formData);
      setMessage({ type: 'success', text: 'User created successfully!' });
      setFormData({ name: '', email: '', password: '', role: 'user' });
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h3>Create New User</h3>
      
      {message && (
        <div className={`alert alert-${message.type}`} role="alert">
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="name" className="form-label">Name</label>
          <input
            type="text"
            className="form-control"
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>

        <div className="mb-3">
          <label htmlFor="email" className="form-label">Email</label>
          <input
            type="email"
            className="form-control"
            id="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
        </div>

        <div className="mb-3">
          <label htmlFor="password" className="form-label">Password</label>
          <input
            type="password"
            className="form-control"
            id="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
          />
        </div>

        <div className="mb-3">
          <label htmlFor="role" className="form-label">Role</label>
          <select
            className="form-select"
            id="role"
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
          >
            <option value="user">User</option>
            <option value="agent">Agent</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        <button 
          type="submit" 
          className="btn btn-primary"
          disabled={loading}
        >
          {loading ? 'Creating...' : 'Create User'}
        </button>
      </form>
    </div>
  );
}

/**
 * Example: Dashboard Stats Display
 */
export function DashboardStatsExample() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await apiService.getDashboardStats();
        setStats(data);
      } catch (err) {
        console.error('Failed to fetch stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) return <div>Loading dashboard...</div>;
  if (!stats) return <div>No stats available</div>;

  return (
    <div className="row">
      <div className="col-md-3">
        <div className="card">
          <div className="card-body">
            <h5 className="card-title">Total Users</h5>
            <p className="card-text display-4">{stats.totalUsers || 0}</p>
          </div>
        </div>
      </div>

      <div className="col-md-3">
        <div className="card">
          <div className="card-body">
            <h5 className="card-title">Total Revenue</h5>
            <p className="card-text display-4">${stats.totalRevenue || 0}</p>
          </div>
        </div>
      </div>

      <div className="col-md-3">
        <div className="card">
          <div className="card-body">
            <h5 className="card-title">Active Agents</h5>
            <p className="card-text display-4">{stats.activeAgents || 0}</p>
          </div>
        </div>
      </div>

      <div className="col-md-3">
        <div className="card">
          <div className="card-body">
            <h5 className="card-title">Pending Withdrawals</h5>
            <p className="card-text display-4">{stats.pendingWithdrawals || 0}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Example: User Profile Fetch
 */
export function ProfileExample() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await apiService.getProfile();
        setProfile(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) return <div>Loading profile...</div>;
  if (error) return <div className="alert alert-danger">{error}</div>;
  if (!profile) return <div>No profile found</div>;

  return (
    <div className="card">
      <div className="card-header">User Profile</div>
      <div className="card-body">
        <p><strong>Name:</strong> {profile.name}</p>
        <p><strong>Email:</strong> {profile.email}</p>
        <p><strong>Role:</strong> {profile.role}</p>
        <p><strong>Status:</strong> {profile.status}</p>
        <p><strong>Joined:</strong> {new Date(profile.createdAt).toLocaleDateString()}</p>
      </div>
    </div>
  );
}

export default {
  UserListExample,
  TransactionsExample,
  CreateUserExample,
  DashboardStatsExample,
  ProfileExample,
};
