import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Briefcase, MessageSquare, ExternalLink } from 'lucide-react';

const AlumniJobs = () => {
    const [jobs, setJobs] = useState([]);
    const [formData, setFormData] = useState({
        title: '', company: '', location: '', domain: '', description: '', apply_link: ''
    });

    useEffect(() => {
        fetchJobs();
    }, []);

    const fetchJobs = async () => {
        try {
            const res = await api.get('/jobs/');
            setJobs(res.data);
        } catch (e) {
            console.error(e);
        }
    };

    const handlePost = async (e) => {
        e.preventDefault();
        try {
            await api.post('/jobs/', formData);
            alert('Job referral posted successfully!');
            fetchJobs();
            setFormData({ title: '', company: '', location: '', domain: '', description: '', apply_link: '' });
        } catch (e) {
            alert('Failed to post job');
        }
    };

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold dark:text-white flex items-center">
                <Briefcase className="mr-3 text-primary-600 border border-primary-600 rounded p-1" /> Job Referrals Board
            </h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="card lg:col-span-1 shadow-md border-t-4 border-t-primary-500">
                    <h2 className="text-lg font-semibold mb-4 dark:text-white">Post an Opening</h2>
                    <form onSubmit={handlePost} className="space-y-3" autoComplete="off">
                        <input required placeholder="Job Title" className="input-field py-1.5" autoComplete="off" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />
                        <input required placeholder="Company Name" className="input-field py-1.5" autoComplete="off" value={formData.company} onChange={e => setFormData({ ...formData, company: e.target.value })} />
                        <input required placeholder="Location" className="input-field py-1.5" autoComplete="off" value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} />
                        <input required placeholder="Domain (e.g., SDE, Data)" className="input-field py-1.5" autoComplete="off" value={formData.domain} onChange={e => setFormData({ ...formData, domain: e.target.value })} />
                        <textarea required placeholder="Short Description & Requirements" className="input-field h-24 text-sm" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
                        <input required type="text" placeholder="Referral Link (https://...)" className="input-field py-1.5" autoComplete="off" value={formData.apply_link} onChange={e => setFormData({ ...formData, apply_link: e.target.value })} />
                        <button type="submit" className="w-full btn-primary font-semibold py-2">Post Referral</button>
                    </form>
                </div>

                <div className="lg:col-span-2 space-y-4">
                    <h2 className="text-lg font-semibold dark:text-white">Active Postings</h2>
                    {jobs.length === 0 ? (
                        <div className="text-center py-12 card text-gray-500 rounded-xl">No active referrals posted yet</div>
                    ) : (
                        <div className="grid grid-cols-1 gap-4">
                            {jobs.map(job => (
                                <div key={job.id} className="card p-5 hover:border-primary-300 dark:hover:border-primary-700 transition flex flex-col sm:flex-row justify-between">
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">{job.title}</h3>
                                        <p className="text-primary-700 dark:text-primary-400 font-medium">{job.company}</p>
                                        <div className="text-xs text-gray-500 mt-1 mb-2 capitalize">{job.location} • {job.domain}</div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{job.description}</p>
                                    </div>
                                    <div className="mt-4 sm:mt-0 sm:ml-4 flex items-end">
                                        <a href={job.apply_link} target="_blank" rel="noopener noreferrer" className="btn-secondary h-10 flex items-center text-sm whitespace-nowrap">
                                            Apply / Connect <ExternalLink size={16} className="ml-2" />
                                        </a>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AlumniJobs;
