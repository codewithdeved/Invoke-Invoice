import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../services/AuthProvider';
import { getUserInvoices } from '../services/auth';
import Navbar from '../navbar/Navbar';

import '../styles/main.css';

const Dashboard = () => {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const [invoices, setInvoices] = useState([]);
    const [isDragging, setIsDragging] = useState(false);
    const invoiceCardRef = useRef(null);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

    useEffect(() => {
        if (!currentUser) {
            navigate('/signin');
            return;
        }

        if (!currentUser.emailVerified) {
            navigate('/signin');
            return;
        }

        const fetchInvoices = async () => {
            try {
                const userInvoices = await getUserInvoices(currentUser.uid);
                setInvoices(userInvoices);
            } catch (error) {
                console.error("Error fetching invoices:", error);
            }
        };
        
        fetchInvoices();
    }, [currentUser, navigate]);

    // Custom draggable implementation to replace react-draggable
    const handleMouseDown = (e) => {
        setIsDragging(true);
        setDragStart({
            x: e.clientX - position.x,
            y: e.clientY - position.y
        });
    };

    const handleMouseMove = (e) => {
        if (!isDragging) return;
        
        setPosition({
            x: e.clientX - dragStart.x,
            y: e.clientY - dragStart.y
        });
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    useEffect(() => {
        if (isDragging) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
        } else {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        }

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, dragStart]);

    return (
        <div className="page">
            <Navbar />
            <div className="dashboard">
                <h2>Welcome to Your Dashboard</h2>
            </div>
        </div>
    );
};

export default Dashboard;