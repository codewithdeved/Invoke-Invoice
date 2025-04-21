import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../services/AuthProvider';
import {
    getUserInvoices,
    processInvoiceFile,
    saveMessage,
    getUserChatHistory,
    saveChatSession,
    addMessageToSession,
    getSessionMessages,
    getUserChatSessions,
} from '../services/auth';
import { Camera, Upload, HelpCircle, FileText, BarChart2, Copy, X, Maximize2, Minimize2, History } from 'lucide-react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './styles.css';

const Chatbot = () => {
    const [isOpen, setIsOpen] = useState(true);
    const [isExpanded, setIsExpanded] = useState(false);
    const [messages, setMessages] = useState([
        {
            id: 'initial-msg',
            type: 'bot',
            content: "👋 Hello! I'm your Invoice Assistant. Upload your invoice to get started and save more today!",
            timestamp: new Date(),
        },
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [uploadStatus, setUploadStatus] = useState(null);
    const [recentInvoices, setRecentInvoices] = useState([]);
    const [welcomeMessageSent, setWelcomeMessageSent] = useState(false);
    const [currentSessionId, setCurrentSessionId] = useState(null);
    const [sessions, setSessions] = useState([]);
    const [showSessionsPanel, setShowSessionsPanel] = useState(false);
    const [sessionTitle, setSessionTitle] = useState('');
    const [showTitleInput, setShowTitleInput] = useState(false);
    const [lastMessageId, setLastMessageId] = useState(1);
    const [lastChatDoc, setLastChatDoc] = useState(null);
    const [hasMoreMessages, setHasMoreMessages] = useState(true);

    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);
    const chatContainerRef = useRef(null);
    const titleInputRef = useRef(null);
    const navigate = useNavigate();
    const { currentUser, userProfile } = useAuth() || {};

    // Scroll to bottom of messages
    const scrollToBottom = useCallback(() => {
        requestAnimationFrame(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        });
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages, scrollToBottom]);

    // Handle user authentication state changes
    useEffect(() => {
        if (currentUser?.uid && !welcomeMessageSent) {
            const displayName = userProfile?.displayName || currentUser.email.split('@')[0];
            setIsLoading(true);
            setTimeout(() => {
                setMessages(prev => [...prev, {
                    id: `msg-${lastMessageId + 1}`,
                    type: 'bot',
                    content: `Welcome, ${displayName}! You're now signed in. You can upload your invoice or ask me about your previous invoices.`,
                    timestamp: new Date(),
                }]);
                setLastMessageId(prev => prev + 1);
                setWelcomeMessageSent(true);
                setIsLoading(false);
                fetchUserInvoices();
                fetchChatSessions();
            }, 800);
        } else if (!currentUser) {
            setWelcomeMessageSent(false);
            setCurrentSessionId(null);
            setSessions([]);
        }
    }, [currentUser, userProfile?.displayName]);

    // Load messages if a session is selected
    useEffect(() => {
        if (currentSessionId && currentUser?.uid) {
            loadSessionMessages(currentSessionId);
        }
    }, [currentSessionId]);

    // Focus the title input when showing
    useEffect(() => {
        if (showTitleInput && titleInputRef.current) {
            titleInputRef.current.focus();
        }
    }, [showTitleInput]);

    const fetchUserInvoices = async () => {
        if (!currentUser?.uid) return;

        try {
            setIsLoading(true);
            const invoices = await getUserInvoices(currentUser.uid);
            setRecentInvoices(invoices);

            if (invoices.length > 0) {
                setTimeout(() => {
                    setMessages(prev => [...prev, {
                        id: `msg-${lastMessageId + 1}`,
                        type: 'bot',
                        content: `I found ${invoices.length} invoice${invoices.length === 1 ? '' : 's'} in your account. Ask me anything about them or upload a new one!`,
                        timestamp: new Date(),
                    }]);
                    setLastMessageId(prev => prev + 1);
                }, 500);
            }
        } catch (error) {
            toast.error(error.message);
            setMessages(prev => [...prev, {
                id: `msg-${lastMessageId + 1}`,
                type: 'bot',
                content: 'I couldn’t retrieve your invoices. Please try again later.',
                timestamp: new Date(),
            }]);
            setLastMessageId(prev => prev + 1);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchChatSessions = async () => {
        if (!currentUser?.uid) return;

        try {
            const userSessions = await getUserChatSessions(currentUser.uid);
            setSessions(userSessions);
        } catch (error) {
            toast.error(error.message);
        }
    };

    const createNewSession = async () => {
        if (!currentUser?.uid) {
            showSignInPrompt();
            return;
        }

        try {
            const title = sessionTitle || `Chat session - ${new Date().toLocaleDateString()}`;
            const newSessionId = await saveChatSession(currentUser.uid, title);

            setMessages([{
                id: 'initial-msg',
                type: 'bot',
                content: "👋 Starting a new conversation! I'm your Invoice Assistant. How can I help you today?",
                timestamp: new Date(),
            }]);
            setCurrentSessionId(newSessionId);
            setShowTitleInput(false);
            setSessionTitle('');
            fetchChatSessions();
            toast.success('New chat session created!');
        } catch (error) {
            toast.error(error.message);
        }
    };

    const loadSessionMessages = async (sessionId) => {
        if (!currentUser?.uid) return;

        try {
            setIsLoading(true);
            const { messages: sessionMessages } = await getSessionMessages(sessionId, currentUser.uid);

            if (sessionMessages.length > 0) {
                const formattedMessages = sessionMessages.map((msg, index) => ({
                    id: `loaded-${index}`,
                    type: msg.type,
                    content: msg.content,
                    timestamp: msg.timestamp,
                    invoice: msg.metadata?.invoiceId ? { id: msg.metadata.invoiceId } : undefined,
                }));
                setMessages(formattedMessages);

                const session = sessions.find(s => s.id === sessionId);
                if (session) {
                    toast.info(`Loaded conversation: ${session.title}`);
                }
            } else {
                setMessages([{
                    id: 'initial-msg',
                    type: 'bot',
                    content: "👋 This is the start of a new conversation! I'm your Invoice Assistant. How can I help you today?",
                    timestamp: new Date(),
                }]);
            }
        } catch (error) {
            toast.error(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const showSignInPrompt = () => {
        setMessages(prev => [...prev, {
            id: `msg-${lastMessageId + 1}`,
            type: 'bot',
            content: 'You need to sign in to save conversations. Would you like to sign in now?',
            timestamp: new Date(),
        }]);
        setLastMessageId(prev => prev + 1);
    };

    const toggleChatbot = () => {
        setIsOpen(!isOpen);
    };

    const toggleExpand = () => {
        setIsExpanded(!isExpanded);
    };

    const toggleSessionsPanel = () => {
        if (!currentUser?.uid) {
            showSignInPrompt();
            return;
        }
        setShowSessionsPanel(!showSessionsPanel);
        if (!showSessionsPanel) {
            fetchChatSessions();
        }
    };

    const handleTitleInputChange = (e) => {
        setSessionTitle(e.target.value);
    };

    const handleTitleKeyPress = (e) => {
        if (e.key === 'Enter' && sessionTitle.trim()) {
            e.preventDefault();
            createNewSession();
        }
    };

    const handleInputChange = (e) => {
        setInputValue(e.target.value);
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && inputValue.trim()) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const saveUserAndBotMessage = async (userContent, botContent) => {
        if (!currentUser?.uid) return;

        try {
            let sessionId = currentSessionId;
            if (!sessionId) {
                sessionId = await saveChatSession(currentUser.uid);
                setCurrentSessionId(sessionId);
                fetchChatSessions();
            }

            await Promise.all([
                addMessageToSession(sessionId, {
                    content: userContent,
                    type: 'user',
                    temporary: false,
                }, currentUser.uid),
                addMessageToSession(sessionId, {
                    content: botContent,
                    type: 'bot',
                    temporary: false,
                }, currentUser.uid),
            ]);
        } catch (error) {
            toast.error(error.message);
        }
    };

    const analyzeInvoice = async (fileData) => {
        try {
            setUploadStatus('Processing your invoice...');
            const result = await processInvoiceFile(fileData, currentUser?.uid);
            return result;
        } catch (error) {
            throw new Error(error.message);
        } finally {
            setUploadStatus(null);
        }
    };

    const processInvoiceResponse = (analysis) => {
        if (!analysis) return "I couldn't analyze this invoice properly. Please try uploading again.";

        const totalSavings = analysis.savings?.total?.toFixed(2) || 0;
        const savingsPercent = analysis.savings?.percentage || 0;

        let response = `I've analyzed your invoice from ${analysis.store} ($${analysis.total}).\n\n`;
        response += `Key insights:\n`;

        if (analysis.savings && analysis.savings.total > 0) {
            response += `• You could save $${totalSavings} (${savingsPercent}%) by shopping at alternative stores\n`;
            analysis.savings.details.forEach(detail => {
                response += `• ${detail.item} is $${detail.save.toFixed(2)} cheaper at ${detail.store}\n`;
            });
        } else {
            response += "• Great job! You've already found great prices on these items.\n";
        }

        response += `\nAsk me for more specific insights or recommendations!`;
        return response;
    };

    const handleIntelligentResponse = (userMessage) => {
        const message = userMessage.toLowerCase();
        let response = '';

        if (!currentUser && !message.includes('login') && !message.includes('sign in')) {
            response = 'You’ll need to sign in to use all features. Would you like to go to the login page?';
        } else if (message.includes('login') || message.includes('sign in')) {
            response = 'I’ll take you to the login page. One moment please...';
            setTimeout(() => navigate('/signin'), 1000);
        } else if (message.includes('save') && (message.includes('chat') || message.includes('conversation'))) {
            if (!currentUser) {
                response = 'Please sign in to save conversations.';
            } else if (!currentSessionId) {
                response = 'I’ll create a new chat session for you. What would you like to name it?';
                setShowTitleInput(true);
            } else {
                response = 'This conversation is already being saved automatically!';
            }
        } else if ((message.includes('load') || message.includes('view') || message.includes('show')) &&
            (message.includes('chat') || message.includes('conversation') || message.includes('history'))) {
            if (!currentUser) {
                response = 'Please sign in to view saved conversations.';
            } else {
                response = 'Opening your saved conversations panel. You can select one to continue.';
                setShowSessionsPanel(true);
            }
        } else if (message.includes('upload') || message.includes('invoice') || message.includes('receipt') || message.includes('scan')) {
            setUploadStatus('Ready to upload...');
            response = 'Ready to analyze your invoice. Please upload it using the button below:';
        } else if (message.includes('cheaper') || message.includes('save') || message.includes('alternative') || message.includes('deal') || message.includes('price')) {
            if (recentInvoices.length === 0) {
                response = currentUser
                    ? 'I need to analyze an invoice first. Please upload one to get started.'
                    : 'Please sign in and upload an invoice first to get personalized savings.';
            } else {
                if (message.includes('milk')) {
                    response = 'I found cheaper options for Organic Milk:\n• Trader Joe\'s: $3.99 (save $1.00)\n• Walmart: $4.49 (save $0.50)';
                } else if (message.includes('bread')) {
                    response = 'Here are better prices for Sourdough Bread:\n• Local Bakery: $4.99 (save $0.50)\n• Kroger: $4.79 (save $0.70)';
                } else {
                    response = 'Based on your latest invoice, you could save $5.70 (12.5%) by shopping for these items at alternative stores.';
                }
            }
        } else if (message.includes('recent') || message.includes('history') || message.includes('previous') || message.includes('past')) {
            if (!currentUser) {
                response = 'Please sign in to view your invoice history.';
            } else if (recentInvoices.length === 0) {
                response = 'You don’t have any invoice history yet. Upload your first invoice to get started!';
            } else {
                response = 'Here are your recent invoices:\n';
                recentInvoices.slice(0, 3).forEach((invoice, index) => {
                    const date = invoice.date.toLocaleDateString();
                    response += `• ${date}: $${invoice.amount.toFixed(2)} - ${invoice.description}\n`;
                });
                response += '\nYou can say "Show me savings for March" or "Compare Target vs Walmart" for more insights.';
            }
        } else if (message.includes('help')) {
            response = 'I can help with:\n• Invoice analysis and savings\n• Finding cheaper alternatives\n• Showing purchase patterns\n• Tracking spending across stores\n• Saving and managing conversations\n\nTry asking "Find cheaper alternatives" or "Save this conversation"';
        } else if (message.includes('about') || message.includes('what') || message.includes('how')) {
            response = 'Invoke is a smart invoice assistant that helps you track expenses, find savings, and compare prices across stores. Upload receipts and I’ll analyze them to help you save money on future purchases!';
        } else {
            response = 'I’m your invoice assistant. I can analyze receipts, find savings, track spending, and save our conversations. Upload an invoice or ask about your purchase history to get started!';
        }

        return response;
    };

    const handleSendMessage = async () => {
        if (!inputValue.trim()) return;

        const userMessage = inputValue;
        const msgId = `msg-${lastMessageId + 1}`;

        setMessages(prev => [...prev, {
            id: msgId,
            type: 'user',
            content: userMessage,
            timestamp: new Date(),
        }]);
        setLastMessageId(prev => prev + 1);
        setInputValue('');
        setIsLoading(true);

        try {
            const response = handleIntelligentResponse(userMessage);
            const responseId = `msg-${lastMessageId + 2}`;

            setMessages(prev => [...prev, {
                id: responseId,
                type: 'bot',
                content: response,
                timestamp: new Date(),
            }]);
            setLastMessageId(prev => prev + 2);

            if (currentUser?.uid && !showTitleInput) {
                await saveUserAndBotMessage(userMessage, response);
            }
        } catch (error) {
            toast.error(error.message);
            setMessages(prev => [...prev, {
                id: `error-${lastMessageId + 2}`,
                type: 'bot',
                content: 'Something went wrong. Please try again.',
                timestamp: new Date(),
            }]);
            setLastMessageId(prev => prev + 2);
        } finally {
            setIsLoading(false);
        }
    };

    const triggerFileUpload = () => {
        fileInputRef.current.click();
    };

    const handleFileUpload = async (e) => {
        if (e.target.files.length === 0) return;

        setIsLoading(true);
        setUploadStatus('Uploading file...');

        const file = e.target.files[0];

        try {
            const uploadMsgId = `msg-${lastMessageId + 1}`;
            setMessages(prev => [...prev, {
                id: uploadMsgId,
                type: 'bot',
                content: `Processing "${file.name}"...`,
                timestamp: new Date(),
            }]);
            setLastMessageId(prev => prev + 1);

            const fileData = new FormData();
            fileData.append('file', file);

            const analysis = await analyzeInvoice(fileData);
            const response = processInvoiceResponse(analysis);

            const analysisMsgId = `msg-${lastMessageId + 1}`;
            const analysisMessage = {
                id: analysisMsgId,
                type: 'bot',
                content: response,
                timestamp: new Date(),
                invoice: analysis,
            };

            setMessages(prev => [...prev, analysisMessage]);
            setLastMessageId(prev => prev + 1);

            if (currentUser?.uid) {
                let sessionId = currentSessionId;
                if (!sessionId) {
                    sessionId = await saveChatSession(currentUser.uid, `Invoice Analysis - ${new Date().toLocaleDateString()}`);
                    setCurrentSessionId(sessionId);
                    fetchChatSessions();
                }

                await Promise.all([
                    addMessageToSession(sessionId, {
                        content: `Processing "${file.name}"...`,
                        type: 'bot',
                        temporary: false,
                    }, currentUser.uid),
                    addMessageToSession(sessionId, {
                        content: response,
                        type: 'bot',
                        metadata: {
                            invoiceId: analysis.id || null,
                            temporary: false,
                        },
                    }, currentUser.uid),
                ]);
            }

            toast.success('Invoice processed successfully!');
        } catch (error) {
            toast.error(error.message);
            setMessages(prev => [...prev, {
                id: `error-${lastMessageId + 1}`,
                type: 'bot',
                content: 'I couldn’t process this invoice. Please try a different file or format (PDF, JPG, PNG supported).',
                timestamp: new Date(),
            }]);
            setLastMessageId(prev => prev + 1);
        } finally {
            setIsLoading(false);
            setUploadStatus(null);
            e.target.value = '';
        }
    };

    const copyMessageToClipboard = (content) => {
        navigator.clipboard.writeText(content)
            .then(() => {
                toast.success('Text copied to clipboard!');
            })
            .catch(() => {
                toast.error('Failed to copy text.');
            });
    };

    return (
        <div className={`chatbot-container ${isExpanded ? 'expanded' : ''}`} ref={chatContainerRef}>
            <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
            <div className={`chatbot ${isOpen ? 'open' : ''} ${isExpanded ? 'expanded' : ''}`}>
                <div className="chatbot-header">
                    <div className="chatbot-title">
                        <span className="chatbot-logo">✨</span>
                        <h3>Invoice Assistant</h3>
                        {currentSessionId && currentUser && (
                            <div className="session-indicator">
                                <span className="save-indicator"></span>
                                {sessions.find(s => s.id === currentSessionId)?.title || 'Saving...'}
                            </div>
                        )}
                    </div>
                    <div className="chatbot-controls">
                        {currentUser && (
                            <button
                                className="control-button history-button"
                                onClick={toggleSessionsPanel}
                                aria-label="Chat History"
                            >
                                <History size={16} />
                            </button>
                        )}
                        <button className="control-button" onClick={toggleExpand} aria-label={isExpanded ? "Minimize" : "Maximize"}>
                            {isExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                        </button>
                        <button className="toggle-button" onClick={toggleChatbot} aria-label={isOpen ? "Close" : "Open"}>
                            {isOpen ? <X size={16} /> : '+'}
                        </button>
                    </div>
                </div>

                {isOpen && (
                    <>
                        <div className="messages-container">
                            {showSessionsPanel && (
                                <div className="sessions-panel">
                                    <div className="sessions-header">
                                        <h4>Saved Conversations</h4>
                                        <button
                                            className="close-sessions"
                                            onClick={() => setShowSessionsPanel(false)}
                                            aria-label="Close Sessions Panel"
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                    <div className="sessions-list">
                                        <button
                                            className="new-session-btn"
                                            onClick={() => {
                                                setShowTitleInput(true);
                                                setShowSessionsPanel(false);
                                            }}
                                        >
                                            + New Conversation
                                        </button>
                                        {sessions.length === 0 ? (
                                            <div className="no-sessions">
                                                No saved conversations yet
                                            </div>
                                        ) : (
                                            sessions.map(session => (
                                                <div
                                                    key={session.id}
                                                    className={`session-item ${currentSessionId === session.id ? 'active' : ''}`}
                                                    onClick={() => {
                                                        setCurrentSessionId(session.id);
                                                        setShowSessionsPanel(false);
                                                    }}
                                                >
                                                    <div className="session-title">{session.title}</div>
                                                    <div className="session-date">
                                                        {session.lastMessageAt.toLocaleDateString()}
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}

                            {messages.map((message) => (
                                <div key={message.id} className={`message ${message.type}`}>
                                    {message.type === 'bot' && <div className="bot-avatar"></div>}
                                    <div className="message-content">
                                        {message.content}
                                        {message.type === 'bot' && (
                                            <button
                                                className="copy-button"
                                                onClick={() => copyMessageToClipboard(message.content)}
                                                aria-label="Copy message"
                                            >
                                                <Copy size={14} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}

                            {isLoading && (
                                <div className="message bot">
                                    <div className="bot-avatar"></div>
                                    <div className="message-content">
                                        <div className="typing-indicator">
                                            <span></span>
                                            <span></span>
                                            <span></span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {uploadStatus && (
                                <div className="upload-status-container">
                                    <div className="upload-status-dot"></div>
                                    <span>{uploadStatus}</span>
                                </div>
                            )}

                            {showTitleInput && (
                                <div className="title-input-container message bot">
                                    <div className="bot-avatar"></div>
                                    <div className="title-input-content">
                                        <input
                                            type="text"
                                            placeholder="Enter conversation title..."
                                            value={sessionTitle}
                                            onChange={handleTitleInputChange}
                                            onKeyPress={handleTitleKeyPress}
                                            ref={titleInputRef}
                                            className="session-title-input"
                                        />
                                        <div className="title-input-buttons">
                                            <button
                                                onClick={createNewSession}
                                                disabled={!sessionTitle.trim()}
                                                className="title-save-btn"
                                            >
                                                Save
                                            </button>
                                            <button
                                                onClick={() => setShowTitleInput(false)}
                                                className="title-cancel-btn"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div ref={messagesEndRef} />
                        </div>

                        <div className="quick-actions">
                            <button
                                onClick={() => {
                                    setUploadStatus('Ready to upload...');
                                    const botMsgId = `msg-${lastMessageId + 1}`;
                                    const uploadMessage = "Ready to analyze your invoice. Please upload it using the button below:";

                                    setMessages(prev => [...prev, {
                                        id: botMsgId,
                                        type: 'bot',
                                        content: uploadMessage,
                                        timestamp: new Date(),
                                    }]);
                                    setLastMessageId(prev => prev + 1);
                                    triggerFileUpload();
                                }}
                                aria-label="Upload Invoice"
                            >
                                <FileText size={16} />
                                Upload Invoice
                            </button>

                            <button
                                onClick={async () => {
                                    const userMsgId = `msg-${lastMessageId + 1}`;
                                    const botResponseId = `msg-${lastMessageId + 2}`;
                                    const userMessage = "Show me recent invoices";

                                    setMessages(prev => [
                                        ...prev,
                                        {
                                            id: userMsgId,
                                            type: 'user',
                                            content: userMessage,
                                            timestamp: new Date(),
                                        },
                                    ]);
                                    setLastMessageId(prev => prev + 1);
                                    setIsLoading(true);

                                    try {
                                        const response = handleIntelligentResponse(userMessage);
                                        setMessages(prev => [
                                            ...prev,
                                            {
                                                id: botResponseId,
                                                type: 'bot',
                                                content: response,
                                                timestamp: new Date(),
                                            },
                                        ]);
                                        setLastMessageId(prev => prev + 1);

                                        if (currentUser?.uid && !showTitleInput) {
                                            await saveUserAndBotMessage(userMessage, response);
                                        }
                                    } catch (error) {
                                        toast.error(error.message);
                                    } finally {
                                        setIsLoading(false);
                                    }
                                }}
                                aria-label="View History"
                            >
                                <BarChart2 size={16} />
                                View History
                            </button>

                            <button
                                onClick={async () => {
                                    const userMsgId = `msg-${lastMessageId + 1}`;
                                    const botResponseId = `msg-${lastMessageId + 2}`;
                                    const userMessage = "Help";

                                    setMessages(prev => [
                                        ...prev,
                                        {
                                            id: userMsgId,
                                            type: 'user',
                                            content: userMessage,
                                            timestamp: new Date(),
                                        },
                                    ]);
                                    setLastMessageId(prev => prev + 1);
                                    setIsLoading(true);

                                    try {
                                        const helpResponse = handleIntelligentResponse(userMessage);
                                        setMessages(prev => [
                                            ...prev,
                                            {
                                                id: botResponseId,
                                                type: 'bot',
                                                content: helpResponse,
                                                timestamp: new Date(),
                                            },
                                        ]);
                                        setLastMessageId(prev => prev + 1);

                                        if (currentUser?.uid && !showTitleInput) {
                                            await saveUserAndBotMessage(userMessage, helpResponse);
                                        }
                                    } catch (error) {
                                        toast.error(error.message);
                                    } finally {
                                        setIsLoading(false);
                                    }
                                }}
                                aria-label="Help"
                            >
                                <HelpCircle size={16} />
                                Help
                            </button>
                        </div>

                        <div className="chatbot-input">
                            <input
                                type="text"
                                placeholder="Ask about invoices, savings, or more..."
                                value={inputValue}
                                onChange={handleInputChange}
                                onKeyPress={handleKeyPress}
                                disabled={isLoading}
                                aria-label="Message input"
                            />
                            <button
                                onClick={handleSendMessage}
                                disabled={!inputValue.trim() || isLoading}
                                aria-label="Send message"
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M22 2L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </button>
                        </div>

                        <div className="user-status">
                            {currentUser ? (
                                <div className="user-info">
                                    <div className="user-indicator">
                                        <div className="user-avatar"></div>
                                        <span>{userProfile?.displayName || currentUser.email.split('@')[0]}</span>
                                    </div>
                                </div>
                            ) : (
                                <button className="sign-in-button" onClick={() => navigate('/signin')}>
                                    Sign in for personalized insights
                                </button>
                            )}
                        </div>

                        <input
                            type="file"
                            ref={fileInputRef}
                            style={{ display: 'none' }}
                            onChange={handleFileUpload}
                            accept=".pdf,.jpg,.jpeg,.png"
                        />
                    </>
                )}
            </div>
        </div>
    );
};

export default Chatbot;