import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../services/AuthProvider';
import { signout } from '../services/auth';
import logo from '../../assets/web_logo.png';

const Navbar = () => {
    const { currentUser, userProfile, loading, isSignupTransition, setLoggingOut } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    
    const isAuthenticated = !loading && currentUser && !isSignupTransition;
    const displayName = userProfile?.displayName || (currentUser?.email?.split('@')[0]) || 'User';
    
    const handleSignout = async (e) => {
        e.preventDefault();
        
        setLoggingOut(true);
        
        try {
            await signout();
            
            navigate('/', { replace: true });
        } catch (error) {
            console.error('Signout error:', error);
            setLoggingOut(false);
        }
    };
    
    return (
        <nav className="navbar">
            <Link to="/" className="logo">
                <img src={logo} alt="Invoke Invoice" />
            </Link>
            <div className="navbar-buttons">
                {isAuthenticated ? (
                    <>
                        <span className="user-welcome">
                            Welcome, {displayName}
                        </span>
                        <button
                            className="btn btn-primary"
                            onClick={handleSignout}
                        >
                            Logout
                        </button>
                    </>
                ) : (
                    <button
                        className="btn btn-primary"
                        onClick={() => navigate('/signin')}
                    >
                        Sign In
                    </button>
                )}
            </div>
        </nav>
    );
};

export default Navbar;