import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './UserNotification.css';

const UserNotification = () => {
    const [notifications, setNotifications] = useState([]);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('http://localhost:5000/api/notifications/user', {
                headers: { 'x-auth-token': token },
            });
            setNotifications(res.data);
        } catch (err) {
            setError('Failed to fetch notifications');
            console.error('Error fetching notifications:', err);
        }
    };

    const handleMarkAsRead = async (id) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`http://localhost:5000/api/notifications/${id}/mark-as-read`, {}, {
                headers: { 'x-auth-token': token },
            });
            fetchNotifications(); // Refresh the notifications list
        } catch (err) {
            console.error('Error marking notification as read:', err);
        }
    };

    return (
        <div className="user-notification">
            <h2>Notifications</h2>
            {error && <p className="error-message">{error}</p>}
            {notifications.length > 0 ? (
                notifications.map((notification) => (
                    <div key={notification._id} className="notification-item">
                        <p>{notification.taskTitle}</p>
                        <button onClick={() => handleMarkAsRead(notification._id)}>Mark as Read</button>
                    </div>
                ))
            ) : (
                <p>No new notifications</p>
            )}
        </div>
    );
};

export default UserNotification;