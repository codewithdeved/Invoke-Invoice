import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

export const useAuthForm = (initialState = {}) => {
    const [formData, setFormData] = useState(initialState);
    const [errors, setErrors] = useState({});
    const [notification, setNotification] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();

    const handleChange = useCallback((e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        // Clear error for this field when it's changed
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    }, [errors]);

    const setFieldValue = useCallback((name, value) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    }, []);

    const validateField = useCallback((name, validators) => {
        if (!validators) return true;

        for (const validator of validators) {
            const error = validator(formData[name], formData);
            if (error) {
                setErrors(prev => ({ ...prev, [name]: error }));
                return false;
            }
        }

        return true;
    }, [formData]);

    const validateForm = useCallback((validationRules) => {
        const newErrors = {};
        let isValid = true;

        Object.entries(validationRules).forEach(([field, validators]) => {
            for (const validator of validators) {
                const error = validator(formData[field], formData);
                if (error) {
                    newErrors[field] = error;
                    isValid = false;
                    break;
                }
            }
        });

        setErrors(newErrors);
        return isValid;
    }, [formData]);

    const handleAuthError = useCallback((err) => {
        // Standardized error handling for authentication errors
        let errorMessage = 'Authentication failed';
        let fieldError = null;

        if (err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found') {
            errorMessage = 'Invalid email or password';
            fieldError = { password: 'Invalid email or password' };
        } else if (err.code === 'auth/email-already-in-use') {
            errorMessage = 'Email already in use';
            fieldError = { email: 'This email is already registered' };
        } else if (err.code === 'auth/invalid-email') {
            errorMessage = 'Invalid email address';
            fieldError = { email: 'Please enter a valid email address' };
        } else if (err.code === 'auth/weak-password') {
            errorMessage = 'Password too weak';
            fieldError = { password: 'Password must be at least 6 characters' };
        } else if (err.code === 'auth/too-many-requests') {
            errorMessage = 'Too many attempts. Try again later.';
        } else if (err.code === 'auth/network-request-failed') {
            errorMessage = 'Network error. Check your connection.';
        } else if (err.message) {
            errorMessage = err.message;
        }

        if (fieldError) {
            setErrors(prev => ({ ...prev, ...fieldError }));
        } else {
            setNotification(errorMessage);
        }
    }, []);

    const redirectWithDelay = useCallback((path, delay = 0, state = {}) => {
        if (delay > 0) {
            const timerId = setTimeout(() => {
                navigate(path, { replace: true, state });
            }, delay);
            return timerId;
        } else {
            navigate(path, { replace: true, state });
            return null;
        }
    }, [navigate]);

    return {
        formData,
        errors,
        notification,
        isSubmitting,
        setFieldValue,
        handleChange,
        setErrors,
        setNotification,
        setIsSubmitting,
        validateField,
        validateForm,
        handleAuthError,
        redirectWithDelay
    };
};