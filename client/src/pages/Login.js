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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post(`${API_BASE_URL}/login`, formData, {
        withCredentials: true, // allow cookies
      });

      if (res.status === 200) {

        const token = res.data.token;

        if (token) {
            alert('Login successful!');
            Cookies.set('token', token, { expires: 1 }); // expires in 1 day
            navigate('/dashboard');
        }else{
             alert('server not responding');
        }

      }
      else if(res.status===401 || res.status===403){
        alert('invalid authentication');
      }
      else{
        alert('with status code '+res.status);
      }
    } catch (error) {
      console.error('Login error:', error.response?.data || error.message);
      alert('server not responsing. Kindly contact Developer Team');
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
        />

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

        <button type="submit">Login</button>

        <p className="register-redirect">
          Don't have an account? <Link to="/register">Register here</Link>
        </p>
      </form>
    </div>
  );
};

export default Login;
