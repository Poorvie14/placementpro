import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Target, AlertCircle } from 'lucide-react';

const StudentDrives = () => {
    const [drives, setDrives] = useState([]);
    const [profile, setProfile] = useState(null);
    const [appliedDrives, setAppliedDrives] = useState(new Set());
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [drivesRes, appsRes, profRes] = await Promise.all([
                    api.get('/drives/'),
                    api.get('/drives/applications'),
                    api.get('/students/me')
                ]);

                setProfile(profRes.data);
                setDrives(drivesRes.data);
                const appliedSet = new Set(appsRes.data.map(app => app.drive_id));
                setAppliedDrives(appliedSet);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleApply = async (driveId) => {
        try {
            await api.post(`/drives/${driveId}/apply`);
            setAppliedDrives(prev => new Set(prev).add(driveId));
            alert("Successfully applied!");
        } catch (e) {
            alert("Failed to apply. " + (e.response?.data?.detail || ""));
            console.error(e);
        }
    };

    const isEligible = (drive) => {
        if (!profile) return false;

        const studentCgpa = parseFloat(profile.cgpa);
        const studentBacklogs = parseInt(profile.backlogs);

        // Only enforce CGPA check if student has it set
        if (!isNaN(studentCgpa) && studentCgpa > 0 && studentCgpa < parseFloat(drive.min_cgpa)) return false;

        // Only enforce backlog check if student has it set
        if (!isNaN(studentBacklogs) && studentBacklogs > parseInt(drive.max_backlogs)) return false;

        // Branch check — only if drive restricts branches AND student has a branch set
        if (drive.eligible_branches && drive.eligible_branches.length > 0 && profile.branch) {
            const branchFull = profile.branch;
            const match = branchFull.match(/\(([^)]+)\)$/); // handle old "...(CSE)" format
            const branchCode = match ? match[1] : branchFull.trim();
            const eligible =
                drive.eligible_branches.includes(branchFull) ||
                drive.eligible_branches.includes(branchCode);
            if (!eligible) return false;
        }

        return true;
    };


    if (loading) return <div className="text-center p-8 dark:text-gray-300">Loading Drives...</div>;

    const eligibleDrives = drives.filter(isEligible);
    const others = drives.filter(d => !isEligible(d));

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold dark:text-white flex items-center">
                <Target className="mr-3 text-primary-600" /> Placement Drives
            </h1>

            <div className="card border-l-4 border-l-green-500 p-6">
                <h2 className="text-lg font-semibold mb-4 text-green-800 dark:text-green-400">Eligible Drives for You</h2>
                {eligibleDrives.length === 0 ? (
                    <p className="text-gray-500 dark:text-gray-400">No current drives match your eligibility criteria.</p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {eligibleDrives.map(drive => (
                            <div key={drive.id} className="border border-green-100 dark:border-green-900/50 bg-green-50/30 dark:bg-green-900/10 rounded-xl p-5 shadow-sm transition hover:shadow-md">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">{drive.company_name}</h3>
                                    <span className="bg-primary-100 text-primary-800 dark:bg-primary-900/60 dark:text-primary-300 text-xs font-semibold px-2.5 py-1 rounded-full">{drive.salary_pkg}</span>
                                </div>
                                <p className="text-gray-600 dark:text-gray-400 font-medium font-sm mb-4">{drive.role}</p>
                                <div className="text-sm text-gray-500 dark:text-gray-400 mb-4 line-clamp-2">{drive.description}</div>

                                <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-200 dark:border-gray-700">
                                    <span className="text-xs text-gray-500 dark:text-gray-400">Drive: {new Date(drive.drive_date).toLocaleDateString()}</span>
                                    {appliedDrives.has(drive.id) ? (
                                        <span className="inline-flex items-center text-sm font-semibold text-green-600 dark:text-green-400">
                                            ✓ Applied
                                        </span>
                                    ) : (
                                        <button onClick={() => handleApply(drive.id)} className="btn-primary py-1.5 text-sm">Apply Now</button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="card p-6 opacity-75">
                <h2 className="text-lg font-semibold mb-4 text-gray-700 dark:text-gray-300 flex items-center">
                    <AlertCircle className="mr-2" size={20} /> Other Active Drives (Not Eligible)
                </h2>
                {others.length === 0 ? (
                    <p className="text-gray-500 text-sm">None available.</p>
                ) : (
                    <div className="space-y-3">
                        {others.map(drive => (
                            <div key={drive.id} className="flex justify-between items-center p-4 border border-gray-200 dark:border-gray-800 rounded-lg">
                                <div>
                                    <h3 className="font-semibold text-gray-800 dark:text-gray-200">{drive.company_name} <span className="text-normal font-normal text-gray-500">({drive.role})</span></h3>
                                    <div className="text-xs text-gray-500 mt-1">Requires: {drive.min_cgpa} CGPA, Branches: {drive.eligible_branches.join(", ")}</div>
                                </div>
                                <button disabled className="bg-gray-200 text-gray-500 dark:bg-gray-800 dark:text-gray-600 px-4 py-1.5 rounded-lg text-sm font-medium cursor-not-allowed">
                                    Ineligible
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default StudentDrives;
