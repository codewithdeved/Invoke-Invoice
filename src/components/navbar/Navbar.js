import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../services/AuthProvider';
import { signout } from '../services/auth';
import logo from '../../assets/web_logo.png';

const Navbar = () => {
    const { currentUser, userProfile, loading } = useAuth();
    const navigate = useNavigate();

    const handleSignout = async () => {
        try {
            await signout();
            navigate('/', { replace: true });
        } catch (error) {
            console.error("Error signing out:", error);
        }
    };

    return (
        <nav className="navbar">
            <Link to="/" className="logo">
                <img src={logo} alt="Invoke Invoice" />
            </Link>
            <div className="navbar-buttons">
                {!loading && currentUser && currentUser.emailVerified ? (
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