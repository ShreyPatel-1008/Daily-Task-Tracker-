import { useState, useEffect, useCallback } from 'react';
import { useTask } from '../context/TaskContext';
import TaskCard from '../components/tasks/TaskCard';
import TaskModal from '../components/tasks/TaskModal';
import { Plus, Search, Filter, ListFilter } from 'lucide-react';
import { getStatusLabel, STATUSES, PRIORITIES, CATEGORIES } from '../utils/helpers';

const Tasks = () => {
    const { tasks, loading, fetchTasks, createTask, updateTask, deleteTask, fetchCategories } = useTask();
    const [showModal, setShowModal] = useState(false);
    const [editingTask, setEditingTask] = useState(null);
    const [search, setSearch] = useState('');
    const [filters, setFilters] = useState({ status: '', priority: '', category: '' });
    const [showFilters, setShowFilters] = useState(false);

    const loadTasks = useCallback(() => {
        const params = { search: search || undefined };
        if (filters.status) params.status = filters.status;
        if (filters.priority) params.priority = filters.priority;
        if (filters.category) params.category = filters.category;
        fetchTasks(params);
    }, [fetchTasks, search, filters]);

    useEffect(() => {
        loadTasks();
        fetchCategories();
    }, [loadTasks, fetchCategories]);

    const handleCreateTask = async (data) => {
        await createTask(data);
    };

    const handleUpdateTask = async (data) => {
        await updateTask(editingTask._id, data);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this task?')) {
            await deleteTask(id);
        }
    };

    const handleEdit = (task) => {
        setEditingTask(task);
        setShowModal(true);
    };

    const clearFilters = () => {
        setFilters({ status: '', priority: '', category: '' });
        setSearch('');
    };

    const hasActiveFilters = filters.status || filters.priority || filters.category || search;

    return (
        <div className="page-container">
            <div className="page-header">
                <div>
                    <h1>Tasks</h1>
                    <p className="page-header-subtitle">Manage and track all your tasks</p>
                </div>
                <button id="create-task-btn" className="btn btn-primary" onClick={() => {
                    setEditingTask(null);
                    setShowModal(true);
                }}>
                    <Plus size={18} />
                    New Task
                </button>
            </div>

            {/* Search & Filters */}
            <div style={{ display: 'flex', gap: 'var(--space-4)', marginBottom: 'var(--space-6)', flexWrap: 'wrap', alignItems: 'center' }}>
                <div className="search-bar" style={{ flex: '1', minWidth: '250px' }}>
                    <Search size={18} />
                    <input
                        id="task-search"
                        type="text"
                        placeholder="Search tasks..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
                <button className={`btn ${showFilters ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setShowFilters(!showFilters)}>
                    <ListFilter size={16} />
                    Filters
                </button>
                {hasActiveFilters && (
                    <button className="btn btn-ghost" onClick={clearFilters}>Clear all</button>
                )}
            </div>

            {showFilters && (
                <div className="filters-bar" style={{ marginBottom: 'var(--space-6)', animation: 'fadeInUp 0.2s ease' }}>
                    <select className="form-select" value={filters.status}
                        onChange={e => setFilters(prev => ({ ...prev, status: e.target.value }))}
                        style={{ width: 'auto', minWidth: '140px' }}>
                        <option value="">All Statuses</option>
                        {STATUSES.map(s => <option key={s} value={s}>{getStatusLabel(s)}</option>)}
                    </select>
                    <select className="form-select" value={filters.priority}
                        onChange={e => setFilters(prev => ({ ...prev, priority: e.target.value }))}
                        style={{ width: 'auto', minWidth: '140px' }}>
                        <option value="">All Priorities</option>
                        {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                    <select className="form-select" value={filters.category}
                        onChange={e => setFilters(prev => ({ ...prev, category: e.target.value }))}
                        style={{ width: 'auto', minWidth: '140px' }}>
                        <option value="">All Categories</option>
                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>
            )}

            {/* Status Summary Chips */}
            <div style={{ display: 'flex', gap: 'var(--space-3)', marginBottom: 'var(--space-6)', flexWrap: 'wrap' }}>
                <span className="filter-chip" onClick={() => setFilters(prev => ({ ...prev, status: '' }))}
                    style={!filters.status ? { borderColor: 'var(--accent-primary)', color: 'var(--accent-primary-light)', background: 'rgba(108, 92, 231, 0.1)' } : {}}>
                    All ({tasks.length})
                </span>
                {STATUSES.map(s => {
                    const count = tasks.filter(t => t.status === s).length;
                    return (
                        <span key={s} className={`filter-chip ${filters.status === s ? 'active' : ''}`}
                            onClick={() => setFilters(prev => ({ ...prev, status: prev.status === s ? '' : s }))}>
                            {getStatusLabel(s)} ({count})
                        </span>
                    );
                })}
            </div>

            {/* Task List */}
            {loading ? (
                <div className="loading-spinner"><div className="spinner" /></div>
            ) : tasks.length > 0 ? (
                <div className="task-list">
                    {tasks.map(task => (
                        <TaskCard key={task._id} task={task} onEdit={handleEdit} onDelete={handleDelete} />
                    ))}
                </div>
            ) : (
                <div className="empty-state">
                    <div className="empty-state-icon">📋</div>
                    <h3 className="empty-state-title">No tasks found</h3>
                    <p className="empty-state-text">
                        {hasActiveFilters
                            ? 'Try adjusting your filters or search query'
                            : 'Create your first task to get started on your productivity journey!'}
                    </p>
                    {!hasActiveFilters && (
                        <button className="btn btn-primary" onClick={() => { setEditingTask(null); setShowModal(true); }}>
                            <Plus size={18} /> Create Task
                        </button>
                    )}
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <TaskModal
                    task={editingTask}
                    onClose={() => { setShowModal(false); setEditingTask(null); }}
                    onSave={editingTask ? handleUpdateTask : handleCreateTask}
                />
            )}
        </div>
    );
};

export default Tasks;
