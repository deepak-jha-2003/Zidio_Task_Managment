import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './AdminDashboard.css';
import AdminNotification from './AdminNotification';

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
  const [editingTask, setEditingTask] = useState(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showPerformance, setShowPerformance] = useState(false);
  const [performanceData, setPerformanceData] = useState([]); // Initialize as an empty array
  const [selectedPerformanceUser, setSelectedPerformanceUser] = useState(null);

  const formRef = useRef(null);
  const navigate = useNavigate();

  const formatDateForInput = (dateString) => {
    const date = new Date(dateString);
    return date.toISOString().slice(0, 16);
  };

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/admin/login');
        return;
      }
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

  const fetchTasks = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/admin/login');
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

  const fetchAllTasksWithCompletionStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/tasks/admin/performance', {
        headers: { 'x-auth-token': token },
      });
      setPerformanceData(res.data || []); // Ensure it's an array
      setShowPerformance(true);
      setSelectedPerformanceUser(null);
    } catch (err) {
      console.error('Error fetching performance data:', err);
    }
  };

  const fetchUserTasksWithCompletionStatus = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(
        `http://localhost:5000/api/tasks/admin/performance/${userId}`,
        {
          headers: { 'x-auth-token': token },
        }
      );
      setPerformanceData(res.data || []); // Ensure it's an array
      setShowPerformance(true);
      setSelectedPerformanceUser(userId);
    } catch (err) {
      console.error('Error fetching user performance data:', err);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchTasks();
  }, []);

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

  const handleDeleteTask = async (taskId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/tasks/${taskId}`, {
        headers: { 'x-auth-token': token },
      });
      setTasks(tasks.filter((task) => task._id !== taskId));
    } catch (err) {
      console.error('Error deleting task:', err);
    }
  };

  const handleUpdateTask = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const res = await axios.put(
        `http://localhost:5000/api/tasks/${editingTask._id}`,
        {
          title: editingTask.title,
          description: editingTask.description,
          startTime: editingTask.startTime,
          endTime: editingTask.endTime,
          userId: editingTask.userId,
          broadcast: editingTask.broadcast,
        },
        { headers: { 'x-auth-token': token } }
      );
      setTasks(tasks.map((task) => (task._id === editingTask._id ? res.data : task)));
      setEditingTask(null);
      if (formRef.current) {
        formRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    } catch (err) {
      console.error('Error updating task:', err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/admin/login');
  };

  const toggleUserDetails = () => {
    setShowUserDetails(!showUserDetails);
  };

  const handleViewProfile = (user) => {
    setSelectedUser(user);
  };

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
          <button onClick={() => setShowNotifications(!showNotifications)} className="notification-icon">
            🔔
          </button>
          <button onClick={fetchAllTasksWithCompletionStatus} className="performance-button">
            Performance
          </button>
        </div>
      </header>

      {showNotifications && <AdminNotification />}

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
                      <button onClick={() => fetchUserTasksWithCompletionStatus(user._id)}>
                        View Performance
                      </button>
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
          <p>
            <strong>Name:</strong> {selectedUser.name}
          </p>
          <p>
            <strong>Email:</strong> {selectedUser.email}
          </p>
          <p>
            <strong>Occupation:</strong> {selectedUser.occupation}
          </p>
          <p>
            <strong>Address:</strong> {selectedUser.address}
          </p>
          <p>
            <strong>Phone Number:</strong> {selectedUser.phoneNumber}
          </p>
          <p>
            <strong>Social Links:</strong> {selectedUser.socialLinks.join(', ')}
          </p>
          <button onClick={() => setSelectedUser(null)}>Close</button>
        </div>
      )}

      {showPerformance && (
        <div className="performance-modal">
          <h2>{selectedPerformanceUser ? `Performance for User: ${selectedPerformanceUser}` : 'All Tasks Performance'}</h2>
          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>Task Title</th>
                  <th>Assigned To</th>
                  <th>Completed By</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {Array.isArray(performanceData) && performanceData.map((task) => (
                  <tr key={task._id}>
                    <td>{task.title}</td>
                    <td>{task.user ? task.user.email : 'Broadcasted to all users'}</td>
                    <td>
                      {task.completedBy.length > 0
                        ? task.completedBy.map((user) => user.email).join(', ')
                        : 'No one'}
                    </td>
                    <td>
                      {task.completedBy.length > 0 ? 'Completed' : 'Not Completed'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button onClick={() => setShowPerformance(false)}>Close</button>
        </div>
      )}

      <div ref={formRef}>
        {editingTask ? (
          <form onSubmit={handleUpdateTask} className="task-form">
            <h2>Edit Task</h2>
            <input
              type="text"
              placeholder="Title"
              value={editingTask.title}
              onChange={(e) => setEditingTask({ ...editingTask, title: e.target.value })}
              required
            />
            <textarea
              placeholder="Description"
              value={editingTask.description}
              onChange={(e) => setEditingTask({ ...editingTask, description: e.target.value })}
            />
            <input
              type="datetime-local"
              placeholder="Start Time"
              value={formatDateForInput(editingTask.startTime)}
              onChange={(e) => setEditingTask({ ...editingTask, startTime: e.target.value })}
              required
            />
            <input
              type="datetime-local"
              placeholder="End Time"
              value={formatDateForInput(editingTask.endTime)}
              onChange={(e) => setEditingTask({ ...editingTask, endTime: e.target.value })}
              required
            />
            <label>
              <input
                type="checkbox"
                checked={editingTask.broadcast}
                onChange={(e) => setEditingTask({ ...editingTask, broadcast: e.target.checked })}
              />
              Broadcast to all users
            </label>
            {!editingTask.broadcast && (
              <select
                value={editingTask.userId}
                onChange={(e) => setEditingTask({ ...editingTask, userId: e.target.value })}
                required
              >
                <option value="">Select a user</option>
                {users.map((user) => (
                  <option key={user._id} value={user._id}>
                    {user.name} ({user.email})
                  </option>
                ))}
              </select>
            )}
            <button type="submit" className="edit-task-button">Update Task</button>
            <button type="button" onClick={() => setEditingTask(null)} className="cancel-button">
              Cancel
            </button>
          </form>
        ) : (
          <form onSubmit={handleSubmit} className="task-form">
            <h2>Create Task</h2>
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
            <button type="submit" className="create-task-button">Create Task</button>
          </form>
        )}
      </div>

      <h2>All Tasks</h2>
      <div className="task-list">
        {tasks.map((task) => (
          <div key={task._id} className={task.urgent ? 'task-urgent' : ''}>
            <h3>{task.title}</h3>
            <p>{task.description}</p>
            <p>Start Time: {new Date(task.startTime).toLocaleString()}</p>
            <p>End Time: {new Date(task.endTime).toLocaleString()}</p>
            <p>Assigned To: {task.user ? task.user.name : 'Broadcasted to all users'}</p>
            <button onClick={() => setEditingTask(task)} className="edit-task-button">
              Edit
            </button>
            <button onClick={() => handleDeleteTask(task._id)} className="delete-task-button">
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;