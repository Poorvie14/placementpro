import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Calendar as CalIcon, Settings, Target } from 'lucide-react';
import { Link } from 'react-router-dom';

const AlumniDashboard = () => {
    const [stats, setStats] = useState({ jobs: 0, slots: 0 });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [jobsRes, slotsRes] = await Promise.all([
                    api.get('/jobs/'),
                    api.get('/mentorship/')
                ]);
                setStats({
                    jobs: jobsRes.data.length,
                    slots: slotsRes.data.length
                });
            } catch (e) {
                console.error(e);
            }
        };
        fetchData();
    }, []);

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold dark:text-white">Alumni Connect Dashboard</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="card text-center relative overflow-hidden group">
                    <div className="absolute inset-0 bg-primary-50 dark:bg-primary-900/10 transform scale-0 group-hover:scale-100 transition-transform duration-500 rounded-xl"></div>
                    <Target size={40} className="mx-auto mb-4 text-primary-500" />
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1 z-10 relative">Job Referrals Posted</h3>
                    <p className="text-4xl font-extrabold text-gray-900 dark:text-white z-10 relative">{stats.jobs}</p>
                    <div className="mt-4 z-10 relative">
                        <Link to="/alumni/jobs" className="text-primary-600 hover:text-primary-700 font-medium text-sm">Post another referral &rarr;</Link>
                    </div>
                </div>

                <div className="card text-center relative overflow-hidden group">
                    <div className="absolute inset-0 bg-green-50 dark:bg-green-900/10 transform scale-0 group-hover:scale-100 transition-transform duration-500 rounded-xl"></div>
                    <CalIcon size={40} className="mx-auto mb-4 text-green-500" />
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1 z-10 relative">Mentorship Slots Created</h3>
                    <p className="text-4xl font-extrabold text-gray-900 dark:text-white z-10 relative">{stats.slots}</p>
                    <div className="mt-4 z-10 relative">
                        <Link to="/alumni/mentorship" className="text-green-600 hover:text-green-700 font-medium text-sm">Manage slots &rarr;</Link>
                    </div>
                </div>
            </div>

            <div className="card mt-8 p-8 text-center bg-gradient-to-r from-blue-700 to-indigo-800 text-white rounded-xl shadow-lg border-none">
                <h2 className="text-2xl font-bold mb-2">Help the Next Generation</h2>
                <p className="opacity-90 max-w-2xl mx-auto mb-6">Your guidance and referrals are vital to the success of current students. Post internships, refer for full-time roles, or set aside 30 minutes a week to mentor someone.</p>
                <div className="flex justify-center space-x-4">
                    <Link to="/alumni/mentorship" className="btn-primary bg-white text-indigo-700 hover:bg-gray-100">Open Mentorship Slots</Link>
                    <Link to="/alumni/jobs" className="btn-secondary border-none bg-indigo-600 text-white hover:bg-indigo-500">Post Job Referral</Link>
                </div>
            </div>
        </div>
    );
};

export default AlumniDashboard;
