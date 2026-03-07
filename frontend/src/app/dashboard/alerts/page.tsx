"use client"

import { useState, useEffect } from 'react'
import {
    UserPlus,
    Mail,
    MessageSquare,
    ChevronRight,
    ShieldAlert,
    Users,
    TrendingDown,
    ArrowUpRight,
    TrendingUp,
    RefreshCw,
    CalendarDays
} from 'lucide-react'
import { API_BASE, getAuthHeaders } from '@/lib/api'

const FALLBACK_AT_RISK = [
    { name: 'John Doe', roll: 'STU102', risk: '85%', reason: 'High absences (12)', trend: 'up' as const },
    { name: 'Kavin M', roll: 'STU205', risk: '72%', reason: 'Low study hours (<2h)', trend: 'stable' as const },
    { name: 'Swetha P', roll: 'STU311', risk: '64%', reason: 'Past grade volatility', trend: 'down' as const },
]

export default function EarlyWarning() {
    const [atRisk, setAtRisk] = useState<any[]>([])
    const [activeSchedules, setActiveSchedules] = useState<any[]>([])
    const [history, setHistory] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedStudent, setSelectedStudent] = useState<any>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [role, setRole] = useState<string | null>(null)
    const [username, setUsername] = useState('')
    const [showHistory, setShowHistory] = useState(false)
    const [showComplaintModal, setShowComplaintModal] = useState(false)
    const [complaints, setComplaints] = useState<any[]>([])
    const [complaintForm, setComplaintForm] = useState({
        student_id: '',
        dept: '',
        year: '',
        section: '',
        period: '1',
        reason: 'Absence',
        explanation: ''
    })
    const [allStudents, setAllStudents] = useState<any[]>([])
    const [filteredStudents, setFilteredStudents] = useState<any[]>([])

    useEffect(() => {
        const storedRole = localStorage.getItem('userRole') || 'student'
        setRole(storedRole)
        setUsername(localStorage.getItem('username') || 'User')

        fetchAlerts()
        fetchSchedules()
        fetchComplaints()

        if (storedRole !== 'student') {
            fetchAllStudents()
        }
    }, [])

    const fetchAllStudents = async () => {
        try {
            const res = await fetch(`${API_BASE}/api/students`, { headers: getAuthHeaders() })
            if (res.ok) setAllStudents(await res.json())
        } catch (e) { console.error(e) }
    }

    const fetchComplaints = async () => {
        try {
            const res = await fetch(`${API_BASE}/api/complaints`, { headers: getAuthHeaders() })
            if (res.ok) setComplaints(await res.json())
        } catch (e) { console.error(e) }
    }

    const fetchSchedules = async () => {
        try {
            const res = await fetch(`${API_BASE}/api/schedule/active`, { headers: getAuthHeaders() })
            if (res.ok) setActiveSchedules(await res.json())

            if (localStorage.getItem('userRole') !== 'student') {
                const hRes = await fetch(`${API_BASE}/api/schedule/history`, { headers: getAuthHeaders() })
                if (hRes.ok) setHistory(await hRes.json())
            }
        } catch (e) { console.error(e) }
    }

    const handleScheduleCounseling = async (student: any, staff: string, date: string, time: string) => {
        setIsSubmitting(true)
        try {
            const res = await fetch(`${API_BASE}/api/schedule/create`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
                body: JSON.stringify({
                    staff_name: staff,
                    event_date: date,
                    event_time: time
                })
            })
            if (res.ok) {
                alert('Counseling scheduled successfully!')
                setSelectedStudent(null)
                fetchSchedules()
            }
        } catch (error) {
            alert('Failed to schedule')
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleAction = async (id: string, action: string) => {
        try {
            const res = await fetch(`${API_BASE}/api/schedule/action`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
                body: JSON.stringify({ schedule_id: id, action })
            })
            if (res.ok) {
                alert(`Schedule marked as ${action}`)
                fetchSchedules()
            }
        } catch (e) { alert("Action failed") }
    }

    const handleLogComplaint = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)
        try {
            const res = await fetch(`${API_BASE}/api/complaints`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
                body: JSON.stringify({
                    student_id: complaintForm.student_id,
                    department: complaintForm.dept,
                    year_of_study: parseInt(complaintForm.year),
                    section: complaintForm.section,
                    period: parseInt(complaintForm.period),
                    reason: complaintForm.reason,
                    explanation: complaintForm.explanation
                })
            })
            if (res.ok) {
                alert('Complaint logged successfully!')
                setShowComplaintModal(false)
                fetchComplaints()
                fetchAlerts() // Refresh risk list
            }
        } catch (e) { alert('Failed to log complaint') } finally { setIsSubmitting(false) }
    }

    const fetchAlerts = () => {
        setLoading(true)
        fetch(`${API_BASE}/api/at_risk_students`, { headers: getAuthHeaders() })
            .then(r => r.json())
            .then((data: any[]) => {
                setAtRisk(data.map(s => ({
                    name: s.name,
                    roll: s.id,
                    risk: `${Math.round((s.risk_probability || 0.8) * 100)}%`,
                    reason: s.reason,
                    trend: 'stable' as const,
                    complaint_count: s.complaint_count || 0
                })))
            })
            .catch(() => { })
            .finally(() => setLoading(false))
    }

    const downloadReport = () => {
        const headers = ["ID", "Student Name", "Staff", "Date", "Time", "Status"]
        const rows = history.map(h => [h.id, h.student_name, h.staff_name, h.event_date, h.event_time, h.status])
        const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].map(e => e.join(",")).join("\n")
        const encodedUri = encodeURI(csvContent)
        const link = document.createElement("a")
        link.setAttribute("href", encodedUri)
        link.setAttribute("download", "counseling_history_report.csv")
        document.body.appendChild(link)
        link.click()
    }

    return (
        <div className="space-y-8 fade-in">
            <div className="flex justify-between items-end">
                <div className="space-y-1">
                    <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Early Warning System</p>
                    <h1 className="text-4xl font-black text-[#001b5e]">At-Risk Students Panel</h1>
                </div>
                <div className="flex gap-4">
                    {role !== 'student' && (
                        <>
                            <button onClick={() => setShowComplaintModal(true)} className="bg-rose-600 text-white px-6 py-3 rounded-2xl font-black shadow-xl hover:scale-105 transition-all flex items-center gap-2">
                                <ShieldAlert className="w-4 h-4" /> Log Teacher Complaint
                            </button>
                            <button onClick={() => setShowHistory(!showHistory)} className="bg-white border border-slate-200 px-6 py-3 rounded-2xl font-bold text-slate-600 hover:bg-slate-50 transition-all">
                                {showHistory ? 'View Active' : 'View History Report'}
                            </button>
                        </>
                    )}
                    <button onClick={fetchAlerts} disabled={loading} className="bg-white border border-slate-200 px-6 py-3 rounded-2xl font-bold text-slate-600 flex items-center gap-2 hover:bg-slate-50 transition-all disabled:opacity-50">
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </button>
                </div>
            </div>

            {showHistory ? (
                <div className="vantage-card p-8">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-black text-[#001b5e]">Counseling Success History</h2>
                        <button onClick={downloadReport} className="bg-emerald-600 text-white px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2">
                            <ArrowUpRight className="w-4 h-4" /> Download CSV Report
                        </button>
                    </div>
                    <table className="w-full text-left">
                        <thead className="text-xs font-black text-slate-400 uppercase tracking-widest border-b">
                            <tr>
                                <th className="pb-4">Student</th>
                                <th className="pb-4">Staff</th>
                                <th className="pb-4">Date/Time</th>
                                <th className="pb-4">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 text-sm font-bold text-slate-600">
                            {history.length === 0 ? <tr><td colSpan={4} className="py-8 text-center text-slate-400">No history available.</td></tr> :
                                history.map((h, i) => (
                                    <tr key={i}>
                                        <td className="py-4">{h.student_name}</td>
                                        <td className="py-4">{h.staff_name}</td>
                                        <td className="py-4">{h.event_date} @ {h.event_time}</td>
                                        <td className="py-4 text-emerald-600 uppercase">Success</td>
                                    </tr>
                                ))
                            }
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-8">
                        {/* At-Risk List (Only shown to Admin/Staff) */}
                        {role && role !== 'student' && (
                            <div className="vantage-card overflow-hidden">
                                <div className="p-6 border-b bg-slate-50/50">
                                    <h3 className="font-black text-[#001b5e]">Flagged for Intervention</h3>
                                </div>
                                <div className="divide-y divide-slate-100">
                                    {atRisk.length === 0 ? (
                                        <div className="p-8 text-center text-slate-500">No flagged students.</div>
                                    ) : (
                                        atRisk.map((student, i) => (
                                            <div key={i} className="p-8 hover:bg-slate-50 transition-all flex flex-col md:flex-row items-center justify-between group gap-4">
                                                <div className="flex items-center gap-6">
                                                    <div className="w-16 h-16 bg-white rounded-3xl shadow-sm flex items-center justify-center text-rose-600 border border-slate-100 group-hover:scale-110 transition-transform">
                                                        <Users className="w-8 h-8" />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <h4 className="font-black text-[#001b5e] text-lg leading-tight">{student.name}</h4>
                                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{student.roll} • <span className="text-rose-500">{student.reason}</span></p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-6">
                                                    <div className="text-right flex items-center gap-4">
                                                        <div>
                                                            <span className="text-2xl font-black text-rose-600 block">{student.risk}</span>
                                                            {student.complaint_count > 0 && (
                                                                <span className="text-[10px] font-black bg-rose-50 text-rose-600 px-2 py-0.5 rounded-full uppercase tracking-tighter">
                                                                    {student.complaint_count} Complaints
                                                                </span>
                                                            )}
                                                        </div>
                                                        <button
                                                            onClick={() => setSelectedStudent({ name: student.name, roll: student.roll })}
                                                            className="bg-white border border-slate-200 p-2 rounded-xl hover:bg-[#001b5e] hover:text-white transition-all shadow-sm flex items-center gap-2 text-xs font-bold"
                                                        >
                                                            <UserPlus className="w-4 h-4" />
                                                            Schedule Counseling
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Active Schedules List */}
                        <div className="vantage-card overflow-hidden">
                            <div className="p-6 border-b bg-slate-50/50">
                                <h3 className="font-black text-[#001b5e]">Counseling Schedule (Active)</h3>
                            </div>
                            <div className="divide-y divide-slate-100">
                                {activeSchedules.length === 0 ? (
                                    <div className="p-8 text-center text-slate-500">
                                        {role === 'student' ? 'You have no scheduled counseling. Use the button on the right to start.' : 'No active schedules found.'}
                                    </div>
                                ) : (
                                    activeSchedules.map((s, i) => (
                                        <div key={i} className="p-8 hover:bg-slate-50 transition-all flex flex-col md:flex-row items-center justify-between group gap-4">
                                            <div className="flex items-center gap-6">
                                                <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-[#001b5e]">
                                                    <CalendarDays className="w-6 h-6" />
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-[#001b5e]">{s.student_name}</h4>
                                                    <p className="text-xs font-bold text-slate-400">Counselor: {s.staff_name}</p>
                                                </div>
                                            </div>
                                            <div className="text-center">
                                                <p className="text-sm font-black text-[#001b5e]">{s.event_date}</p>
                                                <p className="text-xs font-bold text-slate-400">{s.event_time}</p>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                {role !== 'student' ? (
                                                    <>
                                                        <button onClick={() => handleAction(s.id, 'success')} className="bg-emerald-600 text-white px-4 py-2 rounded-xl text-xs font-black shadow-lg shadow-emerald-200">Success</button>
                                                        <button onClick={() => handleAction(s.id, 'reschedule')} className="bg-amber-500 text-white px-4 py-2 rounded-xl text-xs font-black shadow-lg shadow-amber-200">Reschedule</button>
                                                    </>
                                                ) : (
                                                    <span className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest ${s.status === 'reschedule' ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'}`}>
                                                        {s.status === 'reschedule' ? 'Needs Reschedule' : 'Awaiting Counselor'}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Teacher Complaints Feed (Only for Staff) */}
                        {role && role !== 'student' && (
                            <div className="vantage-card overflow-hidden">
                                <div className="p-6 border-b bg-rose-50/30 flex justify-between items-center">
                                    <h3 className="font-black text-rose-900">Recent Teacher Complaints</h3>
                                    <span className="text-[10px] font-black bg-rose-100 text-rose-600 px-2 py-0.5 rounded-full uppercase tracking-widest">Period Tracking</span>
                                </div>
                                <div className="divide-y divide-slate-100">
                                    {complaints.length === 0 ? (
                                        <div className="p-8 text-center text-slate-500">No complaints reported.</div>
                                    ) : (
                                        complaints.map((c, i) => (
                                            <div key={i} className="p-6 hover:bg-slate-50 transition-all">
                                                <div className="flex justify-between items-start mb-2">
                                                    <div>
                                                        <h4 className="font-bold text-[#001b5e]">{c.user_profiles?.full_name}</h4>
                                                        <p className="text-[10px] font-black text-slate-400 uppercase">{c.user_profiles?.roll_number} • Period {c.period}</p>
                                                    </div>
                                                    <span className={`text-[9px] font-black px-2 py-0.5 rounded uppercase ${c.urgency === 'High' ? 'bg-rose-100 text-rose-600' :
                                                        c.urgency === 'Medium' ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-500'
                                                        }`}>
                                                        {c.urgency} Urgency
                                                    </span>
                                                </div>
                                                <p className="text-sm font-bold text-slate-700">{c.reason}</p>
                                                <p className="text-xs text-slate-500 mt-1">{c.explanation}</p>
                                                <p className="text-[9px] font-bold text-slate-400 mt-3 italic text-right">Reported by {c.teacher_name}</p>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="space-y-8">
                        {role === 'student' && (
                            <div className="vantage-card p-8 bg-[#001b5e] text-white">
                                <h3 className="text-xl font-black mb-4">Request Counseling</h3>
                                <p className="text-sm text-blue-200 mb-8 leading-relaxed">Need help with your academic plan? Schedule a session with a counselor.</p>
                                <button
                                    onClick={() => setSelectedStudent({ name: username, roll: 'Me' })}
                                    className="w-full bg-white text-[#001b5e] py-4 rounded-2xl font-black shadow-xl hover:scale-[1.02] transition-all"
                                >
                                    Start Schedule Request
                                </button>
                            </div>
                        )}

                        {role && role !== 'student' && (
                            <div className="vantage-card p-8 bg-rose-50 border-rose-100">
                                <ShieldAlert className="w-10 h-10 text-rose-600 mb-6" />
                                <h3 className="text-xl font-black text-[#001b5e] mb-2">Automated Early Warning</h3>
                                <p className="text-sm text-slate-600 leading-relaxed font-medium mb-8">
                                    The Early Warning Engine flags students before major assessments based on interaction logs and benchmarks.
                                </p>
                                <div className="p-4 bg-white border border-rose-200 rounded-2xl space-y-4">
                                    <div className="flex justify-between items-center text-xs font-bold">
                                        <span className="text-slate-500">Prediction Accuracy</span>
                                        <span className="text-rose-600">95.7% Acc | 0.919 F1</span>
                                    </div>
                                    <div className="h-2 bg-rose-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-rose-600 w-[95%]" />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Counseling Modal */}
            {selectedStudent && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm px-4 fade-in">
                    <div className="bg-white p-8 rounded-3xl w-full max-w-lg shadow-2xl relative border border-slate-100">
                        <h2 className="text-2xl font-black text-[#001b5e] mb-2">Schedule Counseling</h2>
                        <p className="text-sm text-slate-500 mb-6">For: <strong className="text-slate-800">{selectedStudent.name}</strong></p>

                        <form onSubmit={(e) => {
                            e.preventDefault();
                            const target = e.target as any;
                            const staff = target.staff.value;
                            const date = target.date.value;
                            const time = target.time.value;
                            handleScheduleCounseling(selectedStudent, staff, date, time);
                        }} className="space-y-4 text-left">
                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase text-slate-400">Assigned Staff / Counselor</label>
                                <input required name="staff" type="text" className="w-full bg-slate-50 border p-3 rounded-xl font-bold" placeholder="e.g. Dr. Ramesh K" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase text-slate-400">Date</label>
                                    <input required name="date" type="date" className="w-full bg-slate-50 border p-3 rounded-xl font-bold" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase text-slate-400">Time</label>
                                    <input required name="time" type="time" className="w-full bg-slate-50 border p-3 rounded-xl font-bold" />
                                </div>
                            </div>
                            <div className="flex gap-4 pt-4">
                                <button type="button" onClick={() => setSelectedStudent(null)} className="flex-1 bg-slate-100 text-slate-600 py-3 rounded-xl font-bold hover:bg-slate-200 transition-all">Cancel</button>
                                <button type="submit" disabled={isSubmitting} className="flex-1 bg-[#001b5e] text-white py-3 rounded-xl font-black shadow-xl hover:bg-blue-800 transition-all disabled:opacity-50">
                                    {isSubmitting ? 'Scheduling...' : 'Confirm Schedule'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Log Complaint Modal */}
            {showComplaintModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm px-4 fade-in">
                    <div className="bg-white p-8 rounded-3xl w-full max-w-xl shadow-2xl relative border border-slate-100 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-start mb-6">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-600">
                                    <ShieldAlert className="w-6 h-6" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black text-[#001b5e]">Log Teacher Complaint</h2>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Detailed Student Feedback & Attendance</p>
                                </div>
                            </div>
                            <button onClick={() => setShowComplaintModal(false)} className="text-slate-400 hover:text-slate-600 p-2">✕</button>
                        </div>

                        <form onSubmit={handleLogComplaint} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-tighter">Department</label>
                                    <select
                                        required
                                        className="w-full bg-slate-50 border-slate-100 border p-3 rounded-xl font-bold text-[#001b5e] focus:border-rose-300 transition-colors cursor-pointer"
                                        onChange={(e) => setComplaintForm({ ...complaintForm, dept: e.target.value })}
                                    >
                                        <option value="">Select Dept</option>
                                        <option value="CSE">CSE</option>
                                        <option value="IT">IT</option>
                                        <option value="ECE">ECE</option>
                                        <option value="MECH">MECH</option>
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-tighter">Year</label>
                                    <select
                                        required
                                        className="w-full bg-slate-50 border-slate-100 border p-3 rounded-xl font-bold text-[#001b5e] focus:border-rose-300 transition-colors cursor-pointer"
                                        onChange={(e) => setComplaintForm({ ...complaintForm, year: e.target.value })}
                                    >
                                        <option value="">Year</option>
                                        {[1, 2, 3, 4].map(y => <option key={y} value={y}>{y}st Year</option>)}
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-tighter">Section</label>
                                    <select
                                        required
                                        className="w-full bg-slate-50 border-slate-100 border p-3 rounded-xl font-bold text-[#001b5e] focus:border-rose-300 transition-colors cursor-pointer"
                                        onChange={(e) => {
                                            const section = e.target.value;
                                            setComplaintForm({ ...complaintForm, section });
                                            setFilteredStudents(allStudents.filter(s =>
                                                s.department === complaintForm.dept &&
                                                s.year_of_study == parseInt(complaintForm.year) &&
                                                s.section === section
                                            ));
                                        }}
                                    >
                                        <option value="">Section</option>
                                        {['A', 'B', 'C'].map(s => <option key={s} value={s}>Sec {s}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase text-slate-400 tracking-tighter">Select Student</label>
                                <select
                                    required
                                    className="w-full bg-slate-50 border-slate-100 border p-3 rounded-xl font-bold text-[#001b5e] focus:border-rose-300 transition-colors cursor-pointer"
                                    onChange={(e) => setComplaintForm({ ...complaintForm, student_id: e.target.value })}
                                >
                                    <option value="">-- Choose Student --</option>
                                    {filteredStudents.map(s => <option key={s.id} value={s.id}>{s.full_name} ({s.roll_number})</option>)}
                                </select>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-tighter">Period (1-8)</label>
                                    <input required type="number" min="1" max="8" className="w-full bg-slate-50 border-slate-100 border p-3 rounded-xl font-bold text-[#001b5e] focus:border-rose-300 transition-colors" onChange={(e) => setComplaintForm({ ...complaintForm, period: e.target.value })} />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-tighter">Reason</label>
                                    <select required className="w-full bg-slate-50 border-slate-100 border p-3 rounded-xl font-bold text-[#001b5e] focus:border-rose-300 transition-colors cursor-pointer" onChange={(e) => setComplaintForm({ ...complaintForm, reason: e.target.value })}>
                                        <option value="Absence">Unreported Absence</option>
                                        <option value="Performance">Low Performance</option>
                                        <option value="Behavior">Behavioral Issue</option>
                                        <option value="Late">Late Entry</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase text-slate-400 tracking-tighter">Explanation (Required)</label>
                                <textarea required rows={3} className="w-full bg-slate-50 border-slate-100 border p-3 rounded-xl font-medium text-sm text-slate-700 focus:border-rose-300 transition-colors" placeholder="Provide details for intervention..." onChange={(e) => setComplaintForm({ ...complaintForm, explanation: e.target.value })}></textarea>
                            </div>

                            <div className="flex gap-4 pt-2">
                                <button type="button" onClick={() => setShowComplaintModal(false)} className="flex-1 bg-slate-100 text-slate-600 py-4 rounded-2xl font-bold hover:bg-slate-200 transition-all">Cancel</button>
                                <button type="submit" disabled={isSubmitting} className="flex-1 bg-rose-600 text-white py-4 rounded-2xl font-black shadow-xl shadow-rose-200 hover:bg-rose-700 transition-all hover:scale-[1.02] disabled:opacity-50">
                                    {isSubmitting ? 'Submitting...' : 'Log Report'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
