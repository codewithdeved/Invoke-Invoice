import React, { createContext, useState, useContext, useEffect } from 'react';
import { auth } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';

const AuthContext = createContext();

export function useAuth() {
    return useContext(AuthContext);
}

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [userProfile, setUserProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [loggingOut, setLoggingOut] = useState(false);
    const [isSignupTransition, setIsSignupTransition] = useState(false);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            try {
                if (user) {
                    setCurrentUser(user);
                    setUserProfile({
                        displayName: user.displayName || user.email.split('@')[0],
                        email: user.email,
                        uid: user.uid,
                    });
                } else {
                    setCurrentUser(null);
                    setUserProfile(null);
                }
            } catch (error) {
                setCurrentUser(null);
                setUserProfile(null);
            } finally {
                setLoading(false);
                setLoggingOut(false);
            }
        });

        return unsubscribe;
    }, []);

    const value = {
        currentUser,
        userProfile,
        loading,
        loggingOut,
        isSignupTransition,
        setCurrentUser,
        setUserProfile,
        setLoggingOut,
        setIsSignupTransition
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};