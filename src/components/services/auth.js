import { auth, db } from './firebase';
import { useNavigate } from 'react-router-dom';
import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signOut, 
    sendEmailVerification,
    sendPasswordResetEmail
} from 'firebase/auth';
import { 
    doc, 
    setDoc, 
    collection, 
    addDoc, 
    query, 
    where, 
    getDocs,
    serverTimestamp
} from 'firebase/firestore';

// Sign up new user
export const signup = async (email, password) => {
    try {
        // Create user in Firebase Auth
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        // Send verification email
        await sendEmailVerification(user);
        
        // Create user document in Firestore
        await setDoc(doc(db, 'users', user.uid), {
            uid: user.uid,
            email,
            createdAt: serverTimestamp(),
            twoFactorEnabled: false,
            emailVerified: false
        });
        
        // Create a welcome invoice
        await addDoc(collection(db, 'invoices'), {
            userId: user.uid,
            amount: 1000, // $10.00
            date: serverTimestamp(),
            status: 'Pending',
            description: 'Welcome Invoice'
        });
        
        console.log("User created successfully:", user.uid);
        return user;
    } catch (error) {
        console.error("Error in signup function:", error);
        throw error;
    }
};

// Sign in existing user
export const signin = async (email, password) => {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        console.log("User signed in successfully:", userCredential.user.uid);
        return userCredential.user;
    } catch (error) {
        console.error("Error in signin function:", error);
        throw error;
    }
};

// Sign out user
export const signout = async () => {
    try {
        await signOut(auth);
        console.log("User signed out successfully");
    } catch (error) {
        console.error("Error signing out:", error);
        throw error;
    }
};

// Reset password
export const resetPassword = async (email) => {
    try {
        await sendPasswordResetEmail(auth, email);
        console.log("Password reset email sent to:", email);
    } catch (error) {
        console.error("Error sending password reset:", error);
        throw error;
    }
};

// Get user invoices
export const getUserInvoices = async (userId) => {
    try {
        const q = query(collection(db, 'invoices'), where('userId', '==', userId));
        const snapshot = await getDocs(q);
        const invoices = snapshot.docs.map(doc => ({ 
            id: doc.id, 
            ...doc.data(),
            // Convert Firebase timestamp to Date if it exists
            date: doc.data().date ? 
                  (doc.data().date.toDate ? doc.data().date.toDate() : doc.data().date) 
                  : new Date()
        }));
        console.log(`Retrieved ${invoices.length} invoices for user:`, userId);
        return invoices;
    } catch (error) {
        console.error("Error getting user invoices:", error);
        throw error;
    }
};