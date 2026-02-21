import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Trash2 } from 'lucide-react';

const getDriveStatus = (driveDateStr) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const driveDate = new Date(driveDateStr);
    driveDate.setHours(0, 0, 0, 0);
    const diffDays = Math.ceil((driveDate - today) / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return { label: 'Closed', cls: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' };
    if (diffDays < 7) return { label: 'Closing Soon', cls: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' };
    return { label: 'Open', cls: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' };
};

const DriveManager = () => {
    const [drives, setDrives] = useState([]);
    const [formData, setFormData] = useState({
        company_name: '',
        role: '',
        description: '',
        min_cgpa: '',
        max_backlogs: '',
        eligible_branches: [],
        passing_year: new Date().getFullYear(),
        salary_pkg: '',
        drive_date: ''
    });

    const branches = ["CSE", "ISE", "IT", "ECE", "EEE", "MECH", "CIVIL", "MCA", "BCA", "CHEM", "AERO", "IoT", "Data Science", "AI & ML"];
    const [branchMode, setBranchMode] = useState('all');

    const handleBranchModeChange = (mode) => {
        setBranchMode(mode);
        if (mode === 'all') setFormData(prev => ({ ...prev, eligible_branches: [] }));
    };

    useEffect(() => { fetchDrives(); }, []);

    const fetchDrives = async () => {
        try {
            const res = await api.get('/drives/');
            setDrives(res.data);
        } catch (e) { console.error(e); }
    };

    const handleBranchChange = (e) => {
        const value = e.target.value;
        setFormData(prev => ({
            ...prev,
            eligible_branches: prev.eligible_branches.includes(value)
                ? prev.eligible_branches.filter(b => b !== value)
                : [...prev.eligible_branches, value]
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                ...formData,
                min_cgpa: parseFloat(formData.min_cgpa),
                max_backlogs: parseInt(formData.max_backlogs),
                passing_year: parseInt(formData.passing_year),
                drive_date: new Date(formData.drive_date + 'T00:00:00').toISOString()
            };
            await api.post('/drives/', payload);
            alert('Drive Created Successfully!');
            fetchDrives();
            setFormData({
                company_name: '', role: '', description: '',
                min_cgpa: '', max_backlogs: '', eligible_branches: [],
                passing_year: new Date().getFullYear(), salary_pkg: '', drive_date: ''
            });
            setBranchMode('all');
        } catch (e) {
            alert('Error creating drive');
            console.error(e);
        }
    };

    const isClosed = (drive) => new Date(drive.drive_date) < new Date();

    const deleteDrive = async (driveId) => {
        if (!window.confirm('Delete this closed drive permanently?')) return;
        try {
            await api.delete(`/drives/${driveId}`);
            fetchDrives();
        } catch (e) {
            alert('Failed to delete drive.');
        }
    };

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold dark:text-white">Placement Drive Management</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* ── Create Drive Form ── */}
                <div className="card lg:col-span-1">
                    <h2 className="text-lg font-semibold mb-4 dark:text-white">Create New Drive</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1 dark:text-gray-300">Company Name</label>
                            <input required type="text" className="input-field" value={formData.company_name} onChange={e => setFormData({ ...formData, company_name: e.target.value })} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1 dark:text-gray-300">Job Role</label>
                            <input required type="text" className="input-field" value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1 dark:text-gray-300">Salary Package</label>
                            <input required type="text" placeholder="e.g. 10 LPA" className="input-field" value={formData.salary_pkg} onChange={e => setFormData({ ...formData, salary_pkg: e.target.value })} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1 dark:text-gray-300">Drive Date</label>
                            <input required type="date" className="input-field" value={formData.drive_date} onChange={e => setFormData({ ...formData, drive_date: e.target.value })} />
                        </div>

                        <h3 className="text-sm font-semibold mt-4 pt-2 border-t dark:border-gray-700 dark:text-gray-200">Constraints</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1 dark:text-gray-300">Min CGPA</label>
                                <input required type="number" step="0.1" className="input-field" value={formData.min_cgpa} onChange={e => setFormData({ ...formData, min_cgpa: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1 dark:text-gray-300">Max Backlogs</label>
                                <input required type="number" className="input-field" value={formData.max_backlogs} onChange={e => setFormData({ ...formData, max_backlogs: e.target.value })} />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1 dark:text-gray-300">Passing Year</label>
                            <input required type="number" className="input-field" value={formData.passing_year} onChange={e => setFormData({ ...formData, passing_year: e.target.value })} />
                        </div>

                        {/* Eligible Branches */}
                        <div>
                            <label className="block text-sm font-medium mb-2 dark:text-gray-300">Eligible Branches</label>
                            <div className="flex gap-3 mb-3">
                                <label className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer text-sm font-medium transition ${branchMode === 'all' ? 'bg-green-50 border-green-400 text-green-700 dark:bg-green-900/20 dark:border-green-600 dark:text-green-400' : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400'}`}>
                                    <input type="radio" name="branchMode" value="all" checked={branchMode === 'all'} onChange={() => handleBranchModeChange('all')} />
                                    🌐 All Branches
                                </label>
                                <label className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer text-sm font-medium transition ${branchMode === 'specific' ? 'bg-blue-50 border-blue-400 text-blue-700 dark:bg-blue-900/20 dark:border-blue-600 dark:text-blue-400' : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400'}`}>
                                    <input type="radio" name="branchMode" value="specific" checked={branchMode === 'specific'} onChange={() => handleBranchModeChange('specific')} />
                                    🎯 Specific Branches
                                </label>
                            </div>
                            {branchMode === 'specific' && (
                                <div className="grid grid-cols-3 gap-2 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                                    {branches.map(b => (
                                        <label key={b} className="flex items-center space-x-2 text-sm dark:text-gray-300 cursor-pointer">
                                            <input type="checkbox" value={b} checked={formData.eligible_branches.includes(b)} onChange={handleBranchChange} className="rounded text-primary-600 focus:ring-primary-500" />
                                            <span>{b}</span>
                                        </label>
                                    ))}
                                </div>
                            )}
                            {branchMode === 'all' && (
                                <p className="text-xs text-green-600 dark:text-green-400 mt-1">✅ Students from all branches can apply to this drive.</p>
                            )}
                        </div>

                        <button type="submit" className="w-full btn-primary mt-4">Save Drive</button>
                    </form>
                </div>

                {/* ── Active Drives Table ── */}
                <div className="card lg:col-span-2">
                    <h2 className="text-lg font-semibold mb-4 dark:text-white">Active Drives</h2>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-800">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Company</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Role</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Criteria</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Package</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                                    <th className="px-3 py-3"></th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-dark-card divide-y divide-gray-200 dark:divide-gray-700">
                                {drives.map(drive => (
                                    <tr key={drive.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition">
                                        <td className="px-4 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 dark:text-white">{drive.company_name}</td>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">{drive.role}</td>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">&gt; {drive.min_cgpa} CGPA | &lt; {drive.max_backlogs} BL</td>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{drive.salary_pkg}</td>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{new Date(drive.drive_date).toLocaleDateString()}</td>
                                        <td className="px-4 py-4 whitespace-nowrap">
                                            {(() => {
                                                const s = getDriveStatus(drive.drive_date); return (
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${s.cls}`}>
                                                        {s.label === 'Open' ? '🟢' : s.label === 'Closing Soon' ? '🟡' : '🔴'} {s.label}
                                                    </span>
                                                );
                                            })()}
                                        </td>
                                        <td className="px-3 py-4 text-right">
                                            {isClosed(drive) && (
                                                <button
                                                    onClick={() => deleteDrive(drive.id)}
                                                    className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
                                                    title="Delete this closed drive"
                                                >
                                                    <Trash2 size={15} />
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                {drives.length === 0 && (
                                    <tr>
                                        <td colSpan="7" className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">No active drives found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DriveManager;
