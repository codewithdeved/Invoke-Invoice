import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
    apiKey: "AIzaSyB4L8NwoVVBNHsHMbZCjza75JPCOcDp5CM",
    authDomain: "invoke-invoices.firebaseapp.com",
    projectId: "invoke-invoices",
    storageBucket: "invoke-invoices.appspot.com",
    messagingSenderId: "738500401460",
    appId: "1:738500401460:web:aea42c4f21fda27a2d61",
    measurementId: "G-D68G0QJ1FS"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);