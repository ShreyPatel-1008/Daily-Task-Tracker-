import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import {
    LayoutDashboard, CheckSquare, BarChart3, Calendar,
    LogOut, Sun, Moon, Flame, Clock, StickyNote
} from 'lucide-react';

const Sidebar = () => {
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navItems = [
        { path: '/', icon: <LayoutDashboard />, label: 'Dashboard' },
        { path: '/tasks', icon: <CheckSquare />, label: 'Tasks' },
        { path: '/notes', icon: <StickyNote />, label: 'Notes' },
        { path: '/analytics', icon: <BarChart3 />, label: 'Analytics' },
        { path: '/calendar', icon: <Calendar />, label: 'Calendar' },
    ];

    return (
        <aside className="sidebar">
            <div className="sidebar-logo">
                <div className="sidebar-logo-icon">⚡</div>
                <h1>TaskFlow</h1>
            </div>

            <nav className="sidebar-nav">
                <span className="sidebar-section-title">Main Menu</span>
                {navItems.map(item => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                        end={item.path === '/'}
                    >
                        {item.icon}
                        <span>{item.label}</span>
                    </NavLink>
                ))}

                <span className="sidebar-section-title" style={{ marginTop: 'auto' }}>Settings</span>
                <button className="sidebar-link" onClick={toggleTheme}>
                    {theme === 'dark' ? <Sun /> : <Moon />}
                    <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
                </button>
                <button className="sidebar-link" onClick={handleLogout}>
                    <LogOut />
                    <span>Logout</span>
                </button>
            </nav>

            {user && (
                <div className="sidebar-user">
                    <div className="sidebar-user-avatar">
                        {user.name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="sidebar-user-info">
                        <div className="sidebar-user-name">{user.name}</div>
                        <div className="sidebar-user-email">{user.email}</div>
                    </div>
                </div>
            )}
        </aside>
    );
};

export default Sidebar;
