import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, ChevronLeft, ChevronRight, FileText, ExternalLink, RefreshCw } from 'lucide-react';
import { assignmentService } from '../services/api';
import Pagination from '../components/Pagination';

const AssignmentList = () => {
    const [assignments, setAssignments] = useState([]);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);

    const fetchAssignments = async () => {
        setLoading(true);
        try {
            const res = await assignmentService.getAll(page, search);
            setAssignments(res.data.data);
            setTotal(res.data.total);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAssignments();
    }, [page, search]);

    const totalPages = Math.ceil(total / 10);

    return (
        <div className="fade-in">
            <div className="header-section">
                <div>
                    <h1 className="page-title">Institutional Assignments</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>
                        Track and manage coursework across all active institutional courses
                    </p>
                </div>
                <div style={{ position: 'relative' }}>
                    <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                        type="text"
                        placeholder="Search assignments..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        style={{
                            padding: '12px 16px 12px 48px',
                            background: 'white',
                            border: '1px solid var(--border-color)',
                            borderRadius: '10px',
                            color: 'var(--text-main)',
                            width: '320px',
                            outline: 'none',
                            boxShadow: 'var(--card-shadow)'
                        }}
                    />
                </div>
            </div>

            <div className="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Assignment Title</th>
                            <th>Course Name</th>
                            <th>Due Date</th>
                            <th style={{ textAlign: 'right' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="4" style={{ textAlign: 'center', padding: '100px' }}>
                                <RefreshCw className="animate-spin" size={24} color="var(--miet-blue)" />
                            </td></tr>
                        ) : assignments.length === 0 ? (
                            <tr><td colSpan="4" style={{ textAlign: 'center', padding: '100px', color: 'var(--text-muted)' }}>No assignments found</td></tr>
                        ) : assignments.map((a) => (
                            <tr key={a.id}>
                                <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div style={{
                                            width: '32px',
                                            height: '32px',
                                            borderRadius: '6px',
                                            background: '#fff1f2',
                                            color: '#e11d48',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}>
                                            <FileText size={16} />
                                        </div>
                                        <span style={{ fontWeight: 600 }}>{a.title}</span>
                                    </div>
                                </td>
                                <td style={{ fontWeight: 600, color: 'var(--miet-blue)' }}>{a.courseName || 'Unknown Course'}</td>
                                <td>
                                    <span className="badge" style={{ background: '#fef2f2', color: '#991b1b' }}>
                                        {a.dueDate ? `${a.dueDate.day}/${a.dueDate.month}/${a.dueDate.year}` : 'No Due Date'}
                                    </span>
                                </td>
                                <td style={{ textAlign: 'right' }}>
                                    <Link to={`/assignments/${a.id}`} className="nav-link" style={{
                                        display: 'inline-flex',
                                        padding: '6px 12px',
                                        background: '#f1f5f9',
                                        color: 'var(--miet-blue)',
                                        fontSize: '0.8rem',
                                        marginBottom: 0
                                    }}>
                                        Submissions <ExternalLink size={12} style={{ marginLeft: '6px' }} />
                                    </Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <Pagination
                currentPage={page}
                totalItems={total}
                itemsPerPage={10}
                onPageChange={setPage}
            />
        </div>
    );
};

export default AssignmentList;
