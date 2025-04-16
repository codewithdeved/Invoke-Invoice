import { auth, db } from './firebase';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    sendEmailVerification,
    sendPasswordResetEmail,
} from 'firebase/auth';
import {
    doc,
    setDoc,
    collection,
    addDoc,
    query,
    where,
    getDocs,
    serverTimestamp,
} from 'firebase/firestore';

export const signup = async (email, password) => {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        try {
            await sendEmailVerification(user);
        } catch (emailError) {
            console.error('Email verification error:', emailError);
            throw new Error('Failed to send verification email');
        }
        try {
            await setDoc(doc(db, 'users', user.uid), {
                uid: user.uid,
                email,
                createdAt: serverTimestamp(),
                twoFactorEnabled: false,
                emailVerified: false,
            });
        } catch (docError) {
            console.error('User doc error:', docError);
            throw new Error('Failed to create user profile');
        }
        try {
            await addDoc(collection(db, 'invoices'), {
                userId: user.uid,
                amount: 1000,
                date: serverTimestamp(),
                status: 'Pending',
                description: 'Welcome Invoice',
            });
        } catch (invoiceError) {
            console.error('Invoice error:', invoiceError);
            throw new Error('Failed to create welcome invoice');
        }
        return user;
    } catch (error) {
        console.error('Signup error:', error.code, error.message);
        throw error;
    }
};

export const signin = async (email, password) => {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        return userCredential.user;
    } catch (error) {
        console.error('Signin error:', error.code, error.message);
        throw error;
    }
};

export const signout = async () => {
    try {
        await signOut(auth);
    } catch (error) {
        console.error('Signout error:', error);
        throw error;
    }
};

export const resetPassword = async (email) => {
    try {
        await sendPasswordResetEmail(auth, email);
    } catch (error) {
        console.error('Reset password error:', error);
        throw error;
    }
};

export const getUserInvoices = async (userId) => {
    try {
        const q = query(collection(db, 'invoices'), where('userId', '==', userId));
        const snapshot = await getDocs(q);
        return snapshot.docs.map((doc) => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                date: data.date
                    ? data.date.toDate
                        ? data.date.toDate()
                        : new Date(data.date)
                    : new Date(),
            };
        });
    } catch (error) {
        console.error('Get invoices error:', error);
        throw error;
    }
};