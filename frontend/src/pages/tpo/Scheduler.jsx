import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Calendar, Clock, User, Briefcase, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

const STATUS_COLORS = {
    'Applied': 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
    'Interview Scheduled': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300',
    'Aptitude': 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300',
    'Aptitude Passed': 'bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-300',
    'Aptitude Failed': 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300',
    'Cleared': 'bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-300',
    'Selected': 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
    'Rejected': 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
};

const ALL_STATUSES = ['Applied', 'Aptitude', 'Aptitude Passed', 'Aptitude Failed', 'Interview Scheduled', 'Cleared', 'Selected', 'Rejected'];

const Scheduler = () => {
    const [drives, setDrives] = useState([]);
    const [applications, setApplications] = useState([]);
    const [selectedDrive, setSelectedDrive] = useState('all');
    const [loading, setLoading] = useState(true);
    const [scheduleModal, setScheduleModal] = useState(null);
    const [aptitudeModal, setAptitudeModal] = useState(null); // {appId, studentName, company}
    const [aptitudeScore, setAptitudeScore] = useState('');
    const [aptitudeCutoff, setAptitudeCutoff] = useState('60');
    const [interviewTime, setInterviewTime] = useState('');
    const [savingId, setSavingId] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [drivesRes, appsRes] = await Promise.all([
                api.get('/drives/'),
                api.get('/drives/applications')
            ]);
            const normalizedDrives = drivesRes.data.map(d => ({ ...d, id: d.id || String(d._id) }));
            setDrives(normalizedDrives);
            setApplications(appsRes.data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (appId, newStatus) => {
        setSavingId(appId);
        try {
            await api.put(`/drives/applications/${appId}/status?status=${encodeURIComponent(newStatus)}`);
            setApplications(prev => prev.map(a => a.id === appId ? { ...a, status: newStatus } : a));
        } catch (e) {
            alert('Failed to update status');
        } finally {
            setSavingId(null);
        }
    };

    const handleScheduleInterview = async () => {
        if (!interviewTime) return alert('Please select a date and time');
        setSavingId(scheduleModal.appId);
        try {
            await api.put(`/drives/applications/${scheduleModal.appId}/schedule?interview_time=${encodeURIComponent(interviewTime + ':00')}&status=Interview%20Scheduled`);
            setApplications(prev => prev.map(a =>
                a.id === scheduleModal.appId ? { ...a, interview_time: interviewTime, status: 'Interview Scheduled' } : a
            ));
            setScheduleModal(null);
            setInterviewTime('');
        } catch (e) {
            alert('Failed to schedule interview');
        } finally {
            setSavingId(null);
        }
    };

    const handleAptitudeSubmit = async () => {
        if (!aptitudeScore) return alert('Enter a score');
        setSavingId(aptitudeModal.appId);
        try {
            await api.put(
                `/drives/applications/${aptitudeModal.appId}/aptitude?score=${aptitudeScore}&cutoff=${aptitudeCutoff}`
            );
            const newStatus = parseFloat(aptitudeScore) >= parseFloat(aptitudeCutoff) ? 'Aptitude Passed' : 'Aptitude Failed';
            setApplications(prev => prev.map(a =>
                a.id === aptitudeModal.appId ? { ...a, status: newStatus, aptitude_score: aptitudeScore } : a
            ));
            setAptitudeModal(null);
            setAptitudeScore('');
            setAptitudeCutoff('60');
            alert(`Score saved successfully.`);
        } catch (e) {
            alert('Failed to save aptitude score');
        } finally {
            setSavingId(null);
        }
    };

    const filtered = selectedDrive === 'all'
        ? applications
        : applications.filter(a => a.drive_id === selectedDrive);

    const scheduled = applications.filter(a => a.interview_time);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-6 bg-gradient-to-r from-indigo-600 to-purple-700 rounded-xl text-white shadow-md">
                <div>
                    <h1 className="text-2xl font-bold flex items-center"><Calendar className="mr-2" /> Interview Scheduler</h1>
                    <p className="opacity-90 mt-1">Manage interview slots and track application status.</p>
                </div>
                <div className="mt-3 sm:mt-0 text-right">
                    <div className="text-3xl font-bold">{scheduled.length}</div>
                    <div className="text-sm opacity-80">Interviews Scheduled</div>
                </div>
            </div>

            {/* Upcoming Interviews */}
            {scheduled.length > 0 && (
                <div className="card">
                    <h2 className="text-lg font-semibold mb-4 dark:text-white flex items-center">
                        <Clock size={18} className="mr-2 text-indigo-500" /> Upcoming Interviews
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                        {scheduled.map(app => (
                            <div key={app.id} className="flex items-start p-3 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 rounded-lg">
                                <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold text-sm mr-3 flex-shrink-0">
                                    {(app.student_name || app.student_id || '?')[0].toUpperCase()}
                                </div>
                                <div className="min-w-0">
                                    <p className="font-medium text-sm dark:text-white truncate">{app.student_name || app.student_id}</p>
                                    <p className="text-xs text-indigo-700 dark:text-indigo-300 font-medium">{app.company_name} — {app.role}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                        🗓 {new Date(app.interview_time).toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Applications Table */}
            <div className="card">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3">
                    <h2 className="text-lg font-semibold dark:text-white flex items-center">
                        <Briefcase size={18} className="mr-2 text-purple-500" /> Applications
                    </h2>
                    <select
                        className="input-field w-auto text-sm"
                        value={selectedDrive}
                        onChange={e => setSelectedDrive(e.target.value)}
                    >
                        <option value="all">All Drives</option>
                        {drives.map(d => (
                            <option key={d.id} value={d.id}>{d.company_name} — {d.role}</option>
                        ))}
                    </select>
                </div>

                {loading ? (
                    <div className="text-center py-12 text-gray-500">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-3"></div>
                        Loading applications...
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="text-center py-12 text-gray-500 dark:text-gray-400 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg">
                        <AlertCircle className="mx-auto mb-2 opacity-40" size={32} />
                        No applications found. Students need to apply to drives first.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-800">
                                <tr>
                                    {['Student', 'Drive', 'Status', 'Score', 'Interview Time', 'Actions'].map(h => (
                                        <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-dark-card divide-y divide-gray-200 dark:divide-gray-700">
                                {filtered.map(app => (
                                    <tr key={app.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                        <td className="px-4 py-3">
                                            <div className="flex items-center">
                                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold mr-2">
                                                    {(app.student_name || app.student_id || '?')[0].toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium dark:text-white">{app.student_name || 'Student'}</p>
                                                    <p className="text-xs text-gray-400">{app.student_id?.slice(0, 8)}...</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-sm dark:text-gray-300">
                                            <p className="font-medium">{app.company_name || '—'}</p>
                                            <p className="text-xs text-gray-400">{app.role || ''}</p>
                                        </td>
                                        <td className="px-4 py-3">
                                            <select
                                                className={`text-xs font-semibold rounded-full px-2 py-1 border-0 cursor-pointer ${STATUS_COLORS[app.status] || ''}`}
                                                value={app.status}
                                                disabled={savingId === app.id}
                                                onChange={e => handleStatusChange(app.id, e.target.value)}
                                            >
                                                {ALL_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                                            </select>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                                            {app.aptitude_score != null
                                                ? <span className="font-medium text-purple-600 dark:text-purple-400">{app.aptitude_score} / {app.aptitude_cutoff ?? 60}</span>
                                                : <span className="text-gray-300 dark:text-gray-600">—</span>}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                                            {app.interview_time
                                                ? new Date(app.interview_time).toLocaleString()
                                                : <span className="text-gray-300 dark:text-gray-600">Not set</span>}
                                        </td>
                                        <td className="px-4 py-3 flex gap-2 flex-wrap">
                                            <button
                                                onClick={() => {
                                                    setScheduleModal({ appId: app.id });
                                                    setInterviewTime(app.interview_time ? app.interview_time.slice(0, 16) : '');
                                                }}
                                                className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg transition"
                                            >
                                                {app.interview_time ? 'Reschedule' : 'Schedule'}
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setAptitudeModal({ appId: app.id, studentName: app.student_name || 'Student', company: app.company_name || '' });
                                                    setAptitudeScore(app.aptitude_score ?? '');
                                                    setAptitudeCutoff(app.aptitude_cutoff ?? '60');
                                                }}
                                                className="text-xs bg-purple-600 hover:bg-purple-700 text-white px-3 py-1.5 rounded-lg transition"
                                            >
                                                📊 Score
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Aptitude Score Modal */}
            {aptitudeModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setAptitudeModal(null)}>
                    <div className="bg-white dark:bg-dark-card rounded-xl shadow-2xl p-6 w-full max-w-sm mx-4" onClick={e => e.stopPropagation()}>
                        <h3 className="text-lg font-bold mb-1 dark:text-white flex items-center">
                            📊 Enter Aptitude Score
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                            {aptitudeModal.studentName} — {aptitudeModal.company}<br />
                            <span className="text-xs">Student will receive an email with their result.</span>
                        </p>
                        <div className="grid grid-cols-2 gap-3 mb-4">
                            <div>
                                <label className="block text-sm font-medium mb-1 dark:text-gray-300">Score</label>
                                <input
                                    type="number" min="0" max="100" step="0.1"
                                    className="input-field"
                                    placeholder="e.g. 75"
                                    value={aptitudeScore}
                                    onChange={e => setAptitudeScore(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1 dark:text-gray-300">Cutoff</label>
                                <input
                                    type="number" min="0" max="100" step="0.1"
                                    className="input-field"
                                    placeholder="e.g. 60"
                                    value={aptitudeCutoff}
                                    onChange={e => setAptitudeCutoff(e.target.value)}
                                />
                            </div>
                        </div>
                        {aptitudeScore && (
                            <div className={`text-center text-sm font-bold py-2 rounded-lg mb-4 ${parseFloat(aptitudeScore) >= parseFloat(aptitudeCutoff)
                                ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                                : 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400'
                                }`}>
                                {parseFloat(aptitudeScore) >= parseFloat(aptitudeCutoff) ? '✅ PASS — Qualifies for interview' : '❌ FAIL — Does not qualify'}
                            </div>
                        )}
                        <div className="flex gap-3">
                            <button onClick={handleAptitudeSubmit} disabled={savingId !== null} className="flex-1 btn-primary py-2 bg-purple-600 hover:bg-purple-700">
                                {savingId ? 'Saving...' : 'Save Score'}
                            </button>
                            <button onClick={() => setAptitudeModal(null)} className="flex-1 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition">
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Schedule Modal */}
            {scheduleModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setScheduleModal(null)}>
                    <div className="bg-white dark:bg-dark-card rounded-xl shadow-2xl p-6 w-full max-w-sm mx-4" onClick={e => e.stopPropagation()}>
                        <h3 className="text-lg font-bold mb-4 dark:text-white flex items-center">
                            <Calendar size={18} className="mr-2 text-indigo-500" /> Schedule Interview
                        </h3>
                        <label className="block text-sm font-medium mb-1 dark:text-gray-300">Date & Time</label>
                        <input
                            type="datetime-local"
                            className="input-field mb-4"
                            value={interviewTime}
                            onChange={e => setInterviewTime(e.target.value)}
                        />
                        <div className="flex gap-3">
                            <button
                                onClick={handleScheduleInterview}
                                disabled={savingId !== null}
                                className="flex-1 btn-primary py-2"
                            >
                                {savingId ? 'Saving...' : 'Confirm'}
                            </button>
                            <button
                                onClick={() => setScheduleModal(null)}
                                className="flex-1 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Scheduler;
