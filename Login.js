

// pages/Login.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Login({ onLogin }) {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);
  const navigate                = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    // special‐case admin
    const isAdminUser = email === 'admin@gmail.com' && password === 'admin';

    setLoading(true);
    try {
      const response = await fetch('https://surakshasathi-backend.onrender.com/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();

      if (!response.ok) {
        alert(data.message || 'Login failed');
        setLoading(false);
        return;
      }

      // store token & email
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('userEmail', data.email);

      onLogin();

      // navigate
      if (isAdminUser) {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('Error connecting to server');
    } finally {
      setLoading(false);
    }
  };

  const goToSignup = () => {
    navigate('/signup');
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Login to Suraksha Sakhi</h2>
        <form onSubmit={handleSubmit} style={styles.form}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={styles.input}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={styles.input}
            required
          />
          <button type="submit" style={styles.button} disabled={loading}>
            {loading ? 'Loading...' : 'Login'}
          </button>
        </form>
        <p style={styles.toggleText}>
          Don’t have an account?
          <button onClick={goToSignup} style={styles.toggleButton}>
            Sign Up
          </button>
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    backgroundColor: '#f4f6f8',
    height: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    backgroundColor: '#fff',
    padding: '40px',
    borderRadius: '12px',
    boxShadow: '0 0 20px rgba(0,0,0,0.1)',
    width: '100%',
    maxWidth: '400px',
  },
  title: {
    marginBottom: '20px',
    textAlign: 'center',
    color: '#333',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
  },
  input: {
    padding: '12px',
    marginBottom: '15px',
    borderRadius: '8px',
    border: '1px solid #ccc',
    fontSize: '16px',
  },
  button: {
    padding: '12px',
    backgroundColor: '#007bff',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    cursor: 'pointer',
    marginBottom: '15px',
  },
  toggleText: {
    textAlign: 'center',
    fontSize: '14px',
    color: '#333',
  },
  toggleButton: {
    background: 'none',
    border: 'none',
    color: '#007bff',
    fontWeight: 'bold',
    marginLeft: '6px',
    cursor: 'pointer',
  },
};
