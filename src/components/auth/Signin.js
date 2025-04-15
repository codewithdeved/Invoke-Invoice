import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signin } from '../services/auth';
import { useAuth } from '../services/AuthProvider';
import Navbar from '../navbar/Navbar';

const Signin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    
    useEffect(() => {
        if (currentUser) {
            navigate('/');
        }
    }, [currentUser, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);
        
        try {
            const user = await signin(email, password);
            
            if (!user.emailVerified) {
                setError('Please verify your email before signing in. Check your inbox for a verification link.');
                setIsSubmitting(false);
                return;
            }
            
            navigate('/');
        } catch (err) {
            let errorMessage = 'Failed to sign in';
            
            if (err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found') {
                errorMessage = 'Invalid email or password';
            } else if (err.code === 'auth/too-many-requests') {
                errorMessage = 'Too many failed login attempts. Please try again later';
            } else if (err.code === 'auth/network-request-failed') {
                errorMessage = 'Network error. Please check your connection';
            } else if (err.message) {
                errorMessage = err.message;
            }
            
            setError(errorMessage);
            setIsSubmitting(false);
        }
    };

    return (
        <div className="page">
            <Navbar />
            <div className="auth-wrapper">
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
                            />
                        </div>
                        {error && <p className="error-text">{error}</p>}
                        <button 
                            type="submit" 
                            className="btn btn-primary"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Signing In...' : 'Sign In'}
                        </button>
                    </form>
                    <p className="auth-link">
                        Don't have an account? <Link to="/signup">Sign Up</Link>
                    </p>
                    <p className="auth-link">
                        <Link to="/forgot-password">Forgot Password?</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Signin;