import { useState, useEffect } from 'react';
import API from '../utils/api';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getStatusClass, getStatusLabel, getPriorityClass, formatDate } from '../utils/helpers';

const CalendarView = () => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [tasks, setTasks] = useState([]);
    const [selectedDay, setSelectedDay] = useState(null);
    const [loading, setLoading] = useState(true);

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    useEffect(() => {
        const fetchTasks = async () => {
            setLoading(true);
            try {
                const res = await API.get('/tasks', { params: { limit: 500 } });
                setTasks(res.data.tasks);
            } catch (err) { console.error(err); }
            finally { setLoading(false); }
        };
        fetchTasks();
    }, []);

    const navigateMonth = (dir) => {
        const d = new Date(currentDate);
        d.setMonth(d.getMonth() + dir);
        setCurrentDate(d);
        setSelectedDay(null);
    };

    const getDaysInMonth = () => {
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const days = [];
        for (let i = 0; i < firstDay; i++) days.push(null);
        for (let d = 1; d <= daysInMonth; d++) days.push(d);
        return days;
    };

    const getTasksForDay = (day) => {
        if (!day) return [];
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        return tasks.filter(t => {
            const created = t.createdAt?.split('T')[0];
            const due = t.dueDate?.split('T')[0];
            const completed = t.completedAt?.split('T')[0];
            return created === dateStr || due === dateStr || completed === dateStr;
        });
    };

    const days = getDaysInMonth();
    const today = new Date();
    const isToday = (day) => day && today.getDate() === day && today.getMonth() === month && today.getFullYear() === year;
    const dayTasks = selectedDay ? getTasksForDay(selectedDay) : [];

    return (
        <div className="page-container">
            <div className="page-header">
                <div><h1>Calendar</h1><p className="page-header-subtitle">View your tasks on a calendar</p></div>
            </div>

            <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                {/* Calendar Grid */}
                <div className="card" style={{ flex: '1', minWidth: '320px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                        <button className="btn btn-ghost btn-icon" onClick={() => navigateMonth(-1)}><ChevronLeft size={18} /></button>
                        <h3 style={{ fontSize: '1.125rem', fontWeight: 700 }}>{monthNames[month]} {year}</h3>
                        <button className="btn btn-ghost btn-icon" onClick={() => navigateMonth(1)}><ChevronRight size={18} /></button>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px', textAlign: 'center' }}>
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                            <div key={d} style={{ padding: '0.5rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>{d}</div>
                        ))}
                        {days.map((day, i) => {
                            const dayTaskCount = day ? getTasksForDay(day).length : 0;
                            return (
                                <div key={i} onClick={() => day && setSelectedDay(day)} style={{
                                    padding: '0.5rem', minHeight: '52px', borderRadius: '8px', cursor: day ? 'pointer' : 'default',
                                    background: selectedDay === day ? 'rgba(108,92,231,0.15)' : isToday(day) ? 'rgba(108,92,231,0.08)' : 'transparent',
                                    border: isToday(day) ? '1px solid var(--accent-primary)' : '1px solid transparent',
                                    transition: 'all 150ms ease',
                                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px'
                                }}>
                                    {day && <span style={{ fontSize: '0.875rem', fontWeight: isToday(day) ? 700 : 400, color: isToday(day) ? 'var(--accent-primary-light)' : 'var(--text-primary)' }}>{day}</span>}
                                    {dayTaskCount > 0 && <div style={{ display: 'flex', gap: '2px' }}>
                                        {dayTaskCount <= 3 ? Array.from({ length: dayTaskCount }).map((_, j) => (
                                            <div key={j} style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--accent-primary)' }} />
                                        )) : <span style={{ fontSize: '0.65rem', color: 'var(--accent-primary-light)', fontWeight: 600 }}>{dayTaskCount}</span>}
                                    </div>}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Selected Day Tasks */}
                <div style={{ flex: '0 0 340px', minWidth: '280px' }}>
                    <div className="card">
                        <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>
                            {selectedDay ? `${monthNames[month]} ${selectedDay}, ${year}` : 'Select a day'}
                        </h3>
                        {selectedDay ? (
                            dayTasks.length > 0 ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                    {dayTasks.map(t => (
                                        <div key={t._id} style={{ padding: '0.75rem', background: 'var(--bg-input)', borderRadius: '8px', borderLeft: `3px solid ${t.priority === 'HIGH' ? 'var(--color-danger)' : t.priority === 'MEDIUM' ? 'var(--color-warning)' : 'var(--color-success)'}` }}>
                                            <div style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.25rem' }}>{t.title}</div>
                                            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                                                <span className={`status-badge ${getStatusClass(t.status)}`}>
                                                    <span className="status-dot" />{getStatusLabel(t.status)}
                                                </span>
                                                <span className={`priority-badge ${getPriorityClass(t.priority)}`}>{t.priority}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>No tasks for this day</p>
                        ) : <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Click on a day to see tasks</p>}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CalendarView;
