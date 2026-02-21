import React, { useState, useRef, useEffect, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { MessageCircle, X, Send, Bot, User, Minimize2, Maximize2, Trash2 } from 'lucide-react';

// Simple markdown-like renderer for bold **text** and _italic_
const renderMarkdown = (text) => {
    if (!text) return '';
    return text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/_(.*?)_/g, '<em>$1</em>')
        .replace(/`(.*?)`/g, '<code class="px-1 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">$1</code>')
        .replace(/\n/g, '<br/>');
};

const QUICK_ACTIONS = [
    { label: '▶ Start Mock Interview', msg: 'next question' },
    { label: '🧑‍💼 HR Question', msg: 'HR question' },
    { label: '🔧 Technical Question', msg: 'technical question' },
    { label: '📢 Communication Tips', msg: 'communication tips' },
    { label: '📋 My Profile', msg: 'my skills' },
];

const MODES = [
    { value: 'interview', label: '🎯 Interview Prep' },
    { value: 'communication', label: '📢 Communication' },
    { value: 'general', label: '💬 General' },
];

const InterviewChatbot = () => {
    const { user } = useContext(AuthContext);
    const [open, setOpen] = useState(false);
    const [minimized, setMinimized] = useState(false);
    const [mode, setMode] = useState('interview');
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [messages, setMessages] = useState([
        {
            role: 'bot',
            text: `👋 Hi **${user?.name?.split(' ')[0] || 'there'}**! I'm your **Interview Coach** 🎓\n\nI'll ask you interview questions tailored to your skills and applied positions, and help you improve your answers.\n\nType **'help'** to see all commands, or click a quick action below to start!`,
        },
    ]);
    const bottomRef = useRef(null);
    const inputRef = useRef(null);

    useEffect(() => {
        if (open && !minimized) {
            bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
            inputRef.current?.focus();
        }
    }, [messages, open, minimized]);

    const sendMessage = async (msgText) => {
        const text = (msgText || input).trim();
        if (!text) return;

        const userMsg = { role: 'user', text };
        const updatedMessages = [...messages, userMsg];
        setMessages(updatedMessages);
        setInput('');
        setLoading(true);

        try {
            const history = updatedMessages.slice(-10).map(m => ({ role: m.role, text: m.text }));
            const res = await api.post('/ai/chatbot', { message: text, history, mode });
            setMessages(prev => [...prev, { role: 'bot', text: res.data.reply }]);
        } catch (err) {
            setMessages(prev => [...prev, {
                role: 'bot',
                text: '⚠️ Could not connect to the interview coach. Please check your connection and try again.',
            }]);
        } finally {
            setLoading(false);
        }
    };

    const clearChat = () => {
        setMessages([{
            role: 'bot',
            text: "💬 Chat cleared! Type **'next question'** to start fresh.",
        }]);
    };

    return (
        <>
            {/* Floating trigger button */}
            {!open && (
                <button
                    onClick={() => setOpen(true)}
                    className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-gradient-to-br from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 group"
                    title="Interview Coach"
                >
                    <MessageCircle size={24} />
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white animate-pulse"></span>
                    <span className="absolute right-16 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                        Interview Coach
                    </span>
                </button>
            )}

            {/* Chat panel */}
            {open && (
                <div
                    className={`fixed right-6 z-50 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col transition-all duration-300 ${minimized ? 'bottom-6 w-72 h-14' : 'bottom-6 w-96 h-[600px]'}`}
                    style={{ maxHeight: 'calc(100vh - 80px)' }}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-t-2xl text-white flex-shrink-0">
                        <div className="flex items-center">
                            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center mr-2">
                                <Bot size={16} />
                            </div>
                            <div>
                                <p className="font-semibold text-sm">Interview Coach</p>
                                {!minimized && <p className="text-xs text-white/70">PlacementPro AI</p>}
                            </div>
                        </div>
                        <div className="flex items-center gap-1">
                            <button onClick={clearChat} title="Clear chat" className="p-1 hover:bg-white/20 rounded-lg transition">
                                <Trash2 size={14} />
                            </button>
                            <button onClick={() => setMinimized(m => !m)} className="p-1 hover:bg-white/20 rounded-lg transition">
                                {minimized ? <Maximize2 size={14} /> : <Minimize2 size={14} />}
                            </button>
                            <button onClick={() => setOpen(false)} className="p-1 hover:bg-white/20 rounded-lg transition">
                                <X size={14} />
                            </button>
                        </div>
                    </div>

                    {!minimized && (
                        <>
                            {/* Mode selector */}
                            <div className="flex gap-1 px-3 py-2 border-b dark:border-gray-800 flex-shrink-0 bg-gray-50 dark:bg-gray-800/50">
                                {MODES.map(m => (
                                    <button
                                        key={m.value}
                                        onClick={() => setMode(m.value)}
                                        className={`flex-1 text-xs py-1 px-2 rounded-lg font-medium transition ${mode === m.value
                                            ? 'bg-indigo-600 text-white'
                                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
                                    >
                                        {m.label}
                                    </button>
                                ))}
                            </div>

                            {/* Messages */}
                            <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3">
                                {messages.map((msg, i) => (
                                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                        {msg.role === 'bot' && (
                                            <div className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center mr-2 flex-shrink-0 mt-1">
                                                <Bot size={12} className="text-indigo-600 dark:text-indigo-400" />
                                            </div>
                                        )}
                                        <div
                                            className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${msg.role === 'user'
                                                ? 'bg-indigo-600 text-white rounded-tr-sm'
                                                : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-tl-sm'
                                                }`}
                                            dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.text) }}
                                        />
                                        {msg.role === 'user' && (
                                            <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center ml-2 flex-shrink-0 mt-1">
                                                <User size={11} className="text-white" />
                                            </div>
                                        )}
                                    </div>
                                ))}

                                {loading && (
                                    <div className="flex justify-start">
                                        <div className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center mr-2 flex-shrink-0">
                                            <Bot size={12} className="text-indigo-600" />
                                        </div>
                                        <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl rounded-tl-sm px-4 py-3">
                                            <div className="flex space-x-1">
                                                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                <div ref={bottomRef} />
                            </div>

                            {/* Quick actions */}
                            <div className="px-3 py-2 border-t dark:border-gray-800 flex-shrink-0">
                                <div className="flex gap-1 flex-wrap mb-2">
                                    {QUICK_ACTIONS.map(a => (
                                        <button
                                            key={a.msg}
                                            onClick={() => sendMessage(a.msg)}
                                            disabled={loading}
                                            className="text-xs px-2 py-1 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 rounded-full hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition disabled:opacity-50"
                                        >
                                            {a.label}
                                        </button>
                                    ))}
                                </div>

                                {/* Input */}
                                <div className="flex gap-2">
                                    <input
                                        ref={inputRef}
                                        type="text"
                                        value={input}
                                        onChange={e => setInput(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                                        placeholder="Type your answer or a command..."
                                        disabled={loading}
                                        className="flex-1 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm px-3 py-2 text-gray-800 dark:text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-600 disabled:opacity-50"
                                    />
                                    <button
                                        onClick={() => sendMessage()}
                                        disabled={loading || !input.trim()}
                                        className="w-9 h-9 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white rounded-xl flex items-center justify-center transition flex-shrink-0"
                                    >
                                        <Send size={15} />
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            )}
        </>
    );
};

export default InterviewChatbot;
