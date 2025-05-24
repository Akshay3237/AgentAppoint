import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import API_BASE_URL from '../config';
import { getToken } from '../utils/auth';
import { useNavigate } from 'react-router-dom';

const MySlotsPage = () => {
  const [mySlots, setMySlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const token = getToken();
  const navigate = useNavigate();

  // ✅ UseMemo to prevent re-parsing on every render
  const user = useMemo(() => JSON.parse(localStorage.getItem('user')), []);

  useEffect(() => {
    if (!user) {
      alert("Please login to see your booked slots.");
      navigate('/login');
      return;
    }

    const fetchMySlots = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${API_BASE_URL}/api/slots/booked-by-user`, {
          headers: { Authorization: `Bearer ${token}` },
          params: { userId: user._id },
        });
        setMySlots(res.data);
      } catch (error) {
        console.error('Error fetching booked slots:', error);
        alert("Could not load your booked slots.");
      } finally {
        setLoading(false);
      }
    };

    fetchMySlots();
  }, [token, navigate, user]); // `user` is stable now due to useMemo

  return (
    <div className="my-slots-container" style={{ padding: '20px' }}>
      <h2>My Booked Slots</h2>
      <button onClick={() => navigate('/user-dashboard')}>Back to Providers</button>

      {loading ? (
        <p>Loading your booked slots...</p>
      ) : mySlots.length === 0 ? (
        <p>You have no booked slots.</p>
      ) : (
        mySlots.map((slot) => (
          <div key={slot._id} style={{ border: '1px solid #ccc', borderRadius: 6, padding: 15, marginBottom: 15 }}>
            <h4>Provider: {slot.provider.fullName}</h4>
            <p><strong>Service:</strong> {slot.provider.service || 'Not specified'}</p>
            <p><strong>Email:</strong> {slot.provider.email}</p>
            <p><strong>Phone:</strong> {slot.provider.phone}</p>
            <p><strong>Date:</strong> {slot.date}</p>
            <p><strong>Time:</strong> {slot.startingTime} - {slot.endingTime}</p>
            <p><strong>Purpose:</strong> {slot.purpose}</p>
          </div>
        ))
      )}
    </div>
  );
};

export default MySlotsPage;
