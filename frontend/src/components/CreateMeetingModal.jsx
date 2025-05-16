import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './CreateMeetingModal.css';

const CreateMeetingModal = ({ users, onClose, onMeetingCreated }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [broadcast, setBroadcast] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Basic validation
        if (!title || !startTime || !endTime) {
            setError('Title, start time, and end time are required');
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const res = await axios.post(
                'http://localhost:5000/api/meetings',
                { 
                    title, 
                    description, 
                    startTime, 
                    endTime, 
                    participants: selectedUsers, 
                    isBroadcast: broadcast 
                },
                { 
                    headers: { 
                        'x-auth-token': token,
                        'Content-Type': 'application/json'
                    } 
                }
            );
            
            if (res.data && res.data._id) {
                onMeetingCreated(res.data);
                onClose();
            } else {
                setError('Failed to create meeting. Please try again.');
            }
        } catch (err) {
            console.error('Meeting creation error:', err);
            setError(err.response?.data?.msg || err.response?.data?.error || 'Error creating meeting');
        }
    };

    const toggleUserSelection = (userId) => {
        if (selectedUsers.includes(userId)) {
            setSelectedUsers(selectedUsers.filter(id => id !== userId));
        } else {
            setSelectedUsers([...selectedUsers, userId]);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <button className="close-button" onClick={onClose}>×</button>
                <h2>Create New Meeting</h2>
                {error && <p className="error-message">{error}</p>}
                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        placeholder="Meeting Title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                    />
                    <textarea
                        placeholder="Description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                    <div className="time-inputs">
                        <label>
                            Start Time:
                            <input
                                type="datetime-local"
                                value={startTime}
                                onChange={(e) => setStartTime(e.target.value)}
                                required
                            />
                        </label>
                        <label>
                            End Time:
                            <input
                                type="datetime-local"
                                value={endTime}
                                onChange={(e) => setEndTime(e.target.value)}
                                required
                            />
                        </label>
                    </div>
                    <label className="broadcast-checkbox">
                        <input
                            type="checkbox"
                            checked={broadcast}
                            onChange={(e) => {
                                setBroadcast(e.target.checked);
                                if (e.target.checked) {
                                    setSelectedUsers([]);
                                }
                            }}
                        />
                        Broadcast to all users
                    </label>
                    {!broadcast && (
                        <div className="user-selection">
                            <h4>Select Participants:</h4>
                            <div className="user-list">
                                {users.map(user => (
                                    <div key={user._id} className="user-item">
                                        <input
                                            type="checkbox"
                                            id={`user-${user._id}`}
                                            checked={selectedUsers.includes(user._id)}
                                            onChange={() => toggleUserSelection(user._id)}
                                        />
                                        <label htmlFor={`user-${user._id}`}>
                                            {user.name} ({user.email})
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    <button type="submit" className="submit-button">Create Meeting</button>
                </form>
            </div>
        </div>
    );
};

export default CreateMeetingModal;