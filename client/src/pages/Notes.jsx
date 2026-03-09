import { useState, useEffect } from 'react';
import API from '../utils/api';
import { Plus, Pin, PinOff, Edit2, Trash2, X, Search } from 'lucide-react';
import { getRelativeTime } from '../utils/helpers';

const NOTE_COLORS = [
    { name: 'yellow', bg: '#ffeaa7', bgDark: 'rgba(255, 234, 167, 0.15)', border: 'rgba(255, 234, 167, 0.4)', text: '#2d3436' },
    { name: 'green', bg: '#55efc4', bgDark: 'rgba(85, 239, 196, 0.15)', border: 'rgba(85, 239, 196, 0.4)', text: '#2d3436' },
    { name: 'blue', bg: '#74b9ff', bgDark: 'rgba(116, 185, 255, 0.15)', border: 'rgba(116, 185, 255, 0.4)', text: '#2d3436' },
    { name: 'purple', bg: '#a29bfe', bgDark: 'rgba(162, 155, 254, 0.15)', border: 'rgba(162, 155, 254, 0.4)', text: '#2d3436' },
    { name: 'pink', bg: '#fd79a8', bgDark: 'rgba(253, 121, 168, 0.15)', border: 'rgba(253, 121, 168, 0.4)', text: '#2d3436' },
    { name: 'orange', bg: '#ffa502', bgDark: 'rgba(255, 165, 2, 0.15)', border: 'rgba(255, 165, 2, 0.4)', text: '#2d3436' },
    { name: 'red', bg: '#ff6b6b', bgDark: 'rgba(255, 107, 107, 0.15)', border: 'rgba(255, 107, 107, 0.4)', text: '#2d3436' },
    { name: 'teal', bg: '#00cec9', bgDark: 'rgba(0, 206, 201, 0.15)', border: 'rgba(0, 206, 201, 0.4)', text: '#2d3436' },
];

const getColorObj = (colorName) => NOTE_COLORS.find(c => c.name === colorName) || NOTE_COLORS[0];
const isDark = () => document.documentElement.getAttribute('data-theme') !== 'light';

const Notes = () => {
    const [notes, setNotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingNote, setEditingNote] = useState(null);
    const [search, setSearch] = useState('');

    const fetchNotes = async () => {
        try {
            const res = await API.get('/notes');
            setNotes(res.data.notes);
        } catch (err) {
            console.error('Failed to fetch notes:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchNotes(); }, []);

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this note?')) return;
        try {
            await API.delete(`/notes/${id}`);
            setNotes(prev => prev.filter(n => n._id !== id));
        } catch (err) { console.error(err); }
    };

    const handleTogglePin = async (id) => {
        try {
            const res = await API.patch(`/notes/${id}/pin`);
            setNotes(prev => prev.map(n => n._id === id ? res.data.note : n)
                .sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0)));
        } catch (err) { console.error(err); }
    };

    const handleSave = async (noteData) => {
        try {
            if (editingNote) {
                const res = await API.put(`/notes/${editingNote._id}`, noteData);
                setNotes(prev => prev.map(n => n._id === editingNote._id ? res.data.note : n));
            } else {
                const res = await API.post('/notes', noteData);
                setNotes(prev => [res.data.note, ...prev]);
            }
            setShowModal(false);
            setEditingNote(null);
        } catch (err) { throw err; }
    };

    const filtered = notes.filter(n =>
        !search || n.title?.toLowerCase().includes(search.toLowerCase()) ||
        n.content?.toLowerCase().includes(search.toLowerCase())
    );

    const pinnedNotes = filtered.filter(n => n.isPinned);
    const otherNotes = filtered.filter(n => !n.isPinned);

    return (
        <div className="page-container">
            <div className="page-header">
                <div>
                    <h1>Notes</h1>
                    <p className="page-header-subtitle">Quick notes and ideas with color coding</p>
                </div>
                <button className="btn btn-primary" onClick={() => { setEditingNote(null); setShowModal(true); }}>
                    <Plus size={18} /> New Note
                </button>
            </div>

            {/* Search */}
            <div style={{ marginBottom: 'var(--space-6)' }}>
                <div className="search-bar" style={{ maxWidth: '400px' }}>
                    <Search size={18} />
                    <input type="text" placeholder="Search notes..." value={search} onChange={e => setSearch(e.target.value)} />
                </div>
            </div>

            {loading ? (
                <div className="loading-spinner"><div className="spinner" /></div>
            ) : filtered.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-state-icon">📝</div>
                    <h3 className="empty-state-title">{search ? 'No notes found' : 'No notes yet'}</h3>
                    <p className="empty-state-text">{search ? 'Try a different search term' : 'Create your first note to capture ideas and thoughts!'}</p>
                    {!search && (
                        <button className="btn btn-primary" onClick={() => { setEditingNote(null); setShowModal(true); }}>
                            <Plus size={18} /> Create Note
                        </button>
                    )}
                </div>
            ) : (
                <>
                    {/* Pinned Notes */}
                    {pinnedNotes.length > 0 && (
                        <div style={{ marginBottom: 'var(--space-6)' }}>
                            <h3 style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                                <Pin size={14} /> Pinned
                            </h3>
                            <div className="notes-grid">
                                {pinnedNotes.map(note => (
                                    <NoteCard key={note._id} note={note} onEdit={() => { setEditingNote(note); setShowModal(true); }} onDelete={handleDelete} onTogglePin={handleTogglePin} />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Other Notes */}
                    {otherNotes.length > 0 && (
                        <div>
                            {pinnedNotes.length > 0 && (
                                <h3 style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 'var(--space-4)' }}>
                                    Others
                                </h3>
                            )}
                            <div className="notes-grid">
                                {otherNotes.map(note => (
                                    <NoteCard key={note._id} note={note} onEdit={() => { setEditingNote(note); setShowModal(true); }} onDelete={handleDelete} onTogglePin={handleTogglePin} />
                                ))}
                            </div>
                        </div>
                    )}
                </>
            )}

            {showModal && (
                <NoteModal note={editingNote} onClose={() => { setShowModal(false); setEditingNote(null); }} onSave={handleSave} />
            )}
        </div>
    );
};

/* ===== Note Card ===== */
const NoteCard = ({ note, onEdit, onDelete, onTogglePin }) => {
    const color = getColorObj(note.color);
    const dark = isDark();

    return (
        <div className="note-card" style={{
            background: dark ? color.bgDark : color.bg,
            borderColor: color.border,
            animationDelay: `${Math.random() * 0.2}s`
        }}>
            <div className="note-card-header">
                <div style={{ flex: 1 }}>
                    {note.title && <h3 className="note-card-title" style={{ color: dark ? 'var(--text-primary)' : color.text }}>{note.title}</h3>}
                </div>
                <div className="note-card-actions">
                    <button className="btn btn-ghost btn-icon btn-sm" onClick={() => onTogglePin(note._id)} title={note.isPinned ? 'Unpin' : 'Pin'}>
                        {note.isPinned ? <PinOff size={14} /> : <Pin size={14} />}
                    </button>
                    <button className="btn btn-ghost btn-icon btn-sm" onClick={() => onEdit()}>
                        <Edit2 size={14} />
                    </button>
                    <button className="btn btn-ghost btn-icon btn-sm" onClick={() => onDelete(note._id)} style={{ color: 'var(--color-danger)' }}>
                        <Trash2 size={14} />
                    </button>
                </div>
            </div>

            <p className="note-card-content" style={{ color: dark ? 'var(--text-secondary)' : color.text }}>{note.content}</p>

            <div className="note-card-footer">
                <span style={{ fontSize: 'var(--font-size-xs)', color: dark ? 'var(--text-muted)' : 'rgba(45,52,54,0.5)' }}>
                    {getRelativeTime(note.updatedAt)}
                </span>
                {note.isPinned && <Pin size={12} style={{ color: dark ? 'var(--accent-primary-light)' : color.text, opacity: 0.6 }} />}
            </div>
        </div>
    );
};

/* ===== Note Modal ===== */
const NoteModal = ({ note, onClose, onSave }) => {
    const [title, setTitle] = useState(note?.title || '');
    const [content, setContent] = useState(note?.content || '');
    const [color, setColor] = useState(note?.color || 'yellow');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!content.trim()) { setError('Note content is required'); return; }
        setLoading(true);
        try {
            await onSave({ title, content, color });
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to save note');
            setLoading(false);
        }
    };

    const selectedColor = getColorObj(color);

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '560px' }}>
                <div className="modal-header">
                    <h2 className="modal-title">{note ? 'Edit Note' : 'Create New Note'}</h2>
                    <button className="btn btn-ghost btn-icon" onClick={onClose}><X size={20} /></button>
                </div>

                {error && <div className="auth-error">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Title (optional)</label>
                        <input type="text" className="form-input" placeholder="Note title..." value={title} onChange={e => setTitle(e.target.value)} autoFocus />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Content *</label>
                        <textarea className="form-textarea" placeholder="Write your note here..." value={content} onChange={e => { setContent(e.target.value); setError(''); }}
                            style={{ minHeight: '150px', background: isDark() ? selectedColor.bgDark : selectedColor.bg + '40', borderColor: selectedColor.border }}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Color</label>
                        <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
                            {NOTE_COLORS.map(c => (
                                <button key={c.name} type="button" onClick={() => setColor(c.name)}
                                    style={{
                                        width: 36, height: 36, borderRadius: 'var(--radius-md)', background: c.bg,
                                        border: color === c.name ? '3px solid var(--accent-primary)' : '2px solid transparent',
                                        cursor: 'pointer', transition: 'all 150ms ease',
                                        transform: color === c.name ? 'scale(1.15)' : 'scale(1)',
                                        boxShadow: color === c.name ? 'var(--shadow-glow-sm)' : 'none'
                                    }}
                                    title={c.name.charAt(0).toUpperCase() + c.name.slice(1)}
                                />
                            ))}
                        </div>
                    </div>

                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? 'Saving...' : (note ? 'Update Note' : 'Create Note')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Notes;
