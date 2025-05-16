import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './UserDashboard.css';
import UserNotification from './UserNotification';
import Footer from './Footer';
import { useNavigate } from 'react-router-dom';
import CommentSection from './CommentSection';
import FileSection from './FileSection';
import MeetingList from './MeetingList';
import JitsiMeetingComponent from './JitsiMeetingComponent';

const UserDashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const userId = localStorage.getItem('userId');
  const [showComments, setShowComments] = useState({});
  const [showFiles, setShowFiles] = useState({});
  const navigate = useNavigate();
  const [meetings, setMeetings] = useState([]);
  const [activeMeeting, setActiveMeeting] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:5000/api/auth/user', {
          headers: { 'x-auth-token': token }
        });
        setUserData(res.data);
      } catch (err) {
        console.error('Error fetching user data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, []);

  const fetchMeetings = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/meetings/user', {
        headers: { 'x-auth-token': token },
      });
      setMeetings(res.data);
    } catch (err) {
      console.error('Error fetching meetings:', err);
    }
  };

  const handleJoinMeeting = (roomName) => {
    if (!userData) {
      alert('Please wait while we load your profile data');
      return;
    }
    setActiveMeeting(roomName);
  };

  const handleMeetingEnd = () => {
    setActiveMeeting(null);
  };

  useEffect(() => {
    fetchMeetings();
  }, []);

  // Fetch tasks when the component loads
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:5000/api/tasks', {
          headers: { 'x-auth-token': token },
        });
        setTasks(res.data);
      } catch (err) {
        console.error('Error fetching tasks:', err);
      }
    };
    fetchTasks();
  }, []);

  // Handle task completion
  const handleCompleteTask = async (taskId) => {
    try {
      const task = tasks.find((task) => task._id === taskId);
      if (!task) return;

      const now = new Date().getTime();
      const startTime = new Date(task.startTime).getTime();
      const endTime = new Date(task.endTime).getTime();

      if (now < startTime) {
        alert('Time is not started yet!');
        return;
      }

      if (now > endTime) {
        alert('Time is over!');
        return;
      }

      const token = localStorage.getItem('token');
      const res = await axios.put(
        `http://localhost:5000/api/tasks/${taskId}/complete`,
        {},
        {
          headers: { 'x-auth-token': token },
        }
      );

      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task._id === taskId ? res.data : task
        )
      );

      alert('Task completed!');
    } catch (err) {
      console.error('Error completing task:', err);
    }
  };

  // Calculate remaining time for a task
  const calculateRemainingTime = (endTime) => {
    const now = new Date().getTime();
    const end = new Date(endTime).getTime();
    const remainingTime = end - now;

    if (remainingTime <= 0) return 'Time is over';

    const hours = Math.floor((remainingTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((remainingTime % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((remainingTime % (1000 * 60)) / 1000);

    return `${hours}h ${minutes}m ${seconds}s`;
  };

  // Update countdown every second
  useEffect(() => {
    const interval = setInterval(() => {
      setTasks((prevTasks) =>
        prevTasks.map((task) => {
          const now = new Date().getTime();
          const startTime = new Date(task.startTime).getTime();
          const endTime = new Date(task.endTime).getTime();

          if (now >= startTime && now <= endTime) {
            return {
              ...task,
              remainingTime: calculateRemainingTime(task.endTime),
              urgent: endTime - now <= 60 * 60 * 1000,
            };
          }
          return task;
        })
      );
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    navigate('/user/login');
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

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  if (activeMeeting) {
    return (
      <JitsiMeetingComponent
  roomName={activeMeeting}
  onMeetingEnd={handleMeetingEnd}
  user={userData || { name: 'User', email: 'user@example.com' }}
  configOverwrite={{
    disableDeepLinking: true,  // Add this to prevent mobile app opening
    startWithAudioMuted: true,
    startWithVideoMuted: true,
    disableInviteFunctions: true
  }}
  interfaceConfigOverwrite={{
    DISABLE_JOIN_LEAVE_NOTIFICATIONS: true,
    SHOW_CHROME_EXTENSION_BANNER: false
  }}
/>

    );
  }

  return (
    <div className="user-dashboard">
      <header className="user-header">
        <h1>User Dashboard</h1>
        <div>
          <button 
            onClick={() => setShowNotifications(!showNotifications)} 
            className="notification-icon"
          >
            🔔
          </button>
          <button onClick={handleLogout} className="logout-button">
            Logout
          </button>
        </div>
      </header>

      {showNotifications && <UserNotification />}

      <MeetingList
        meetings={meetings}
        onJoinMeeting={handleJoinMeeting}
        isAdmin={false}
      />

      <h2>Your Tasks</h2>
      <div className="task-list">
        {tasks.map((task) => {
          const now = new Date().getTime();
          const startTime = new Date(task.startTime).getTime();
          const endTime = new Date(task.endTime).getTime();
          const isTaskActive = now >= startTime && now <= endTime;
          const isTaskCompleted = (task.completedBy || []).includes(userId);

          return (
            <div key={task._id} className={task.urgent ? 'task-urgent' : ''}>
              <h3>{task.title}</h3>
              <p>{task.description}</p>
              <p>Start Time: {new Date(task.startTime).toLocaleString()}</p>
              <p>End Time: {new Date(task.endTime).toLocaleString()}</p>
              
              {isTaskActive && !isTaskCompleted && (
                <>
                  <p>Time Remaining: {task.remainingTime}</p>
                  <button 
                    onClick={() => handleCompleteTask(task._id)} 
                    className="complete-task-button"
                  >
                    Complete
                  </button>
                </>
              )}
              
              {isTaskCompleted && <p>Task Completed</p>}
              {now < startTime && <p>Task has not started yet</p>}
              {now > endTime && <p>Task time is over</p>}
              
              <div className="task-actions">
                <button 
                  onClick={() => toggleComments(task._id)} 
                  className="toggle-button"
                >
                  {showComments[task._id] ? 'Hide Comments' : 'Show Comments'}
                </button>
                <button 
                  onClick={() => toggleFiles(task._id)} 
                  className="toggle-button"
                >
                  {showFiles[task._id] ? 'Hide Files' : 'Show Files'}
                </button>
              </div>
              
              {showComments[task._id] && <CommentSection taskId={task._id} />}
              {showFiles[task._id] && <FileSection taskId={task._id} />}
            </div>
          );
        })}
      </div>
      
      <div className="app">
        <Footer />
      </div>
    </div>
  );
};

export default UserDashboard;