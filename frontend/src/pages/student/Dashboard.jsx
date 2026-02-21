import React, { useState, useEffect, useContext, useRef } from 'react';
import api from '../../services/api';
import { AuthContext } from '../../context/AuthContext';
import { Target, CheckCircle, Clock, Zap, User, Save, Edit2, Bot, Send, MessageCircle, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const BRANCHES = [
    { label: 'Computer Science & Engineering', value: 'CSE' },
    { label: 'Information Science & Engineering', value: 'ISE' },
    { label: 'Information Technology', value: 'IT' },
    { label: 'Electronics & Communication Engineering', value: 'ECE' },
    { label: 'Electrical & Electronics Engineering', value: 'EEE' },
    { label: 'Mechanical Engineering', value: 'MECH' },
    { label: 'Civil Engineering', value: 'CIVIL' },
    { label: 'Chemical Engineering', value: 'CHEM' },
    { label: 'Biomedical Engineering', value: 'BME' },
    { label: 'Aerospace Engineering', value: 'AERO' },
    { label: 'Automobile Engineering', value: 'AUTO' },
    { label: 'Marine Engineering', value: 'MARINE' },
    { label: 'Internet of Things', value: 'IoT' },
    { label: 'Data Science', value: 'Data Science' },
    { label: 'Artificial Intelligence & Machine Learning', value: 'AI & ML' },
    { label: 'Master of Computer Applications', value: 'MCA' },
    { label: 'Bachelor of Computer Applications', value: 'BCA' },
    { label: 'Other', value: 'Other' },
];

const PASSING_YEARS = [2024, 2025, 2026, 2027, 2028];

const renderMd = (t) => (t || '')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/_(.*?)_/g, '<em>$1</em>')
    .replace(/`(.*?)`/g, '<code class="bg-gray-200 dark:bg-gray-700 px-1 rounded text-xs font-mono">$1</code>')
    .replace(/\n/g, '<br/>');

const QUICK = [
    { label: '▶ Start Mock', msg: 'next question' },
    { label: '🧑‍💼 HR Q', msg: 'HR question' },
    { label: '🔧 Tech Q', msg: 'technical question' },
    { label: '📢 Comm Tips', msg: 'communication tips' },
    { label: '📋 My Profile', msg: 'my skills' },
];

const MODES = [
    { value: 'interview', label: '🎯 Interview Prep' },
    { value: 'communication', label: '📢 Communication' },
    { value: 'general', label: '💬 General' },
];

const StudentDashboard = () => {
    const { user } = useContext(AuthContext);
    const [profile, setProfile] = useState(null);
    const [apps, setApps] = useState([]);
    const [prob, setProb] = useState(null);
    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({
        branch: '', cgpa: '', backlogs: '', passing_year: '', skills: '', resume_url: ''
    });

    // ── Chatbot state ─────────────────────────────────────────────────────────
    const [chatMode, setChatMode] = useState('interview');
    const [chatInput, setChatInput] = useState('');
    const [chatLoading, setChatLoading] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'bot', text: "👋 Hi! I'm your **Interview Coach** 🎓\n\nI'll ask you questions tailored to your skills & applied roles, and give feedback on your answers.\n\nClick a quick action or type **'help'** to see all commands!" }
    ]);
    const chatBottomRef = useRef(null);
    const chatInputRef = useRef(null);

    useEffect(() => {
        chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const sendChat = async (overrideMsg) => {
        const text = (overrideMsg || chatInput).trim();
        if (!text) return;
        const userMsg = { role: 'user', text };
        const updated = [...messages, userMsg];
        setMessages(updated);
        setChatInput('');
        setChatLoading(true);
        try {
            const history = updated.slice(-12).map(m => ({ role: m.role, text: m.text }));
            const res = await api.post('/ai/chatbot', { message: text, history, mode: chatMode });
            setMessages(prev => [...prev, { role: 'bot', text: res.data.reply }]);
        } catch {
            setMessages(prev => [...prev, { role: 'bot', text: '⚠️ Could not reach the coach. Please try again.' }]);
        } finally {
            setChatLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [profRes, appRes, probRes] = await Promise.all([
                api.get('/students/me'),
                api.get('/drives/applications'),
                api.get('/ai/predict-placement')
            ]);
            const p = profRes.data;
            setProfile(p);
            setApps(appRes.data);
            setProb(probRes.data);
            setForm({
                branch: p.branch || '',
                cgpa: p.cgpa || '',
                backlogs: p.backlogs ?? '',
                passing_year: p.passing_year || '',
                skills: (p.skills || []).join(', '),
                resume_url: p.resume_url || '',
            });
            // Auto-open editor if profile is empty
            if (!p.branch || p.cgpa === 0.0) setEditing(true);
        } catch (e) {
            console.error(e);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const payload = {
                branch: form.branch,
                cgpa: parseFloat(form.cgpa) || 0,
                backlogs: parseInt(form.backlogs) || 0,
                passing_year: parseInt(form.passing_year) || 0,
                skills: form.skills.split(',').map(s => s.trim()).filter(Boolean),
                resume_url: form.resume_url,
            };
            const res = await api.put('/students/me', payload);
            setProfile(res.data);
            setEditing(false);
        } catch (err) {
            console.error(err);
            alert('Failed to save profile');
        } finally {
            setSaving(false);
        }
    };

    const isIncomplete = !profile?.branch || profile?.cgpa === 0.0;

    if (!profile) return (
        <div className="p-8 text-center dark:text-gray-300 space-y-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-3"></div>
            Loading student profile...
        </div>
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between md:items-center space-y-4 md:space-y-0">
                <h1 className="text-2xl font-bold dark:text-white">Welcome back, {user?.name?.split(' ')[0]} 👋</h1>
                <div className="flex space-x-3">
                    <button
                        onClick={() => setEditing(e => !e)}
                        className="btn-secondary flex items-center text-sm"
                    >
                        <Edit2 size={15} className="mr-1.5" />{editing ? 'Cancel Edit' : 'Edit Profile'}
                    </button>
                    <Link to="/student/drives" className="btn-primary flex items-center shadow-md bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                        <Target size={18} className="mr-2" /> Find Drives
                    </Link>
                </div>
            </div>

            {/* Profile Setup Card — shown when editing or incomplete */}
            {(editing || isIncomplete) && (
                <div className="card border-t-4 border-t-primary-500 shadow-md">
                    <div className="flex items-center mb-5">
                        <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center mr-3">
                            <User size={20} className="text-primary-600" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold dark:text-white">
                                {isIncomplete && !editing ? '⚠️ Complete Your Profile' : 'My Academic Profile'}
                            </h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                {isIncomplete ? 'Fill in your details to appear in placement drives and get AI predictions.' : 'Update your academic information.'}
                            </p>
                        </div>
                    </div>

                    <form onSubmit={handleSave} autoComplete="off">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                            {/* Branch */}
                            <div>
                                <label className="block text-sm font-medium mb-1 dark:text-gray-300">Branch / Department <span className="text-red-500">*</span></label>
                                <select
                                    required
                                    className="input-field"
                                    value={form.branch}
                                    onChange={e => setForm({ ...form, branch: e.target.value })}
                                >
                                    <option value="">-- Select Branch --</option>
                                    {BRANCHES.map(b => <option key={b.value} value={b.value}>{b.label}</option>)}
                                </select>
                            </div>

                            {/* CGPA */}
                            <div>
                                <label className="block text-sm font-medium mb-1 dark:text-gray-300">Current CGPA <span className="text-red-500">*</span></label>
                                <input
                                    required
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    max="10"
                                    placeholder="e.g. 8.5"
                                    className="input-field"
                                    value={form.cgpa}
                                    onChange={e => setForm({ ...form, cgpa: e.target.value })}
                                />
                            </div>

                            {/* Backlogs */}
                            <div>
                                <label className="block text-sm font-medium mb-1 dark:text-gray-300">Active Backlogs</label>
                                <input
                                    type="number"
                                    min="0"
                                    placeholder="0"
                                    className="input-field"
                                    value={form.backlogs}
                                    onChange={e => setForm({ ...form, backlogs: e.target.value })}
                                />
                            </div>

                            {/* Passing Year */}
                            <div>
                                <label className="block text-sm font-medium mb-1 dark:text-gray-300">Expected Year of Passing <span className="text-red-500">*</span></label>
                                <select
                                    required
                                    className="input-field"
                                    value={form.passing_year}
                                    onChange={e => setForm({ ...form, passing_year: e.target.value })}
                                >
                                    <option value="">-- Select Year --</option>
                                    {PASSING_YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                                </select>
                            </div>

                            {/* Resume URL */}
                            <div>
                                <label className="block text-sm font-medium mb-1 dark:text-gray-300">Resume Link (Drive / Portfolio)</label>
                                <input
                                    type="text"
                                    placeholder="https://drive.google.com/..."
                                    className="input-field"
                                    value={form.resume_url}
                                    onChange={e => setForm({ ...form, resume_url: e.target.value })}
                                />
                            </div>
                        </div>

                        {/* Skills */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-1 dark:text-gray-300">
                                Technical Skills <span className="text-gray-400 font-normal">(comma-separated)</span>
                            </label>
                            <input
                                type="text"
                                placeholder="e.g. Python, React, MySQL, Machine Learning, Git..."
                                className="input-field"
                                value={form.skills}
                                onChange={e => setForm({ ...form, skills: e.target.value })}
                            />
                            {form.skills && (
                                <div className="flex flex-wrap gap-1.5 mt-2">
                                    {form.skills.split(',').map(s => s.trim()).filter(Boolean).map((s, i) => (
                                        <span key={i} className="px-2 py-0.5 bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-300 rounded-full text-xs font-medium">{s}</span>
                                    ))}
                                </div>
                            )}
                        </div>

                        <button type="submit" disabled={saving} className="btn-primary flex items-center">
                            <Save size={16} className="mr-2" />
                            {saving ? 'Saving...' : 'Save Profile'}
                        </button>
                    </form>
                </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="card text-center relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-teal-500/10 transform scale-0 group-hover:scale-100 transition-transform duration-500 rounded-xl"></div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1 z-10 relative">Placement Probability</h3>
                    <p className="text-4xl font-extrabold text-gray-900 dark:text-white z-10 relative">{prob?.probability || '--'}%</p>
                    <p className="text-xs text-green-600 dark:text-green-400 mt-2 z-10 relative">AI Predicted</p>
                </div>

                <div className="card text-center">
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Current CGPA</h3>
                    <p className="text-4xl font-extrabold text-gray-900 dark:text-white">{profile.cgpa || 'N/A'}</p>
                    <p className="text-xs text-gray-500 mt-2">Target &gt; 8.0</p>
                </div>

                <div className="card text-center">
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Applications Active</h3>
                    <p className="text-4xl font-extrabold text-gray-900 dark:text-white">{apps.length}</p>
                    <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">In progress</p>
                </div>

                <div className="card text-center">
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Skill Matches</h3>
                    <p className="text-4xl font-extrabold text-gray-900 dark:text-white">{profile.skills?.length || 0}</p>
                    <p className="text-xs text-gray-500 mt-2">Verified skills</p>
                </div>
            </div>

            {/* Profile Summary (when not editing) */}
            {!editing && !isIncomplete && (
                <div className="card">
                    <h2 className="text-base font-semibold dark:text-white mb-3 flex items-center">
                        <User size={16} className="mr-2 text-primary-500" /> Profile Summary
                    </h2>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                        <div><p className="text-gray-500 dark:text-gray-400 text-xs uppercase">Branch</p><p className="font-medium dark:text-white mt-0.5">{profile.branch || '—'}</p></div>
                        <div><p className="text-gray-500 dark:text-gray-400 text-xs uppercase">CGPA</p><p className="font-medium dark:text-white mt-0.5">{profile.cgpa}</p></div>
                        <div><p className="text-gray-500 dark:text-gray-400 text-xs uppercase">Backlogs</p><p className="font-medium dark:text-white mt-0.5">{profile.backlogs ?? '—'}</p></div>
                        <div><p className="text-gray-500 dark:text-gray-400 text-xs uppercase">Passing Year</p><p className="font-medium dark:text-white mt-0.5">{profile.passing_year || '—'}</p></div>
                    </div>
                    {profile.skills?.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1.5">
                            {profile.skills.map(s => (
                                <span key={s} className="px-2 py-0.5 bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300 rounded-full text-xs font-medium flex items-center">
                                    <CheckCircle size={11} className="mr-1" />{s}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Application Status */}
                <div className="card lg:col-span-2 space-y-4">
                    <div className="flex justify-between items-center mb-2 border-b dark:border-gray-800 pb-2">
                        <h2 className="text-lg font-semibold dark:text-white flex items-center">
                            <Clock className="mr-2" size={20} /> Application Status
                        </h2>
                        <Link to="/student/applications" className="text-sm text-primary-600 dark:text-primary-400 hover:underline">View All</Link>
                    </div>
                    {apps.length === 0 ? (
                        <div className="text-center py-6 text-gray-500 dark:text-gray-400">
                            No active applications yet. <Link to="/student/drives" className="text-primary-600 hover:underline">Apply now</Link>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {apps.slice(0, 3).map(app => (
                                <div key={app.id} className="flex justify-between items-center p-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-lg transition border border-transparent hover:border-gray-200 dark:hover:border-gray-700">
                                    <div>
                                        <h3 className="font-semibold text-gray-800 dark:text-gray-200">{app.company_name}</h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">{app.role}</p>
                                    </div>
                                    <span className={`px-3 py-1 text-xs font-semibold rounded-full
                                        ${app.status === 'Applied' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300' : ''}
                                        ${['Aptitude', 'Cleared'].includes(app.status) ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300' : ''}
                                        ${app.status === 'Interview Scheduled' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300' : ''}
                                        ${app.status === 'Selected' ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300' : ''}
                                        ${app.status === 'Rejected' ? 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300' : ''}
                                    `}>
                                        {app.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* AI Advice */}
                <div className="card space-y-4">
                    <div className="flex justify-between items-center mb-2 border-b dark:border-gray-800 pb-2">
                        <h2 className="text-lg font-semibold dark:text-white flex items-center">
                            <Zap className="mr-2 text-yellow-500" size={20} /> AI Advice
                        </h2>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                        {prob?.message || 'Update your profile to get personalized AI placement probability and advice on which skills to focus on next.'}
                    </p>
                    <div className="pt-2">
                        <Link to="/student/skills" className="text-sm btn-secondary w-full flex justify-center py-2 h-auto text-center font-medium">
                            Run Skill Gap Analysis
                        </Link>
                    </div>
                </div>
            </div>
            {/* ── Interview Prep Chatbot ── */}
            <div className="card border-t-4 border-t-indigo-500 shadow-md">
                {/* Header */}
                <div className="flex items-center justify-between mb-3">
                    <h2 className="text-lg font-semibold dark:text-white flex items-center">
                        <Bot size={20} className="mr-2 text-indigo-500" /> Interview Coach
                        <span className="ml-2 text-xs bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-full font-medium">AI Powered</span>
                    </h2>
                    <button onClick={() => setMessages([{ role: 'bot', text: "Chat cleared! Type **'help'** to see commands." }])} className="text-xs text-gray-400 hover:text-red-500 flex items-center gap-1 transition">
                        <Trash2 size={12} /> Clear
                    </button>
                </div>

                {/* Mode selector */}
                <div className="flex gap-2 mb-3">
                    {MODES.map(m => (
                        <button key={m.value} onClick={() => setChatMode(m.value)}
                            className={`flex-1 text-xs py-1.5 px-3 rounded-lg font-medium transition border ${chatMode === m.value
                                ? 'bg-indigo-600 text-white border-indigo-600'
                                : 'text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800'
                                }`}>
                            {m.label}
                        </button>
                    ))}
                </div>

                {/* Messages */}
                <div className="h-72 overflow-y-auto space-y-3 mb-3 pr-1">
                    {messages.map((msg, i) => (
                        <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            {msg.role === 'bot' && (
                                <div className="w-7 h-7 rounded-full bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center mr-2 flex-shrink-0 mt-0.5">
                                    <Bot size={14} className="text-indigo-600 dark:text-indigo-400" />
                                </div>
                            )}
                            <div
                                className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${msg.role === 'user'
                                    ? 'bg-indigo-600 text-white rounded-tr-sm'
                                    : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-tl-sm'
                                    }`}
                                dangerouslySetInnerHTML={{ __html: renderMd(msg.text) }}
                            />
                            {msg.role === 'user' && (
                                <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center ml-2 flex-shrink-0 mt-0.5">
                                    <User size={13} className="text-white" />
                                </div>
                            )}
                        </div>
                    ))}
                    {chatLoading && (
                        <div className="flex justify-start">
                            <div className="w-7 h-7 rounded-full bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center mr-2">
                                <Bot size={14} className="text-indigo-600" />
                            </div>
                            <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl rounded-tl-sm px-4 py-3 flex space-x-1">
                                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                            </div>
                        </div>
                    )}
                    <div ref={chatBottomRef} />
                </div>

                {/* Quick actions */}
                <div className="flex flex-wrap gap-1.5 mb-3">
                    {QUICK.map(q => (
                        <button key={q.msg} onClick={() => sendChat(q.msg)} disabled={chatLoading}
                            className="text-xs px-3 py-1 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 rounded-full hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition disabled:opacity-50">
                            {q.label}
                        </button>
                    ))}
                </div>

                {/* Input */}
                <div className="flex gap-2">
                    <input
                        ref={chatInputRef}
                        type="text"
                        value={chatInput}
                        onChange={e => setChatInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && sendChat()}
                        placeholder="Type your answer or a command..."
                        disabled={chatLoading}
                        className="flex-1 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm px-3 py-2 text-gray-800 dark:text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
                    />
                    <button
                        onClick={() => sendChat()}
                        disabled={chatLoading || !chatInput.trim()}
                        className="w-10 h-10 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white rounded-xl flex items-center justify-center transition"
                    >
                        <Send size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default StudentDashboard;
