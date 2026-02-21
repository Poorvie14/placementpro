import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { Users, Briefcase, Calendar as CalendarIcon, Target, TrendingUp, ChevronRight } from 'lucide-react';

const StatCard = ({ icon: Icon, iconBg, iconColor, label, value, subtitle, onClick }) => (
    <div
        onClick={onClick}
        className="card flex items-center p-5 cursor-pointer group hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 border-2 border-transparent hover:border-primary-200 dark:hover:border-primary-800"
    >
        <div className={`p-3 rounded-xl ${iconBg} ${iconColor} mr-4 flex-shrink-0 group-hover:scale-110 transition-transform duration-200`}>
            <Icon size={22} />
        </div>
        <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">{label}</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-0.5">{value ?? '—'}</p>
            {subtitle && <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{subtitle}</p>}
        </div>
        <ChevronRight size={16} className="text-gray-300 dark:text-gray-600 group-hover:text-primary-500 group-hover:translate-x-1 transition-all flex-shrink-0" />
    </div>
);

const Dashboard = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [analyticsRes, drivesRes] = await Promise.all([
                    api.get('/tpo/analytics'),
                    api.get('/drives/')
                ]);
                setStats({
                    total_students: analyticsRes.data.total_students,
                    total_placed: analyticsRes.data.total_placed,
                    upcoming_interviews: analyticsRes.data.upcoming_interviews ?? 0,
                    placement_pct: analyticsRes.data.placement_percentage,
                    drives: drivesRes.data.length,
                });
            } catch (error) {
                console.error('Error fetching admin stats', error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Overview</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Click any card to navigate to its section</p>
                </div>
                <button
                    onClick={() => navigate('/tpo/analytics')}
                    className="btn-primary flex items-center text-sm"
                >
                    <TrendingUp size={16} className="mr-1.5" /> Full Analytics
                </button>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="card p-5 flex items-center gap-4 animate-pulse">
                            <div className="w-12 h-12 rounded-xl bg-gray-200 dark:bg-gray-700" />
                            <div className="flex-1 space-y-2">
                                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
                                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard
                        icon={Users}
                        iconBg="bg-blue-100 dark:bg-blue-900/30"
                        iconColor="text-blue-600 dark:text-blue-400"
                        label="Registered Students"
                        value={stats?.total_students}
                        subtitle="Tap to run Criteria Engine"
                        onClick={() => navigate('/tpo/criteria')}
                    />
                    <StatCard
                        icon={Target}
                        iconBg="bg-green-100 dark:bg-green-900/30"
                        iconColor="text-green-600 dark:text-green-400"
                        label="Students Placed"
                        value={stats?.total_placed}
                        subtitle={stats ? `${stats.placement_pct}% placement rate` : ''}
                        onClick={() => navigate('/tpo/analytics')}
                    />
                    <StatCard
                        icon={Briefcase}
                        iconBg="bg-purple-100 dark:bg-purple-900/30"
                        iconColor="text-purple-600 dark:text-purple-400"
                        label="Active Drives"
                        value={stats?.drives}
                        subtitle="Tap to manage drives"
                        onClick={() => navigate('/tpo/drives')}
                    />
                    <StatCard
                        icon={CalendarIcon}
                        iconBg="bg-orange-100 dark:bg-orange-900/30"
                        iconColor="text-orange-600 dark:text-orange-400"
                        label="Upcoming Interviews"
                        value={stats?.upcoming_interviews}
                        subtitle="Tap to open Scheduler"
                        onClick={() => navigate('/tpo/scheduler')}
                    />
                </div>
            )}

            <div className="card">
                <h2 className="text-lg font-semibold mb-4 dark:text-white">Quick Actions</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    <button
                        onClick={() => navigate('/tpo/drives')}
                        className="btn-secondary h-20 flex flex-col justify-center items-center hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
                    >
                        <Briefcase className="mb-2" size={20} />
                        Create New Drive
                    </button>
                    <button
                        onClick={() => navigate('/tpo/criteria')}
                        className="btn-secondary h-20 flex flex-col justify-center items-center hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
                    >
                        <Users className="mb-2" size={20} />
                        Run Criteria Engine
                    </button>
                    <button
                        onClick={() => navigate('/tpo/scheduler')}
                        className="btn-secondary h-20 flex flex-col justify-center items-center hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
                    >
                        <CalendarIcon className="mb-2" size={20} />
                        Schedule Interviews
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
