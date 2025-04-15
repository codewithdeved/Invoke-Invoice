import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './components/services/AuthProvider';
import Dashboard from './components/dashboard/Dashboard';
import Signup from './components/auth/Signup';
import Signin from './components/auth/Signin';
import './components/styles/main.css';

const App = () => (
    <AuthProvider>
        <Router>
            <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/signin" element={<Signin />} />
            </Routes>
        </Router>
    </AuthProvider>
);

export default App;