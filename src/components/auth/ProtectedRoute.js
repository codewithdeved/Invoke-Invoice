import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../services/AuthProvider';

const ProtectedRoute = ({ children }) => {
    const { currentUser, loading } = useAuth();

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading...</p>
            </div>
        );
    }

    if (!currentUser || !currentUser.emailVerified) {
        return <Navigate to="/signin" replace />;
    }

    return children;
};

export default ProtectedRoute;