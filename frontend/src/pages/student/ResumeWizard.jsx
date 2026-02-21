import React, { useState } from 'react';
import api from '../../services/api';
import { FileText, Download, Wand2, Star, CheckCircle, BrainCircuit, Plus, Trash2 } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const emptyInternship = () => ({ company: '', role: '', duration: '', description: '' });
const emptyProject = () => ({ title: '', tech: '', description: '' });
const emptyEducation = () => ({ degree: '', institution: '', year: '', cgpa: '' });
const emptyCertification = () => ({ name: '', description: '', pdfName: '', pdfUrl: '' });

const ResumeWizard = () => {
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
        { label: 'Internet of Things', value: 'IoT' },
        { label: 'Data Science', value: 'Data Science' },
        { label: 'Artificial Intelligence & Machine Learning', value: 'AI & ML' },
        { label: 'Master of Computer Applications', value: 'MCA' },
        { label: 'Bachelor of Computer Applications', value: 'BCA' },
        { label: 'Other', value: 'Other' },
    ];

    const [resumeData, setResumeData] = useState({
        name: 'John Doe',
        email: 'john@college.edu',
        phone: '9876543210',
        branch: 'CSE',
        linkedin: 'linkedin.com/in/johndoe',
        github: 'github.com/johndoe',
        address: 'Chennai, Tamil Nadu',
        objective: '',
        education: [
            { degree: 'B.Tech Computer Science & Engineering', institution: 'ABC Engineering College', year: '2024', cgpa: '8.5 CGPA' },
            { degree: 'XII (HSC) – Science (12th Standard)', institution: 'XYZ Higher Secondary School', year: '2020', cgpa: '88%' },
            { degree: 'X (SSLC) – (10th Standard)', institution: 'XYZ Matriculation School', year: '2018', cgpa: '92%' },
        ],
        technicalSkills: 'React, Python, FastAPI, MongoDB, Node.js, REST APIs, Git, Docker',
        softSkills: 'Team Leadership, Communication, Problem Solving, Time Management',
        internships: [
            { company: 'Tech Corp Pvt. Ltd.', role: 'Software Development Intern', duration: 'May – Jul 2023 (3 Months)', description: 'Built RESTful APIs using FastAPI and integrated with React frontend. Improved API response time by 30%.' },
        ],
        projects: [
            { title: '', tech: '', description: '' },
        ],
        certifications: [
            { name: '', description: '', pdfName: '', pdfUrl: '' },
        ],
        achievements: [
            'Winner – Smart India Hackathon 2023 (National Level)',
            'Top 5% – LeetCode Problem Solving (600+ problems solved)',
            'Best Project Award – Department Annual Tech Fest 2023',
        ],
        languages: 'English (Fluent), Tamil (Native), Hindi (Conversational)',
    });
    const [score, setScore] = useState(null);
    const [loading, setLoading] = useState(false);

    const update = (key, val) => setResumeData(p => ({ ...p, [key]: val }));
    const updateList = (key, idx, field, val) => {
        const copy = [...resumeData[key]];
        copy[idx] = { ...copy[idx], [field]: val };
        update(key, copy);
    };
    const addItem = (key, template) => update(key, [...resumeData[key], template()]);
    const removeItem = (key, idx) => update(key, resumeData[key].filter((_, i) => i !== idx));
    const updateStrList = (key, idx, val) => {
        const copy = [...resumeData[key]];
        copy[idx] = val;
        update(key, copy);
    };

    const handleScore = async () => {
        setLoading(true);
        try {
            const payload = {
                skills: resumeData.technicalSkills.split(',').map(s => s.trim()),
                projects: resumeData.projects.map(p => ({ title: p.title, description: p.description })),
                internships: resumeData.internships.map(i => ({ company: i.company, description: i.role })),
                education: resumeData.education,
                certifications: resumeData.certifications,
            };
            const res = await api.post('/ai/resume-score', payload);
            setScore(res.data);
        } catch (e) {
            console.error(e);
            alert('Failed to analyze resume.');
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = async () => {
        const input = document.getElementById('resume-preview-container');
        if (!input) return;
        const canvas = await html2canvas(input, { scale: 2 });
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save('PlacementPro_Resume.pdf');
    };

    const SectionHeader = ({ label }) => (
        <h2 className="text-[11px] font-bold uppercase tracking-widest text-gray-800 border-b-2 border-gray-800 pb-0.5 mb-2">{label}</h2>
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-6 bg-gradient-to-r from-emerald-600 to-teal-700 rounded-xl text-white shadow-md">
                <div>
                    <h1 className="text-2xl font-bold flex items-center"><Wand2 className="mr-2" /> AI Resume Wizard</h1>
                    <p className="opacity-90 mt-1">Fill every section → get AI score → download a professional PDF.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 items-start">

                {/* ── EDITOR ── */}
                <div className="card space-y-5 shadow-sm border-t-4 border-t-emerald-500">
                    <h2 className="text-lg font-semibold dark:text-white flex items-center">
                        <FileText className="mr-2 text-gray-400" size={20} /> Input Details
                    </h2>

                    {/* Personal Info */}
                    <fieldset className="space-y-3">
                        <legend className="text-xs font-bold uppercase text-emerald-600 mb-2">Personal Information</legend>
                        <div className="grid grid-cols-2 gap-3">
                            <div><label className="label">Full Name</label><input className="input-field py-1.5" value={resumeData.name} onChange={e => update('name', e.target.value)} /></div>
                            <div><label className="label">Email</label><input className="input-field py-1.5" value={resumeData.email} onChange={e => update('email', e.target.value)} /></div>
                            <div><label className="label">Phone</label><input className="input-field py-1.5" value={resumeData.phone} onChange={e => update('phone', e.target.value)} /></div>
                            <div><label className="label">Location</label><input className="input-field py-1.5" value={resumeData.address} onChange={e => update('address', e.target.value)} /></div>
                            <div className="col-span-2">
                                <label className="label">Branch / Department</label>
                                <select className="input-field py-1.5" value={resumeData.branch} onChange={e => update('branch', e.target.value)}>
                                    <option value="">-- Select Branch --</option>
                                    {BRANCHES.map(b => <option key={b.value} value={b.value}>{b.label} ({b.value})</option>)}
                                </select>
                            </div>
                            <div><label className="label">LinkedIn URL</label><input className="input-field py-1.5" value={resumeData.linkedin} onChange={e => update('linkedin', e.target.value)} /></div>
                            <div><label className="label">GitHub URL</label><input className="input-field py-1.5" value={resumeData.github} onChange={e => update('github', e.target.value)} /></div>
                        </div>
                    </fieldset>

                    {/* Objective */}
                    <fieldset>
                        <legend className="text-xs font-bold uppercase text-emerald-600 mb-2">Career Objective</legend>
                        <textarea className="input-field text-sm h-20" value={resumeData.objective} onChange={e => update('objective', e.target.value)} />
                    </fieldset>

                    {/* Education */}
                    <fieldset>
                        <div className="flex items-center justify-between mb-2">
                            <legend className="text-xs font-bold uppercase text-emerald-600">Education</legend>
                            <button type="button" onClick={() => addItem('education', emptyEducation)} className="text-xs text-emerald-600 hover:text-emerald-700 flex items-center"><Plus size={13} className="mr-1" />Add</button>
                        </div>
                        {resumeData.education.map((edu, i) => (
                            <div key={i} className="border dark:border-gray-700 rounded-lg p-3 mb-2 space-y-2 relative">
                                {i > 0 && <button type="button" onClick={() => removeItem('education', i)} className="absolute top-2 right-2 text-red-400 hover:text-red-600"><Trash2 size={14} /></button>}
                                <input placeholder="Degree / Qualification (e.g. B.Tech CSE, XII, X)" className="input-field py-1.5 text-sm" value={edu.degree} onChange={e => updateList('education', i, 'degree', e.target.value)} />
                                <input placeholder="Institution / School / College Name" className="input-field py-1.5 text-sm" value={edu.institution} onChange={e => updateList('education', i, 'institution', e.target.value)} />
                                <div className="grid grid-cols-2 gap-2">
                                    <input placeholder="Year of Passing" className="input-field py-1.5 text-sm" value={edu.year} onChange={e => updateList('education', i, 'year', e.target.value)} />
                                    <input placeholder="Percentage / CGPA" className="input-field py-1.5 text-sm" value={edu.cgpa} onChange={e => updateList('education', i, 'cgpa', e.target.value)} />
                                </div>
                            </div>
                        ))}
                    </fieldset>

                    {/* Skills */}
                    <fieldset className="space-y-2">
                        <legend className="text-xs font-bold uppercase text-emerald-600 mb-2">Skills</legend>
                        <div><label className="label">Technical Skills (comma-separated)</label><textarea className="input-field text-sm font-mono h-16" value={resumeData.technicalSkills} onChange={e => update('technicalSkills', e.target.value)} /></div>
                        <div><label className="label">Soft Skills (comma-separated)</label><input className="input-field py-1.5 text-sm" value={resumeData.softSkills} onChange={e => update('softSkills', e.target.value)} /></div>
                    </fieldset>

                    {/* Internships */}
                    <fieldset>
                        <div className="flex items-center justify-between mb-2">
                            <legend className="text-xs font-bold uppercase text-emerald-600">Internships / Experience</legend>
                            <button type="button" onClick={() => addItem('internships', emptyInternship)} className="text-xs text-emerald-600 hover:text-emerald-700 flex items-center"><Plus size={13} className="mr-1" />Add</button>
                        </div>
                        {resumeData.internships.map((int, i) => (
                            <div key={i} className="border dark:border-gray-700 rounded-lg p-3 mb-2 space-y-2 relative">
                                {i > 0 && <button type="button" onClick={() => removeItem('internships', i)} className="absolute top-2 right-2 text-red-400 hover:text-red-600"><Trash2 size={14} /></button>}
                                <div className="grid grid-cols-2 gap-2">
                                    <input placeholder="Company" className="input-field py-1.5 text-sm" value={int.company} onChange={e => updateList('internships', i, 'company', e.target.value)} />
                                    <input placeholder="Role / Designation" className="input-field py-1.5 text-sm" value={int.role} onChange={e => updateList('internships', i, 'role', e.target.value)} />
                                </div>
                                <input placeholder="Duration (e.g. May–Jul 2023)" className="input-field py-1.5 text-sm" value={int.duration} onChange={e => updateList('internships', i, 'duration', e.target.value)} />
                                <textarea placeholder="Key contributions / responsibilities" className="input-field text-sm h-16" value={int.description} onChange={e => updateList('internships', i, 'description', e.target.value)} />
                            </div>
                        ))}
                    </fieldset>

                    {/* Projects */}
                    <fieldset>
                        <div className="flex items-center justify-between mb-2">
                            <legend className="text-xs font-bold uppercase text-emerald-600">Projects</legend>
                            <button type="button" onClick={() => addItem('projects', emptyProject)} className="text-xs text-emerald-600 hover:text-emerald-700 flex items-center"><Plus size={13} className="mr-1" />Add</button>
                        </div>
                        {resumeData.projects.map((proj, i) => (
                            <div key={i} className="border dark:border-gray-700 rounded-lg p-3 mb-2 space-y-2 relative">
                                {i > 0 && <button type="button" onClick={() => removeItem('projects', i)} className="absolute top-2 right-2 text-red-400 hover:text-red-600"><Trash2 size={14} /></button>}
                                <input placeholder="Project Title" className="input-field py-1.5 text-sm" value={proj.title} onChange={e => updateList('projects', i, 'title', e.target.value)} />
                                <input placeholder="Tech Stack (e.g. React, Python)" className="input-field py-1.5 text-sm" value={proj.tech} onChange={e => updateList('projects', i, 'tech', e.target.value)} />
                                <textarea placeholder="Description & impact" className="input-field text-sm h-16" value={proj.description} onChange={e => updateList('projects', i, 'description', e.target.value)} />
                            </div>
                        ))}
                    </fieldset>

                    {/* Certifications */}
                    <fieldset>
                        <div className="flex items-center justify-between mb-2">
                            <legend className="text-xs font-bold uppercase text-emerald-600">Certifications</legend>
                            <button type="button" onClick={() => addItem('certifications', emptyCertification)} className="text-xs text-emerald-600 hover:text-emerald-700 flex items-center"><Plus size={13} className="mr-1" />Add</button>
                        </div>
                        {resumeData.certifications.map((cert, i) => (
                            <div key={i} className="border dark:border-gray-700 rounded-lg p-3 mb-3 space-y-2 relative">
                                {i > 0 && <button type="button" onClick={() => removeItem('certifications', i)} className="absolute top-2 right-2 text-red-400 hover:text-red-600"><Trash2 size={14} /></button>}
                                <input
                                    placeholder="Certificate name & issuer (e.g. AWS Cloud Practitioner – Amazon)"
                                    className="input-field py-1.5 text-sm"
                                    value={cert.name}
                                    onChange={e => updateList('certifications', i, 'name', e.target.value)}
                                />
                                <textarea
                                    placeholder="Short description (e.g. Covered cloud fundamentals, S3, EC2, IAM...)"
                                    className="input-field text-sm h-16"
                                    value={cert.description}
                                    onChange={e => updateList('certifications', i, 'description', e.target.value)}
                                />
                                <div>
                                    <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">📎 Attach Certificate PDF <span className="text-gray-400">(optional)</span></label>
                                    <input
                                        type="file"
                                        accept="application/pdf"
                                        className="block w-full text-xs text-gray-500 file:mr-3 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-medium file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 dark:file:bg-emerald-900/30 dark:file:text-emerald-400 cursor-pointer"
                                        onChange={e => {
                                            const file = e.target.files[0];
                                            if (file) {
                                                updateList('certifications', i, 'pdfName', file.name);
                                                updateList('certifications', i, 'pdfUrl', URL.createObjectURL(file));
                                            }
                                        }}
                                    />
                                    {cert.pdfName && (
                                        <div className="mt-1.5 inline-flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 text-xs px-2 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
                                            📄 {cert.pdfName}
                                            <button type="button" onClick={() => { updateList('certifications', i, 'pdfName', ''); updateList('certifications', i, 'pdfUrl', ''); }} className="ml-1 text-red-400 hover:text-red-600">✕</button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </fieldset>

                    {/* Achievements */}
                    <fieldset>
                        <div className="flex items-center justify-between mb-2">
                            <legend className="text-xs font-bold uppercase text-emerald-600">Achievements & Activities</legend>
                            <button type="button" onClick={() => update('achievements', [...resumeData.achievements, ''])} className="text-xs text-emerald-600 hover:text-emerald-700 flex items-center"><Plus size={13} className="mr-1" />Add</button>
                        </div>
                        {resumeData.achievements.map((ach, i) => (
                            <div key={i} className="flex gap-2 mb-2">
                                <input placeholder="Achievement / Award / Activity" className="input-field py-1.5 text-sm flex-1" value={ach} onChange={e => updateStrList('achievements', i, e.target.value)} />
                                {i > 0 && <button type="button" onClick={() => removeItem('achievements', i)} className="text-red-400 hover:text-red-600"><Trash2 size={14} /></button>}
                            </div>
                        ))}
                    </fieldset>

                    {/* Languages */}
                    <fieldset>
                        <legend className="text-xs font-bold uppercase text-emerald-600 mb-2">Languages Known</legend>
                        <input className="input-field py-1.5 text-sm" value={resumeData.languages} onChange={e => update('languages', e.target.value)} placeholder="English (Fluent), Tamil (Native)..." />
                    </fieldset>

                    {/* Actions */}
                    <div className="flex space-x-3 pt-4 border-t dark:border-gray-800">
                        <button onClick={handleScore} disabled={loading} className="flex-1 btn-secondary border-emerald-500 text-emerald-700 dark:text-emerald-400 flex justify-center items-center font-bold">
                            <BrainCircuit size={18} className="mr-2" />{loading ? 'Scoring...' : 'AI Review'}
                        </button>
                        <button onClick={handleDownload} className="flex-1 btn-primary bg-emerald-600 hover:bg-emerald-700 flex justify-center items-center">
                            <Download size={18} className="mr-2" /> Download PDF
                        </button>
                    </div>

                    {score && (
                        <div className={`p-4 rounded-lg border ${score.score > 70 ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800' : 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800'}`}>
                            <h3 className="font-bold text-gray-800 dark:text-gray-200 flex items-center mb-2">
                                <Star className="text-yellow-500 mr-2" size={18} fill="currentColor" /> ATS Score: {score.score}/100
                            </h3>
                            <ul className="text-sm space-y-1">
                                {score.feedback.length === 0 && <li className="text-green-600 dark:text-green-400 flex items-center"><CheckCircle size={14} className="mr-1" /> Looks perfect!</li>}
                                {score.feedback.map((f, i) => <li key={i} className="text-gray-700 dark:text-gray-300 list-disc ml-4">{f}</li>)}
                            </ul>
                        </div>
                    )}
                </div>

                {/* ── A4 PREVIEW ── */}
                <div className="flex justify-center bg-gray-200 dark:bg-gray-800 rounded-xl p-4 sm:p-6 overflow-auto">
                    <div id="resume-preview-container" className="bg-white w-full max-w-[210mm] shadow-2xl text-black" style={{ fontFamily: 'Arial, sans-serif', fontSize: '11px', padding: '28px 32px', minHeight: '297mm' }}>

                        {/* Header */}
                        <div className="text-center border-b-2 border-gray-900 pb-3 mb-4">
                            <h1 style={{ fontSize: '22px', fontWeight: 'bold', letterSpacing: '2px', textTransform: 'uppercase', margin: 0 }}>{resumeData.name}</h1>
                            <div style={{ fontSize: '10px', color: '#555', marginTop: '4px', lineHeight: '1.6' }}>
                                {resumeData.phone} | {resumeData.email} | {resumeData.address}
                            </div>
                            <div style={{ fontSize: '10px', color: '#555' }}>
                                {resumeData.linkedin} | {resumeData.github}
                            </div>
                        </div>

                        {/* Objective */}
                        {resumeData.objective && (
                            <div style={{ marginBottom: '12px' }}>
                                <SectionHeader label="Career Objective" />
                                <p style={{ color: '#444', lineHeight: '1.5' }}>{resumeData.objective}</p>
                            </div>
                        )}

                        {/* Education */}
                        <div style={{ marginBottom: '12px' }}>
                            <SectionHeader label="Education" />
                            {resumeData.education.map((edu, i) => (
                                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                    <div>
                                        <span style={{ fontWeight: 'bold' }}>{edu.degree}</span>
                                        {edu.institution && <span style={{ color: '#555' }}> — {edu.institution}</span>}
                                    </div>
                                    <span style={{ color: '#555', whiteSpace: 'nowrap', marginLeft: '8px' }}>{edu.cgpa} | {edu.year}</span>
                                </div>
                            ))}
                        </div>

                        {/* Skills */}
                        <div style={{ marginBottom: '12px' }}>
                            <SectionHeader label="Technical Skills" />
                            <p style={{ color: '#444', lineHeight: '1.6' }}>{resumeData.technicalSkills.split(',').map(s => s.trim()).join(' • ')}</p>
                            {resumeData.softSkills && <p style={{ color: '#555', marginTop: '4px' }}><strong>Soft Skills: </strong>{resumeData.softSkills}</p>}
                        </div>

                        {/* Internships */}
                        {resumeData.internships.length > 0 && (
                            <div style={{ marginBottom: '12px' }}>
                                <SectionHeader label="Internships & Experience" />
                                {resumeData.internships.map((int, i) => (
                                    <div key={i} style={{ marginBottom: '8px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <span style={{ fontWeight: 'bold' }}>{int.role}{int.company ? ` — ${int.company}` : ''}</span>
                                            <span style={{ color: '#666', fontSize: '10px' }}>{int.duration}</span>
                                        </div>
                                        {int.description && <p style={{ color: '#555', marginTop: '2px', lineHeight: '1.5' }}>• {int.description}</p>}
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Projects */}
                        {resumeData.projects.length > 0 && (
                            <div style={{ marginBottom: '12px' }}>
                                <SectionHeader label="Key Projects" />
                                {resumeData.projects.map((proj, i) => (
                                    <div key={i} style={{ marginBottom: '8px' }}>
                                        <span style={{ fontWeight: 'bold' }}>{proj.title}</span>
                                        {proj.tech && <span style={{ color: '#555', fontStyle: 'italic' }}> | {proj.tech}</span>}
                                        {proj.description && <p style={{ color: '#555', marginTop: '2px', lineHeight: '1.5' }}>• {proj.description}</p>}
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Certifications */}
                        {resumeData.certifications.some(c => c.name) && (
                            <div style={{ marginBottom: '12px' }}>
                                <SectionHeader label="Certifications" />
                                {resumeData.certifications.filter(c => c.name).map((cert, i) => (
                                    <div key={i} style={{ color: '#444', marginBottom: '4px' }}>
                                        <span style={{ fontWeight: 'bold' }}>• {cert.name}</span>
                                        {cert.description && <span style={{ color: '#666', fontStyle: 'italic' }}> — {cert.description}</span>}
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Achievements */}
                        {resumeData.achievements.some(a => a) && (
                            <div style={{ marginBottom: '12px' }}>
                                <SectionHeader label="Achievements & Extracurriculars" />
                                {resumeData.achievements.filter(a => a).map((ach, i) => (
                                    <div key={i} style={{ color: '#444', marginBottom: '3px' }}>• {ach}</div>
                                ))}
                            </div>
                        )}

                        {/* Languages */}
                        {resumeData.languages && (
                            <div style={{ marginBottom: '12px' }}>
                                <SectionHeader label="Languages" />
                                <p style={{ color: '#444' }}>{resumeData.languages}</p>
                            </div>
                        )}

                        <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '9px', color: '#aaa' }}>Generated via PlacementPro AI Resume Wizard</div>
                    </div>
                </div>

            </div>
        </div>
    );
};

// Add a label helper class
const style = document.createElement('style');
style.textContent = '.label { display: block; font-size: 0.75rem; font-weight: 500; margin-bottom: 0.25rem; }';
document.head.appendChild(style);

export default ResumeWizard;
