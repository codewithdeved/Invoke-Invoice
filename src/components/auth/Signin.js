import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { signin } from '../services/auth';
import { useAuth } from '../services/AuthProvider';
import Navbar from '../navbar/Navbar';

const Signin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [notification, setNotification] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { setCurrentUser, loading, loggingOut } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // Clear any redirection notifications after a delay
    useEffect(() => {
        if (notification) {
            const timer = setTimeout(() => {
                setNotification('');
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [notification]);

    // Check if user was redirected from signup or ProtectedRoute
    useEffect(() => {
        const from = location.state?.from;
        if (from === '/signup') {
            setEmail('');
            setPassword('');
            document.getElementById('email')?.focus();
        }
    }, [location]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setNotification('');
        setIsSubmitting(true);

        try {
            const userCredential = await signin(email, password);
            setCurrentUser(userCredential.user);
            setNotification('Redirecting...');
            setTimeout(() => {
                const redirectTo = location.state?.from || '/dashboard';
                navigate(redirectTo, { replace: true });
            }, 1000);
        } catch (err) {
            let errorMessage = 'Failed to sign in';
            if (err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found') {
                errorMessage = 'Invalid email or password';
            } else if (err.code === 'auth/too-many-requests') {
                errorMessage = 'Too many attempts. Try again later.';
            } else if (err.code === 'auth/network-request-failed') {
                errorMessage = 'Network error. Check your connection.';
            } else if (err.message) {
                errorMessage = err.message;
            }
            setError(errorMessage);
            setIsSubmitting(false);
        }
    };

    if (loading || loggingOut) {
        return (
            <div className="page">
                <Navbar />
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="page">
            <Navbar />
            <div className="auth-wrapper">
                {notification && (
                    <div className="notification success-notification">
                        <p>{notification}</p>
                    </div>
                )}
                <div className="auth-container">
                    <div className="auth-header">
                        <h2>Sign In</h2>
                        <p>Access your Invoke Invoices account</p>
                    </div>
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="email">Email</label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                disabled={isSubmitting}
                                autoComplete="email"
                                placeholder="Enter your email"
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="password">Password</label>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                disabled={isSubmitting}
                                autoComplete="current-password"
                                placeholder="Enter your password"
                            />
                        </div>
                        {error && <p className="error-text">{error}</p>}
                        <button
                            type="submit"
                            className="btn btn-primary w-full"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Signing In...' : 'Sign In'}
                        </button>
                    </form>
                    <div className="auth-links">
                        <p className="auth-link">
                            Don't have an account? <Link to="/signup">Sign Up</Link>
                        </p>
                        <p className="auth-link">
                            <Link to="/forgot-password">Forgot Password?</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Signin;