import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../services/AuthProvider';
import Navbar from '../navbar/Navbar';

const Dashboard = () => {
    const { currentUser, userProfile } = useAuth();
    const navigate = useNavigate();

    // Check if user is logged in
    if (!currentUser) {
        console.log('No current user, redirecting to signin');
        navigate('/signin', { replace: true });
        return null;
    }

    return (
        <div className="page">
            <Navbar />
            <div className="dashboard">
                <div className="dashboard-header">
                    <h2>Welcome to Dashboard</h2>
                    <p>Hello, {userProfile?.displayName || currentUser?.email || 'User'}! Manage your invoices and payments here.</p>
                </div>
                <div className="dashboard-content">
                    <div className="dashboard-card">
                        <h3>Welcome to Invoke Invoice</h3>
                        <p>Your professional invoicing solution</p>
                        <p>We're pleased to have you on board. Start managing your invoices here.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;