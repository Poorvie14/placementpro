import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Calendar as CalIcon, Clock, Users } from 'lucide-react';

const Mentorship = () => {
    const [slots, setSlots] = useState([]);
    const [formData, setFormData] = useState({
        date: '', start_time: '', duration: '30'
    });

    useEffect(() => {
        fetchSlots();
    }, []);

    const fetchSlots = async () => {
        try {
            const res = await api.get('/mentorship/');
            setSlots(res.data);
        } catch (e) {
            console.error(e);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            const start = new Date(`${formData.date}T${formData.start_time}`);
            const end = new Date(start.getTime() + parseInt(formData.duration) * 60000);

            await api.post('/mentorship/', {
                start_time: start.toISOString(),
                end_time: end.toISOString(),
            });
            alert('Mentorship slot opened successfully!');
            fetchSlots();
            setFormData({ date: '', start_time: '', duration: '30' });
        } catch (e) {
            alert('Failed to open slot');
        }
    };

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold dark:text-white flex items-center">
                <Users className="mr-3 text-green-600" /> Mentorship Scheduling
            </h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="card lg:col-span-1 shadow-md border-t-4 border-t-green-500">
                    <h2 className="text-lg font-semibold mb-4 dark:text-white">Open a New Slot</h2>
                    <form onSubmit={handleCreate} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1 dark:text-gray-300">Date</label>
                            <input required type="date" className="input-field" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1 dark:text-gray-300">Start Time</label>
                            <input required type="time" className="input-field" value={formData.start_time} onChange={e => setFormData({ ...formData, start_time: e.target.value })} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1 dark:text-gray-300">Duration</label>
                            <select required className="input-field" value={formData.duration} onChange={e => setFormData({ ...formData, duration: e.target.value })}>
                                <option value="30">30 Minutes</option>
                                <option value="45">45 Minutes</option>
                                <option value="60">1 Hour</option>
                            </select>
                        </div>
                        <button type="submit" className="w-full btn-primary bg-green-600 hover:bg-green-700 font-semibold py-2">Open Availability</button>
                    </form>
                </div>

                <div className="lg:col-span-2 space-y-4">
                    <h2 className="text-lg font-semibold dark:text-white">Your Available Slots</h2>
                    {slots.length === 0 ? (
                        <div className="text-center py-12 card text-gray-500 rounded-xl">No slots created.</div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {slots.map(slot => (
                                <div key={slot.id} className={`p-4 border rounded-xl shadow-sm flex flex-col justify-between ${slot.is_booked ? 'bg-red-50 border-red-200 dark:bg-red-900/10 dark:border-red-900/50' : 'bg-green-50 border-green-200 dark:bg-green-900/10 dark:border-green-900/50'}`}>
                                    <div className="flex items-center mb-3">
                                        <CalIcon size={18} className={`mr-2 ${slot.is_booked ? 'text-red-500' : 'text-green-500'}`} />
                                        <span className="font-semibold text-gray-900 dark:text-gray-200">
                                            {new Date(slot.start_time).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <div className="flex items-center mb-4 text-sm text-gray-600 dark:text-gray-400">
                                        <Clock size={16} className="mr-2" />
                                        {new Date(slot.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -
                                        {new Date(slot.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>

                                    <div className={`mt-auto text-center py-1.5 rounded-lg text-sm font-semibold ${slot.is_booked ? 'bg-red-200 text-red-800 dark:bg-red-900/40 dark:text-red-300' : 'bg-green-200 text-green-800 dark:bg-green-900/40 dark:text-green-300'}`}>
                                        {slot.is_booked ? "Booked by Student" : "Available to Book"}
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

export default Mentorship;
