import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './AdminDashboard.css';
import AdminNotification from './AdminNotification';
import Footer from './Footer';
import CommentSection from './CommentSection';
import FileSection from './FileSection';
import MeetingList from './MeetingList';
import MeetingCalendar from './MeetingCalendar';
import CreateMeetingModal from './CreateMeetingModal';
import JitsiMeetingComponent from './JitsiMeetingComponent';

const AdminDashboard = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [broadcast, setBroadcast] = useState(false);
  const [users, setUsers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editingTask, setEditingTask] = useState(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showPerformance, setShowPerformance] = useState(false);
  const [performanceData, setPerformanceData] = useState([]);
  const [selectedPerformanceUser, setSelectedPerformanceUser] = useState(null);
  const [error, setError] = useState('');
  const [showUserSelection, setShowUserSelection] = useState(false);
  const [showComments, setShowComments] = useState({}); 
  const [showFiles, setShowFiles] = useState({});
  const [meetings, setMeetings] = useState([]);
  const [showCreateMeetingModal, setShowCreateMeetingModal] = useState(false);
  const [activeMeeting, setActiveMeeting] = useState(null);
  const [showMeetingCalendar, setShowMeetingCalendar] = useState(false);

  const formRef = useRef(null);
  const navigate = useNavigate();

  const formatDateForInput = (dateString) => {
    const date = new Date(dateString);
    return date.toISOString().slice(0, 16);
  };

  const fetchMeetings = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/meetings/admin', {
        headers: { 
          'x-auth-token': token,
          'Content-Type': 'application/json'
        }
      });
      setMeetings(res.data);
    } catch (err) {
      console.error('Error fetching meetings:', err);
      if (err.response?.status === 401 || err.response?.status === 403) {
        localStorage.removeItem('token');
        navigate('/admin/login');
      }
      setError(err.response?.data?.msg || 'Failed to fetch meetings');
    }
  };
  
  const handleCreateMeeting = async (meetingData) => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(
        'http://localhost:5000/api/meetings',
        meetingData,
        { headers: { 'x-auth-token': token } }
      );
      
      setMeetings(prev => [...prev, res.data]);
      setShowCreateMeetingModal(false);
    } catch (err) {
      console.error('Meeting creation error:', err);
      setError(err.response?.data?.msg || 'Failed to create meeting');
    }
  };

  const handleDeleteMeeting = async (meetingId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/meetings/${meetingId}`, {
        headers: { 'x-auth-token': token },
      });
      setMeetings(meetings.filter(meeting => meeting._id !== meetingId));
    } catch (err) {
      console.error('Error deleting meeting:', err);
      setError('Failed to delete meeting. Please try again.');
    }
  };

  const handleJoinMeeting = (roomName) => {
    setActiveMeeting(roomName);
  };

  const handleMeetingEnd = () => {
    setActiveMeeting(null);
  };

  const handleSelectMeeting = (meetingId) => {
    const meeting = meetings.find(m => m._id === meetingId);
    if (meeting) {
      setActiveMeeting(meeting.roomName);
    }
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
      setError('Failed to fetch users. Please try again.');
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
      setError('');
    } catch (err) {
      console.error('Error fetching tasks:', err);
      setError('Failed to fetch tasks. Please try again.');
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
      setPerformanceData(res.data || []);
      setShowPerformance(true);
      setSelectedPerformanceUser(null);
    } catch (err) {
      console.error('Error fetching performance data:', err);
      setError('Failed to fetch performance data. Please try again.');
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
      setPerformanceData(res.data || []);
      setShowPerformance(true);
      setSelectedPerformanceUser(userId);
    } catch (err) {
      console.error('Error fetching user performance data:', err);
      setError('Failed to fetch user performance data. Please try again.');
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchTasks();
    fetchMeetings();
  }, []);

  const handleUserSelection = (userId) => {
    if (selectedUsers.includes(userId)) {
      setSelectedUsers(selectedUsers.filter((id) => id !== userId));
    } else {
      setSelectedUsers([...selectedUsers, userId]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(
        'http://localhost:5000/api/tasks',
        { title, description, startTime, endTime, userIds: selectedUsers, broadcast },
        { headers: { 'x-auth-token': token } }
      );
      setTasks([...tasks, res.data]);
      setTitle('');
      setDescription('');
      setStartTime('');
      setEndTime('');
      setSelectedUsers([]);
      setBroadcast(false);
      setShowUserSelection(false);
      setError('');
    } catch (err) {
      console.error('Task creation error:', err);
      setError('Failed to create task. Please try again.');
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/tasks/${taskId}`, {
        headers: { 'x-auth-token': token },
      });
      setTasks(tasks.filter((task) => task._id !== taskId));
      setError('');
    } catch (err) {
      console.error('Error deleting task:', err);
      setError('Failed to delete task. Please try again.');
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
          userIds: editingTask.userIds,
          broadcast: editingTask.broadcast,
        },
        { headers: { 'x-auth-token': token } }
      );
      setTasks(tasks.map((task) => (task._id === editingTask._id ? res.data : task)));
      setEditingTask(null);
      setError('');
      if (formRef.current) {
        formRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    } catch (err) {
      console.error('Error updating task:', err);
      setError('Failed to update task. Please try again.');
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
      setError('');
    } catch (err) {
      console.error('Error deleting user:', err);
      setError('Failed to delete user. Please try again.');
    }
  };

  const toggleComments = (taskId) => {
    setShowComments((prev) => ({
      ...prev,
      [taskId]: !prev[taskId],
    }));
  };

  const toggleFiles = (taskId) => {
    setShowFiles((prev) => ({
      ...prev,
      [taskId]: !prev[taskId],
    }));
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
          <button onClick={() => setShowCreateMeetingModal(true)} className="create-meeting-button">
            Create Meeting
          </button>
          <button onClick={() => setShowMeetingCalendar(!showMeetingCalendar)} className="calendar-button">
            {showMeetingCalendar ? 'Hide Calendar' : 'Show Calendar'}
          </button>
        </div>
      </header>

      {showCreateMeetingModal && (
        <CreateMeetingModal 
          users={users} 
          onClose={() => setShowCreateMeetingModal(false)} 
          onMeetingCreated={handleCreateMeeting}
        />
      )}

      {activeMeeting ? (
        <JitsiMeetingComponent 
          roomName={activeMeeting} 
          onMeetingEnd={handleMeetingEnd}
          user={{ name: 'Admin', email: 'admin@example.com' }}
        />
      ) : (
        <>
          {showMeetingCalendar ? (
            <MeetingCalendar 
              meetings={meetings} 
              onSelectMeeting={handleSelectMeeting}
            />
          ) : (
            <MeetingList 
              meetings={meetings} 
              onJoinMeeting={handleJoinMeeting}
              onDeleteMeeting={handleDeleteMeeting}
              isAdmin={true}
            />
          )}
        </>
      )}

      {showNotifications && <AdminNotification />}

      {error && <p className="error-message">{error}</p>}

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
                    <td>{user.socialLinks?.join(', ') || 'None'}</td>
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
            <strong>Social Links:</strong> {selectedUser.socialLinks?.join(', ') || 'None'}
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
                    <td>{task.broadcast ? "Broadcasted to all users" : task.users ? task.users.map(user => user.name).join(', ') : 'No users assigned'}</td>
                    <td>
                      {task.completedBy?.length > 0
                        ? task.completedBy.map((user) => user.name).join(', ')
                        : 'No one'}
                    </td>
                    <td>
                      {task.completedBy?.length > 0 ? 'Completed' : 'Not Completed'}
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
              <div className="user-selection">
                <h3>Select Users:</h3>
                <div className="dropdown">
                  <button type="button" className="dropdown-toggle" onClick={() => setShowUserSelection(!showUserSelection)}>
                    Select Users
                  </button>
                  {showUserSelection && (
                    <div className="dropdown-menu">
                      {users.map((user) => (
                        <label key={user._id}>
                          <input
                            type="checkbox"
                            checked={editingTask.userIds?.includes(user._id)}
                            onChange={() => handleUserSelection(user._id)}
                          />
                          {user.name} ({user.email})
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              </div>
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
                onChange={(e) => {
                  setBroadcast(e.target.checked);
                  setShowUserSelection(!e.target.checked);
                }}
              />
              Broadcast to all users
            </label>
            {!broadcast && (
              <div className="user-selection">
                <h3>Select Users:</h3>
                <div className="dropdown">
                  <button type="button" className="dropdown-toggle" onClick={() => setShowUserSelection(!showUserSelection)}>
                    Select Users
                  </button>
                  {showUserSelection && (
                    <div className="dropdown-menu">
                      {users.map((user) => (
                        <label key={user._id}>
                          <input
                            type="checkbox"
                            checked={selectedUsers.includes(user._id)}
                            onChange={() => handleUserSelection(user._id)}
                          />
                          {user.name} ({user.email})
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              </div>
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
            <p>
              Assigned To:{" "}
              {task.broadcast
                ? "Broadcasted to all users"
                : task.users && task.users.length > 0
                ? task.users.map((user) => user.name).join(", ")
                : "No users assigned"}
            </p>
            <button onClick={() => setEditingTask(task)} className="edit-task-button">
              Edit
            </button>
            <button onClick={() => handleDeleteTask(task._id)} className="delete-task-button">
              Delete
            </button>
            <div className="task-actions">
              <button onClick={() => toggleComments(task._id)} className="toggle-button">
                {showComments[task._id] ? 'Hide Comments' : 'Show Comments'}
              </button>
              <button onClick={() => toggleFiles(task._id)} className="toggle-button">
                {showFiles[task._id] ? 'Hide Files' : 'Show Files'}
              </button>
            </div>
            {showComments[task._id] && <CommentSection taskId={task._id} />}
            {showFiles[task._id] && <FileSection taskId={task._id} />}
          </div>
        ))}
      </div>
      <div className="app">
        <Footer />
      </div>
    </div>
  );
};

export default AdminDashboard;