import React, { useState } from 'react';
import api from '../services/api';
import { MessageSquare, Calendar as CalIcon, Clock, Send } from 'lucide-react';

const ChatWidget = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'bot', text: 'Hi! I am PlacementBot. Ask me about cutoffs, dates, or your application status.' }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);

    const sendMessage = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMsg = input.trim();
        setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
        setInput('');
        setLoading(true);

        try {
            const res = await api.post('/ai/chatbot', { message: userMsg });
            setMessages(prev => [...prev, { role: 'bot', text: res.data.reply }]);
        } catch (err) {
            setMessages(prev => [...prev, { role: 'bot', text: 'Sorry, I am offline right now.' }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50">
            {isOpen ? (
                <div className="bg-white dark:bg-dark-card w-80 sm:w-96 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 flex flex-col h-[500px]">
                    <div className="bg-primary-600 text-white p-4 rounded-t-2xl flex justify-between items-center shadow-md">
                        <div className="flex items-center">
                            <MessageSquare size={20} className="mr-2" />
                            <span className="font-bold">PlacementBot AI</span>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="text-white hover:text-gray-200">
                            ✕
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-dark-bg/50">
                        {messages.map((m, i) => (
                            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${m.role === 'user'
                                    ? 'bg-primary-600 text-white shadow-sm'
                                    : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700 shadow-sm'
                                    }`}>
                                    {m.text}
                                </div>
                            </div>
                        ))}
                        {loading && (
                            <div className="flex justify-start">
                                <div className="bg-white dark:bg-gray-800 text-gray-500 text-xs px-4 py-2 rounded-2xl border border-gray-200 dark:border-gray-700">
                                    Thinking...
                                </div>
                            </div>
                        )}
                    </div>

                    <form onSubmit={sendMessage} className="p-3 bg-white dark:bg-dark-card border-t border-gray-200 dark:border-gray-800 rounded-b-2xl flex">
                        <input
                            type="text"
                            className="flex-1 bg-gray-100 dark:bg-gray-900 border-none px-4 py-2 rounded-l-lg focus:ring-0 focus:outline-none dark:text-white"
                            placeholder="Ask me a question..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                        />
                        <button type="submit" disabled={!input.trim()} className="bg-primary-600 disabled:bg-primary-400 text-white px-4 rounded-r-lg hover:bg-primary-700 transition">
                            <Send size={18} />
                        </button>
                    </form>
                </div>
            ) : (
                <button
                    onClick={() => setIsOpen(true)}
                    className="bg-primary-600 text-white p-4 rounded-full shadow-lg hover:bg-primary-700 transition-transform duration-300 hover:scale-105 flex items-center justify-center animate-bounce-slow"
                >
                    <MessageSquare size={26} />
                </button>
            )}
        </div>
    );
};

export default ChatWidget;
