import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const API_URL = 'http://localhost:5000/api';

function App() {
  const [tkn, setTkn] = useState(localStorage.getItem('token'));
  const [usr, setUsr] = useState(JSON.parse(localStorage.getItem('user')));
  const [vw, setVw] = useState('login');
  const [shwNtfcn, setShwNtfcn] = useState(false);

  useEffect(() => {
    if (tkn && usr) {
      setVw('dashboard');
    }
  }, [tkn, usr]);

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setTkn(null);
    setUsr(null);
    setVw('login');
    setShwNtfcn(false);
  };

  // --- LOGIN COMPONENT ---
  const Login = () => {
    const [eml, setEml] = useState('');
    const [pswd, setPswd] = useState('');
    const [err, setErr] = useState('');

    const handleLogin = async (e) => {
      e.preventDefault();
      setErr('');
      try {
        const res = await axios.post(`${API_URL}/auth/login`, { email: eml, password: pswd });
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        setTkn(res.data.token);
        setUsr(res.data.user);
        setVw('dashboard');
      } catch (err) {
        setErr(err.response?.data?.msg || 'Login failed');
      }
    };

    return (
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <div className="logo-large">MCS</div>
            <h2>Welcome Back</h2>
            <p>Sign in to your account</p>
          </div>
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                placeholder="Enter your email"
                value={eml}
                onChange={e => setEml(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                placeholder="Enter your password"
                value={pswd}
                onChange={e => setPswd(e.target.value)}
                required
              />
            </div>
            {err && <div className="error-message">{err}</div>}
            <button className="btn btn-primary" type="submit">Sign In</button>
          </form>
          <div className="auth-footer">
            Don't have an account?
            <button className="link-btn" onClick={() => setVw('register')}>Register here</button>
          </div>
        </div>
      </div>
    );
  };

  // --- REGISTER COMPONENT ---
  const Register = () => {
    const [usrnm, setUsrnm] = useState('');
    const [eml, setEml] = useState('');
    const [pswd, setPswd] = useState('');
    const [rl, setRl] = useState('citizen');
    const [err, setErr] = useState('');
    const [ldng, setLdng] = useState(false);

    const handleRegister = async (e) => {
      e.preventDefault();
      setErr('');
      setLdng(true);
      try {
        await axios.post(`${API_URL}/auth/register`, { username: usrnm, email: eml, password: pswd, role: rl });
        const res = await axios.post(`${API_URL}/auth/login`, { email: eml, password: pswd });
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        setTkn(res.data.token);
        setUsr(res.data.user);
        setVw('dashboard');
      } catch (err) {
        setErr(err.response?.data?.msg || 'Registration failed');
      }
      setLdng(false);
    };

    return (
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <div className="logo-large">MCS</div>
            <h2>Create Account</h2>
            <p>Join the Municipal Complaint System</p>
          </div>
          <form onSubmit={handleRegister}>
            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                placeholder="Enter your full name"
                value={usrnm}
                onChange={e => setUsrnm(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                placeholder="Enter your email"
                value={eml}
                onChange={e => setEml(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                placeholder="Create a password"
                value={pswd}
                onChange={e => setPswd(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Account Type</label>
              <select value={rl} onChange={e => setRl(e.target.value)}>
                <option value="citizen">Citizen</option>
                <option value="admin">Administrator</option>
              </select>
            </div>
            {err && <div className="error-message">{err}</div>}
            <button className="btn btn-primary" type="submit" disabled={ldng}>
              {ldng ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>
          <div className="auth-footer">
            Already have an account?
            <button className="link-btn" onClick={() => setVw('login')}>Sign in</button>
          </div>
        </div>
      </div>
    );
  };

  // --- NOTIFICATIONS SIDEBAR ---
  const NotificationsSidebar = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      if (shwNtfcn) {
        fetchNotifications();
      }
    }, [shwNtfcn]);

    const fetchNotifications = async () => {
      try {
        const res = await axios.get(`${API_URL}/notifications`, {
          headers: { Authorization: tkn }
        });
        setNotifications(res.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching notifications:', err);
        setLoading(false);
      }
    };

    const markAsRead = async (id) => {
      try {
        await axios.put(`${API_URL}/notifications/${id}/read`, {}, {
          headers: { Authorization: tkn }
        });
        setNotifications(notifications.map(n =>
          n._id === id ? { ...n, isRead: true } : n
        ));
      } catch (err) {
        console.error('Error marking notification as read:', err);
      }
    };

    const markAllAsRead = async () => {
      try {
        await axios.put(`${API_URL}/notifications/read-all/mark`, {}, {
          headers: { Authorization: tkn }
        });
        setNotifications(notifications.map(n => ({ ...n, isRead: true })));
      } catch (err) {
        console.error('Error marking all as read:', err);
      }
    };

    const deleteNotification = async (id) => {
      try {
        await axios.delete(`${API_URL}/notifications/${id}`, {
          headers: { Authorization: tkn }
        });
        setNotifications(notifications.filter(n => n._id !== id));
      } catch (err) {
        console.error('Error deleting notification:', err);
      }
    };

    const unreadCount = notifications.filter(n => !n.isRead).length;

    return (
      <div className={`notifications-sidebar ${shwNtfcn ? 'open' : ''}`}>
        <div className="notifications-header">
          <h3>Notifications</h3>
          <button className="close-btn" onClick={() => setShwNtfcn(false)}>✕</button>
        </div>
        
        {unreadCount > 0 && (
          <div className="notifications-actions">
            <button className="mark-all-btn" onClick={markAllAsRead}>
              Mark all as read ({unreadCount})
            </button>
          </div>
        )}

        <div className="notifications-list">
          {loading ? (
            <div className="notifications-loading">Loading...</div>
          ) : notifications.length === 0 ? (
            <div className="notifications-empty">
              <div className="empty-icon">🔔</div>
              <p>No notifications yet</p>
            </div>
          ) : (
            notifications.map(notification => (
              <div 
                key={notification._id} 
                className={`notification-item ${!notification.isRead ? 'unread' : ''}`}
              >
                <div className="notification-content">
                  <div className="notification-icon">
                    {notification.type === 'complaint_filed' ? '📝' : 
                     notification.type === 'complaint_resolved' ? '✅' : 'ℹ️'}
                  </div>
                  <div className="notification-text">
                    <p>{notification.message}</p>
                    <span className="notification-time">
                      {new Date(notification.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>
                <div className="notification-actions">
                  {!notification.isRead && (
                    <button 
                      className="icon-btn" 
                      onClick={() => markAsRead(notification._id)}
                      title="Mark as read"
                    >
                      ✓
                    </button>
                  )}
                  <button 
                    className="icon-btn delete" 
                    onClick={() => deleteNotification(notification._id)}
                    title="Delete"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  };

  // --- DASHBOARD COMPONENT ---
  const Dashboard = () => {
    const [cmplt, setCmplt] = useState([]);
    const [nwCmplt, setNwCmplt] = useState({ ttl: '', dscrptn: '', ctgry: 'General' });
    const [ntfcn, setNtfcn] = useState([]);

    useEffect(() => {
      fetchComplaints();
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }, []);

    const fetchComplaints = async () => {
      try {
        const res = await axios.get(`${API_URL}/complaints`, {
          headers: { Authorization: tkn }
        });
        setCmplt(res.data);
      } catch (err) {
        console.error(err);
      }
    };

    const fetchNotifications = async () => {
      try {
        const res = await axios.get(`${API_URL}/notifications`, {
          headers: { Authorization: tkn }
        });
        setNtfcn(res.data);
      } catch (err) {
        console.error(err);
      }
    };

    const submitComplaint = async (e) => {
      e.preventDefault();
      try {
        await axios.post(`${API_URL}/complaints`, {
          title: nwCmplt.ttl,
          description: nwCmplt.dscrptn,
          category: nwCmplt.ctgry
        }, {
          headers: { Authorization: tkn }
        });
        setNwCmplt({ ttl: '', dscrptn: '', ctgry: 'General' });
        fetchComplaints();
        alert('Complaint submitted successfully!');
      } catch (err) {
        alert('Error submitting complaint');
      }
    };

    const resolveComplaint = async (id) => {
      try {
        await axios.put(`${API_URL}/complaints/${id}/resolve`, {}, {
          headers: { Authorization: tkn }
        });
        fetchComplaints();
        alert('Complaint marked as resolved!');
      } catch (err) {
        alert('Error updating status');
      }
    };

    const unrCnt = ntfcn.filter(n => !n.isRead).length;

    return (
      <div className="dashboard">
        <nav className="navbar">
          <div className="navbar-brand">
            <div className="logo">MCS</div>
            <h1>Municipal Complaint System</h1>
          </div>
          <div className="navbar-actions">
            <button
              className="notification-btn"
              onClick={() => setShwNtfcn(!shwNtfcn)}
            >
              🔔
              {unrCnt > 0 && <span className="badge">{unrCnt}</span>}
            </button>
            <div className="user-menu">
              <div className="avatar">{usr.username?.charAt(0).toUpperCase()}</div>
              <div className="user-info">
                <span className="user-name">{usr.username}</span>
                <span className="user-role">{usr.role}</span>
              </div>
              <button className="btn btn-logout" onClick={logout}>Logout</button>
            </div>
          </div>
        </nav>

        <div className="dashboard-content">
          <div className="container">
            {usr.role === 'citizen' && (
              <div className="card">
                <div className="card-header">
                  <h2>📝 File a New Complaint</h2>
                  <p>Report municipal issues and track their resolution</p>
                </div>
                <form onSubmit={submitComplaint}>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Complaint Title *</label>
                      <input
                        type="text"
                        placeholder="Brief description of the issue"
                        value={nwCmplt.ttl}
                        onChange={e => setNwCmplt({...nwCmplt, ttl: e.target.value})}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Category *</label>
                      <select
                        value={nwCmplt.ctgry}
                        onChange={e => setNwCmplt({...nwCmplt, ctgry: e.target.value})}
                      >
                        <option>General</option>
                        <option>Sanitation</option>
                        <option>Roads</option>
                        <option>Water Supply</option>
                        <option>Electricity</option>
                        <option>Street Lights</option>
                      </select>
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Description *</label>
                    <textarea
                      placeholder="Provide detailed information about the issue..."
                      value={nwCmplt.dscrptn}
                      onChange={e => setNwCmplt({...nwCmplt, dscrptn: e.target.value})}
                      required
                      rows="4"
                    />
                  </div>
                  <button type="submit" className="btn btn-primary">Submit Complaint</button>
                </form>
              </div>
            )}

            <div className="card">
              <div className="card-header">
                <h2>{usr.role === 'admin' ? '📋 All Complaints' : '📋 My Complaints'}</h2>
                <p>
                  {cmplt.length} {cmplt.length === 1 ? 'complaint' : 'complaints'} found
                </p>
              </div>
              
              {cmplt.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">📭</div>
                  <h3>No complaints yet</h3>
                  <p>
                    {usr.role === 'citizen'
                      ? 'File your first complaint using the form above'
                      : 'No complaints have been filed yet'}
                  </p>
                </div>
              ) : (
                <div className="complaints-grid">
                  {cmplt.map(complaint => (
                    <div key={complaint._id} className="complaint-card">
                      <div className="complaint-header">
                        <h3>{complaint.title}</h3>
                        <span className={`status-badge ${complaint.status.toLowerCase()}`}>
                          {complaint.status}
                        </span>
                      </div>
                      <div className="complaint-meta">
                        <span className="category-tag">{complaint.category}</span>
                        <span className="date">{new Date(complaint.createdAt).toLocaleDateString()}</span>
                      </div>
                      <p className="complaint-description">{complaint.description}</p>
                      {usr.role === 'admin' && (
                        <div className="complaint-footer">
                          <span className="filed-by">Filed by: {complaint.userId?.email || 'Unknown'}</span>
                          {complaint.status === 'Pending' && (
                            <button 
                              className="btn btn-success" 
                              onClick={() => resolveComplaint(complaint._id)}
                            >
                              ✓ Mark as Resolved
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <NotificationsSidebar />

        {shwNtfcn && (
          <div className="overlay" onClick={() => setShwNtfcn(false)}></div>
        )}
      </div>
    );
  };

  return (
    <div className="App">
      {vw === 'login' && <Login />}
      {vw === 'register' && <Register />}
      {vw === 'dashboard' && <Dashboard />}
    </div>
  );
}

export default App;
