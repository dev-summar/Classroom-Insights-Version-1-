import React, { useState, useEffect } from 'react';
import { analyticsService } from '../services/api';
import Pagination from '../components/Pagination';
import { MessageSquareOff, Search, AlertCircle } from 'lucide-react';

const SilentStudents = () => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [limit] = useState(10);

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
            setPage(1);
        }, 500);
        return () => clearTimeout(timer);
    }, [search]);

    useEffect(() => {
        fetchStudents();
    }, [page, debouncedSearch]);

    const fetchStudents = async () => {
        setLoading(true);
        try {
            const res = await analyticsService.getSilentStudents(page, debouncedSearch, limit);
            setStudents(res.data.students);
            setTotal(res.data.count);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fade-in">
            <div className="header-section">
                <div>
                    <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <MessageSquareOff color="var(--text-muted)" />
                        Silent Students
                    </h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: '4px' }}>
                        Students with zero submissions or no activity in the last 30 days
                    </p>
                </div>
                <div className="search-bar">
                    <Search size={18} color="var(--text-muted)" />
                    <input
                        type="text"
                        placeholder="Search student..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <table className="data-table">
                    <thead>
                        <tr>
                            <th style={{ width: '30%' }}>Student Name</th>
                            <th>Total Assignments</th>
                            <th>Submitted</th>
                            <th>Last Activity</th>
                            <th style={{ textAlign: 'right' }}>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan="5" className="text-center py-8">Loading...</td>
                            </tr>
                        ) : students.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="text-center py-8">No silent students found.</td>
                            </tr>
                        ) : (
                            students.map((student) => (
                                <tr key={student.userId}>
                                    <td style={{ fontWeight: 500 }}>{student.studentName}</td>
                                    <td>{student.totalAssignments}</td>
                                    <td>{student.submitted}</td>
                                    <td>
                                        {student.lastActivity === 'None' ? (
                                            <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Never</span>
                                        ) : (
                                            student.lastActivity
                                        )}
                                    </td>
                                    <td style={{ textAlign: 'right' }}>
                                        <span className="badge" style={{
                                            background: '#ffe4e6',
                                            color: '#be123c',
                                            border: '1px solid #fda4af'
                                        }}>
                                            Silent
                                        </span>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
            <Pagination
                currentPage={page}
                totalItems={total}
                itemsPerPage={limit}
                onPageChange={setPage}
            />
        </div>
    );
};

export default SilentStudents;
