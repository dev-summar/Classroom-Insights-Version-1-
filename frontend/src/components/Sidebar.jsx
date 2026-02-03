import React from 'react';
import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard,
    BookOpen,
    Users,
    UserSquare2,
    FileText,
    BrainCircuit,
    UserX,
    MessageSquareOff
} from 'lucide-react';

const Sidebar = () => {
    const mainMenuItems = [
        { name: 'Dashboard', path: '/', icon: LayoutDashboard },
        { name: 'Courses', path: '/courses', icon: BookOpen },
        { name: 'Teachers', path: '/teachers', icon: UserSquare2 },
        { name: 'Students', path: '/students', icon: Users },
        { name: 'Assignments', path: '/assignments', icon: FileText },
    ];

    const analyticsMenuItems = [
        { name: 'At-Risk Students', path: '/at-risk-students', icon: UserX },
        { name: 'Silent Students', path: '/silent-students', icon: MessageSquareOff },
        { name: 'AI Insights', icon: BrainCircuit, disabled: true },
    ];

    return (
        <div className="sidebar">
            <div className="logo-container" style={{ marginBottom: '2.5rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'white', marginBottom: '4px' }}>
                    MIET
                </h2>
                <div style={{ height: '2px', width: '30px', background: 'var(--miet-accent)', marginBottom: '12px' }}></div>
                <h1 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'rgba(255,255,255,0.9)', margin: 0 }}>
                    Classroom Insights
                </h1>
                <p style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.5)', marginTop: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Model Institute of Engineering and Technology
                </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                <div>
                    <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em', paddingLeft: '16px', marginBottom: '12px', display: 'block' }}>
                        Main Menu
                    </span>
                    <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        {mainMenuItems.map((item) => (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                            >
                                <item.icon size={18} />
                                {item.name}
                            </NavLink>
                        ))}
                    </nav>
                </div>

                <div>
                    <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em', paddingLeft: '16px', marginBottom: '12px', display: 'block' }}>
                        Advanced Analytics
                    </span>
                    <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        {analyticsMenuItems.map((item) => (
                            item.disabled ? (
                                <div
                                    key={item.name}
                                    className="nav-link disabled"
                                    title="Coming Soon"
                                >
                                    <item.icon size={18} />
                                    {item.name}
                                    <span className="coming-soon-badge">Soon</span>
                                </div>
                            ) : (
                                <NavLink
                                    key={item.path}
                                    to={item.path}
                                    className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                                >
                                    <item.icon size={18} />
                                    {item.name}
                                </NavLink>
                            )
                        ))}
                    </nav>
                </div>
            </div>

            <div style={{ marginTop: 'auto', padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }}></div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'rgba(255,255,255,0.8)' }}>
                        System Online
                    </span>
                </div>
                <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)', marginTop: '4px' }}>
                    v1.2.0-stable
                </div>
            </div>
        </div>
    );
};

export default Sidebar;
