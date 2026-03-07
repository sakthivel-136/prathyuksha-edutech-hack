"use client"

import { useEffect, useState } from 'react'
import { Clock, MapPin, Inbox, Plus, Trash2, X, Edit2 } from 'lucide-react'
import { API_BASE, getAuthHeaders } from '@/lib/api'

export default function ExamsPage() {
    const [filters, setFilters] = useState({ year: '', semester: '', dept: '' })
    const [exams, setExams] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [role, setRole] = useState('student')

    // Create Modal State
    const [showCreateModal, setShowCreateModal] = useState(false)
    const [newExam, setNewExam] = useState({
        course_code: '',
        course_name: '',
        exam_date: '',
        exam_time: '',
        exam_type: 'End Sem',
        department: 'CSE',
        academic_year: '2025-26',
        year_of_study: 1,
        semester: 1
    })

    // Edit Modal State
    const [showEditModal, setShowEditModal] = useState(false)
    const [editingExam, setEditingExam] = useState<any>(null)

    // Result Modal State
    const [showResultModal, setShowResultModal] = useState(false)
    const [resultData, setResultData] = useState({ roll_number: '', status: 'Pass', exam_id: '', course_code: '', course_id: '', course_name: '' })

    const fetchExams = () => {
        setLoading(true)
        const params = new URLSearchParams()
        if (filters.year) params.append('year', filters.year)
        if (filters.semester) params.append('semester', filters.semester)
        if (filters.dept) params.append('dept', filters.dept)

        fetch(`${API_BASE}/api/exams?${params.toString()}`, { headers: getAuthHeaders() })
            .then(r => r.json())
            .then(data => { setExams(Array.isArray(data) ? data : []); setLoading(false) })
            .catch(() => setLoading(false))
    }

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setRole(localStorage.getItem('userRole') || 'student')
        }
        fetchExams()
    }, [filters])

    const handleDelete = async (examId: string) => {
        if (!confirm('Are you sure you want to delete this exam?')) return
        try {
            await fetch(`${API_BASE}/api/exams/${examId}`, {
                method: 'DELETE',
                headers: getAuthHeaders()
            })
            fetchExams()
        } catch (e) {
            console.error('Failed to delete exam')
        }
    }

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            const res = await fetch(`${API_BASE}/api/exams`, {
                method: 'POST',
                headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...newExam, room: '' })
            })
            if (res.ok) {
                setShowCreateModal(false)
                setNewExam({
                    course_code: '',
                    course_name: '',
                    exam_date: '',
                    exam_time: '',
                    exam_type: 'End Sem',
                    department: 'CSE',
                    academic_year: '2025-26',
                    year_of_study: 1,
                    semester: 1
                })
                fetchExams()
            }
        } catch (e) {
            console.error('Failed to create exam')
        }
    }

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            const res = await fetch(`${API_BASE}/api/exams/${editingExam.id}`, {
                method: 'PUT',
                headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    course_code: editingExam.course_code,
                    course_name: editingExam.course_name,
                    exam_date: editingExam.exam_date,
                    exam_time: editingExam.exam_time,
                    room: editingExam.room || '',
                    exam_type: editingExam.exam_type,
                    department: editingExam.department
                })
            })
            if (res.ok) {
                setShowEditModal(false)
                setEditingExam(null)
                fetchExams()
            }
        } catch (e) {
            console.error('Failed to update exam')
        }
    }

    const openEditModal = (exam: any) => {
        setEditingExam({ ...exam })
        setShowEditModal(true)
    }

    const handleMarkResult = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            // First find student ID by roll number
            const stuRes = await fetch(`${API_BASE}/api/students`, { headers: getAuthHeaders() })
            const students = await stuRes.json()
            const student = students.find((s: any) => s.roll_number === resultData.roll_number)

            if (!student) {
                alert('Student not found with this roll number')
                return
            }

            const res = await fetch(`${API_BASE}/api/results/add`, {
                method: 'POST',
                headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    student_id: student.id,
                    course_id: resultData.course_id,
                    course_code: resultData.course_code,
                    semester: parseInt(filters.semester || '1'),
                    academic_year: '2025-26',
                    status: resultData.status,
                    grade: resultData.status === 'Pass' ? 'A' : 'F'
                })
            })
            if (res.ok) {
                setShowResultModal(false)
                setResultData({ roll_number: '', status: 'Pass', exam_id: '', course_code: '', course_id: '', course_name: '' })
                alert('Result recorded successfully')
            }
        } catch (e) {
            console.error('Failed to mark result')
        }
    }

    const openResultModal = (exam: any) => {
        setResultData({ ...resultData, exam_id: exam.id, course_code: exam.course_code, course_id: exam.course_id, course_name: exam.course_name })
        setShowResultModal(true)
    }

    if (loading && exams.length === 0) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="w-10 h-10 border-4 border-[#001b5e] border-t-transparent rounded-full animate-spin"></div>
            </div>
        )
    }

    const isElevated = role === 'admin' || role === 'coe'

    return (
        <div className="space-y-8 fade-in relative">
            <div className="flex justify-between items-end">
                <div className="space-y-1">
                    <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Examination</p>
                    <h1 className="text-4xl font-black text-[#001b5e]">Exam Schedule</h1>
                </div>
                {isElevated && (
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="bg-[#001b5e] text-white px-6 py-3 rounded-2xl font-black shadow-xl shadow-blue-900/20 flex items-center gap-2 hover:bg-blue-700 transition-all"
                    >
                        <Plus className="w-4 h-4" /> Add Exam
                    </button>
                )}
            </div>

            {/* Premium Filters */}
            <div className="lumina-card p-8 bg-white border border-slate-100 shadow-xl shadow-slate-200/50">
                <div className="flex flex-col md:flex-row items-center gap-6">
                    <div className="flex-1 w-full space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-[#001b5e] tracking-widest flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                                Department
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {['ALL', 'CSE', 'ECE', 'MECH', 'IT', 'AI-DS'].map(d => (
                                    <button
                                        key={d}
                                        onClick={() => setFilters({ ...filters, dept: d === 'ALL' ? '' : d })}
                                        className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${filters.dept === (d === 'ALL' ? '' : d) ? 'bg-[#001b5e] text-white shadow-lg' : 'bg-white text-slate-400 border border-slate-100'}`}
                                    >
                                        {d}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-[#001b5e] tracking-widest flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                    Year
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {['ALL', '1', '2', '3', '4'].map(y => (
                                        <button
                                            key={y}
                                            onClick={() => setFilters({ ...filters, year: y === 'ALL' ? '' : y })}
                                            className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${filters.year === (y === 'ALL' ? '' : y) ? 'bg-[#001b5e] text-white shadow-lg' : 'bg-white text-slate-400 border border-slate-100'}`}
                                        >
                                            {y === 'ALL' ? 'ALL' : `Year ${y}`}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-[#001b5e] tracking-widest flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                                    Semester
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {['ALL', '1', '2', '3', '4', '5', '6', '7', '8'].map(s => (
                                        <button
                                            key={s}
                                            onClick={() => setFilters({ ...filters, semester: s === 'ALL' ? '' : s })}
                                            className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${filters.semester === (s === 'ALL' ? '' : s) ? 'bg-[#001b5e] text-white shadow-lg' : 'bg-white text-slate-400 border border-slate-100'}`}
                                        >
                                            {s === 'ALL' ? 'ALL' : `Sem ${s}`}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {exams.length === 0 ? (
                <div className="lumina-card p-16 flex flex-col items-center justify-center text-center space-y-4">
                    <Inbox className="w-16 h-16 text-slate-200" />
                    <h3 className="text-xl font-black text-[#001b5e]">No Exams Scheduled</h3>
                    <p className="text-slate-400 max-w-sm">No exam schedule has been published yet for these criteria.</p>
                </div>
            ) : (
                <div className="lumina-card overflow-hidden">
                    <div className="divide-y divide-slate-100">
                        {exams.map((exam, i: number) => {
                            const isArrear = exam.semester < (parseInt(filters.year || '1') * 2 - 1)
                            return (
                                <div key={i} className="p-6 hover:bg-slate-50 transition-all flex items-center justify-between group">
                                    <div className="flex items-center gap-6">
                                        <div className="w-14 h-14 bg-blue-50 rounded-2xl flex flex-col items-center justify-center text-[#001b5e] border border-blue-100">
                                            <span className="text-xs font-black leading-tight">{(exam.exam_date || '').split('-')[1] || '—'}</span>
                                            <span className="text-lg font-black leading-tight">{(exam.exam_date || '').split('-')[2] || '—'}</span>
                                        </div>
                                        <div>
                                            <h4 className="font-black text-[#001b5e] text-lg flex items-center gap-2">
                                                {exam.course_name}
                                                {isArrear && <span className="bg-amber-100 text-amber-700 text-[10px] px-2 py-0.5 rounded-full uppercase tracking-widest">Arrear</span>}
                                            </h4>
                                            <p className="text-xs font-bold text-slate-400 mt-1">{exam.course_code} • {exam.department} • {exam.exam_type}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-8">
                                        <div className="flex items-center gap-2 text-sm font-bold text-slate-600">
                                            <Clock className="w-4 h-4 text-slate-400" />
                                            {exam.exam_time || 'TBD'}
                                        </div>
                                        <div className="flex items-center gap-2 text-sm font-bold text-slate-600">
                                            <MapPin className="w-4 h-4 text-slate-400" />
                                            {exam.room || 'Pending Allocation'}
                                        </div>

                                        {isElevated && (
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => openResultModal(exam)}
                                                    className="bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider hover:bg-emerald-100 border border-emerald-100"
                                                >
                                                    Mark Results
                                                </button>
                                                <button
                                                    onClick={() => openEditModal(exam)}
                                                    className="p-2 text-slate-300 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all"
                                                    title="Edit Exam"
                                                >
                                                    <Edit2 className="w-5 h-5" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(exam.id)}
                                                    className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-full transition-all"
                                                    title="Delete Exam"
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            )}

            {/* Create Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm px-4 fade-in">
                    <div className="bg-white p-8 rounded-3xl w-full max-w-lg shadow-2xl relative">
                        <button onClick={() => setShowCreateModal(false)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-800">
                            <X className="w-6 h-6" />
                        </button>
                        <h2 className="text-2xl font-black text-[#001b5e] mb-6">Schedule Exam</h2>

                        <form onSubmit={handleCreate} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase text-slate-400">Course Code</label>
                                    <input required type="text" value={newExam.course_code} onChange={e => setNewExam({ ...newExam, course_code: e.target.value })} className="w-full bg-slate-50 border p-3 rounded-xl font-bold" placeholder="e.g. CS301" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase text-slate-400">Course Name</label>
                                    <input required type="text" value={newExam.course_name} onChange={e => setNewExam({ ...newExam, course_name: e.target.value })} className="w-full bg-slate-50 border p-3 rounded-xl font-bold" placeholder="Data Structures" />
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase text-slate-400">Department</label>
                                    <select value={newExam.department} onChange={e => setNewExam({ ...newExam, department: e.target.value })} className="w-full bg-slate-50 border p-3 rounded-xl font-bold">
                                        <option value="CSE">CSE</option>
                                        <option value="ECE">ECE</option>
                                        <option value="MECH">MECH</option>
                                        <option value="IT">IT</option>
                                        <option value="AI-DS">AI-DS</option>
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase text-slate-400">Year</label>
                                    <select value={newExam.year_of_study} onChange={e => setNewExam({ ...newExam, year_of_study: parseInt(e.target.value) })} className="w-full bg-slate-50 border p-3 rounded-xl font-bold">
                                        <option value={1}>1st</option>
                                        <option value={2}>2nd</option>
                                        <option value={3}>3rd</option>
                                        <option value={4}>4th</option>
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase text-slate-400">Semester</label>
                                    <select value={newExam.semester} onChange={e => setNewExam({ ...newExam, semester: parseInt(e.target.value) })} className="w-full bg-slate-50 border p-3 rounded-xl font-bold">
                                        {[1, 2, 3, 4, 5, 6, 7, 8].map(s => <option key={s} value={s}>Sem {s}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase text-slate-400">Date</label>
                                    <input required type="date" value={newExam.exam_date} onChange={e => setNewExam({ ...newExam, exam_date: e.target.value })} className="w-full bg-slate-50 border p-3 rounded-xl font-bold" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase text-slate-400">Time</label>
                                    <input required type="text" value={newExam.exam_time} onChange={e => setNewExam({ ...newExam, exam_time: e.target.value })} className="w-full bg-slate-50 border p-3 rounded-xl font-bold" placeholder="09:00 AM" />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase text-slate-400">Exam Type</label>
                                    <select value={newExam.exam_type} onChange={e => setNewExam({ ...newExam, exam_type: e.target.value })} className="w-full bg-slate-50 border p-3 rounded-xl font-bold">
                                        <option>Mid Sem</option>
                                        <option>End Sem</option>
                                        <option>Lab</option>
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase text-slate-400">Academic Year</label>
                                    <input required type="text" value={newExam.academic_year} onChange={e => setNewExam({ ...newExam, academic_year: e.target.value })} className="w-full bg-slate-50 border p-3 rounded-xl font-bold" placeholder="2025-26" />
                                </div>
                            </div>

                            <button type="submit" className="w-full mt-4 bg-[#001b5e] text-white py-4 rounded-xl font-black shadow-xl hover:bg-blue-800 transition-all">
                                Publish Schedule
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {showEditModal && editingExam && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm px-4 fade-in">
                    <div className="bg-white p-8 rounded-3xl w-full max-w-lg shadow-2xl relative">
                        <button onClick={() => setShowEditModal(false)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-800">
                            <X className="w-6 h-6" />
                        </button>
                        <h2 className="text-2xl font-black text-[#001b5e] mb-6">Edit Exam Details</h2>

                        <form onSubmit={handleUpdate} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase text-slate-400">Date</label>
                                    <input required type="date" value={editingExam.exam_date} onChange={e => setEditingExam({ ...editingExam, exam_date: e.target.value })} className="w-full bg-slate-50 border p-3 rounded-xl font-bold" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase text-slate-400">Time</label>
                                    <input required type="text" value={editingExam.exam_time} onChange={e => setEditingExam({ ...editingExam, exam_time: e.target.value })} className="w-full bg-slate-50 border p-3 rounded-xl font-bold" placeholder="09:00 AM" />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase text-slate-400">Update Room Allotment</label>
                                <input type="text" value={editingExam.room || ''} onChange={e => setEditingExam({ ...editingExam, room: e.target.value })} className="w-full bg-slate-50 border p-3 rounded-xl font-bold" placeholder="e.g. B-101" />
                            </div>

                            <button type="submit" className="w-full mt-4 bg-[#001b5e] text-white py-4 rounded-xl font-black shadow-xl hover:bg-blue-800 transition-all">
                                Save Changes
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Mark Result Modal */}
            {showResultModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm px-4 fade-in">
                    <div className="bg-white p-8 rounded-3xl w-full max-w-md shadow-2xl relative">
                        <button onClick={() => setShowResultModal(false)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-800">
                            <X className="w-6 h-6" />
                        </button>
                        <h2 className="text-2xl font-black text-[#001b5e] mb-2">Mark Result</h2>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">{resultData.course_name} ({resultData.course_code})</p>

                        <form onSubmit={handleMarkResult} className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase text-slate-400">Student Roll Number</label>
                                <input required type="text" value={resultData.roll_number} onChange={e => setResultData({ ...resultData, roll_number: e.target.value })} className="w-full bg-slate-50 border p-3 rounded-xl font-bold" placeholder="e.g. 21CS001" />
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase text-slate-400">Outcome Status</label>
                                <select value={resultData.status} onChange={e => setResultData({ ...resultData, status: e.target.value })} className="w-full bg-slate-50 border p-3 rounded-xl font-bold">
                                    <option value="Pass">Pass (Competent)</option>
                                    <option value="Fail">Fail (Arrear)</option>
                                </select>
                            </div>

                            <button type="submit" className="w-full mt-4 bg-emerald-600 text-white py-4 rounded-xl font-black shadow-xl hover:bg-emerald-700 transition-all">
                                Save Final Result
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
