import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [userId, setUserId] = useState('');
  const [broadcast, setBroadcast] = useState(false);
  const [users, setUsers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const navigate = useNavigate();

  // Fetch all users
  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No token found');
        navigate('/admin/login'); 
        return;
      }
      // console.log('Token:', token); 
      const res = await axios.get('http://localhost:5000/api/admin/users', {
        headers: { 'x-auth-token': token },
      });
      setUsers(res.data);
    } catch (err) {
      console.error('Error fetching users:', err);
      if (err.response?.status === 401) {
        localStorage.removeItem('token'); 
        navigate('/admin/login'); 
      }
    }
  };

  // Fetch all tasks
  const fetchTasks = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No token found');
        navigate('/admin/login'); // Redirect to login if no token
        return;
      }
      const res = await axios.get('http://localhost:5000/api/tasks/all', {
        headers: { 'x-auth-token': token },
      });
      setTasks(res.data);
    } catch (err) {
      console.error('Error fetching tasks:', err);
      if (err.response?.status === 401) {
        localStorage.removeItem('token'); 
        navigate('/admin/login'); 
      }
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchTasks();
  }, []);
  
  // Handle task creation
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(
        'http://localhost:5000/api/tasks',
        { title, description, startTime, endTime, userId, broadcast },
        { headers: { 'x-auth-token': token } }
      );
      setTasks([...tasks, res.data]);
      setTitle('');
      setDescription('');
      setStartTime('');
      setEndTime('');
      setUserId('');
      setBroadcast(false);
    } catch (err) {
      console.error('Task creation error:', err);
    }
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/admin/login');
  };

  // Toggle user details visibility
  const toggleUserDetails = () => {
    setShowUserDetails(!showUserDetails);
  };

  // Handle view profile
  const handleViewProfile = (user) => {
    setSelectedUser(user);
  };

  // Handle delete user
  const handleDeleteUser = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/admin/users/${userId}`, {
        headers: { 'x-auth-token': token },
      });
      setUsers(users.filter((user) => user._id !== userId));
    } catch (err) {
      console.error('Error deleting user:', err);
    }
  };

  return (
    <div className="admin-dashboard">
      <header className="admin-header">
        <h1>Admin Dashboard</h1>
        <div>
          <button onClick={handleLogout}>Logout</button>
          <button onClick={toggleUserDetails} className="users-button">
            {showUserDetails ? 'Hide Users' : 'Show Users'}
          </button>
        </div>
      </header>

      {showUserDetails && (
        <div className="user-details">
          <h2>User Details</h2>
          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Occupation</th>
                  <th>Address</th>
                  <th>Phone Number</th>
                  <th>Social Links</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user._id}>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>{user.occupation}</td>
                    <td>{user.address}</td>
                    <td>{user.phoneNumber}</td>
                    <td>{user.socialLinks.join(', ')}</td>
                    <td>
                      <button onClick={() => handleViewProfile(user)}>View Profile</button>
                      <button onClick={() => handleDeleteUser(user._id)}>Delete User</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selectedUser && (
        <div className="user-profile-modal">
          <h2>User Profile</h2>
          <p><strong>Name:</strong> {selectedUser.name}</p>
          <p><strong>Email:</strong> {selectedUser.email}</p>
          <p><strong>Occupation:</strong> {selectedUser.occupation}</p>
          <p><strong>Address:</strong> {selectedUser.address}</p>
          <p><strong>Phone Number:</strong> {selectedUser.phoneNumber}</p>
          <p><strong>Social Links:</strong> {selectedUser.socialLinks.join(', ')}</p>
          <button onClick={() => setSelectedUser(null)}>Close</button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="task-form">
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <input
          type="datetime-local"
          placeholder="Start Time"
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
          required
        />
        <input
          type="datetime-local"
          placeholder="End Time"
          value={endTime}
          onChange={(e) => setEndTime(e.target.value)}
          required
        />
        <label>
          <input
            type="checkbox"
            checked={broadcast}
            onChange={(e) => setBroadcast(e.target.checked)}
          />
          Broadcast to all users
        </label>
        {!broadcast && (
          <select value={userId} onChange={(e) => setUserId(e.target.value)} required>
            <option value="">Select a user</option>
            {users.map((user) => (
              <option key={user._id} value={user._id}>
                {user.name} ({user.email})
              </option>
            ))}
          </select>
        )}
        <button type="submit">Create Task</button>
      </form>

      <h2>All Tasks</h2>
      <div className="task-list">
        {tasks.map((task) => (
          <div key={task._id}>
            <h3>{task.title}</h3>
            <p>{task.description}</p>
            <p>Start Time: {new Date(task.startTime).toLocaleString()}</p>
            <p>End Time: {new Date(task.endTime).toLocaleString()}</p>
            <p>Assigned To: {task.user ? task.user.name : 'Broadcasted to all users'}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;