import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signup, signin } from '../services/auth';
import { useAuth } from '../services/AuthProvider';
import Navbar from '../navbar/Navbar';

const Auth = () => {
    const [isSignup, setIsSignup] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [notification, setNotification] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { setCurrentUser } = useAuth();
    const navigate = useNavigate();

    // Clear notifications after delay
    useEffect(() => {
        if (notification) {
            const timer = setTimeout(() => {
                setNotification('');
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [notification]);

    const validatePassword = () => {
        if (password.length < 6) return 'Password must be at least 6 characters';
        if (isSignup && password !== confirmPassword) return 'Passwords do not match';
        return null;
    };

    const handleSignup = async () => {
        const passwordError = validatePassword();
        if (passwordError) {
            setError(passwordError);
            setIsSubmitting(false);
            return;
        }

        try {
            await signup(email, password);
            setNotification('Account created! Please sign in with your credentials');
            // Switch to signin form automatically after successful signup
            setIsSignup(false);
            setConfirmPassword('');
            setIsSubmitting(false);
        } catch (err) {
            let errorMessage = 'Failed to create account';
            if (err.code === 'auth/email-already-in-use') {
                errorMessage = 'Email already in use';
            } else if (err.code === 'auth/invalid-email') {
                errorMessage = 'Invalid email address';
            } else if (err.code === 'auth/weak-password') {
                errorMessage = 'Password too weak';
            } else if (err.message) {
                errorMessage = err.message;
            }
            setError(errorMessage);
            setIsSubmitting(false);
        }
    };

    const handleSignin = async () => {
        try {
            const userCredential = await signin(email, password);
            setCurrentUser(userCredential.user);
            setNotification('Redirecting to Dashboard...');
            
            // Navigate to dashboard after a short delay
            setTimeout(() => {
                navigate('/dashboard', { replace: true });
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setNotification('');
        setIsSubmitting(true);

        if (isSignup) {
            await handleSignup();
        } else {
            await handleSignin();
        }
    };

    const switchMode = () => {
        setIsSignup(!isSignup);
        setError('');
        setNotification('');
    };

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
                        <h2>{isSignup ? 'Sign Up' : 'Sign In'}</h2>
                        <p>
                            {isSignup
                                ? 'Create your Invoke Invoices account'
                                : 'Access your Invoke Invoices account'}
                        </p>
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
                                placeholder="Enter your email"
                                autoComplete={isSignup ? 'email' : 'current-email'}
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
                                placeholder={isSignup ? 'Create a password' : 'Enter your password'}
                                autoComplete={isSignup ? 'new-password' : 'current-password'}
                            />
                        </div>
                        {isSignup && (
                            <div className="form-group">
                                <label htmlFor="confirmPassword">Confirm Password</label>
                                <input
                                    id="confirmPassword"
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                    disabled={isSubmitting}
                                    placeholder="Confirm your password"
                                    autoComplete="new-password"
                                />
                            </div>
                        )}
                        {error && <p className="error-text">{error}</p>}
                        <button
                            type="submit"
                            className="btn btn-primary w-full"
                            disabled={isSubmitting}
                        >
                            {isSubmitting
                                ? isSignup
                                    ? 'Creating Account...'
                                    : 'Signing In...'
                                : isSignup
                                ? 'Sign Up'
                                : 'Sign In'}
                        </button>
                    </form>
                    <div className="auth-links">
                        <p className="auth-link">
                            {isSignup ? 'Already have an account? ' : "Don't have an account? "}
                            <button
                                onClick={switchMode}
                                className="link-button"
                                type="button"
                                disabled={isSubmitting}
                            >
                                {isSignup ? 'Sign In' : 'Sign Up'}
                            </button>
                        </p>
                        {!isSignup && (
                            <p className="auth-link">
                                <Link to="/forgot-password">Forgot Password?</Link>
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Auth;