
import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import { useNotification } from '../../context/NotificationContext';
import { Calendar, Clock, CheckCircle2 } from 'lucide-react';

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

export const WorkerSchedule = () => {
  const { showToast } = useNotification();
  const [schedule, setSchedule] = useState({
    monday: { active: true, slots: ['09:00-13:00', '14:00-18:00'] },
    tuesday: { active: true, slots: ['09:00-13:00', '14:00-18:00'] },
    wednesday: { active: true, slots: ['09:00-13:00', '14:00-18:00'] },
    thursday: { active: true, slots: ['09:00-13:00', '14:00-18:00'] },
    friday: { active: true, slots: ['09:00-13:00', '14:00-18:00'] },
    saturday: { active: true, slots: ['09:00-13:00', '14:00-18:00'] },
    sunday: { active: false, slots: ['10:00-14:00'] },
  });

  useEffect(() => {
    API.get('/workers/me').then((res) => {
      if (res.data.success && res.data.worker.weeklySchedule) {
        setSchedule(res.data.worker.weeklySchedule);
      }
    });
  }, []);

  const toggleDay = (day) => {
    setSchedule({
      ...schedule,
      [day]: {
        ...schedule[day],
        active: !schedule[day]?.active,
      },
    });
  };

  const handleSave = async () => {
    try {
      const res = await API.patch('/workers/schedule', { weeklySchedule: schedule });
      if (res.data.success) {
        showToast('Weekly schedule updated successfully', 'success');
      }
    } catch (e) {
      showToast('Failed to save schedule', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Weekly Working Calendar</h1>
          <p className="text-xs text-slate-500 mt-0.5">Control which days and hours you appear in customer booking searches</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="divide-y divide-slate-100">
            {DAYS.map((day) => {
              const dayData = schedule[day] || { active: false, slots: [] };
              return (
                <div key={day} className="py-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={dayData.active}
                      onChange={() => toggleDay(day)}
                      className="w-4 h-4 accent-coop-600 rounded"
                    />
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 capitalize">{day}</h4>
                      <p className="text-xs text-slate-400">
                        {dayData.active ? dayData.slots?.join(' & ') : 'Off Duty'}
                      </p>
                    </div>
                  </div>

                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                    dayData.active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {dayData.active ? 'Active Available' : 'Off'}
                  </span>
                </div>
              );
            })}
          </div>

          <button
            onClick={handleSave}
            className="w-full py-3.5 bg-coop-600 hover:bg-coop-700 text-white rounded-2xl text-xs font-black shadow-lg shadow-coop-600/20"
          >
            Save Weekly Calendar
          </button>
        </div>
      </div>
    </div>
  );
};
