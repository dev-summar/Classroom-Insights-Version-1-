import React, { useState, useEffect } from 'react';
import { Route, Routes } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import CourseList from './pages/CourseList';
import CourseDetail from './pages/CourseDetail';
import StudentList from './pages/StudentList';
import TeacherList from './pages/TeacherList';
import AssignmentList from './pages/AssignmentList';
import AssignmentDetail from './pages/AssignmentDetail';
import SilentStudents from './pages/SilentStudents';
import AtRiskStudents from './pages/AtRiskStudents';

import Header from './components/Header';

const App = () => {
    return (
        <div className="main-layout">
            <Header />
            <Sidebar />
            <div className="content-area">
                <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/courses" element={<CourseList />} />
                    <Route path="/courses/:id" element={<CourseDetail />} />
                    <Route path="/students" element={<StudentList />} />
                    <Route path="/teachers" element={<TeacherList />} />
                    <Route path="/assignments" element={<AssignmentList />} />
                    <Route path="/assignments/:id" element={<AssignmentDetail />} />
                    <Route path="/silent-students" element={<SilentStudents />} />
                    <Route path="/at-risk-students" element={<AtRiskStudents />} />
                </Routes>
            </div>
        </div>
    );
};

export default App;
