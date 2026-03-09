import { useState, useEffect, useRef } from 'react';
import { Edit2, Trash2, Play, Square, Clock, Calendar as CalIcon, Tag, RefreshCw } from 'lucide-react';
import { useTask } from '../../context/TaskContext';
import { formatDate, getStatusLabel, getStatusClass, getPriorityClass, formatTime, isOverdue } from '../../utils/helpers';

const TaskCard = ({ task, onEdit, onDelete }) => {
    const { updateTaskStatus, startTimer, stopTimer } = useTask();
    const [timerRunning, setTimerRunning] = useState(false);
    const [elapsed, setElapsed] = useState(0);
    const timerRef = useRef(null);

    useEffect(() => {
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, []);

    const handleStatusChange = async (newStatus) => {
        try {
            await updateTaskStatus(task._id, newStatus);
        } catch (err) {
            console.error('Failed to update status:', err);
        }
    };

    const handleTimerToggle = async () => {
        try {
            if (timerRunning) {
                await stopTimer(task._id);
                clearInterval(timerRef.current);
                setTimerRunning(false);
            } else {
                await startTimer(task._id);
                setTimerRunning(true);
                setElapsed(0);
                timerRef.current = setInterval(() => {
                    setElapsed(prev => prev + 1);
                }, 1000);
            }
        } catch (err) {
            console.error('Timer error:', err);
        }
    };

    const statusOptions = ['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED'];
    const overdue = isOverdue(task.dueDate, task.status);

    return (
        <div className={`task-card priority-${getPriorityClass(task.priority)}`}
            style={{ animationDelay: `${Math.random() * 0.2}s` }}>
            <div className="task-card-header">
                <h3 className={`task-card-title ${task.status === 'COMPLETED' ? 'completed' : ''}`}>
                    {task.title}
                </h3>
                <div className="task-card-actions">
                    <button className="btn btn-ghost btn-icon btn-sm" onClick={handleTimerToggle}
                        title={timerRunning ? 'Stop Timer' : 'Start Timer'}>
                        {timerRunning ? <Square size={14} /> : <Play size={14} />}
                    </button>
                    <button className="btn btn-ghost btn-icon btn-sm" onClick={() => onEdit(task)}>
                        <Edit2 size={14} />
                    </button>
                    <button className="btn btn-ghost btn-icon btn-sm" onClick={() => onDelete(task._id)}
                        style={{ color: 'var(--color-danger)' }}>
                        <Trash2 size={14} />
                    </button>
                </div>
            </div>

            {task.description && (
                <p className="task-card-body">{task.description}</p>
            )}

            <div className="task-card-footer">
                <div className="task-card-meta">
                    <select
                        className="status-badge-select"
                        value={task.status}
                        onChange={(e) => handleStatusChange(e.target.value)}
                        style={{
                            background: 'var(--bg-input)',
                            border: '1px solid var(--border-color)',
                            borderRadius: 'var(--radius-full)',
                            padding: '2px 8px',
                            fontSize: 'var(--font-size-xs)',
                            color: 'var(--text-primary)',
                            fontWeight: 600,
                            cursor: 'pointer',
                            fontFamily: 'var(--font-family)',
                            outline: 'none'
                        }}
                    >
                        {statusOptions.map(s => (
                            <option key={s} value={s}>{getStatusLabel(s)}</option>
                        ))}
                    </select>

                    <span className={`priority-badge ${getPriorityClass(task.priority)}`}>
                        {task.priority}
                    </span>

                    {task.category && (
                        <span className="category-tag">
                            <Tag size={10} />
                            {task.category}
                        </span>
                    )}

                    {task.isDaily && (
                        <span style={{
                            display: 'inline-flex', alignItems: 'center', gap: '4px',
                            fontSize: 'var(--font-size-xs)', fontWeight: 600,
                            color: 'var(--accent-primary-light)',
                            background: 'rgba(108, 92, 231, 0.12)',
                            padding: '2px 8px', borderRadius: 'var(--radius-full)'
                        }}>
                            <RefreshCw size={10} /> Daily
                        </span>
                    )}
                </div>

                <div className="task-card-meta">
                    {task.dueDate && (
                        <span className={`task-card-meta-item ${overdue ? 'overdue' : ''}`}
                            style={overdue ? { color: 'var(--color-danger)' } : {}}>
                            <CalIcon size={14} />
                            {formatDate(task.dueDate)}
                        </span>
                    )}

                    {timerRunning && (
                        <span className="timer-display running">
                            <span className="timer-dot" />
                            {formatTime(elapsed)}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TaskCard;
