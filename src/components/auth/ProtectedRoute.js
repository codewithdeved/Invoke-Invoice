import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../services/AuthProvider';

const ProtectedRoute = ({ children }) => {
    const { currentUser, loading } = useAuth();

    // if (loading) {
    //     return <div className="loading-container">Loading...</div>;
    // }

    if (!currentUser) {
        return <Navigate to="/signin" replace />;
    }

    return children;
};

export default ProtectedRoute;