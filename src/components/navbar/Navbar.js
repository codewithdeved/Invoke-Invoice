import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../services/AuthProvider';
import { signout } from '../services/auth';
import logo from '../../assets/web_logo.png';

const Navbar = () => {
    const { currentUser, userProfile, loading, loggingOut, setCurrentUser, setLoggingOut } = useAuth();
    const navigate = useNavigate();

    const handleSignout = async () => {
        try {
            setLoggingOut(true);
            setCurrentUser(null); // Clear currentUser immediately
            await signout();
            navigate('/', { replace: true });
        } catch (error) {
            console.error("Error signing out:", error);
        } finally {
            setLoggingOut(false); // Always reset loggingOut after logout attempt
        }
    };

    if (loggingOut) {
        return (
            <nav className="navbar">
                <Link to="/" className="logo">
                    <img src={logo} alt="Invoke Invoice" />
                </Link>
                <div className="navbar-buttons">
                    <div className="loading-spinner" style={{ width: '24px', height: '24px' }}></div>
                </div>
            </nav>
        );
    }

    return (
        <nav className="navbar">
            <Link to="/" className="logo">
                <img src={logo} alt="Invoke Invoice" />
            </Link>
            <div className="navbar-buttons">
                {!loading && currentUser ? (
                    <>
                        <span className="user-welcome">
                            Welcome, {userProfile?.displayName || 'User'}
                        </span>
                        <button className="btn btn-primary" onClick={handleSignout}>
                            Logout
                        </button>
                    </>
                ) : (
                    <button className="btn btn-primary" onClick={() => navigate('/signin')}>
                        Sign In
                    </button>
                )}
            </div>
        </nav>
    );
};

export default Navbar;