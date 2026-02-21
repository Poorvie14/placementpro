import React, { useState } from 'react';
import api from '../../services/api';
import { Target, Zap, AlertTriangle, BookOpen, CheckCircle } from 'lucide-react';

const SkillGap = () => {
    const [role, setRole] = useState('Software Engineer');
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(false);

    const roleGroups = {
        '💻 CSE / IT': [
            'Software Engineer',
            'Frontend Developer',
            'Backend Developer',
            'Full Stack Developer',
            'Mobile App Developer (Android)',
            'Mobile App Developer (iOS)',
            'DevOps Engineer',
            'Cloud Engineer (AWS / Azure / GCP)',
            'Site Reliability Engineer (SRE)',
            'Cybersecurity Analyst',
            'Penetration Tester',
            'Database Administrator',
            'Blockchain Developer',
            'Game Developer',
            'AI / ML Engineer',
            'Data Scientist',
            'Data Analyst',
            'NLP Engineer',
            'Computer Vision Engineer',
            'UI / UX Designer',
            'Product Manager',
            'Business Analyst',
            'QA / Test Engineer',
            'AR / VR Developer',
        ],
        '📡 ECE / EEE': [
            'VLSI Design Engineer',
            'Embedded Systems Engineer',
            'RF / Antenna Engineer',
            'Signal Processing Engineer',
            'PCB Design Engineer',
            'Hardware Design Engineer',
            'IoT Solutions Engineer',
            'Power Electronics Engineer',
            'Control Systems Engineer',
            'Instrumentation Engineer',
            'Communication Systems Engineer',
            'Semiconductor Engineer',
            'Firmware Developer',
            'Automation & PLC Engineer',
        ],
        '⚙️ Mechanical': [
            'Mechanical Design Engineer',
            'CAD / CAM Engineer',
            'Automotive Engineer',
            'Manufacturing Engineer',
            'Production Engineer',
            'Quality Assurance Engineer',
            'Thermal / HVAC Engineer',
            'Robotics Engineer',
            'Tool & Die Designer',
            'Materials Engineer',
            'Aerospace Engineer',
            'Maintenance Engineer',
        ],
        '🏗️ Civil': [
            'Structural Engineer',
            'Construction Project Manager',
            'Geotechnical Engineer',
            'Environmental Engineer',
            'Urban / Town Planner',
            'Transportation Engineer',
            'Quantity Surveyor',
            'Water Resources Engineer',
            'Site Engineer',
            'BIM Engineer',
        ],
        '⚗️ Chemical / Biotech': [
            'Process Engineer',
            'Chemical Plant Engineer',
            'Petroleum / Refinery Engineer',
            'Materials Scientist',
            'Pharmaceutical Engineer',
            'Food Technology Engineer',
            'Biomedical Engineer',
            'Clinical Engineer',
            'Medical Device Designer',
            'Biochemical Engineer',
        ],
        '📊 Management / Core': [
            'Management Trainee',
            'Operations Manager',
            'Supply Chain Analyst',
            'ERP Consultant (SAP)',
            'HR Analyst',
            'Financial Analyst',
            'Marketing Analyst',
            'Technical Writer',
            'Research & Development Engineer',
        ],
    };

    const handleAnalyze = async (e) => {
        e.preventDefault();
        setLoading(true);
        setResults(null);
        try {
            const res = await api.post('/ai/skill-gap', { role });
            setResults(res.data);
        } catch (err) {
            console.error(err);
            alert('Failed to run analysis. Make sure your student profile is updated with skills.');
        } finally {
            setLoading(false);
        }
    };

    const scoreColor = (s) => s > 70 ? 'text-green-500' : s > 40 ? 'text-yellow-500' : 'text-red-500';
    const scoreBg = (s) => s > 70 ? 'from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/10 border-green-200 dark:border-green-800'
        : s > 40 ? 'from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/10 border-yellow-200 dark:border-yellow-800'
            : 'from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/10 border-red-200 dark:border-red-800';

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-6 bg-gradient-to-r from-blue-700 to-indigo-800 rounded-xl text-white shadow-md">
                <div>
                    <h1 className="text-2xl font-bold flex items-center">
                        <Zap className="mr-2 text-yellow-400" /> AI Skill Gap Analysis
                    </h1>
                    <p className="opacity-90 mt-1 max-w-2xl">Compare your current verified skills with top industry requirements for your dream role to get personalized learning recommendations.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="card lg:col-span-1 border-t-4 border-t-primary-500">
                    <h2 className="text-lg font-semibold mb-4 dark:text-white">Target Role Profile</h2>
                    <form onSubmit={handleAnalyze} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1 dark:text-gray-300">Select Dream Role</label>
                            <select
                                className="input-field"
                                value={role}
                                onChange={e => setRole(e.target.value)}
                            >
                                {Object.entries(roleGroups).map(([group, roles]) => (
                                    <optgroup key={group} label={group}>
                                        {roles.map(r => <option key={r} value={r}>{r}</option>)}
                                    </optgroup>
                                ))}
                            </select>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full btn-primary flex justify-center items-center h-11"
                        >
                            {loading ? (
                                <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div> Analyzing...</>
                            ) : (
                                'Run AI Analysis'
                            )}
                        </button>
                    </form>
                </div>


                <div className="lg:col-span-2 space-y-6">
                    {!results && !loading && (
                        <div className="card h-full flex flex-col items-center justify-center p-12 text-center text-gray-500 dark:text-gray-400 border-2 border-dashed border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-dark-card/50">
                            <Target size={48} className="text-gray-300 dark:text-gray-600 mb-4" />
                            <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">Ready to find your gaps?</h3>
                            <p className="max-w-md">Select a role on the left and our AI matching engine will compare your profile against the top 100 successful candidates in that domain.</p>
                        </div>
                    )}

                    {loading && (
                        <div className="card h-full flex flex-col items-center justify-center p-12 text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4"></div>
                            <p className="text-gray-500 font-medium">Crunching placement data...</p>
                        </div>
                    )}

                    {results && !loading && (
                        <div className="space-y-4">
                            {/* Score Banner */}
                            <div className={`card bg-gradient-to-br border ${scoreBg(results.recommendation_score)} p-6`}>
                                <div className="flex items-center justify-between flex-wrap gap-4">
                                    <div>
                                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Profile Match Score for <strong>{role}</strong></p>
                                        <span className={`text-5xl font-extrabold ${scoreColor(results.recommendation_score)}`}>{results.recommendation_score}%</span>
                                        <p className="text-sm mt-2 font-medium text-gray-600 dark:text-gray-300">
                                            {results.recommendation_score > 70 ? '🟢 Strong Match — focus on projects & system design'
                                                : results.recommendation_score > 40 ? '🟡 Moderate Match — upskill the missing areas first'
                                                    : '🔴 Needs Work — follow the learning path below carefully'}
                                        </p>
                                    </div>
                                    <svg viewBox="0 0 36 36" className="w-20 h-20 flex-shrink-0 -rotate-90">
                                        <circle cx="18" cy="18" r="15.9" fill="none" stroke="#e5e7eb" strokeWidth="3" />
                                        <circle cx="18" cy="18" r="15.9" fill="none"
                                            stroke={results.recommendation_score > 70 ? '#22c55e' : results.recommendation_score > 40 ? '#eab308' : '#ef4444'}
                                            strokeWidth="3"
                                            strokeDasharray={`${results.recommendation_score} ${100 - results.recommendation_score}`}
                                            strokeLinecap="round" />
                                        <text x="18" y="20" textAnchor="middle" className="text-xs" style={{ rotate: '90deg', fontSize: '7px', fontWeight: 'bold', fill: results.recommendation_score > 70 ? '#22c55e' : results.recommendation_score > 40 ? '#eab308' : '#ef4444' }}>{results.recommendation_score}%</text>
                                    </svg>
                                </div>
                            </div>

                            {/* Skills Panel */}
                            <div className="card space-y-4">
                                {/* Missing Skills */}
                                <div>
                                    <h3 className="text-base font-semibold dark:text-white flex items-center mb-3">
                                        <AlertTriangle className="mr-2 text-yellow-500" size={18} /> Skills to Acquire
                                    </h3>
                                    {results.missing_skills.length === 0 ? (
                                        <div className="flex items-center text-green-600 dark:text-green-400 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                            <CheckCircle className="mr-2" size={18} />
                                            <span className="font-medium text-sm">You already have all core skills for this role — focus on building projects!</span>
                                        </div>
                                    ) : (
                                        <div className="flex flex-wrap gap-2">
                                            {results.missing_skills.map(skill => (
                                                <span key={skill} className="px-3 py-1 bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 rounded-full text-xs font-semibold border border-red-200 dark:border-red-800/50">
                                                    ✗ {skill}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Matched Skills */}
                                {results.matched_skills && results.matched_skills.length > 0 && (
                                    <div>
                                        <h3 className="text-base font-semibold dark:text-white flex items-center mb-3">
                                            <CheckCircle className="mr-2 text-green-500" size={18} /> Skills You Already Have
                                        </h3>
                                        <div className="flex flex-wrap gap-2">
                                            {results.matched_skills.map(skill => (
                                                <span key={skill} className="px-3 py-1 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 rounded-full text-xs font-semibold border border-green-200 dark:border-green-800/50">
                                                    ✓ {skill}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* AI Learning Path */}
                                <div className="pt-3 border-t dark:border-gray-800">
                                    <h3 className="text-base font-semibold dark:text-white flex items-center mb-2">
                                        <BookOpen className="mr-2 text-indigo-500" size={18} /> AI-Recommended Learning Path
                                    </h3>
                                    <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-100 dark:border-indigo-800/50">
                                        <p className="text-gray-800 dark:text-gray-200 leading-relaxed text-sm">{results.suggested_path}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SkillGap;
