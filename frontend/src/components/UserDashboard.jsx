import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './UserDashboard.css';
import UserNotification from './UserNotification';

const UserDashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const userId = localStorage.getItem('userId'); // Ensure userId is stored in localStorage during login

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

      // Check if the current time is before the start time
      if (now < startTime) {
        alert('Time is not started yet!');
        return;
      }

      // Check if the current time is after the end time
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

      // Update the task's completedBy status in the frontend state
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task._id === taskId ? res.data : task // Replace the task with the updated task from the backend
        )
      );

      alert('Task completed!');
    } catch (err) {
      console.error('Error completing task:', err);
    }
  };

  // Function to calculate the remaining time for a task
  const calculateRemainingTime = (endTime) => {
    const now = new Date().getTime();
    const end = new Date(endTime).getTime();
    const remainingTime = end - now;

    if (remainingTime <= 0) {
      return 'Time is over';
    }

    const hours = Math.floor((remainingTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((remainingTime % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((remainingTime % (1000 * 60)) / 1000);

    return `${hours}h ${minutes}m ${seconds}s`;
  };

  // Update the countdown every second
  useEffect(() => {
    const interval = setInterval(() => {
      setTasks((prevTasks) =>
        prevTasks.map((task) => {
          const now = new Date().getTime();
          const startTime = new Date(task.startTime).getTime();
          const endTime = new Date(task.endTime).getTime();

          // Only start the countdown after the start time is reached
          if (now >= startTime && now <= endTime) {
            return {
              ...task,
              remainingTime: calculateRemainingTime(task.endTime),
              urgent: endTime - now <= 60 * 60 * 1000, // 1 hour
            };
          } else {
            return task;
          }
        })
      );
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="user-dashboard">
      <header className="user-header">
        <h1>User Dashboard</h1>
        <div>
          <button onClick={() => setShowNotifications(!showNotifications)} className="notification-icon">
            🔔
          </button>
        </div>
      </header>
      {showNotifications && <UserNotification />}
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
                  <button onClick={() => handleCompleteTask(task._id)} className="complete-task-button">
                    Complete
                  </button>
                </>
              )}
              {isTaskCompleted && <p>Task Completed</p>}
              {now < startTime && <p>Task has not started yet</p>}
              {now > endTime && <p>Task time is over</p>}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default UserDashboard;