import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, CheckCircle2, Clock, RefreshCw, BarChart3, Target, Calendar } from 'lucide-react';
import { assignmentService } from '../services/api';
import Pagination from '../components/Pagination';

const AssignmentDetail = () => {
    const { id } = useParams();
    const [data, setData] = useState(null);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchDetail = async () => {
            setLoading(true);
            try {
                const res = await assignmentService.getById(id, page);
                setData(res.data);
                setLoading(false);
            } catch (err) {
                console.error(err);
                setError('Failed to load assignment details or its parent course is archived.');
                setLoading(false);
            }
        };
        fetchDetail();
    }, [id, page]);

    if (loading) return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
            <RefreshCw className="animate-spin" size={40} color="var(--miet-blue)" />
        </div>
    );

    if (error || !data) return (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
            <h2 style={{ color: 'var(--danger)', marginBottom: '1rem' }}>Error</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>{error || 'Assignment not found'}</p>
            <Link to="/assignments" className="btn-sync" style={{ display: 'inline-flex', width: 'auto' }}>
                <ChevronLeft size={18} /> Back to Assignments
            </Link>
        </div>
    );

    const totalPages = Math.ceil(data.submissions.total / 10);

    return (
        <div className="fade-in">
            <div style={{ marginBottom: '2rem' }}>
                <Link to="/assignments" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--miet-blue)', textDecoration: 'none', fontWeight: 600, fontSize: '0.875rem' }}>
                    <ChevronLeft size={16} /> Back to All Assignments
                </Link>
            </div>

            <div className="card" style={{ marginBottom: '2.5rem', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: '#ef4444' }}></div>
                <h1 style={{ fontSize: '1.875rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '8px' }}>{data.assignment.title}</h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>Course: <span style={{ fontWeight: 700, color: 'var(--miet-blue)' }}>{data.assignment.courseName || 'Unknown Course'}</span></p>

                <div style={{ marginTop: '2.5rem', display: 'flex', gap: '24px' }}>
                    <div style={{
                        flex: 1,
                        padding: '1.25rem',
                        background: '#f8fafc',
                        borderRadius: '12px',
                        border: '1px solid var(--border-color)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '16px'
                    }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '10px', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--miet-blue)', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                            <BarChart3 size={24} />
                        </div>
                        <div>
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Submissions</span>
                            <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)' }}>{data.submissions.total}</span>
                        </div>
                    </div>

                    <div style={{
                        flex: 1,
                        padding: '1.25rem',
                        background: '#f8fafc',
                        borderRadius: '12px',
                        border: '1px solid var(--border-color)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '16px'
                    }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '10px', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--success)', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                            <Target size={24} />
                        </div>
                        <div>
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Maximum Points</span>
                            <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)' }}>{data.assignment.maxPoints || 'Ungraded'}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Submission Tracking</h2>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                    Page {page} of {totalPages || 1}
                </div>
            </div>

            <div className="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Student Name</th>
                            <th>Status</th>
                            <th>Grade</th>
                            <th style={{ textAlign: 'right' }}>Last Synchronized</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.submissions.data.map((sub, idx) => (
                            <tr key={`${sub.id}-${idx}`}>
                                <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <div style={{
                                            width: '28px',
                                            height: '28px',
                                            borderRadius: '50%',
                                            background: 'var(--primary-light)',
                                            color: 'var(--primary)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '0.7rem',
                                            fontWeight: 700
                                        }}>
                                            {sub.studentName?.charAt(0) || '?'}
                                        </div>
                                        <span style={{ fontWeight: 600 }}>{sub.studentName || 'Unknown Student'}</span>
                                    </div>
                                </td>
                                <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        {sub.state === 'RETURNED' ? (
                                            <span className="badge" style={{ background: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <CheckCircle2 size={12} /> {sub.state}
                                            </span>
                                        ) : (
                                            <span className="badge" style={{ background: '#fffbeb', color: '#d97706', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <Clock size={12} /> {sub.state}
                                            </span>
                                        )}
                                    </div>
                                </td>
                                <td style={{ fontWeight: 800, color: sub.assignedGrade ? 'var(--text-main)' : 'var(--text-muted)' }}>
                                    {sub.assignedGrade !== undefined ? `${sub.assignedGrade}` : '---'}
                                </td>
                                <td style={{ textAlign: 'right', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                                    {new Date(sub.updateTime).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                                </td>
                            </tr>
                        ))}
                        {data.submissions.data.length === 0 && (
                            <tr><td colSpan="4" style={{ textAlign: 'center', padding: '100px', color: 'var(--text-muted)' }}>No submission data found for this page.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            <Pagination
                currentPage={page}
                totalItems={data.submissions.total}
                itemsPerPage={10}
                onPageChange={setPage}
            />
        </div>
    );
};

export default AssignmentDetail;
