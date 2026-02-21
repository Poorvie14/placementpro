import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell
} from 'recharts';

const Analytics = () => {
    const [data, setData] = useState(null);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const res = await api.get('/tpo/analytics');
                setData(res.data);
            } catch (e) {
                console.error(e);
            }
        };
        fetchAnalytics();
    }, []);

    if (!data) return <div className="p-8 text-center dark:text-gray-300">Loading analytics...</div>;

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold dark:text-white">Placement Analytics</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="card text-center bg-gradient-to-br from-blue-500 to-blue-600 text-white border-none">
                    <h3 className="text-xl font-medium opacity-90 mb-2">Placement Rate</h3>
                    <p className="text-5xl font-bold">{data.placement_percentage}%</p>
                </div>
                <div className="card text-center bg-gradient-to-br from-indigo-500 to-purple-600 text-white border-none">
                    <h3 className="text-xl font-medium opacity-90 mb-2">Total Students</h3>
                    <p className="text-5xl font-bold">{data.total_students}</p>
                </div>
                <div className="card text-center bg-gradient-to-br from-green-500 to-emerald-600 text-white border-none">
                    <h3 className="text-xl font-medium opacity-90 mb-2">Total Placed</h3>
                    <p className="text-5xl font-bold">{data.total_placed}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="card">
                    <h2 className="text-lg font-semibold mb-6 dark:text-white">Branch-wise Placements</h2>
                    <div className="h-80 w-full min-w-0 min-h-0">
                        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                            <BarChart
                                data={data.branch_analytics}
                                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
                                <XAxis dataKey="name" stroke="#6b7280" />
                                <YAxis stroke="#6b7280" />
                                <RechartsTooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff' }} />
                                <Legend />
                                <Bar dataKey="placed" fill="#3b82f6" name="Students Placed" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="card">
                    <h2 className="text-lg font-semibold mb-6 dark:text-white">Company-wise Offers</h2>
                    <div className="h-80 w-full min-w-0 min-h-0">
                        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                            <PieChart>
                                <Pie
                                    data={data.company_analytics}
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={100}
                                    fill="#8884d8"
                                    dataKey="hires"
                                    nameKey="name"
                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                >
                                    {data.company_analytics.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <RechartsTooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff' }} />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Analytics;
