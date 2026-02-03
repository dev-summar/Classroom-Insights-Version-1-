import React, { useState, useEffect } from 'react';
import { Search, ChevronLeft, ChevronRight, UserSquare2, RefreshCw } from 'lucide-react';
import { teacherService } from '../services/api';
import Pagination from '../components/Pagination';

const TeacherList = () => {
    const [teachers, setTeachers] = useState([]);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);

    const fetchTeachers = async () => {
        setLoading(true);
        try {
            const res = await teacherService.getAll(page, search);
            setTeachers(res.data.data);
            setTotal(res.data.total);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTeachers();
    }, [page, search]);

    const totalPages = Math.ceil(total / 10);

    return (
        <div className="fade-in">
            <div className="header-section">
                <div>
                    <h1 className="page-title">Institutional Teachers</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>
                        Directory of all faculty members across active courses
                    </p>
                </div>
                <div style={{ position: 'relative' }}>
                    <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                        type="text"
                        placeholder="Search teachers..."
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
                            <th>Teacher Name</th>
                            <th>Total Courses Taught</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="2" style={{ textAlign: 'center', padding: '100px' }}>
                                <RefreshCw className="animate-spin" size={24} color="var(--miet-blue)" />
                            </td></tr>
                        ) : teachers.length === 0 ? (
                            <tr><td colSpan="2" style={{ textAlign: 'center', padding: '100px', color: 'var(--text-muted)' }}>No teachers found</td></tr>
                        ) : teachers.map((teacher, index) => (
                            <tr key={`${teacher.userId}-${index}`}>
                                <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div style={{
                                            width: '32px',
                                            height: '32px',
                                            borderRadius: '50%',
                                            background: 'var(--primary-light)',
                                            color: 'var(--primary)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '0.75rem',
                                            fontWeight: 700
                                        }}>
                                            {teacher.name?.charAt(0) || <UserSquare2 size={16} />}
                                        </div>
                                        <span style={{ fontWeight: 600 }}>{teacher.name || 'Unknown Teacher'}</span>
                                    </div>
                                </td>
                                <td>
                                    <span style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        padding: '6px 14px',
                                        background: 'var(--primary-light)',
                                        color: 'var(--primary)',
                                        borderRadius: '20px',
                                        fontSize: '0.875rem',
                                        fontWeight: 600
                                    }}>
                                        {teacher.courseCount || 0} {teacher.courseCount === 1 ? 'Course' : 'Courses'}
                                    </span>
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

export default TeacherList;
