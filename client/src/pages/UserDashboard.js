import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './UserDashboard.css';
import API_BASE_URL from '../config';
import { getToken } from '../utils/auth';
import { useNavigate } from 'react-router-dom';

const UserDashboard = () => {
  const [providers, setProviders] = useState([]);
  const [slots, setSlots] = useState([]);
  const [selectedProviderId, setSelectedProviderId] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [purpose, setPurpose] = useState('');
  const navigate = useNavigate();
  const token = getToken();

  useEffect(() => {
    const fetchProviders = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/users/providers`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setProviders(res.data);
      } catch (error) {
        console.error('Error fetching providers:', error);
        alert('Failed to load providers');
      }
    };

    fetchProviders();
  }, []);

  const handleCheckSlots = async (providerId) => {
    if (!selectedDate) {
      alert("Please select a date first.");
      return;
    }

    setLoadingSlots(true);
    setSelectedProviderId(providerId);
    setSelectedSlot(null);
    setSlots([]);

    try {
      const res = await axios.get(`${API_BASE_URL}/api/slots/free`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { providerUserId: providerId, date: selectedDate },
      });

      setSlots(res.data);
    } catch (error) {
      console.error('Error fetching slots:', error);
      alert("Could not fetch slots.");
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleBookSlot = async () => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) return alert("Login required");

    try {
      const res = await axios.post(`${API_BASE_URL}/api/slots/book`,
        {
          providerUserId: selectedProviderId,
          userUserId: user._id,
          startingTime: selectedSlot.start,
          endingTime: selectedSlot.end,
          date: selectedDate,
          purpose: purpose
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("Slot booked successfully!");
      setSelectedSlot(null);
      setSlots([]);
    } catch (error) {
      console.error('Error booking slot:', error.response?.data || error.message);
      alert("Could not book the slot.");
    }
  };

  const filteredProviders = providers.filter((provider) =>
    provider.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (provider.service && provider.service.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="dashboard-container">
      <h2>Available Service Providers</h2>
        <button onClick={() => navigate('/my-slots')} style={{ marginLeft: 10 }}>
        My Slots
      </button>
      <label>
        Select Date: <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} />
      </label>

      <div className="search-container">
        <input
          type="text"
          placeholder="Search by name or service..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      <div className="provider-list">
        {filteredProviders.map((provider) => (
          <div className="provider-card" key={provider._id}>
            <h3>{provider.fullName}</h3>
            <p><strong>Service:</strong> {provider.service || 'Not specified'}</p>
            <p><strong>Email:</strong> {provider.email}</p>
            <p><strong>Phone:</strong> {provider.phone}</p>

            <button onClick={() => handleCheckSlots(provider._id)} disabled={loadingSlots}>
              {loadingSlots && selectedProviderId === provider._id ? 'Loading...' : 'Check Slots'}
            </button>

            {selectedProviderId === provider._id && slots.length > 0 && (
              <div className="slots-container">
                <h4>Available Time Slots</h4>
                <div className="slots-grid">
                  {slots.map((slot, index) => (
                    <button
                      key={index}
                      className={`slot-button ${selectedSlot?.start === slot.start ? 'selected' : ''}`}
                      onClick={() => setSelectedSlot(slot)}
                    >
                      {slot.start} - {slot.end}
                    </button>
                  ))}
                </div>

                {selectedSlot && (
  <div className="booking-section">
    <label>
      Purpose: 
      <input
        type="text"
        value={purpose}
        onChange={(e) => setPurpose(e.target.value)}
        placeholder="Enter purpose"
        style={{ marginLeft: 10, padding: 4, width: '60%' }}
      />
    </label>
    <br />
    <button className="book-button" onClick={handleBookSlot} disabled={!purpose.trim()}>
      Book Now
    </button>
  </div>
)}

              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserDashboard;
