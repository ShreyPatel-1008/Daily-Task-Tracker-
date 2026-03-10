import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Menu, Sun, Moon } from 'lucide-react';
import Sidebar from './Sidebar';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

const PAGE_TITLES = {
    '/': 'Dashboard',
    '/tasks': 'Tasks',
    '/analytics': 'Analytics',
    '/calendar': 'Calendar',
    '/notes': 'Notes',
};

const Layout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const location = useLocation();
    const { user } = useAuth();
    const { theme, toggleTheme } = useTheme();

    const currentTitle = PAGE_TITLES[location.pathname] || 'TaskFlow';

    return (
        <div className={`app-layout ${isSidebarOpen ? 'sidebar-open' : ''}`}>
            <Sidebar isOpen={isSidebarOpen} />
            <main className="main-content">
                <header className="topbar">
                    <div className="topbar-left">
                        <button
                            type="button"
                            className="btn btn-ghost btn-icon topbar-menu"
                            onClick={() => setIsSidebarOpen((open) => !open)}
                            aria-label="Toggle navigation"
                        >
                            <Menu size={18} />
                        </button>
                        <div>
                            <div className="topbar-title">{currentTitle}</div>
                            <div className="topbar-subtitle">Stay on top of your work</div>
                        </div>
                    </div>
                    <div className="topbar-right">
                        <button
                            type="button"
                            className="theme-toggle-btn"
                            onClick={toggleTheme}
                            aria-label="Toggle theme"
                        >
                            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                        </button>
                        {user && (
                            <div className="topbar-user">
                                <div className="topbar-user-avatar">
                                    {user.name?.charAt(0).toUpperCase()}
                                </div>
                                <div className="topbar-user-info">
                                    <div className="topbar-user-name">{user.name}</div>
                                    <div className="topbar-user-email">{user.email}</div>
                                </div>
                            </div>
                        )}
                    </div>
                </header>
                <div className="main-scroll">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default Layout;
