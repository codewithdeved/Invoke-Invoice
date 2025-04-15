import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../services/AuthProvider';
import { signout } from '../services/auth';

import logo from '../../assets/web_logo.png';

const Navbar = () => {
    const { currentUser } = useAuth();
    const navigate = useNavigate();

    const handleSignout = async () => {
        await signout();
        navigate('/');
    };

    return (
        <nav className="navbar">
                <div className="logo">
                    <img src={logo} alt="Invoke Invoice" />
                </div>
            <div className="navbar-buttons">
                {currentUser ? (
                    <button className="btn btn-primary mt-1" onClick={() => { handleSignout(); navigate("/");}}>Sign Out</button>
                ) : (
                    <>
                        <button className="btn btn-primary mt-1" onClick={() => navigate('/signin')}>Sign In</button>
                    </>
                )}
            </div>
        </nav>
    );
};

export default Navbar;