import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './ProviderDashboard.css';
import API_BASE_URL from '../config';
import { getToken } from '../utils/auth';
import geminiIcon from '../assets/chatBot.png';
import { useNavigate } from 'react-router-dom'; // ✅ Ensure this is imported

const ProviderBookedSlots = () => {
  const [bookedSlots, setBookedSlots] = useState([]);
  const [searchName, setSearchName] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [startHour, setStartHour] = useState('');
  const [endHour, setEndHour] = useState('');
  const [chatPrompt, setChatPrompt] = useState('');
  const [chatResponse, setChatResponse] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [showChat, setShowChat] = useState(false); // ✅ Added this state

  const navigate = useNavigate();
  const token = getToken();

  const user = JSON.parse(localStorage.getItem('user'));

  const handleLogout = () => {
    localStorage.removeItem('token');  // or clear whatever you use for auth
    localStorage.removeItem('user');
    navigate('/login');  // redirect to login page
  };

  const fetchBookedSlots = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/slots/provider/booked/${user._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBookedSlots(res.data);
    } catch (err) {
      console.error('Failed to fetch booked slots:', err);
      alert('Could not load booked slots');
    }
  };

  useEffect(() => {
    fetchBookedSlots();
  }, []);

  const timeToHour = (timeStr) => {
    if (!timeStr) return null;
    const [hour] = timeStr.split(':').map(Number);
    return hour;
  };
  // Determine min selectable date (today)
  const todayStr = new Date().toISOString().split('T')[0];

  const getAvailableHours = () => {
    const now = new Date();
    const selected = new Date(filterDate);
    const isToday = filterDate === todayStr;

    const minHour = isToday ? now.getHours() + 1 : 9;
    const maxHour = 18;

    const options = [];
    for (let i = minHour; i < maxHour; i++) {
      options.push(i);
    }
    return options;
  };

  const filteredSlots = bookedSlots.filter((slot) => {
    const nameMatch = slot.userUserId?.fullName?.toLowerCase().includes(searchName.toLowerCase());
    const dateMatch = filterDate ? slot.date === filterDate : true;

    const slotStart = timeToHour(slot.startingTime);
    const slotEnd = timeToHour(slot.endingTime);

    let timeMatch = true;
    if (startHour && endHour) {
      const start = parseInt(startHour);
      const end = parseInt(endHour);
      timeMatch = slotStart >= start && slotEnd <= end;
    }

    return nameMatch && dateMatch && timeMatch;
  });

  const hourOptions = Array.from({ length: 10 }, (_, i) => 9 + i); // 9 to 18

  const handleCancel = async (slotId) => {
    if (!window.confirm("Are you sure you want to cancel this appointment?")) return;

    try {
      await axios.put(`${API_BASE_URL}/api/slots/cancel/${slotId}`, null, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert("Appointment cancelled successfully");
      fetchBookedSlots(); // ✅ Refresh the list after cancellation
    } catch (error) {
      console.error("Error cancelling appointment:", error);
      alert("Failed to cancel appointment");
    }
  };

  const handleChatSubmit = async () => {
    if (!chatPrompt.trim()) return;

    setChatLoading(true);
    setChatResponse('');

    try {
      const res = await axios.post(
        `${API_BASE_URL}/api/gemini/cancel-via-ai`,
        {
          prompt: chatPrompt,
          providerUserId: user._id,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setChatResponse(res.data.message || 'No response from AI.');
      fetchBookedSlots(); // ✅ Optionally refresh slots
    } catch (error) {
      console.error('Cancel via chatbot error:', error);
      setChatResponse(error.response?.data?.error || 'Error occurred');
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Booked Slots</h2>
        <button onClick={handleLogout} style={{ padding: '8px 16px', cursor: 'pointer' }}>
          Logout
        </button>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="Search by user name"
          value={searchName}
          onChange={(e) => setSearchName(e.target.value)}
          style={{ marginRight: '10px' }}
        />
        <input
          type="date"
          value={filterDate}
          min={todayStr}
          onChange={(e) => {
            setFilterDate(e.target.value);
            setStartHour('');
            setEndHour('');
          }}
          style={{ marginRight: '10px' }}
        />

        <select
          value={startHour}
          onChange={(e) => setStartHour(e.target.value)}
          style={{ marginRight: '10px' }}
          disabled={!filterDate}
        >
          <option value="">Start Hour</option>
          {getAvailableHours().map((hour) => (
            <option key={hour} value={hour}>{hour}:00</option>
          ))}
        </select>

        <select
          value={endHour}
          onChange={(e) => setEndHour(e.target.value)}
          disabled={!filterDate || !startHour}
        >
          <option value="">End Hour</option>
          {getAvailableHours()
            .filter((hour) => parseInt(hour) > parseInt(startHour || 0))
            .map((hour) => (
              <option key={hour} value={hour}>{hour}:00</option>
            ))}
        </select>
      </div>

      {filteredSlots.length === 0 ? (
        <p className="no-slots-message">No matching booked slots</p>
      ) : (
        <div className="slots-list">
          {filteredSlots.map((slot) => (
            <div key={slot._id} className="slot-card">
              <p><strong>Date:</strong> {slot.date}</p>
              <p><strong>Time:</strong> {slot.startingTime} - {slot.endingTime}</p>
              <p><strong>Purpose:</strong> {slot.purpose || 'N/A'}</p>
              <p><strong>Booked by:</strong> {slot.userUserId?.fullName}</p>
              <p><strong>Email:</strong> {slot.userUserId?.email}</p>
              <p><strong>Phone:</strong> {slot.userUserId?.phone}</p>
              <p><strong>Status:</strong> {slot.status}</p>
              {slot.status !== 'cancelled' && (
                <button
                  className="cancel-btn"
                  onClick={() => handleCancel(slot._id)}
                >
                  Cancel Appointment
                </button>
              )}
            </div>
          ))}
        </div>
      )}


      {/* Floating Chatbot Button */}
      <div className="chatbot-toggle" onClick={() => setShowChat(!showChat)}>
        <img src={geminiIcon} alt="Chatbot" className="chatbot-icon" />
      </div>

      {/* Chatbot Box */}
      {showChat && (
        <div className="chatbot-box">
          <textarea
            rows="3"
            value={chatPrompt}
            onChange={(e) => setChatPrompt(e.target.value)}
            placeholder="for cancel..."
          />
          <button onClick={handleChatSubmit} disabled={chatLoading}>
            {chatLoading ? 'Thinking...' : 'Ask'}
          </button>
          <div className="chat-response">{chatResponse}</div>
        </div>
      )}
    </div>
  );
};

export default ProviderBookedSlots;
