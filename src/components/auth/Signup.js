import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signup } from '../services/auth';
import { useAuth } from '../services/AuthProvider';
import Navbar from '../navbar/Navbar';

const Signup = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { currentUser } = useAuth(); // Keep for success redirect
    const navigate = useNavigate();

    const validatePassword = () => {
        if (password.length < 6) return 'Password must be at least 6 characters';
        if (password !== confirmPassword) return 'Passwords do not match';
        return null;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setIsSubmitting(true);
        // Optional: Use global isSubmittingForm if implemented in AuthProvider
        // setIsSubmittingForm(true);

        const passwordError = validatePassword();
        if (passwordError) {
            setError(passwordError);
            setIsSubmitting(false);
            // setIsSubmittingForm(false);
            return;
        }

        try {
            await signup(email, password);
            setSuccess('Account created! Please check your email (including spam/junk) to verify your account, then sign in.');
            setEmail('');
            setPassword('');
            setConfirmPassword('');
            setTimeout(() => {
                navigate('/signin', { replace: true });
                setIsSubmitting(false);
                // setIsSubmittingForm(false);
            }, 2000);
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
            // setIsSubmittingForm(false);
        }
    };

    if (success || (currentUser && currentUser.emailVerified)) {
        return (
            <div className="page">
                <Navbar />
                <div className="auth-wrapper">
                    <div className="auth-container">
                        <p className="success-text">{success || 'Redirecting to dashboard...'}</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="page">
            <Navbar />
            <div className="auth-wrapper">
                <div className="auth-container">
                    <div className="auth-header">
                        <h2>Sign Up</h2>
                        <p>Create your Invoke Invoices account</p>
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
                                placeholder="Create a password"
                                autoComplete="new-password"
                            />
                        </div>
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
                        {error && <p className="error-text">{error}</p>}
                        <button
                            type="submit"
                            className="btn btn-primary w-full"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Creating Account...' : 'Sign Up'}
                        </button>
                    </form>
                    <p className="auth-link">
                        Already have an account? <Link to="/signin">Sign In</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Signup;