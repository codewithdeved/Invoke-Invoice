import React, { createContext, useState, useContext, useEffect } from 'react';
import { auth } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';

const AuthContext = createContext();

export function useAuth() {
    return useContext(AuthContext);
}

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [userProfile, setUserProfile] = useState(null);
    const [authInitialized, setAuthInitialized] = useState(false);
    
    // Optional: Global form submission state
    // const [isSubmittingForm, setIsSubmittingForm] = useState(false);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(
            auth,
            (user) => {
                try {
                    console.log('Auth state changed:', user);
                    setCurrentUser(user);
                    setUserProfile(
                        user && user.emailVerified
                            ? {
                                  displayName: user.displayName || user.email.split('@')[0],
                                  email: user.email,
                                  emailVerified: user.emailVerified,
                                  uid: user.uid,
                              }
                            : null
                    );
                    setLoading(false);
                    setAuthInitialized(true);
                } catch (error) {
                    console.error('Auth state error:', error);
                    setLoading(false);
                    setAuthInitialized(true);
                }
            },
            (error) => {
                console.error('onAuthStateChanged error:', error);
                setLoading(false);
                setAuthInitialized(true);
            }
        );

        return unsubscribe;
    }, []);

    const value = {
        currentUser,
        userProfile,
        loading,
        authInitialized,
        setCurrentUser,
        // isSubmittingForm,
        // setIsSubmittingForm,
    };

    if (!authInitialized) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading...</p>
            </div>
        );
    }

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
// import { auth } from './firebase';
// import { onAuthStateChanged } from 'firebase/auth';

// const AuthContext = createContext();

// export const useAuth = () => useContext(AuthContext);

// export const AuthProvider = ({ children }) => {
//     const [currentUser, setCurrentUser] = useState(null);
//     const [loading, setLoading] = useState(true);
//     const unsubscribeRef = useRef(null);

//     useEffect(() => {
//         if (unsubscribeRef.current) unsubscribeRef.current();

//         const unsubscribe = onAuthStateChanged(auth, (user) => {
//             setCurrentUser(user);
//             setLoading(false);
//         });

//         unsubscribeRef.current = unsubscribe;

//         return () => {
//             if (unsubscribeRef.current) unsubscribeRef.current();
//         };
//     }, []);

//     return (
//         <AuthContext.Provider value={{ currentUser, loading }}>
//             {!loading && children}
//         </AuthContext.Provider>
//     );
// };