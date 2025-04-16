import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../services/AuthProvider';
import { getUserInvoices } from '../services/auth';
import Navbar from '../navbar/Navbar';

const Dashboard = () => {
    const { currentUser, userProfile } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [invoices, setInvoices] = useState([]);

    useEffect(() => {
        if (!currentUser || !currentUser.emailVerified) {
            navigate('/signin', { replace: true });
            return;
        }

        const fetchInvoices = async () => {
            try {
                const userInvoices = await getUserInvoices(currentUser.uid);
                setInvoices(userInvoices);
            } catch (error) {
                console.error("Error fetching invoices:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchInvoices();
    }, [currentUser, navigate]);

    if (loading) {
        return (
            <div className="page">
                <Navbar />
                <div className="dashboard loading-container">
                    <div className="loading-spinner"></div>
                    <p>Loading your dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="page">
            <Navbar />
            <div className="dashboard">
                <div className="dashboard-header">
                    <h2>Welcome to Dashboard</h2>
                    <p>Hello, {userProfile?.displayName || 'User'}! Manage your invoices and payments here.</p>
                </div>
                <div className="dashboard-content">
                    <div className="dashboard-card">
                        <h3>Welcome to Invoke Invoice</h3>
                        <p>Your professional invoicing solution</p>
                        <p>We're pleased to have you on board. Once you start creating invoices, they will appear here.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;