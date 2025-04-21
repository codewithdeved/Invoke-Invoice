export const validators = {
    required: (value) => !value ? 'This field is required' : null,
    email: (value) => {
        if (!value) return null;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return !emailRegex.test(value) ? 'Please enter a valid email address' : null;
    },
    minLength: (length) => (value) => {
        if (!value) return null;
        return value.length < length ? `Must be at least ${length} characters` : null;
    },
    passwordMatch: (value, formData) => {
        if (!value) return null;
        return value !== formData.password ? 'Passwords do not match' : null;
    }
};