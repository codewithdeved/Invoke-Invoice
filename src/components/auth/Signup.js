import React, { useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signup } from '../services/auth';
import { useAuth } from '../services/AuthProvider';
import Navbar from '../navbar/Navbar';
import { AuthFormInput } from '../utils/AuthFormInput';
import { AuthButton } from '../utils/AuthButton';
import { Notification } from '../utils/Notification';
import { useAuthForm } from '../utils/useAuthForm';
import { validators } from '../utils/validators';

const Signup = () => {
    const navigate = useNavigate();
    const { setIsSignupTransition } = useAuth();

    const {
        formData,
        errors,
        notification,
        isSubmitting,
        handleChange,
        validateForm
    } = useAuthForm({
        email: '',
        password: '',
        confirmPassword: ''
    });

    const redirectTimerRef = useRef(null);
    const signupTimeoutRef = useRef(null);

    useEffect(() => {
        return () => {
            if (redirectTimerRef.current) {
                clearTimeout(redirectTimerRef.current);
            }
            if (signupTimeoutRef.current) {
                clearTimeout(signupTimeoutRef.current);
            }
        };
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();

        const validationRules = {
            email: [validators.required, validators.email],
            password: [validators.required, validators.minLength(6)],
            confirmPassword: [validators.required, validators.passwordMatch]
        };

        if (!validateForm(validationRules)) {
            return;
        }

        const emailToUse = formData.email;
        setIsSignupTransition(true);

        signupTimeoutRef.current = setTimeout(() => {
            if (isSubmitting) {
                navigateToSignin(emailToUse);
            }
        }, 5000);

        redirectTimerRef.current = setTimeout(() => {
            navigateToSignin(emailToUse);
        }, 1000);

        try {
            await signup(emailToUse, formData.password);
        } catch (err) {
            // Continue with navigation even if there's an error
        }
    };

    const navigateToSignin = (email) => {
        if (redirectTimerRef.current) {
            clearTimeout(redirectTimerRef.current);
            redirectTimerRef.current = null;
        }
        if (signupTimeoutRef.current) {
            clearTimeout(signupTimeoutRef.current);
            signupTimeoutRef.current = null;
        }

        navigate('/signin', {
            replace: true,
            state: {
                from: '/signup',
                signupEmail: email,
                autoFocusPassword: true
            }
        });
    };

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
                        <h2>Sign Up</h2>
                        <p>Create your Invoke Invoices account</p>
                    </div>

                    <form onSubmit={handleSubmit} noValidate>
                        <AuthFormInput
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            name="email"
                            disabled={isSubmitting}
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
                            disabled={isSubmitting}
                            autoComplete="new-password"
                            placeholder="Create a password"
                            label="Password"
                            error={errors.password}
                        />

                        <AuthFormInput
                            id="confirmPassword"
                            type="password"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            name="confirmPassword"
                            disabled={isSubmitting}
                            autoComplete="new-password"
                            placeholder="Confirm your password"
                            label="Confirm Password"
                            error={errors.confirmPassword}
                        />

                        <AuthButton
                            disabled={isSubmitting}
                            isLoading={isSubmitting}
                            loadingText="Please wait..."
                        >
                            Sign Up
                        </AuthButton>
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