import { useState, useEffect } from 'react';
import API from '../utils/api';
import { ChevronLeft, ChevronRight, CheckCircle, Circle, Clock, RefreshCw } from 'lucide-react';
import { getStatusClass, getStatusLabel, getPriorityClass } from '../utils/helpers';

const CalendarView = () => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [tasks, setTasks] = useState([]);
    const [dailyHistory, setDailyHistory] = useState([]);
    const [selectedDay, setSelectedDay] = useState(new Date().getDate());
    const [loading, setLoading] = useState(true);

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [tasksRes, historyRes] = await Promise.all([
                    API.get('/tasks', { params: { limit: 500 } }),
                    API.get('/tasks/daily-history', {
                        params: { days: 60 }
                    }).catch(() => ({ data: { history: [] } }))
                ]);
                setTasks(tasksRes.data.tasks);
                // Flatten grouped history into individual task records
                const grouped = historyRes.data.history || [];
                const flat = [];
                grouped.forEach(group => {
                    (group.tasks || []).forEach(t => {
                        flat.push({ ...t, date: group.date });
                    });
                });
                setDailyHistory(flat);
            } catch (err) { console.error(err); }
            finally { setLoading(false); }
        };
        fetchData();
    }, [year, month]);

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

    const today = new Date();
    const todayDay = today.getDate();
    const isCurrentMonth = today.getMonth() === month && today.getFullYear() === year;
    const isToday = (day) => day && isCurrentMonth && todayDay === day;

    const isFutureDay = (day) => {
        if (!day) return false;
        const dayDate = new Date(year, month, day);
        const todayStart = new Date(today);
        todayStart.setHours(0, 0, 0, 0);
        return dayDate > todayStart;
    };

    const isPastDay = (day) => {
        if (!day) return false;
        const dayDate = new Date(year, month, day);
        const todayStart = new Date(today);
        todayStart.setHours(0, 0, 0, 0);
        return dayDate < todayStart;
    };

    // For today: show all daily tasks with current status
    // For past days: show DailyHistory data
    // For future days: show daily tasks as "upcoming"
    const getTasksForDay = (day) => {
        if (!day) return [];
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

        if (isToday(day)) {
            // Today: show all daily tasks with their current live status
            return tasks.filter(t => t.isDaily).map(t => ({
                _id: t._id,
                title: t.title,
                status: t.status,
                priority: t.priority,
                category: t.category,
                isLive: true
            }));
        } else if (isPastDay(day)) {
            // Past: show from DailyHistory
            return dailyHistory
                .filter(h => {
                    const histDate = h.date?.split('T')[0];
                    return histDate === dateStr;
                })
                .map(h => ({
                    _id: h._id,
                    title: h.taskTitle,
                    status: h.wasCompleted ? 'COMPLETED' : h.status || 'NOT_STARTED',
                    category: h.category,
                    priority: 'MEDIUM',
                    isHistory: true
                }));
        } else if (isFutureDay(day)) {
            // Future: show daily tasks as upcoming / not started
            return tasks.filter(t => t.isDaily).map(t => ({
                _id: t._id,
                title: t.title,
                status: 'NOT_STARTED',
                priority: t.priority,
                category: t.category,
                isFuture: true
            }));
        }

        return [];
    };

    // Count tasks that have dots on the calendar
    const getTaskCountForDay = (day) => {
        return getTasksForDay(day).length;
    };

    // Completion percentage for a day
    const getCompletionForDay = (day) => {
        const dayTasks = getTasksForDay(day);
        if (dayTasks.length === 0) return -1;
        const completed = dayTasks.filter(t => t.status === 'COMPLETED').length;
        return Math.round((completed / dayTasks.length) * 100);
    };

    const getDotColor = (day) => {
        const pct = getCompletionForDay(day);
        if (pct === -1) return null;
        if (pct >= 80) return 'var(--color-success)';
        if (pct >= 40) return 'var(--color-warning)';
        return 'var(--color-danger)';
    };

    const days = getDaysInMonth();
    const dayTasks = selectedDay ? getTasksForDay(selectedDay) : [];
    const completion = selectedDay ? getCompletionForDay(selectedDay) : -1;

    const statusIcon = (status) => {
        if (status === 'COMPLETED') return <CheckCircle size={14} style={{ color: 'var(--color-success)' }} />;
        if (status === 'IN_PROGRESS') return <Clock size={14} style={{ color: 'var(--color-warning)' }} />;
        return <Circle size={14} style={{ color: 'var(--text-muted)' }} />;
    };

    return (
        <div className="page-container">
            <div className="page-header">
                <div>
                    <h1>Calendar</h1>
                    <p className="page-header-subtitle">Track your daily task completion over time</p>
                </div>
                {isCurrentMonth && (
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: 'var(--space-2)',
                        padding: 'var(--space-2) var(--space-4)', borderRadius: 'var(--radius-full)',
                        background: 'var(--bg-card)', border: '1px solid var(--border-color)',
                        fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)'
                    }}>
                        <RefreshCw size={14} />
                        Daily tasks reset at 4:00 AM
                    </div>
                )}
            </div>

            <div style={{ display: 'flex', gap: 'var(--space-6)', flexWrap: 'wrap' }}>
                {/* Calendar Grid */}
                <div className="card" style={{ flex: '1', minWidth: '320px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-6)' }}>
                        <button className="btn btn-ghost btn-icon" onClick={() => navigateMonth(-1)}><ChevronLeft size={18} /></button>
                        <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 700 }}>{monthNames[month]} {year}</h3>
                        <button className="btn btn-ghost btn-icon" onClick={() => navigateMonth(1)}><ChevronRight size={18} /></button>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', textAlign: 'center' }}>
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                            <div key={d} style={{ padding: 'var(--space-2)', fontSize: 'var(--font-size-xs)', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{d}</div>
                        ))}
                        {days.map((day, i) => {
                            const taskCount = day ? getTaskCountForDay(day) : 0;
                            const dotColor = getDotColor(day);
                            const selected = selectedDay === day;
                            return (
                                <div key={i} onClick={() => day && setSelectedDay(day)} style={{
                                    padding: 'var(--space-2)', minHeight: '60px', borderRadius: 'var(--radius-md)',
                                    cursor: day ? 'pointer' : 'default',
                                    background: selected ? 'rgba(108,92,231,0.15)' : isToday(day) ? 'rgba(108,92,231,0.06)' : 'transparent',
                                    border: isToday(day) ? '1.5px solid var(--accent-primary)' : selected ? '1.5px solid rgba(108,92,231,0.3)' : '1px solid transparent',
                                    transition: 'all 150ms ease',
                                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
                                    opacity: isFutureDay(day) ? 0.5 : 1
                                }}>
                                    {day && <span style={{
                                        fontSize: 'var(--font-size-sm)', fontWeight: isToday(day) ? 700 : 400,
                                        color: isToday(day) ? 'var(--accent-primary-light)' : 'var(--text-primary)'
                                    }}>{day}</span>}
                                    {taskCount > 0 && dotColor && !isFutureDay(day) && (
                                        <div style={{
                                            width: '8px', height: '8px', borderRadius: '50%',
                                            background: dotColor, transition: 'all 200ms ease'
                                        }} />
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {/* Legend */}
                    <div style={{ display: 'flex', gap: 'var(--space-4)', justifyContent: 'center', marginTop: 'var(--space-5)', fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--color-success)', display: 'inline-block' }} /> 80%+</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--color-warning)', display: 'inline-block' }} /> 40-79%</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--color-danger)', display: 'inline-block' }} /> &lt;40%</span>
                    </div>
                </div>

                {/* Selected Day Panel */}
                <div style={{ flex: '0 0 360px', minWidth: '300px' }}>
                    <div className="card" style={{ position: 'sticky', top: 'calc(var(--header-height) + var(--space-4))' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-4)' }}>
                            <h3 style={{ fontSize: 'var(--font-size-base)', fontWeight: 700 }}>
                                {selectedDay ? `${monthNames[month]} ${selectedDay}, ${year}` : 'Select a day'}
                            </h3>
                            {selectedDay && isToday(selectedDay) && (
                                <span style={{
                                    fontSize: 'var(--font-size-xs)', padding: '2px 8px',
                                    borderRadius: 'var(--radius-full)', background: 'var(--accent-primary)',
                                    color: 'var(--text-inverse)', fontWeight: 600
                                }}>Today</span>
                            )}
                        </div>

                        {/* Completion bar */}
                        {selectedDay && dayTasks.length > 0 && (
                            <div style={{ marginBottom: 'var(--space-4)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', marginBottom: '4px' }}>
                                    <span>{dayTasks.filter(t => t.status === 'COMPLETED').length} / {dayTasks.length} completed</span>
                                    <span>{completion}%</span>
                                </div>
                                <div style={{ width: '100%', height: 6, background: 'var(--border-color)', borderRadius: 'var(--radius-full)' }}>
                                    <div style={{
                                        width: `${completion}%`, height: '100%',
                                        background: completion >= 80 ? 'var(--color-success)' : completion >= 40 ? 'var(--color-warning)' : 'var(--color-danger)',
                                        borderRadius: 'var(--radius-full)', transition: 'width 0.5s ease'
                                    }} />
                                </div>
                            </div>
                        )}

                        {selectedDay ? (
                            dayTasks.length > 0 ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                                    {dayTasks.map(t => (
                                        <div key={t._id} style={{
                                            padding: 'var(--space-3) var(--space-4)', background: 'var(--bg-input)',
                                            borderRadius: 'var(--radius-md)',
                                            borderLeft: `3px solid ${t.status === 'COMPLETED' ? 'var(--color-success)' : t.status === 'IN_PROGRESS' ? 'var(--color-warning)' : 'var(--border-color)'}`,
                                            display: 'flex', alignItems: 'center', gap: 'var(--space-3)',
                                            opacity: t.isFuture ? 0.6 : 1,
                                            transition: 'all 150ms ease'
                                        }}>
                                            {statusIcon(t.status)}
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div style={{
                                                    fontSize: 'var(--font-size-sm)', fontWeight: 600,
                                                    textDecoration: t.status === 'COMPLETED' ? 'line-through' : 'none',
                                                    color: t.status === 'COMPLETED' ? 'var(--text-muted)' : 'var(--text-primary)',
                                                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
                                                }}>{t.title}</div>
                                                {t.category && (
                                                    <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>{t.category}</div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)', textAlign: 'center', padding: 'var(--space-6) 0' }}>
                                    {isPastDay(selectedDay) ? 'No history recorded for this day' : 'No daily tasks set up yet'}
                                </p>
                            )
                        ) : (
                            <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)', textAlign: 'center', padding: 'var(--space-6) 0' }}>
                                Click on a day to view tasks
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CalendarView;
