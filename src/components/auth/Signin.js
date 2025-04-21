import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { signin } from '../services/auth';
import { useAuth } from '../services/AuthProvider';
import Navbar from '../navbar/Navbar';
import { AuthFormInput } from '../utils/AuthFormInput';
import { AuthButton } from '../utils/AuthButton';
import { Notification } from '../utils/Notification';
import { useAuthForm } from '../utils/useAuthForm';
import { validators } from '../utils/validators';

const Signin = () => {
    const { currentUser, setCurrentUser, setIsSignupTransition, loading } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const passwordInputRef = useRef(null);
    const redirectTimerRef = useRef(null);
    const [signupInProgress, setSignupInProgress] = useState(false);
    
    const signupEmail = location.state?.signupEmail || '';
    const autoFocusPassword = location.state?.autoFocusPassword || false;
    const from = location.state?.from;
    
    const { 
        formData, 
        errors,
        notification, 
        isSubmitting,
        handleChange,
        setFieldValue,
        validateForm,
        handleAuthError
    } = useAuthForm({ 
        email: signupEmail,
        password: '' 
    });
    
    useEffect(() => {
        return () => {
            if (redirectTimerRef.current) {
                clearTimeout(redirectTimerRef.current);
            }
        };
    }, []);

    useEffect(() => {
        if (currentUser && !loading) {
            navigate('/dashboard', { replace: true });
        }
    }, [currentUser, loading, navigate]);

    useEffect(() => {
        if (autoFocusPassword && passwordInputRef.current) {
            setTimeout(() => {
                passwordInputRef.current.focus();
            }, 100);
        }
    }, [autoFocusPassword]);

    useEffect(() => {
        if (from === '/signup') {
            setSignupInProgress(true);
            setIsSignupTransition(true);
            setSignupInProgress(false);
        }
    }, [from, setIsSignupTransition]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (signupInProgress) {
            return;
        }
        
        const validationRules = {
            email: [validators.required, validators.email],
            password: [validators.required]
        };
        
        if (!validateForm(validationRules)) {
            return;
        }
    
        try {
            const userCredential = await signin(formData.email, formData.password);
            
            if (!userCredential?.user) {
                throw new Error('Unable to sign in. Please try again.');
            }
            
            // Update current user
            setCurrentUser(userCredential.user);
            setIsSignupTransition(false);
            
            // Navigate to dashboard immediately
            navigate('/dashboard', { replace: true });
        } catch (err) {
            handleAuthError(err);
        }
    };

    // const handleSubmit = async (e) => {
    //     e.preventDefault();
        
    //     if (signupInProgress) {
    //         return;
    //     }
        
    //     const validationRules = {
    //         email: [validators.required, validators.email],
    //         password: [validators.required]
    //     };
        
    //     if (!validateForm(validationRules)) {
    //         return;
    //     }

    //     try {
    //         const userCredential = await signin(formData.email, formData.password);
            
    //         if (!userCredential?.user) {
    //             throw new Error('Unable to sign in. Please try again.');
    //         }
            
    //         if (setCurrentUser) {
    //             setCurrentUser(userCredential.user);
    //             setIsSignupTransition(false);
                
    //             redirectTimerRef.current = setTimeout(() => {
    //                 navigate('/dashboard', { replace: true });
                    
    //                 setTimeout(() => {
    //                     if (window.location.pathname !== '/dashboard') {
    //                         window.location.href = '/dashboard';
    //                     }
    //                 }, 200);
    //             }, 1000);
    //         } else {
    //             throw new Error('Authentication system is not initialized properly.');
    //         }
    //     } catch (err) {
    //         handleAuthError(err);
    //     }
    // };

    return (
        <div className="page">
            <Navbar />
            <div className="auth-wrapper">
                <Notification 
                    message={notification} 
                    onClose={() => {}}
                />
                
                <div className="auth-container">
                    <div className="auth-header">
                        <h2>Sign In</h2>
                        <p>Access your Invoke Invoices account</p>
                    </div>
                    
                    <form onSubmit={handleSubmit} noValidate>
                        <AuthFormInput
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            name="email"
                            disabled={isSubmitting || signupInProgress}
                            autoComplete="email"
                            placeholder="Enter your email"
                            label="Email"
                            error={errors.email}
                        />
                        
                        <AuthFormInput
                            id="password"
                            type="password"
                            value={formData.password}
                            onChange={handleChange}
                            name="password"
                            disabled={isSubmitting || signupInProgress}
                            autoComplete="current-password"
                            placeholder="Enter your password"
                            label="Password"
                            error={errors.password}
                            ref={passwordInputRef}
                        />
                        
                        <AuthButton
                            disabled={isSubmitting || signupInProgress}
                            isLoading={isSubmitting || signupInProgress}
                            loadingText={signupInProgress ? "Creating Account..." : "Signing In..."}
                        >
                            Sign In
                        </AuthButton>
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