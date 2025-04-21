import React, { forwardRef } from 'react';

export const AuthFormInput = forwardRef(({
    id,
    type,
    value,
    onChange,
    name,
    disabled,
    placeholder,
    autoComplete,
    label,
    required = true,
    error
}, ref) => {
    const inputId = `auth-input-${id}`;

    return (
        <div className="form-group">
            <label htmlFor={inputId}>{label}</label>
            <input
                id={inputId}
                type={type}
                value={value}
                onChange={onChange}
                name={name}
                required={required}
                disabled={disabled}
                placeholder={placeholder}
                autoComplete={autoComplete}
                aria-invalid={!!error}
                aria-describedby={error ? `${inputId}-error` : undefined}
                className={error ? "input-error" : ""}
                ref={ref}
            />
            {error && (
                <p id={`${inputId}-error`} className="error-text" aria-live="polite">
                    {error}
                </p>
            )}
        </div>
    );
});