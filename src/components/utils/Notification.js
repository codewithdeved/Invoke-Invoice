import React, { useEffect } from 'react';

export const Notification = ({
    message,
    type = "success",
    duration = 3000,
    onClose
}) => {
    useEffect(() => {
        if (message) {
            const timer = setTimeout(() => {
                if (onClose) onClose();
            }, duration);
            return () => clearTimeout(timer);
        }
    }, [message, duration, onClose]);

    if (!message) return null;

    return (
        <div
            className={`notification ${type}-notification`}
            role="alert"
            aria-live="assertive"
        >
            <p>{message}</p>
        </div>
    );
};