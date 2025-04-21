import React from 'react';

export const AuthButton = ({
    type = "submit",
    disabled,
    isLoading,
    className = "btn btn-primary w-full",
    loadingText,
    children
}) => {
    return (
        <button
            type={type}
            className={className}
            disabled={disabled || isLoading}
            aria-busy={isLoading}
        >
            {isLoading ? loadingText : children}
        </button>
    );
};