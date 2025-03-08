import React, { useState, useEffect } from 'react';
import axios from 'axios';

const UserDashboard = () => {
  const [tasks, setTasks] = useState([]);

  // Fetch tasks for the logged-in user
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

  return (
    <div className="user-dashboard">
      <h1>User Dashboard</h1>
      <h2>Your Tasks</h2>
      <div className="task-list">
      {tasks.map((task) => (
        <div key={task._id}>
          <h3>{task.title}</h3>
          <p>{task.description}</p>
          <p>Start Time: {new Date(task.startTime).toLocaleString()}</p>
          <p>End Time: {new Date(task.endTime).toLocaleString()}</p>
        </div>
      ))}
    </div>
    </div>
  );
};

export default UserDashboard;