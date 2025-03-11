import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AdminNotification.css';

const AdminNotification = () => {
    const [notifications, setNotifications] = useState([]);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('http://localhost:5000/api/notifications/admin', {
                headers: { 'x-auth-token': token },
            });
            setNotifications(res.data);
        } catch (err) {
            setError('Failed to fetch notifications');
            console.error('Error fetching notifications:', err);
        }
    };

    return (
        <div className="admin-notification">
            <h2>Notifications</h2>
            {error && <p className="error-message">{error}</p>}
            {notifications.length > 0 ? (
                notifications.map((notification) => (
                    <div key={notification._id} className={`notification-item ${notification.isRead ? 'read' : 'unread'}`}>
                        <p>
                            {notification.taskTitle} - {notification.userEmail}
                            {notification.isRead && <span> (Read)</span>}
                        </p>
                    </div>
                ))
            ) : (
                <p>No new notifications</p>
            )}
        </div>
    );
};

export default AdminNotification;