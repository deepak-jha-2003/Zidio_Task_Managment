import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './CommentSection.css';

const CommentSection = ({ taskId }) => {
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');

    useEffect(() => {
        fetchComments();
    }, [taskId]);

    const fetchComments = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`http://localhost:5000/api/comments/${taskId}`, {
                headers: { 'x-auth-token': token }
            });
            setComments(res.data);
        } catch (err) {
            console.error('Error fetching comments:', err);
        }
    };

    const handleAddComment = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.post('http://localhost:5000/api/comments', {
                taskId,
                comment: newComment
            }, {
                headers: { 'x-auth-token': token }
            });
            setComments([...comments, res.data]);
            setNewComment('');
        } catch (err) {
            console.error('Error adding comment:', err);
        }
    };

    return (
        <div className="comment-section">
            <h3>Comments</h3>
            <div className="comments-list">
                {comments.map(comment => (
                    <div key={comment._id} className="comment">
                        <p><strong>{comment.isAdmin ? 'Admin' : comment.userId.name}:</strong> {comment.comment}</p>
                    </div>
                ))}
            </div>
            <textarea
                placeholder="Add a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
            />
            <button onClick={handleAddComment}>Add Comment</button>
        </div>
    );
};

export default CommentSection;