import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { resetPassword } from '../services/auth';
import Navbar from '../navbar/Navbar';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setIsSubmitting(true);

        try {
            await resetPassword(email);
            setSuccess('Password reset email sent! Check your inbox and spam/junk folder.');
            setEmail('');
        } catch (err) {
            let errorMessage = 'Failed to send reset email';
            if (err.code === 'auth/user-not-found') {
                errorMessage = 'No account found with this email';
            } else if (err.code === 'auth/invalid-email') {
                errorMessage = 'Invalid email address';
            } else if (err.message) {
                errorMessage = err.message;
            }
            setError(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="page">
            <Navbar />
            <div className="auth-wrapper">
                <div className="auth-container">
                    <div className="auth-header">
                        <h2>Reset Password</h2>
                        <p>We'll send you a password reset link</p>
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
                        {error && <p className="error-text">{error}</p>}
                        {success && <p className="success-text">{success}</p>}
                        <button
                            type="submit"
                            className="btn btn-primary w-full"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Sending...' : 'Send Reset Link'}
                        </button>
                    </form>
                    <p className="auth-link">
                        Remember your password? <Link to="/signin">Sign In</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;