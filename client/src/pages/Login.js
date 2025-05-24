
// export default Login;
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import './Login.css';
import API_BASE_URL from '../config';
import Cookies from 'js-cookie';

const Login = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false); // optional loading state

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);

  try {
    const res = await axios.post(`${API_BASE_URL}/api/auth/login`, formData);

    const { token, user } = res.data;

    if (token) {
      Cookies.set('token', token, { expires: 1 });
      localStorage.setItem('user', JSON.stringify(user));

      // Navigate based on user type
      if (user.type === 'provider') {
        navigate('/provider-dashboard');
      } else if (user.type === 'user') {
        navigate('/user-dashboard');
      } else {
        navigate('/dashboard'); // fallback
      }
    } else {
      alert('Token not received. Please try again.');
    }

  } catch (error) {
    console.error('Login error:', error.response?.data || error.message);

    const errorMessage =
      error.response?.data?.message || 'Server not responding. Contact support.';
    alert(errorMessage);
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleSubmit}>
        <h2>Login</h2>

        <input
          name="email"
          type="email"
          placeholder="Email"
          required
          onChange={handleChange}
          value={formData.email}
        />

        <div className="password-field">
          <input
            name="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Password"
            required
            onChange={handleChange}
            value={formData.password}
          />
          <span onClick={() => setShowPassword((prev) => !prev)} className="eye-icon">
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </span>
        </div>

        <button type="submit" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>

        <p className="register-redirect">
          Don't have an account? <Link to="/register">Register here</Link>
        </p>
      </form>
    </div>
  );
};

export default Login;
