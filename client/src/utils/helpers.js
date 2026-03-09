export const formatDate = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });
};

export const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

export const getStatusLabel = (status) => {
    const labels = {
        'NOT_STARTED': 'Not Started',
        'IN_PROGRESS': 'In Progress',
        'COMPLETED': 'Completed'
    };
    return labels[status] || status;
};

export const getStatusClass = (status) => {
    const classes = {
        'NOT_STARTED': 'not-started',
        'IN_PROGRESS': 'in-progress',
        'COMPLETED': 'completed'
    };
    return classes[status] || '';
};

export const getPriorityClass = (priority) => {
    return priority?.toLowerCase() || 'medium';
};

export const isOverdue = (dueDate, status) => {
    if (!dueDate || status === 'COMPLETED') return false;
    return new Date(dueDate) < new Date();
};

export const getRelativeTime = (date) => {
    const now = new Date();
    const then = new Date(date);
    const diff = now - then;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return formatDate(date);
};

export const CATEGORIES = ['General', 'Work', 'Personal', 'Study', 'Fitness', 'Coding', 'Design', 'Meeting'];
export const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH'];
export const STATUSES = ['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED'];
