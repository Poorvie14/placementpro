import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Menu, LogOut, User as UserIcon, Moon, Sun } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Navbar = ({ toggleSidebar, toggleTheme, theme }) => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <header className="bg-white dark:bg-dark-card border-b border-gray-200 dark:border-gray-800 h-16 flex items-center justify-between px-4 sm:px-6 shadow-sm z-10">
            <div className="flex items-center">
                <button
                    onClick={toggleSidebar}
                    className="p-2 mr-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white rounded-md lg:hidden"
                >
                    <Menu size={20} />
                </button>
                <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-blue-400 hidden sm:block">
                    PlacementPro
                </h1>
            </div>

            <div className="flex items-center space-x-4">
                <button
                    onClick={toggleTheme}
                    className="p-2 text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-yellow-400 transition"
                >
                    {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                </button>

                {user && (
                    <div className="flex items-center space-x-3 border-l border-gray-200 dark:border-gray-700 pl-4">
                        <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-300 flex items-center justify-center font-bold">
                                {user.name.charAt(0)}
                            </div>
                            <span className="text-sm font-medium hidden sm:block dark:text-gray-200">{user.name}</span>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="p-2 text-gray-500 hover:text-red-500 dark:text-gray-400 transition"
                            title="Logout"
                        >
                            <LogOut size={20} />
                        </button>
                    </div>
                )}
            </div>
        </header>
    );
};

export default Navbar;
