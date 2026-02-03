import React from 'react';
import { PieChart, BarChart3, Activity } from 'lucide-react';

export const AnalyticsDashboard = ({ stats, extraStats }) => {
    if (!stats || !extraStats) return null;

    // --- Data Preparation ---
    const totalStudents = stats.students || 0;
    const silent = extraStats.silent || 0;
    const atRisk = extraStats.atRisk || 0;
    const active = Math.max(0, totalStudents - silent - atRisk);

    const workload = [
        { label: 'Courses', value: stats.courses || 0, color: '#1e40af' },
        { label: 'Assignments', value: stats.assignments || 0, color: '#ef4444' },
        { label: 'Submissions', value: stats.submissions || 0, color: '#8b5cf6' }
    ];

    const submissionsPerStudent = totalStudents ? (stats.submissions / totalStudents).toFixed(1) : 0;
    const assignmentsPerCourse = stats.courses ? (stats.assignments / stats.courses).toFixed(1) : 0;

    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', width: '100%' }}>
            {/* 1. Student Status Distribution (Donut) */}
            <ChartCard title="Student Status">
                <DonutChart
                    data={[
                        { label: 'Active', value: active, color: '#10b981' },
                        { label: 'At-Risk', value: atRisk, color: '#c2410c' },
                        { label: 'Silent', value: silent, color: '#be123c' }
                    ]}
                    total={totalStudents}
                    centerLabel="Students"
                />
            </ChartCard>

            {/* 2. Academic Workload (Bar) */}
            <ChartCard title="Academic Workload">
                <SimpleBarChart data={workload} />
            </ChartCard>

            {/* 3. Engagement Ratio (Metrics) */}
            <ChartCard title="Engagement Ratios">
                <EngagementMetrics
                    subPerStudent={submissionsPerStudent}
                    assignPerCourse={assignmentsPerCourse}
                />
            </ChartCard>
        </div>
    );
};

// --- Sub-components ---

const ChartCard = ({ title, children }) => (
    <div style={{
        background: '#fff',
        borderRadius: '8px',
        padding: '16px',
        border: '1px solid #e2e8f0',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
    }}>
        <h3 style={{ fontSize: '0.9rem', fontWeight: 600, color: '#64748b', margin: 0 }}>{title}</h3>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {children}
        </div>
    </div>
);

const DonutChart = ({ data, total, centerLabel }) => {
    // Calculate conic gradient segments
    let cumulative = 0;
    const gradients = data.map(item => {
        const start = (cumulative / total) * 100;
        cumulative += item.value;
        const end = (cumulative / total) * 100;
        return `${item.color} ${start}% ${end}%`;
    });

    const background = `conic-gradient(${gradients.join(', ')})`;

    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', width: '100%' }}>
            <div style={{
                position: 'relative',
                width: '100px',
                height: '100px',
                borderRadius: '50%',
                background: total > 0 ? background : '#e2e8f0',
                flexShrink: 0
            }}>
                {/* Inner White Circle for Donut Effect */}
                <div style={{
                    position: 'absolute',
                    top: '20%',
                    left: '20%',
                    width: '60%',
                    height: '60%',
                    background: '#fff',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'column'
                }}>
                    <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#1e293b' }}>{total}</span>
                </div>
            </div>
            {/* Legend */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.8rem' }}>
                {data.map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: item.color }} />
                        <span style={{ color: '#475569' }}>{item.label}: <b>{item.value}</b></span>
                    </div>
                ))}
            </div>
        </div>
    );
};

const SimpleBarChart = ({ data }) => {
    const maxValue = Math.max(...data.map(d => d.value), 1);

    return (
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around', width: '100%', height: '120px', paddingBottom: '20px' }}>
            {data.map((item, idx) => {
                const height = (item.value / maxValue) * 100;
                return (
                    <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', flex: 1 }}>
                        <div
                            title={`${item.label}: ${item.value}`}
                            style={{
                                width: '30%',
                                minWidth: '16px',
                                height: `${height}%`,
                                background: item.color,
                                borderRadius: '4px 4px 0 0',
                                transition: 'height 0.5s ease'
                            }}
                        />
                        <span style={{ fontSize: '0.7rem', color: '#64748b', textAlign: 'center' }}>{item.label}</span>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: item.color }}>{item.value}</span>
                    </div>
                );
            })}
        </div>
    );
};

const EngagementMetrics = ({ subPerStudent, assignPerCourse }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
        <MetricRow label="Submissions / Student" value={subPerStudent} color="#8b5cf6" icon={Activity} />
        <MetricRow label="Assignments / Course" value={assignPerCourse} color="#ef4444" icon={BarChart3} />
    </div>
);

const MetricRow = ({ label, value, color, icon: Icon }) => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: `${color}10`, borderRadius: '6px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Icon size={16} color={color} />
            <span style={{ fontSize: '0.8rem', color: '#334155', fontWeight: 500 }}>{label}</span>
        </div>
        <span style={{ fontSize: '1rem', fontWeight: 700, color: color }}>{value}</span>
    </div>
);
