import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../services/AuthProvider';
import Navbar from '../navbar/Navbar';

const LandingPage = () => {
    const { currentUser, loading } = useAuth();

    if (!loading && currentUser && currentUser.emailVerified) {
        return <Navigate to="/dashboard" replace />;
    }

    return (
        <div className="page">
            <Navbar />
            <div className="landing-content">
                <div className="landing-hero">
                    <h1>Invoke Invoice</h1>
                    <p>Professional invoicing made simple</p>
                </div>
            </div>
        </div>
    );
};

export default LandingPage;