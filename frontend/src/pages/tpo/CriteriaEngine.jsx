import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Search, Send, Users } from 'lucide-react';

const CriteriaEngine = () => {
    const [drives, setDrives] = useState([]);
    const [selectedDrive, setSelectedDrive] = useState(null);
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(false);
    const [notifying, setNotifying] = useState(false);

    useEffect(() => {
        fetchDrives();
    }, []);

    const fetchDrives = async () => {
        try {
            const res = await api.get('/drives/');
            // Normalize: ensure each drive has a string `id` field
            const normalized = res.data.map(d => ({ ...d, id: d.id || String(d._id) }));
            setDrives(normalized);
        } catch (e) {
            console.error(e);
        }
    };

    const handleRunCriteria = async (e) => {
        e.preventDefault();
        if (!selectedDrive) return alert("Select a drive first");

        const drive = drives.find(d => String(d.id || d._id) === selectedDrive);
        if (!drive) return;

        setLoading(true);
        try {
            const payload = {
                min_cgpa: drive.min_cgpa,
                max_backlogs: drive.max_backlogs,
                eligible_branches: drive.eligible_branches,
                passing_year: drive.passing_year
            };

            const res = await api.post('/tpo/criteria-engine', payload);
            setResults(res.data);
        } catch (e) {
            console.error(e);
            alert("Failed to run criteria engine");
        } finally {
            setLoading(false);
        }
    };

    const handleNotify = async () => {
        if (!results || results.count === 0) return;
        setNotifying(true);
        try {
            const drive = drives.find(d => String(d.id || d._id) === selectedDrive);
            await api.post('/tpo/notify', {
                subject: `New Placement Drive: ${drive.company_name}`,
                message: `You are eligible for the ${drive.company_name} drive. Please apply in your student portal.`,
                drive_id: String(drive.id || drive._id)
            });
            alert(`Successfully notified ${results.count} eligible students!`);
        } catch (e) {
            console.error(e);
            alert("Failed to send notifications");
        } finally {
            setNotifying(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-6 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl text-white shadow-md">
                <div>
                    <h1 className="text-2xl font-bold flex items-center">
                        <Search className="mr-2" /> Criteria Engine
                    </h1>
                    <p className="opacity-90 mt-1">Dynamically query the student database based on drive constraints.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="card lg:col-span-1">
                    <h2 className="text-lg font-semibold mb-4 dark:text-white">Run Query</h2>
                    <form onSubmit={handleRunCriteria} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1 dark:text-gray-300">Select Placement Drive</label>
                            <select
                                className="input-field"
                                value={selectedDrive || ''}
                                onChange={e => setSelectedDrive(e.target.value)}
                                required
                            >
                                <option value="" disabled>-- Select Drive --</option>
                                {drives.map(d => (
                                    <option key={String(d.id || d._id)} value={String(d.id || d._id)}>
                                        {d.company_name} - {d.role}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {selectedDrive && (
                            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 text-sm dark:text-gray-300 space-y-2">
                                <p><strong>Min CGPA:</strong> {drives.find(d => d.id === selectedDrive)?.min_cgpa}</p>
                                <p><strong>Max Backlogs:</strong> {drives.find(d => d.id === selectedDrive)?.max_backlogs}</p>
                                <p><strong>Branches:</strong> {drives.find(d => d.id === selectedDrive)?.eligible_branches.join(", ")}</p>
                                <p><strong>Batch:</strong> {drives.find(d => d.id === selectedDrive)?.passing_year}</p>
                            </div>
                        )}

                        <button type="submit" className="w-full btn-primary flex justify-center items-center" disabled={loading}>
                            {loading ? "querying..." : "Execute Query"}
                        </button>
                    </form>
                </div>

                <div className="card lg:col-span-2">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-semibold dark:text-white flex items-center">
                            <Users className="mr-2" size={20} /> Query Results
                        </h2>
                        {results && results.count > 0 && (
                            <button
                                onClick={handleNotify}
                                disabled={notifying}
                                className="btn-primary bg-green-600 hover:bg-green-700 flex items-center text-sm py-1.5"
                            >
                                <Send size={16} className="mr-2" />
                                {notifying ? "Sending..." : "Notify All"}
                            </button>
                        )}
                    </div>

                    {!results && !loading && (
                        <div className="text-center py-12 text-gray-500 dark:text-gray-400 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg">
                            Select a drive and execute the query to see eligible students.
                        </div>
                    )}

                    {loading && (
                        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
                            Processing Database...
                        </div>
                    )}

                    {results && !loading && (
                        <div>
                            <div className="mb-4 inline-block px-3 py-1 bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300 rounded-full font-medium text-sm">
                                Found {results.count} Eligible Students
                            </div>

                            <div className="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-lg">
                                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                    <thead className="bg-gray-50 dark:bg-gray-800">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Name</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Branch</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">CGPA</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white dark:bg-dark-card divide-y divide-gray-200 dark:divide-gray-700">
                                        {results.students.map((student, idx) => (
                                            <tr key={idx}>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                                    <div>{student.name}</div>
                                                    <div className="text-xs text-gray-500">{student.email}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{student.branch}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{student.cgpa}</td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                                                        Eligible
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                        {results.count === 0 && (
                                            <tr>
                                                <td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-500">No students meet these criteria.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CriteriaEngine;
