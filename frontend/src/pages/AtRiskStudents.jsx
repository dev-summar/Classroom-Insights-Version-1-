import React, { useState, useEffect } from 'react';
import { analyticsService } from '../services/api';
import Pagination from '../components/Pagination';
import { UserX, Search, AlertTriangle } from 'lucide-react';

const AtRiskStudents = () => {
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
            const res = await analyticsService.getAtRiskStudents(page, debouncedSearch, limit);
            setStudents(res.data.students);
            setTotal(res.data.count);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const getRiskBadge = (pct) => {
        if (pct >= 50) {
            return <span className="badge" style={{ background: '#fee2e2', color: '#991b1b', border: '1px solid #fecaca' }}>High Risk</span>;
        }
        if (pct >= 40) {
            return <span className="badge" style={{ background: '#ffedd5', color: '#9a3412', border: '1px solid #fed7aa' }}>Medium Risk</span>;
        }
        return <span className="badge" style={{ background: '#f1f5f9', color: '#475569', border: '1px solid #e2e8f0' }}>Low Risk</span>;
    };

    return (
        <div className="fade-in">
            <div className="header-section">
                <div>
                    <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <AlertTriangle color="var(--miet-red)" />
                        At-Risk Students
                    </h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: '4px' }}>
                        Students flagged for low submission rates or consecutive missing assignments
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
                            <th>Missed</th>
                            <th>Missed %</th>
                            <th style={{ textAlign: 'right' }}>Risk Level</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan="6" className="text-center py-8">Loading...</td>
                            </tr>
                        ) : students.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="text-center py-8">No at-risk students found.</td>
                            </tr>
                        ) : (
                            students.map((student) => (
                                <tr key={student.userId}>
                                    <td style={{ fontWeight: 500 }}>{student.studentName}</td>
                                    <td>{student.totalAssignments}</td>
                                    <td>{student.submitted}</td>
                                    <td style={{ color: 'var(--miet-red)', fontWeight: 600 }}>{student.missed}</td>
                                    <td>{student.missedPercentage}%</td>
                                    <td style={{ textAlign: 'right' }}>
                                        {getRiskBadge(student.missedPercentage)}
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

export default AtRiskStudents;
