import React from 'react';
import { useAuth } from '../services/AuthProvider';
import Navbar from '../navbar/Navbar';
import Chatbot from '../chat/Chatbot';

const Dashboard = () => {
    const { currentUser, userProfile } = useAuth();
    
    return (
        <div className="page">
            <Navbar />
            <div className="dashboard">
                <div className="dashboard-header">
                    <h2>Welcome to Dashboard</h2>
                    <p>Hello, {userProfile?.displayName || currentUser?.email || 'User'}! Manage your invoices and payments here.</p>
                </div>
                <div className="dashboard-content">
                </div>
            </div>
            
            <Chatbot />
        </div>
    );
};

export default Dashboard;