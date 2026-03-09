import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../utils/api';
import {
    CheckCircle, Clock, AlertCircle, BarChart3,
    TrendingUp, Flame, Target, Zap
} from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend, AreaChart, Area
} from 'recharts';

const CHART_COLORS = ['#6c5ce7', '#00cec9', '#fdcb6e', '#ff6b6b', '#a29bfe', '#55efc4'];
const STATUS_COLORS = { COMPLETED: '#00b894', IN_PROGRESS: '#fdcb6e', NOT_STARTED: '#ff6b6b' };

const Dashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState(null);
    const [weekly, setWeekly] = useState(null);
    const [streak, setStreak] = useState(null);
    const [insights, setInsights] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [statsRes, weeklyRes, streakRes, insightsRes] = await Promise.all([
                    API.get('/analytics/dashboard'),
                    API.get('/analytics/weekly'),
                    API.get('/analytics/streak'),
                    API.get('/analytics/insights')
                ]);
                setStats(statsRes.data);
                setWeekly(weeklyRes.data);
                setStreak(streakRes.data);
                setInsights(insightsRes.data.insights);
            } catch (err) {
                console.error('Dashboard data failed:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="page-container">
                <div className="loading-spinner"><div className="spinner" /></div>
            </div>
        );
    }

    const pieData = stats ? [
        { name: 'Completed', value: stats.completed, color: STATUS_COLORS.COMPLETED },
        { name: 'In Progress', value: stats.inProgress, color: STATUS_COLORS.IN_PROGRESS },
        { name: 'Not Started', value: stats.notStarted, color: STATUS_COLORS.NOT_STARTED }
    ].filter(d => d.value > 0) : [];

    const categoryData = stats?.categoryDistribution?.map(c => ({
        name: c._id, value: c.count
    })) || [];

    const CustomTooltip = ({ active, payload, label }) => {
        if (!active || !payload?.length) return null;
        return (
            <div style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                padding: '10px 14px',
                boxShadow: 'var(--shadow-md)',
                fontSize: 'var(--font-size-sm)'
            }}>
                <p style={{ fontWeight: 600, marginBottom: 4, color: 'var(--text-primary)' }}>{label}</p>
                {payload.map((p, i) => (
                    <p key={i} style={{ color: p.color, fontSize: 'var(--font-size-xs)' }}>
                        {p.name}: {p.value}
                    </p>
                ))}
            </div>
        );
    };

    return (
        <div className="page-container">
            <div className="page-header">
                <div>
                    <h1>Welcome back, {user?.name?.split(' ')[0]} 👋</h1>
                    <p className="page-header-subtitle">Here's your productivity overview</p>
                </div>
                <div style={{ display: 'flex', gap: 'var(--space-4)', alignItems: 'center' }}>
                    {streak && (
                        <div className="streak-card" style={{ padding: 'var(--space-4) var(--space-6)', display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                            <span style={{ fontSize: '1.5rem' }}>🔥</span>
                            <div>
                                <div className="streak-count" style={{ fontSize: 'var(--font-size-xl)' }}>{streak.currentStreak}</div>
                                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>Day Streak</div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Stats Grid */}
            <div className="stats-grid">
                <div className="stat-card purple" style={{ animationDelay: '0.05s' }}>
                    <div className="stat-card-header">
                        <span className="stat-card-label">Total Tasks</span>
                        <div className="stat-card-icon purple"><BarChart3 size={22} /></div>
                    </div>
                    <div className="stat-card-value">{stats?.total || 0}</div>
                    <div className="stat-card-footer">+{stats?.todayCreated || 0} created today</div>
                </div>

                <div className="stat-card green" style={{ animationDelay: '0.1s' }}>
                    <div className="stat-card-header">
                        <span className="stat-card-label">Completed</span>
                        <div className="stat-card-icon green"><CheckCircle size={22} /></div>
                    </div>
                    <div className="stat-card-value">{stats?.completed || 0}</div>
                    <div className="stat-card-footer">+{stats?.todayCompleted || 0} completed today</div>
                </div>

                <div className="stat-card orange" style={{ animationDelay: '0.15s' }}>
                    <div className="stat-card-header">
                        <span className="stat-card-label">In Progress</span>
                        <div className="stat-card-icon orange"><Clock size={22} /></div>
                    </div>
                    <div className="stat-card-value">{stats?.inProgress || 0}</div>
                </div>

                <div className="stat-card red" style={{ animationDelay: '0.2s' }}>
                    <div className="stat-card-header">
                        <span className="stat-card-label">Not Started</span>
                        <div className="stat-card-icon red"><AlertCircle size={22} /></div>
                    </div>
                    <div className="stat-card-value">{stats?.notStarted || 0}</div>
                </div>

                <div className="stat-card blue" style={{ animationDelay: '0.25s' }}>
                    <div className="stat-card-header">
                        <span className="stat-card-label">Completion Rate</span>
                        <div className="stat-card-icon blue"><Target size={22} /></div>
                    </div>
                    <div className="stat-card-value">{stats?.completionPercentage || 0}%</div>
                    <div className="stat-card-footer">
                        <div style={{
                            width: '100%', height: 4, background: 'var(--border-color)',
                            borderRadius: 'var(--radius-full)', marginTop: 4
                        }}>
                            <div style={{
                                width: `${stats?.completionPercentage || 0}%`,
                                height: '100%',
                                background: 'var(--gradient-primary)',
                                borderRadius: 'var(--radius-full)',
                                transition: 'width 1s ease'
                            }} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts */}
            <div className="charts-grid">
                {/* Weekly Bar Chart */}
                <div className="chart-card">
                    <div className="chart-card-header">
                        <h3 className="chart-card-title">Weekly Overview</h3>
                        {weekly && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                                <Zap size={16} style={{ color: 'var(--accent-primary-light)' }} />
                                <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--accent-primary-light)', fontWeight: 600 }}>
                                    Score: {weekly.productivityScore}%
                                </span>
                            </div>
                        )}
                    </div>
                    <ResponsiveContainer width="100%" height={280}>
                        <BarChart data={weekly?.weeklyData || []}>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" />
                            <XAxis dataKey="day" stroke="var(--text-muted)" fontSize={12} />
                            <YAxis stroke="var(--text-muted)" fontSize={12} />
                            <Tooltip content={<CustomTooltip />} />
                            <Bar dataKey="completed" fill="#00b894" name="Completed" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="created" fill="#6c5ce7" name="Created" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Status Distribution Pie */}
                <div className="chart-card">
                    <div className="chart-card-header">
                        <h3 className="chart-card-title">Task Status Distribution</h3>
                    </div>
                    {pieData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={280}>
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={70}
                                    outerRadius={100}
                                    dataKey="value"
                                    paddingAngle={4}
                                    stroke="none"
                                >
                                    {pieData.map((entry, i) => (
                                        <Cell key={i} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Legend
                                    verticalAlign="bottom"
                                    formatter={(value) => <span style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>{value}</span>}
                                />
                                <Tooltip content={<CustomTooltip />} />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="empty-state" style={{ padding: 'var(--space-8)' }}>
                            <p className="empty-state-text">No tasks yet. Create your first task!</p>
                        </div>
                    )}
                </div>

                {/* Weekly Trend */}
                <div className="chart-card">
                    <div className="chart-card-header">
                        <h3 className="chart-card-title">Productivity Trend</h3>
                        <TrendingUp size={18} style={{ color: 'var(--color-success)' }} />
                    </div>
                    <ResponsiveContainer width="100%" height={280}>
                        <AreaChart data={weekly?.weeklyData || []}>
                            <defs>
                                <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#6c5ce7" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#6c5ce7" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" />
                            <XAxis dataKey="day" stroke="var(--text-muted)" fontSize={12} />
                            <YAxis stroke="var(--text-muted)" fontSize={12} />
                            <Tooltip content={<CustomTooltip />} />
                            <Area
                                type="monotone"
                                dataKey="completed"
                                stroke="#6c5ce7"
                                fill="url(#colorCompleted)"
                                name="Completed"
                                strokeWidth={2}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                {/* Category Distribution */}
                <div className="chart-card">
                    <div className="chart-card-header">
                        <h3 className="chart-card-title">Categories</h3>
                    </div>
                    {categoryData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={280}>
                            <PieChart>
                                <Pie
                                    data={categoryData}
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={100}
                                    dataKey="value"
                                    paddingAngle={2}
                                    stroke="none"
                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                >
                                    {categoryData.map((entry, i) => (
                                        <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip content={<CustomTooltip />} />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="empty-state" style={{ padding: 'var(--space-8)' }}>
                            <p className="empty-state-text">No categories yet</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Insights */}
            {insights.length > 0 && (
                <div className="chart-card" style={{ marginBottom: 'var(--space-8)' }}>
                    <div className="chart-card-header">
                        <h3 className="chart-card-title">🧠 Smart Insights</h3>
                    </div>
                    <div className="insights-list">
                        {insights.map((insight, i) => (
                            <div key={i} className="insight-item" style={{ animationDelay: `${i * 0.1}s` }}>
                                <span className="insight-icon">{insight.icon}</span>
                                <span>{insight.message}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Weekly Stats */}
            {weekly && (
                <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
                    <div className="stat-card purple">
                        <div className="stat-card-header">
                            <span className="stat-card-label">Weekly Score</span>
                            <Zap size={18} style={{ color: 'var(--accent-primary-light)' }} />
                        </div>
                        <div className="stat-card-value">{weekly.productivityScore}%</div>
                    </div>
                    <div className="stat-card green">
                        <div className="stat-card-header">
                            <span className="stat-card-label">Focus Hours</span>
                            <Clock size={18} style={{ color: 'var(--color-success)' }} />
                        </div>
                        <div className="stat-card-value">{weekly.focusHours}h</div>
                    </div>
                    <div className="stat-card blue">
                        <div className="stat-card-header">
                            <span className="stat-card-label">Week Completed</span>
                            <CheckCircle size={18} style={{ color: 'var(--color-info)' }} />
                        </div>
                        <div className="stat-card-value">{weekly.weekCompleted}</div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
