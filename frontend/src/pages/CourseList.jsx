import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, ChevronLeft, ChevronRight, ExternalLink, BookOpen, RefreshCw } from 'lucide-react';
import { courseService } from '../services/api';
import Pagination from '../components/Pagination';


const CourseList = () => {
    const [courses, setCourses] = useState([]);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);

    const fetchCourses = async () => {
        setLoading(true);
        try {
            const res = await courseService.getAll(page, search);
            setCourses(res.data.data);
            setTotal(res.data.total);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCourses();
    }, [page, search]);

    const totalPages = Math.max(1, Math.ceil(total / 10));

    return (
        <div className="fade-in">
            <div className="header-section">
                <div>
                    <h1 className="page-title">Institutional Courses</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>
                        Browse and manage all active academic courses
                    </p>
                </div>
                <div style={{ position: 'relative' }}>
                    <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                        type="text"
                        placeholder="Search courses..."
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
                            <th>Course Name</th>
                            <th>Section / Subject</th>
                            <th style={{ textAlign: 'center' }}>Teachers</th>
                            <th style={{ textAlign: 'center' }}>Students</th>
                            <th style={{ textAlign: 'center' }}>Assignments</th>
                            <th style={{ textAlign: 'right' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="6" style={{ textAlign: 'center', padding: '100px' }}>
                                <RefreshCw className="animate-spin" size={24} color="var(--miet-blue)" />
                            </td></tr>
                        ) : courses.length === 0 ? (
                            <tr><td colSpan="6" style={{ textAlign: 'center', padding: '100px', color: 'var(--text-muted)' }}>No courses found</td></tr>
                        ) : courses.map((course) => (
                            <tr key={course.id}>
                                <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div style={{
                                            width: '32px',
                                            height: '32px',
                                            borderRadius: '6px',
                                            background: 'var(--primary-light)',
                                            color: 'var(--primary)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}>
                                            <BookOpen size={16} />
                                        </div>
                                        <span style={{ fontWeight: 600 }}>{course.name}</span>
                                    </div>
                                </td>
                                <td><span className="badge" style={{ background: '#f1f5f9', color: '#475569' }}>{course.section || '---'}</span></td>
                                <td style={{ textAlign: 'center' }}>
                                    <span className="badge" style={{ background: '#e0f2fe', color: '#0369a1', fontWeight: 600 }}>
                                        {course.teacherCount || 0}
                                    </span>
                                </td>
                                <td style={{ textAlign: 'center' }}>
                                    <span className="badge" style={{ background: '#dbeafe', color: '#1e40af', fontWeight: 600 }}>
                                        {course.studentCount || 0}
                                    </span>
                                </td>
                                <td style={{ textAlign: 'center' }}>
                                    <span className="badge" style={{ background: '#fef3c7', color: '#92400e', fontWeight: 600 }}>
                                        {course.assignmentCount || 0}
                                    </span>
                                </td>
                                <td style={{ textAlign: 'right' }}>
                                    <Link to={`/courses/${course.id}`} className="nav-link" style={{
                                        display: 'inline-flex',
                                        padding: '6px 12px',
                                        background: '#f1f5f9',
                                        color: 'var(--miet-blue)',
                                        fontSize: '0.8rem',
                                        marginBottom: 0
                                    }}>
                                        Details <ExternalLink size={12} style={{ marginLeft: '6px' }} />
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

export default CourseList;
