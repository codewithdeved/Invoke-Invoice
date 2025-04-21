import { auth, db } from './firebase';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    sendPasswordResetEmail,
} from 'firebase/auth';
import {
    collection,
    addDoc,
    query,
    where,
    getDocs,
    orderBy,
    limit,
    serverTimestamp,
    doc,
    setDoc,
    getDoc,
    updateDoc,
    startAfter,
} from 'firebase/firestore';

// Utility to validate email format
const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

// Utility to validate user inputs
const validateInputs = (email, password) => {
    if (!email || !password) {
        throw new Error('Email and password are required.');
    }
    if (!validateEmail(email)) {
        throw new Error('Invalid email format.');
    }
    if (password.length < 6) {
        throw new Error('Password must be at least 6 characters long.');
    }
};

export const signup = async (email, password) => {
    try {
        validateInputs(email, password);

        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Batch user creation and initial invoice
        const userDocRef = doc(db, 'users', user.uid);
        const invoiceCollectionRef = collection(db, 'invoices');

        await Promise.all([
            setDoc(userDocRef, {
                uid: user.uid,
                email,
                createdAt: serverTimestamp(),
                twoFactorEnabled: false,
            }),
            addDoc(invoiceCollectionRef, {
                userId: user.uid,
                amount: 1000,
                date: serverTimestamp(),
                status: 'Pending',
                description: 'Welcome Invoice',
            }),
        ]);

        return userCredential;
    } catch (error) {
        throw new Error(error.message || 'Failed to sign up. Please try again.');
    }
};

export const signin = async (email, password) => {
    try {
        validateInputs(email, password);
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        return userCredential;
    } catch (error) {
        throw new Error(error.message || 'Failed to sign in. Please check your credentials.');
    }
};

export const signout = async () => {
    try {
        await signOut(auth);
    } catch (error) {
        throw new Error(error.message || 'Failed to sign out. Please try again.');
    }
};

export const resetPassword = async (email) => {
    try {
        if (!validateEmail(email)) {
            throw new Error('Invalid email format.');
        }
        await sendPasswordResetEmail(auth, email);
    } catch (error) {
        throw new Error(error.message || 'Failed to send password reset email. Please try again.');
    }
};

export const getUserInvoices = async (userId) => {
    try {
        if (!userId) {
            throw new Error('User ID is required.');
        }

        const q = query(
            collection(db, 'invoices'),
            where('userId', '==', userId),
            orderBy('date', 'desc'),
            limit(10) // Limit to 10 invoices for performance
        );
        const snapshot = await getDocs(q);

        return snapshot.docs.map((doc) => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                date: data.date?.toDate() || new Date(),
            };
        });
    } catch (error) {
        throw new Error(error.message || 'Failed to fetch invoices.');
    }
};

export const processInvoiceFile = async (fileData, userId) => {
    try {
        if (!fileData) {
            throw new Error('File data is required.');
        }

        // Simulate invoice processing (replace with actual backend API in production)
        const mockAnalysis = {
            id: Date.now().toString(),
            store: 'Whole Foods Market',
            date: new Date().toISOString(),
            total: 45.67,
            items: [
                { name: 'Organic Milk', price: 4.99, category: 'Dairy' },
                { name: 'Sourdough Bread', price: 5.49, category: 'Bakery' },
                { name: 'Avocados (3)', price: 5.99, category: 'Produce' },
                { name: 'Free Range Eggs', price: 6.49, category: 'Dairy' },
                { name: 'Quinoa', price: 8.99, category: 'Grains' },
                { name: 'Salmon Fillet', price: 13.99, category: 'Seafood' },
            ],
            savings: {
                total: 5.70,
                percentage: 12.5,
                details: [
                    { item: 'Organic Milk', save: 1.00, store: 'Trader Joe\'s' },
                    { item: 'Sourdough Bread', save: 0.70, store: 'Kroger' },
                    { item: 'Quinoa', save: 2.00, store: 'Aldi' },
                    { item: 'Salmon Fillet', save: 2.00, store: 'Costco' },
                ],
            },
        };

        if (userId) {
            await addDoc(collection(db, 'invoices'), {
                userId,
                amount: mockAnalysis.total,
                date: serverTimestamp(),
                description: `${mockAnalysis.store} Purchase`,
                items: mockAnalysis.items,
                savings: mockAnalysis.savings,
            });
        }

        return mockAnalysis;
    } catch (error) {
        throw new Error(error.message || 'Failed to process invoice file.');
    }
};

export const saveMessage = async (message, userId) => {
    try {
        if (!message?.content || !userId) {
            throw new Error('Message content and user ID are required.');
        }

        const chatRef = await addDoc(collection(db, 'chats'), {
            userId,
            content: message.content,
            type: message.type,
            timestamp: serverTimestamp(),
            metadata: {
                invoiceId: message.invoiceId || null,
                temporary: message.temporary || false,
            },
        });

        return chatRef.id;
    } catch (error) {
        throw new Error(error.message || 'Failed to save message.');
    }
};

export const getUserChatHistory = async (userId, lastDoc = null, pageSize = 20) => {
    try {
        if (!userId) {
            return [];
        }

        let q = query(
            collection(db, 'chats'),
            where('userId', '==', userId),
            where('metadata.temporary', '==', false),
            orderBy('timestamp', 'desc'),
            limit(pageSize)
        );

        if (lastDoc) {
            q = query(q, startAfter(lastDoc));
        }

        const snapshot = await getDocs(q);

        return {
            messages: snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                timestamp: doc.data().timestamp?.toDate() || new Date(),
            })).reverse(),
            lastDoc: snapshot.docs[snapshot.docs.length - 1] || null,
        };
    } catch (error) {
        throw new Error(error.message || 'Failed to fetch chat history.');
    }
};

export const saveChatSession = async (userId, title = null) => {
    try {
        if (!userId) {
            throw new Error('User ID is required.');
        }

        const sessionTitle = title || `Chat session - ${new Date().toLocaleDateString()}`;
        const sessionRef = await addDoc(collection(db, 'chatSessions'), {
            userId,
            title: sessionTitle,
            createdAt: serverTimestamp(),
            lastMessageAt: serverTimestamp(),
        });

        return sessionRef.id;
    } catch (error) {
        throw new Error(error.message || 'Failed to create chat session.');
    }
};

export const getUserChatSessions = async (userId) => {
    try {
        if (!userId) {
            return [];
        }

        const q = query(
            collection(db, 'chatSessions'),
            where('userId', '==', userId),
            orderBy('lastMessageAt', 'desc'),
            limit(50) // Limit sessions for performance
        );

        const snapshot = await getDocs(q);

        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate() || new Date(),
            lastMessageAt: doc.data().lastMessageAt?.toDate() || new Date(),
        }));
    } catch (error) {
        throw new Error(error.message || 'Failed to fetch chat sessions.');
    }
};

export const addMessageToSession = async (sessionId, message, userId) => {
    try {
        if (!sessionId || !message?.content || !userId) {
            throw new Error('Session ID, message content, and user ID are required.');
        }

        const sessionDocRef = doc(db, 'chatSessions', sessionId);
        const sessionDoc = await getDoc(sessionDocRef);

        if (!sessionDoc.exists() || sessionDoc.data().userId !== userId) {
            throw new Error('Invalid session or unauthorized access.');
        }

        const messageRef = await addDoc(collection(db, 'chats'), {
            userId,
            sessionId,
            content: message.content,
            type: message.type,
            timestamp: serverTimestamp(),
            metadata: {
                invoiceId: message.invoiceId || null,
                temporary: message.temporary || false,
            },
        });

        await updateDoc(sessionDocRef, {
            lastMessageAt: serverTimestamp(),
        });

        return messageRef.id;
    } catch (error) {
        throw new Error(error.message || 'Failed to add message to session.');
    }
};

export const getSessionMessages = async (sessionId, userId, lastDoc = null, pageSize = 20) => {
    try {
        const sessionDocRef = doc(db, 'chatSessions', sessionId);
        const sessionDoc = await getDoc(sessionDocRef);

        if (!sessionDoc.exists() || sessionDoc.data().userId !== userId) {
            throw new Error('Invalid session or unauthorized access.');
        }

        let q = query(
            collection(db, 'chats'),
            where('sessionId', '==', sessionId),
            orderBy('timestamp', 'asc'),
            limit(pageSize)
        );

        if (lastDoc) {
            q = query(q, startAfter(lastDoc));
        }

        const snapshot = await getDocs(q);

        return {
            messages: snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                timestamp: doc.data().timestamp?.toDate() || new Date(),
            })),
            lastDoc: snapshot.docs[snapshot.docs.length - 1] || null,
        };
    } catch (error) {
        throw new Error(error.message || 'Failed to fetch session messages.');
    }
};