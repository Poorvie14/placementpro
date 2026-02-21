import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Target, CheckCircle2, CircleDashed, Users, CheckSquare, XCircle } from 'lucide-react';

const ApplicationTracker = () => {
    const [apps, setApps] = useState([]);

    useEffect(() => {
        fetchApps();
    }, []);

    const fetchApps = async () => {
        try {
            const res = await api.get('/drives/applications');
            setApps(res.data);
        } catch (e) {
            console.error(e);
        }
    };

    const STATUS_FLOW = ["Applied", "Aptitude", "Cleared", "Interview Scheduled", "Selected"];

    const getStepIndex = (status) => {
        if (status === "Rejected") return -1;
        return STATUS_FLOW.indexOf(status);
    };

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold dark:text-white flex items-center">
                <Target className="mr-3 text-primary-600" /> Application Tracker
            </h1>

            {apps.length === 0 ? (
                <div className="card text-center py-12 text-gray-500 dark:text-gray-400">
                    You haven't applied to any drives yet.
                </div>
            ) : (
                <div className="space-y-6">
                    {apps.map(app => {
                        const currentStep = getStepIndex(app.status);
                        const isRejected = app.status === "Rejected";

                        return (
                            <div key={app.id} className="card p-6">
                                <div className="flex justify-between items-center mb-6">
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">{app.company_name}</h2>
                                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{app.role}</p>
                                    </div>
                                    {isRejected ? (
                                        <span className="bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300 px-3 py-1 rounded-full text-sm font-semibold flex items-center border border-red-200 dark:border-red-800">
                                            <XCircle size={14} className="mr-1" /> Application Rejected
                                        </span>
                                    ) : currentStep === STATUS_FLOW.length - 1 ? (
                                        <span className="bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300 px-3 py-1 rounded-full text-sm font-semibold flex items-center border border-green-200 dark:border-green-800">
                                            <CheckCircle2 size={14} className="mr-1" /> Selected!
                                        </span>
                                    ) : (
                                        <span className="bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300 px-3 py-1 rounded-full text-sm font-semibold border border-blue-200 dark:border-blue-800">
                                            In Progress
                                        </span>
                                    )}
                                </div>

                                {!isRejected && (
                                    <div className="relative">
                                        <div className="overflow-hidden h-2 mb-4 text-xs flex rounded-full bg-gray-200 dark:bg-gray-700">
                                            <div style={{ width: `${Math.max(10, ((currentStep + 1) / STATUS_FLOW.length) * 100)}%` }}
                                                className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-gradient-to-r from-primary-500 to-indigo-500 transition-all duration-500">
                                            </div>
                                        </div>

                                        <div className="flex justify-between items-center w-full px-2">
                                            {STATUS_FLOW.map((step, index) => {
                                                const isCompleted = currentStep >= index;
                                                const isCurrent = currentStep === index;
                                                return (
                                                    <div key={step} className="flex flex-col items-center">
                                                        <div className={`
                              flex items-center justify-center w-8 h-8 rounded-full mb-2 z-10 transition-colors duration-300
                              ${isCompleted ? 'bg-primary-600 text-white shadow-md shadow-primary-500/30' : 'bg-gray-200 text-gray-400 dark:bg-gray-700 dark:text-gray-500'}
                              ${isCurrent ? 'ring-4 ring-primary-100 dark:ring-primary-900/30' : ''}
                            `}>
                                                            {isCompleted ? <CheckCircle2 size={16} /> : <CircleDashed size={16} />}
                                                        </div>
                                                        <span className={`text-xs font-medium text-center max-w-20 ${isCompleted ? 'text-gray-900 dark:text-gray-200' : 'text-gray-400 dark:text-gray-600'}`}>
                                                            {step}
                                                        </span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default ApplicationTracker;
