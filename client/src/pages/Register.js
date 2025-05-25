import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import './Register.css';
import API_BASE_URL from '../config';

const Register = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '', // ✅ changed from full_name
    phone: '',
    type: 'user',
    service: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match!');
      return;
    }

    const payload = { ...formData };
    delete payload.confirmPassword;

    if (payload.type !== 'provider') {
      delete payload.service;
    }

    try {
      const res = await axios.post(`${API_BASE_URL}/api/auth/register`, payload); // ✅ added full path
      if (res.status === 201 || res.status === 200) {
        alert('Registered successfully!');
        navigate('/login');
      }
    } catch (error) {
      console.error('Registration error:', error.response?.data || error.message);
      alert('Registration failed!');
    }
  };

  return (
    <div className="register-container">
      <form className="register-form" onSubmit={handleSubmit}>
        <h2>Create Account</h2>

        <input name="username" type="text" placeholder="Username" required onChange={handleChange} />
        <input name="email" type="email" placeholder="Email" required onChange={handleChange} />

        <div className="password-field">
          <input
            name="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Password"
            required
            onChange={handleChange}
          />
          <span onClick={() => setShowPassword((prev) => !prev)} className="eye-icon">
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </span>
        </div>

        <div className="password-field">
          <input
            name="confirmPassword"
            type={showConfirmPassword ? 'text' : 'password'}
            placeholder="Confirm Password"
            required
            onChange={handleChange}
          />
          <span onClick={() => setShowConfirmPassword((prev) => !prev)} className="eye-icon">
            {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
          </span>
        </div>

        <input name="fullName" type="text" placeholder="Full Name" required onChange={handleChange} />
        <input name="phone" type="tel" placeholder="Phone" required onChange={handleChange} />

        <select name="type" value={formData.type} onChange={handleChange} required>
          <option value="user">User</option>
          <option value="provider">Provider</option>
        </select>

        {formData.type === 'provider' && (
          <input name="service" type="text" placeholder="Service Offered" onChange={handleChange} />
        )}

        <button type="submit">Register</button>

        <p className="login-redirect">
          Already have an account? <Link to="/login">Login here</Link>
        </p>
      </form>
    </div>
  );
};

export default Register;
