import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './FileSection.css';

const FileSection = ({ taskId }) => {
    const [files, setFiles] = useState([]);
    const [selectedFile, setSelectedFile] = useState(null);

    useEffect(() => {
        fetchFiles();
    }, [taskId]);

    const fetchFiles = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`http://localhost:5000/api/files/${taskId}`, {
                headers: { 'x-auth-token': token }
            });
            setFiles(res.data);
        } catch (err) {
            console.error('Error fetching files:', err);
        }
    };

    const handleFileUpload = async () => {
        try {
            const token = localStorage.getItem('token');
            const formData = new FormData();
            formData.append('file', selectedFile);
            formData.append('taskId', taskId);

            const res = await axios.post('http://localhost:5000/api/files', formData, {
                headers: { 'x-auth-token': token, 'Content-Type': 'multipart/form-data' }
            });
            setFiles([...files, res.data]);
            setSelectedFile(null);
        } catch (err) {
            console.error('Error uploading file:', err);
        }
    };

    const handleDownload = (filePath) => {
        window.open(`http://localhost:5000/${filePath}`);
    };

    return (
        <div className="file-section">
            <h3>Files</h3>
            <div className="files-list">
                {files.map(file => (
                    <div key={file._id} className="file">
                        <p><strong>{file.isAdmin ? 'Admin' : file.userId.name}:</strong> {file.fileName}</p>
                        <button onClick={() => handleDownload(file.filePath)}>Download</button>
                    </div>
                ))}
            </div>
            <input type="file" onChange={(e) => setSelectedFile(e.target.files[0])} />
            <button onClick={handleFileUpload}>Upload File</button>
        </div>
    );
};

export default FileSection;