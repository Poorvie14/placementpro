import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import {
    LayoutDashboard,
    Briefcase,
    Users,
    Calendar,
    BarChart,
    FileText,
    Target,
    MessageSquare
} from 'lucide-react';

const Sidebar = ({ isOpen, toggleSidebar }) => {
    const { user } = useContext(AuthContext);

    const tpoLinks = [
        { name: 'Dashboard', path: '/tpo', icon: <LayoutDashboard size={20} /> },
        { name: 'Drives', path: '/tpo/drives', icon: <Briefcase size={20} /> },
        { name: 'Criteria Engine', path: '/tpo/criteria', icon: <Users size={20} /> },
        { name: 'Scheduler', path: '/tpo/scheduler', icon: <Calendar size={20} /> },
        { name: 'Analytics', path: '/tpo/analytics', icon: <BarChart size={20} /> },
    ];

    const studentLinks = [
        { name: 'Dashboard', path: '/student', icon: <LayoutDashboard size={20} /> },
        { name: 'Drives', path: '/student/drives', icon: <Briefcase size={20} /> },
        { name: 'Applications', path: '/student/applications', icon: <Target size={20} /> },
        { name: 'Resume Wizard', path: '/student/resume', icon: <FileText size={20} /> },
        { name: 'Skill Gap', path: '/student/skills', icon: <BarChart size={20} /> },
    ];

    const alumniLinks = [
        { name: 'Dashboard', path: '/alumni', icon: <LayoutDashboard size={20} /> },
        { name: 'Referrals', path: '/alumni/jobs', icon: <Briefcase size={20} /> },
        { name: 'Mentorship', path: '/alumni/mentorship', icon: <MessageSquare size={20} /> },
    ];

    let links = [];
    if (user?.role === 'TPO') links = tpoLinks;
    else if (user?.role === 'STUDENT') links = studentLinks;
    else if (user?.role === 'ALUMNI') links = alumniLinks;

    const NavItem = ({ item }) => (
        <NavLink
            to={item.path}
            end={item.path === '/tpo' || item.path === '/student' || item.path === '/alumni'}
            onClick={() => {
                if (window.innerWidth < 1024) toggleSidebar();
            }}
            className={({ isActive }) =>
                `flex items-center space-x-3 px-4 py-3 rounded-lg mb-1 transition-colors ${isActive
                    ? 'bg-primary-50 text-primary-600 dark:bg-primary-900/50 dark:text-primary-400 font-medium'
                    : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-dark-card hover:text-gray-900 dark:hover:text-gray-200'
                }`
            }
        >
            {item.icon}
            <span>{item.name}</span>
        </NavLink>
    );

    return (
        <>
            {/* Mobile overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-20 lg:hidden"
                    onClick={toggleSidebar}
                />
            )}

            <aside
                className={`fixed lg:static inset-y-0 left-0 z-30 w-64 bg-white dark:bg-[#0f172a] border-r border-gray-200 dark:border-gray-800 transition-transform duration-300 ease-in-out transform ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
                    } flex flex-col`}
            >
                <div className="h-16 flex items-center px-6 border-b border-gray-200 dark:border-gray-800 lg:hidden">
                    <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-blue-400">
                        PlacementPro
                    </h1>
                </div>

                <div className="flex-1 overflow-y-auto p-4">
                    <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 px-4">
                        {user?.role} Portal
                    </div>
                    <nav>
                        {links.map((link, idx) => <NavItem key={idx} item={link} />)}
                    </nav>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
