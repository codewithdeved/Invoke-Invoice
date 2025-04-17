import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../services/AuthProvider';

const ProtectedRoute = ({ children }) => {
    const { currentUser, loading, loggingOut } = useAuth();

    if (loading || loggingOut) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading...</p>
            </div>
        );
    }

    if (!currentUser) {
        return <Navigate to="/signin" state={{ from: window.location.pathname }} replace />;
    }

    return children;
};

export default ProtectedRoute;