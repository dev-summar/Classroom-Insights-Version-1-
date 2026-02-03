import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Users, UserSquare2, FileText, Calendar, ExternalLink, RefreshCw, ChevronLeft, ArrowRight, Code } from 'lucide-react';
import { courseService } from '../services/api';

const CourseDetail = () => {
    const { id } = useParams();
    const [data, setData] = useState(null);
    const [activeTab, setActiveTab] = useState('students');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchDetail = async () => {
            setLoading(true);
            try {
                const res = await courseService.getById(id);
                setData(res.data);
                setLoading(false);
            } catch (err) {
                console.error(err);
                setError('Failed to load course details or course is archived.');
                setLoading(false);
            }
        };
        fetchDetail();
    }, [id]);

    if (loading) return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
            <RefreshCw className="animate-spin" size={40} color="var(--miet-blue)" />
        </div>
    );

    if (error || !data) return (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
            <h2 style={{ color: 'var(--danger)', marginBottom: '1rem' }}>Error</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>{error || 'Course not found'}</p>
            <Link to="/courses" className="btn-sync" style={{ display: 'inline-flex', width: 'auto' }}>
                <ChevronLeft size={18} /> Back to Courses
            </Link>
        </div>
    );

    const tabs = [
        { id: 'students', label: 'Students', icon: Users, count: data.students.length },
        { id: 'teachers', label: 'Teachers', icon: UserSquare2, count: data.teachers.length },
        { id: 'assignments', label: 'Assignments', icon: FileText, count: data.assignments.length },
    ];

    return (
        <div className="fade-in">
            <div style={{ marginBottom: '2rem' }}>
                <Link to="/courses" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--miet-blue)', textDecoration: 'none', fontWeight: 600, fontSize: '0.875rem' }}>
                    <ChevronLeft size={16} /> Back to All Courses
                </Link>
            </div>

            <div className="card" style={{ marginBottom: '2.5rem', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: 'var(--miet-accent)' }}></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '8px' }}>{data.course.name}</h1>
                        <p style={{ color: 'var(--text-muted)', fontSize: '1rem', maxWidth: '800px' }}>{data.course.description || 'No description provided'}</p>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '32px', marginTop: '2.5rem', padding: '1.5rem', background: '#f8fafc', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--miet-blue)', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                            <Code size={20} />
                        </div>
                        <div>
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Access Code</span>
                            <span style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--text-main)' }}>{data.course.enrollmentCode || 'PROPRIETARY'}</span>
                        </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--success)', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                            <Calendar size={20} />
                        </div>
                        <div>
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Created On</span>
                            <span style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--text-main)' }}>{new Date(data.course.creationTime).toLocaleDateString(undefined, { dateStyle: 'long' })}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div style={{
                display: 'flex',
                gap: '8px',
                background: 'rgba(0,0,0,0.03)',
                padding: '6px',
                borderRadius: '12px',
                marginBottom: '2rem',
                width: 'fit-content'
            }}>
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        style={{
                            padding: '10px 20px',
                            borderRadius: '10px',
                            border: 'none',
                            background: activeTab === tab.id ? 'white' : 'transparent',
                            color: activeTab === tab.id ? 'var(--miet-blue)' : 'var(--text-muted)',
                            boxShadow: activeTab === tab.id ? '0 4px 6px -1px rgba(0,0,0,0.1)' : 'none',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            fontWeight: 700,
                            fontSize: '0.875rem',
                            transition: 'all 0.2s'
                        }}
                    >
                        <tab.icon size={18} />
                        {tab.label}
                        <span style={{
                            background: activeTab === tab.id ? 'var(--primary-light)' : 'rgba(0,0,0,0.05)',
                            color: activeTab === tab.id ? 'var(--miet-blue)' : 'var(--text-muted)',
                            padding: '2px 8px',
                            borderRadius: '999px',
                            fontSize: '0.75rem'
                        }}>
                            {tab.count}
                        </span>
                    </button>
                ))}
            </div>

            <div className="table-container">
                <table>
                    <thead>
                        {activeTab === 'students' && (
                            <tr>
                                <th>Student Name</th>
                                <th>Email Address</th>
                                <th style={{ textAlign: 'right' }}>Institutional ID</th>
                            </tr>
                        )}
                        {activeTab === 'teachers' && (
                            <tr>
                                <th>Teacher Name</th>
                                <th>Email Address</th>
                                <th style={{ textAlign: 'right' }}>Institutional ID</th>
                            </tr>
                        )}
                        {activeTab === 'assignments' && (
                            <tr>
                                <th>Assignment Title</th>
                                <th>Due Date</th>
                                <th>Points</th>
                                <th style={{ textAlign: 'right' }}>Actions</th>
                            </tr>
                        )}
                    </thead>
                    <tbody>
                        {activeTab === 'students' && data.students.map((s, idx) => (
                            <tr key={`${s.userId}-${idx}`}>
                                <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 800 }}>
                                            {s.name?.charAt(0)}
                                        </div>
                                        <span style={{ fontWeight: 600 }}>{s.name}</span>
                                    </div>
                                </td>
                                <td>{s.email || '---'}</td>
                                <td style={{ textAlign: 'right', fontSize: '0.75rem', fontFamily: 'monospace', color: 'var(--text-muted)' }}>{s.userId}</td>
                            </tr>
                        ))}
                        {activeTab === 'teachers' && data.teachers.map((t, idx) => (
                            <tr key={`${t.userId}-${idx}`}>
                                <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--primary-light)', color: 'var(--miet-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 800 }}>
                                            {t.name?.charAt(0)}
                                        </div>
                                        <span style={{ fontWeight: 600 }}>{t.name}</span>
                                    </div>
                                </td>
                                <td>{t.email || '---'}</td>
                                <td style={{ textAlign: 'right', fontSize: '0.75rem', fontFamily: 'monospace', color: 'var(--text-muted)' }}>{t.userId}</td>
                            </tr>
                        ))}
                        {activeTab === 'assignments' && data.assignments.map((a, idx) => (
                            <tr key={`${a.id}-${idx}`}>
                                <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: '#fff1f2', color: '#e11d48', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <FileText size={14} />
                                        </div>
                                        <span style={{ fontWeight: 600 }}>{a.title}</span>
                                    </div>
                                </td>
                                <td>
                                    <span className="badge" style={{ background: '#fef2f2', color: '#991b1b' }}>
                                        {a.dueDate ? `${a.dueDate.day}/${a.dueDate.month}/${a.dueDate.year}` : 'No Due Date'}
                                    </span>
                                </td>
                                <td><span style={{ fontWeight: 700 }}>{a.maxPoints || 'Ungraded'}</span></td>
                                <td style={{ textAlign: 'right' }}>
                                    <Link to={`/assignments/${a.id}`} className="nav-link" style={{ display: 'inline-flex', padding: '4px 10px', background: '#f1f5f9', color: 'var(--miet-blue)', fontSize: '0.75rem', marginBottom: 0 }}>
                                        View <ArrowRight size={12} style={{ marginLeft: '4px' }} />
                                    </Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default CourseDetail;
