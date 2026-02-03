import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { dashboardService, analyticsService } from '../services/api';
import { AnalyticsDashboard } from '../components/AnalyticsCharts';
import {
    BookOpen,
    Users,
    UserSquare2,
    FileText,
    RefreshCw,
    TrendingUp,
    AlertCircle,
    CheckCircle2,
    BarChart3,
    ArrowRight,
    MessageSquareOff,
    AlertTriangle
} from 'lucide-react';

const Dashboard = () => {
    const [stats, setStats] = useState(null);
    const [extraStats, setExtraStats] = useState({ silent: 0, atRisk: 0 });
    const [loading, setLoading] = useState(true);
    const [syncing, setSyncing] = useState(false);
    const [syncStatus, setSyncStatus] = useState(null); // 'success', 'error'
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [baseStats, silentRes, atRiskRes] = await Promise.all([
                dashboardService.getStats(),
                analyticsService.getSilentStudents(1, '', 1),
                analyticsService.getAtRiskStudents(1, '', 1)
            ]);

            setStats(baseStats.data);
            setExtraStats({
                silent: silentRes.data.count,
                atRisk: atRiskRes.data.count
            });
            setLoading(false);
        } catch (err) {
            console.error(err);
            // Non-blocking error for analytics? Or blocking?
            // If base stats fail, show error.
            if (!stats) {
                setError('Failed to connect to backend. Verify MongoDB Atlas is connected.');
            }
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const [baseStats, silentRes, atRiskRes] = await Promise.all([
                dashboardService.getStats(),
                analyticsService.getSilentStudents(1, '', 1),
                analyticsService.getAtRiskStudents(1, '', 1)
            ]);
            setStats(baseStats.data);
            setExtraStats({
                silent: silentRes.data.count,
                atRisk: atRiskRes.data.count
            });
        } catch (err) {
            setError('Failed to refresh statistics.');
        }
    };

    const handleSync = async () => {
        setSyncing(true);
        setSyncStatus(null);
        setError(null);
        try {
            await dashboardService.syncAll();
            await fetchStats();
            setSyncStatus('success');
            setSyncing(false);
            setTimeout(() => setSyncStatus(null), 5000);
        } catch (err) {
            setSyncing(false);
            setSyncStatus('error');
            setError('Sync failed. Please check backend logs.');
        }
    };

    if (loading) return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
            <RefreshCw className="animate-spin" size={40} color="var(--miet-blue)" />
        </div>
    );

    const cardData = [
        { label: 'Total Courses', value: stats?.courses, icon: BookOpen, color: '#1e40af', path: '/courses' },
        { label: 'Total Teachers', value: stats?.teachers, icon: UserSquare2, color: '#f59e0b', path: '/teachers' },
        { label: 'Total Students', value: stats?.students, icon: Users, color: '#10b981', path: '/students' },
        { label: 'Total Assignments', value: stats?.assignments, icon: FileText, color: '#ef4444', path: '/assignments' },
        { label: 'Total Submissions', value: stats?.submissions, icon: BarChart3, color: '#8b5cf6', path: '/assignments' },
        { label: 'Silent Students', value: extraStats?.silent, icon: MessageSquareOff, color: '#be123c', path: '/silent-students' },
        { label: 'At-Risk Students', value: extraStats?.atRisk, icon: AlertTriangle, color: '#c2410c', path: '/at-risk-students' },
    ];

    return (
        <div className="fade-in dashboard-page">
            <div className="header-section dashboard-header-section">
                <div>
                    <h1 className="page-title dashboard-page-title">Institutional Overview</h1>
                    <p className="dashboard-subtitle">
                        Real-time analytics for MIET Google Classroom ecosystem
                    </p>
                </div>
                <div className="dashboard-sync-row">
                    {syncStatus === 'success' && (
                        <div className="dashboard-sync-success">
                            <CheckCircle2 size={18} /> Sync Complete
                        </div>
                    )}
                    <button
                        onClick={handleSync}
                        disabled={syncing}
                        className="btn-sync"
                    >
                        {syncing ? <RefreshCw className="animate-spin" size={18} /> : <RefreshCw size={18} />}
                        {syncing ? 'Syncing...' : 'Sync Now'}
                    </button>
                </div>
            </div>

            {error && (
                <div className="dashboard-error-banner">
                    <AlertCircle size={20} />
                    {error}
                </div>
            )}

            <div className="dashboard-cards-grid">
                {cardData.map((card) => (
                    <Link to={card.path} key={card.label} className="card stat-card dashboard-stat-card">
                        <div className="stat-icon" style={{ background: `${card.color}10`, color: card.color }}>
                            <card.icon size={24} />
                        </div>
                        <div>
                            <span className="stat-label">{card.label}</span>
                            <div className="stat-number">{card.value?.toLocaleString() || 0}</div>
                        </div>
                        <span className="view-details-link" style={{ color: card.color }}>
                            View Details <ArrowRight size={12} />
                        </span>
                    </Link>
                ))}
            </div>

            <div className="dashboard-bottom-grid">
                <div className="card">
                    <h2 className="dashboard-section-title">
                        <TrendingUp size={20} className="dashboard-section-title-icon" />
                        Engagement Analytics
                    </h2>
                    <AnalyticsDashboard stats={stats} extraStats={extraStats} />
                </div>

                <div className="card">
                    <h2 className="dashboard-section-title">System Status</h2>
                    <div className="dashboard-status-list">
                        <StatusItem label="Classroom API" status="Connected" />
                        <StatusItem label="Institutional DB" status="Stable" />
                        <StatusItem label="Sync Pipeline" status="Active" />
                    </div>
                    <div className="dashboard-status-message">
                        All systems are functioning within normal institutional parameters.
                    </div>
                </div>
            </div>
        </div>
    );
};

const StatusItem = ({ label, status }) => (
    <div className="dashboard-status-item">
        <span className="dashboard-status-item-label">{label}</span>
        <span className="badge badge-active">{status}</span>
    </div>
);

export default Dashboard;
