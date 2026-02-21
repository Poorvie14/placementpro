import React, { useState, useEffect, useContext } from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { Outlet } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import InterviewChatbot from './InterviewChatbot';

const Layout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [theme, setTheme] = useState('light');
    const { user } = useContext(AuthContext);

    useEffect(() => {
        // Check system preference or local storage
        if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            setTheme('dark');
            document.documentElement.classList.add('dark');
        } else {
            setTheme('light');
            document.documentElement.classList.remove('dark');
        }
    }, []);

    const toggleTheme = () => {
        if (theme === 'light') {
            setTheme('dark');
            localStorage.theme = 'dark';
            document.documentElement.classList.add('dark');
        } else {
            setTheme('light');
            localStorage.theme = 'light';
            document.documentElement.classList.remove('dark');
        }
    };

    return (
        <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-dark-bg transition-colors duration-200">
            <Sidebar isOpen={sidebarOpen} toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

            <div className="flex-1 flex flex-col overflow-hidden relative">
                <Navbar toggleSidebar={() => setSidebarOpen(!sidebarOpen)} toggleTheme={toggleTheme} theme={theme} />

                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 dark:bg-dark-bg p-4 sm:p-6 lg:p-8">
                    <div className="max-w-7xl mx-auto">
                        <Outlet />
                    </div>
                </main>
            </div>
            {user?.role === 'STUDENT' && <InterviewChatbot />}
        </div>
    );
};

export default Layout;
