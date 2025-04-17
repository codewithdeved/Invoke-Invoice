import React, { useState } from 'react';
import { useAuth } from '../services/AuthProvider';
import { sendEmailVerification, signout } from '../services/auth';
import { useNavigate } from 'react-router-dom';
import Navbar from '../navbar/Navbar';

const VerifyEmail = () => {
    const { currentUser } = useAuth();
    const [isSending, setIsSending] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleResendEmail = async () => {
        setIsSending(true);
        setMessage('');
        setError('');
        try {
            await sendEmailVerification(currentUser);
            setMessage('Verification email sent! Please check your inbox (including spam/junk).');
        } catch (err) {
            setError('Failed to send verification email. Please try again.');
        } finally {
            setIsSending(false);
        }
    };

    const handleCheckVerification = async () => {
        setIsSending(true);
        setMessage('');
        setError('');
        try {
            await currentUser.reload(); // Refresh user data
            if (currentUser.emailVerified) {
                setMessage('Email verified! Redirecting to dashboard...');
                setTimeout(() => {
                    navigate('/dashboard', { replace: true });
                }, 1000);
            } else {
                setError('Email not yet verified. Please check your inbox.');
            }
        } catch (err) {
            setError('Failed to check verification status. Please try again.');
        } finally {
            setIsSending(false);
        }
    };

    const handleSignOut = async () => {
        setIsSending(true);
        setMessage('');
        setError('');
        try {
            await signout();
            navigate('/signin', { replace: true });
        } catch (err) {
            setError('Failed to sign out. Please try again.');
        } finally {
            setIsSending(false);
        }
    };

    if (!currentUser) {
        return navigate('/signin', { replace: true });
    }

    return (
        <div className="page">
            <Navbar />
            <div className="auth-wrapper">
                <div className="auth-container">
                    <div className="auth-header">
                        <h2>Verify Your Email</h2>
                        <p>Please verify your email address to access the dashboard.</p>
                    </div>
                    <p>
                        A verification email has been sent to <strong>{currentUser?.email}</strong>.
                        Please check your inbox (and spam/junk folder) and click the verification link.
                    </p>
                    {message && <p className="success-text">{message}</p>}
                    {error && <p className="error-text">{error}</p>}
                    <button
                        className="btn btn-primary w-full"
                        onClick={handleResendEmail}
                        disabled={isSending}
                    >
                        {isSending ? 'Sending...' : 'Resend Verification Email'}
                    </button>
                    <button
                        className="btn btn-primary w-full"
                        onClick={handleCheckVerification}
                        disabled={isSending}
                    >
                        {isSending ? 'Checking...' : 'Check Verification Status'}
                    </button>
                    <button
                        className="btn btn-secondary w-full"
                        onClick={handleSignOut}
                        disabled={isSending}
                    >
                        Sign Out
                    </button>
                </div>
            </div>
        </div>
    );
};

export default VerifyEmail;