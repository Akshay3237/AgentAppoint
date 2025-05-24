import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Dashboard.css';
import API_BASE_URL from '../config';
import { useNavigate } from 'react-router-dom';
import { getToken } from '../utils/auth';
const Dashboard = () => {
  const [providers, setProviders] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProviders = async () => {
      try {
         const token = getToken();
          const response = await axios.get(`${API_BASE_URL}/serviceproviders`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
        setProviders(response.data);
      } catch (error) {
        console.error('Error fetching service providers:', error);
        alert('Failed to fetch service providers');
      }
    };

    fetchProviders();
  }, []);

  return (
    <div className="dashboard-container">
      <nav className="navbar">
        <h2>Service Appointment System</h2>
        <div className="nav-links">
          <button onClick={() => navigate('/')}>Home</button>
          <button onClick={() => alert('Edit coming soon!')}>Edit</button>
        </div>
      </nav>

      <h3 className="section-title">Available Service Providers</h3>

      <div className="providers-grid">
        {providers.length === 0 ? (
          <p>No service providers found.</p>
        ) : (
          providers.map((provider) => (
            <div className="card" key={provider._id}>
              <h4>{provider.full_name}</h4>
              <p><strong>Username:</strong> {provider.username}</p>
              <p><strong>Email:</strong> {provider.email}</p>
              <p><strong>Phone:</strong> {provider.phone}</p>
              <p><strong>Service:</strong> {provider.service}</p>
              <button className="details-button" onClick={() => alert('Details view coming soon!')}>Details</button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Dashboard;
