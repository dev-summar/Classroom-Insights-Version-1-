import React, { useState, useEffect } from 'react';
import { Search, ChevronLeft, ChevronRight, Users, RefreshCw } from 'lucide-react';
import { studentService } from '../services/api';
import Pagination from '../components/Pagination';

const StudentList = () => {
    const [students, setStudents] = useState([]);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);

    const fetchStudents = async () => {
        setLoading(true);
        try {
            const res = await studentService.getAll(page, search);
            setStudents(res.data.data);
            setTotal(res.data.total);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStudents();
    }, [page, search]);

    const totalPages = Math.ceil(total / 10);

    return (
        <div className="fade-in">
            <div className="header-section">
                <div>
                    <h1 className="page-title">Institutional Students</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>
                        Browse all enrolled students across active academic courses
                    </p>
                </div>
                <div style={{ position: 'relative' }}>
                    <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                        type="text"
                        placeholder="Search students..."
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
                            <th>Student Name</th>
                            <th>Email Address</th>
                            <th>Institutional ID</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="3" style={{ textAlign: 'center', padding: '100px' }}>
                                <RefreshCw className="animate-spin" size={24} color="var(--miet-blue)" />
                            </td></tr>
                        ) : students.length === 0 ? (
                            <tr><td colSpan="3" style={{ textAlign: 'center', padding: '100px', color: 'var(--text-muted)' }}>No students found</td></tr>
                        ) : students.map((student, index) => (
                            <tr key={`${student.userId}-${index}`}>
                                <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div style={{
                                            width: '32px',
                                            height: '32px',
                                            borderRadius: '50%',
                                            background: '#ecfdf5',
                                            color: '#059669',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '0.75rem',
                                            fontWeight: 700
                                        }}>
                                            {student.name?.charAt(0) || <Users size={16} />}
                                        </div>
                                        <span style={{ fontWeight: 600 }}>{student.name}</span>
                                    </div>
                                </td>
                                <td>{student.email || '---'}</td>
                                <td style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontFamily: 'monospace' }}>{student.userId}</td>
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

export default StudentList;
