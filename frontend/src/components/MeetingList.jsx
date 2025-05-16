import React from 'react';
import { useNavigate } from 'react-router-dom';
import './MeetingList.css';

const MeetingList = ({ meetings, onJoinMeeting, onDeleteMeeting, isAdmin }) => {
    const navigate = useNavigate();

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString();
    };

    return (
        <div className="meeting-list">
            <h2>Upcoming Meetings</h2>
            {meetings.length === 0 ? (
                <p>No upcoming meetings</p>
            ) : (
                <div className="meetings-container">
                    {meetings.map(meeting => (
                        <div key={meeting._id} className="meeting-card">
                            <h3>{meeting.title}</h3>
                            <p>{meeting.description}</p>
                            <p><strong>Time:</strong> {formatDate(meeting.startTime)} - {formatDate(meeting.endTime)}</p>
                            <div className="meeting-actions">
                                <button 
                                    onClick={() => onJoinMeeting(meeting.roomName)}
                                    className="join-button"
                                >
                                    Join Meeting
                                </button>
                                {isAdmin && (
                                    <button 
                                        onClick={() => onDeleteMeeting(meeting._id)}
                                        className="delete-button"
                                    >
                                        Delete
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MeetingList;