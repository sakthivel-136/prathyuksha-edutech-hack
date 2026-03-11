"use client"

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Clock, MapPin, Inbox, Plus, Trash2, X, Edit2, Calendar, ArrowRight, CheckCircle2, Layout, Shield, Activity, TrendingUp } from 'lucide-react'
import { API_BASE, getAuthHeaders } from '@/lib/api'
import SeatingPopup from '@/components/SeatingPopup'

const ResultModal = ({ exam, onClose }: { exam: any, onClose: () => void }) => {
    const [markingArrear, setMarkingArrear] = useState(false)
    const [rollNumber, setRollNumber] = useState('')
    const [submitting, setSubmitting] = useState(false)

    const handleMarkArrear = async () => {
        if (!rollNumber) return alert("Please enter a roll number")
        setSubmitting(true)
        try {
            const { getAuthHeaders, API_BASE } = await import('@/lib/api')
            const res = await fetch(`${API_BASE}/api/results/mark_arrear`, {
                method: 'POST',
                headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    roll_number: rollNumber,
                    exam_id: exam.id,
                    course_id: exam.course_id
                })
            })
            if (res.ok) {
                alert(`✅ Arrear result recorded for ${rollNumber}`)
                setRollNumber('')
            } else {
                const err = await res.json()
                const msg = typeof err.detail === 'string' ? err.detail : JSON.stringify(err.detail)
                alert(msg || "Failed to mark arrear")
            }
        } catch (e) { console.error(e) } finally { setSubmitting(false) }
    }

    const handleBulkPass = async () => {
        if (!confirm("This will mark all students (except those already marked as Arrear) as 'PASS'. Proceed?")) return
        setSubmitting(true)
        try {
            const { getAuthHeaders, API_BASE } = await import('@/lib/api')
            const res = await fetch(`${API_BASE}/api/results/bulk_pass`, {
                method: 'POST',
                headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    exam_id: exam.id,
                    course_id: exam.course_id
                })
            })
            if (res.ok) {
                alert("✅ All remaining students marked as Pass!")
                onClose()
            } else {
                const err = await res.json()
                const msg = typeof err.detail === 'string' ? err.detail : JSON.stringify(err.detail)
                alert(msg || "Bulk pass failed")
            }
        } catch (e) { console.error(e) } finally { setSubmitting(false) }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 fade-in">
            <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden border border-slate-100">
                <div className="p-8 bg-gradient-to-br from-[#001b5e] to-blue-900 text-white">
                    <div className="flex justify-between items-start">
                        <div>
                            <h2 className="text-2xl font-black italic">Final Result Entry</h2>
                            <p className="text-blue-200 text-xs font-bold uppercase tracking-widest mt-1">{exam.course_name} ({exam.course_code})</p>
                        </div>
                        <CheckCircle2 className="w-10 h-10 text-emerald-400 opacity-80" />
                    </div>
                </div>

                <div className="p-8 space-y-8">
                    <div className="space-y-6">
                        <label className="flex items-center gap-4 p-5 bg-slate-50 border border-slate-100 rounded-2xl cursor-pointer group hover:border-[#001b5e] transition-all">
                            <input
                                type="checkbox"
                                checked={markingArrear}
                                onChange={(e) => setMarkingArrear(e.target.checked)}
                                className="w-6 h-6 rounded-lg text-[#001b5e] focus:ring-[#001b5e]"
                            />
                            <div>
                                <h4 className="font-black text-[#001b5e]">Mark as Arrear Student</h4>
                                <p className="text-[10px] font-bold text-slate-400 uppercase">Input roll number for individual failure entry</p>
                            </div>
                        </label>

                        {markingArrear && (
                            <div className="space-y-2 fade-in">
                                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Student Roll Number</label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={rollNumber}
                                        onChange={(e) => setRollNumber(e.target.value.toUpperCase())}
                                        className="flex-1 bg-slate-50 border border-slate-200 p-4 rounded-2xl font-black text-[#001b5e] focus:ring-2 focus:ring-[#001b5e] outline-none"
                                        placeholder="e.g. 23UCS019"
                                    />
                                    <button
                                        onClick={handleMarkArrear}
                                        disabled={submitting}
                                        className="bg-rose-600 text-white px-6 rounded-2xl font-black text-xs uppercase hover:bg-rose-700 transition-all disabled:opacity-50"
                                    >
                                        Record
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="pt-8 border-t border-slate-100 space-y-4">
                        <div className="flex items-center gap-3 text-emerald-600 mb-2">
                            <Activity className="w-4 h-4" />
                            <h4 className="text-[10px] font-black uppercase tracking-widest">Bulk Actions</h4>
                        </div>
                        <p className="text-xs font-bold text-slate-500 leading-relaxed italic">
                            * Once all arrears are marked, click below to pass the remaining batch members in this course.
                        </p>
                        <button
                            onClick={handleBulkPass}
                            disabled={submitting}
                            className="w-full bg-emerald-600 text-white py-5 rounded-2xl font-black shadow-xl shadow-emerald-900/10 hover:bg-emerald-700 transition-all flex items-center justify-center gap-2"
                        >
                            <TrendingUp className="w-5 h-5" />
                            Bulk Pass All Remaining Members
                        </button>
                    </div>

                    <div className="flex gap-4">
                        <button
                            onClick={onClose}
                            className="flex-1 py-4 bg-slate-100 text-[#001b5e] rounded-2xl font-black text-xs uppercase border border-slate-200 hover:bg-slate-200"
                        >
                            Cancel & Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default function ExamsPage() {
    const router = useRouter()
    const [popupState, setPopupState] = useState({ isOpen: false, examId: '', courseName: '' })
    const [filters, setFilters] = useState({ year: '', semester: '', dept: '' })
    const [exams, setExams] = useState<any[]>([])
    const [myAllocations, setMyAllocations] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [role, setRole] = useState('student')

    // Create Modal State
    const [showCreateModal, setShowCreateModal] = useState(false)
    const [newExam, setNewExam] = useState({
        course_code: '',
        course_name: '',
        exam_date: '',
        exam_time: '',
        room: '',
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
    const [resultData, setResultData] = useState({
        roll_number: '',
        status: 'Pass',
        exam_id: '',
        course_code: '',
        course_id: '',
        course_name: '',
        markingMode: 'Regular' as 'Regular' | 'Arrear'
    })
    const [markingProgress, setMarkingProgress] = useState(false)

    const fetchExams = () => {
        setLoading(true)
        const params = new URLSearchParams()
        if (filters.year) params.append('year', filters.year)
        if (filters.semester) params.append('semester', filters.semester)
        if (filters.dept) params.append('dept', filters.dept)

        fetch(`${API_BASE}/api/exams?${params.toString()}`, { headers: getAuthHeaders() })
            .then(r => r.json())
            .then(data => {
                let list = Array.isArray(data) ? data : [];
                // CRITICAL: Double-check filter strictness. 
                // We MUST ensure types match (numbers vs strings)
                if (filters.dept) {
                    list = list.filter(ex => String(ex.department).toUpperCase() === String(filters.dept).toUpperCase());
                }
                if (filters.year && filters.year !== '') {
                    list = list.filter(ex => Number(ex.year_of_study) === Number(filters.year));
                }
                if (filters.semester && filters.semester !== '' && filters.semester !== 'ALL') {
                    list = list.filter(ex => Number(ex.semester) === Number(filters.semester));
                }

                setExams(list);
                setLoading(false)
            })
            .catch(() => setLoading(false))
    }

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const r = localStorage.getItem('userRole') || 'student'
            setRole(r)
            if (r === 'student') fetchMyAllocations()
        }
        fetchExams()
    }, [filters])

    const fetchMyAllocations = async () => {
        try {
            const { API_BASE, getAuthHeaders } = await import('@/lib/api')
            const profRes = await fetch(`${API_BASE}/api/me/profile`, { headers: getAuthHeaders() })
            const prof = await profRes.json()
            if (prof.id) {
                const res = await fetch(`${API_BASE}/api/seating/search?student_id=${prof.id}`, { headers: getAuthHeaders() })
                if (res.ok) setMyAllocations(await res.json())
            }
        } catch (e) { console.error(e) }
    }

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
                body: JSON.stringify({ ...newExam, room: newExam.room || 'Pending Allocation' })
            })
            const result = await res.json();
            if (res.ok) {
                alert('Exam scheduled successfully!')
                setShowCreateModal(false)
                setNewExam({
                    course_code: '',
                    course_name: '',
                    exam_date: '',
                    exam_time: '',
                    room: '',
                    exam_type: 'End Sem',
                    department: 'CSE',
                    academic_year: '2025-26',
                    year_of_study: 1,
                    semester: 1
                })
                fetchExams()
            } else {
                console.error('Exam Creation Error:', result);
                alert(`Failed: ${result.detail || 'Check server logs'}`);
            }
        } catch (e) {
            console.error('Network Error:', e);
            alert('Failed to schedule exam: Network error');
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
                    room: editingExam.room || 'Pending Allocation',
                    exam_type: editingExam.exam_type,
                    department: editingExam.department,
                    year_of_study: editingExam.year_of_study,
                    semester: editingExam.semester,
                    academic_year: editingExam.academic_year
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

    const [markingArrear, setMarkingArrear] = useState(false)

    const handleMarkResult = async (e: React.FormEvent) => {
        e.preventDefault()
        setMarkingProgress(true)
        try {
            if (markingArrear) {
                // Individual Arrear Marking
                if (!resultData.roll_number) {
                    alert('Please enter a roll number'); setMarkingProgress(false); return;
                }
                const res = await fetch(`${API_BASE}/api/results/mark_arrear`, {
                    method: 'POST',
                    headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        roll_number: resultData.roll_number,
                        exam_id: resultData.exam_id,
                        course_id: resultData.course_id
                    })
                })
                if (res.ok) {
                    alert(`✅ Student ${resultData.roll_number} marked as Arrear.`);
                    setResultData({ ...resultData, roll_number: '' }) // Clear roll number for next one
                } else {
                    const err = await res.json();
                    alert(`❌ Error: ${err.detail || 'Failed to mark arrear'}`);
                }
            } else {
                // Bulk Pass Regulars
                const confirmBulk = confirm(`This will mark ALL non-arrear students in this batch as "Pass". Are you sure?`)
                if (!confirmBulk) { setMarkingProgress(false); return }

                const res = await fetch(`${API_BASE}/api/results/bulk_pass`, {
                    method: 'POST',
                    headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        exam_id: resultData.exam_id,
                        course_id: resultData.course_id,
                        status: 'Pass'
                    })
                })
                if (res.ok) {
                    const data = await res.json()
                    alert(`✅ Success: ${data.count} regular student results recorded as "Pass".`)
                    setShowResultModal(false)
                } else {
                    alert('❌ Bulk pass failed.')
                }
            }
        } catch (e) {
            console.error('Failed to mark result')
            alert('Error recording result. Check connection.')
        } finally {
            setMarkingProgress(false)
        }
    }

    const openResultModal = (exam: any) => {
        setResultData({
            roll_number: '',
            status: 'Pass',
            exam_id: exam.id,
            course_code: exam.course_code,
            course_id: exam.course_id,
            course_name: exam.course_name,
            markingMode: 'Regular'
        })
        setMarkingArrear(false)
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
            <div className="vantage-card p-8 bg-white border border-slate-100 shadow-xl shadow-slate-200/50">
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
                <div className="vantage-card p-16 flex flex-col items-center justify-center text-center space-y-4">
                    <img src="/logo.png" style={{ height: '50px' }} alt="VANTAGE-EDU Logo" />
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#001b5e' }}>VANTAGE-EDU</div><h3 className="text-xl font-black text-[#001b5e]">No Exams Scheduled</h3>
                    <p className="text-slate-400 max-w-sm">No exam schedule has been created yet for these criteria.</p>
                </div>
            ) : (
                <div className="vantage-card overflow-hidden">
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
                                                <button
                                                    onClick={() => setPopupState({ isOpen: true, examId: exam.id, courseName: exam.course_name })}
                                                    className="hover:text-blue-600 transition-colors flex items-center gap-2 group text-left"
                                                >
                                                    {exam.course_name}
                                                    <Layout className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                </button>
                                                {isArrear && <span className="bg-amber-100 text-amber-700 text-[10px] px-2 py-0.5 rounded-full uppercase tracking-widest">Arrear</span>}
                                            </h4>
                                            <p className="text-xs font-bold text-slate-400 mt-1">
                                                {exam.course_code} • {exam.department} • {exam.exam_type} • Year {exam.year_of_study} (Sem {exam.semester})
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-8">
                                        <div className="flex items-center gap-2 text-sm font-bold text-slate-600">
                                            <Clock className="w-4 h-4 text-slate-400" />
                                            {exam.exam_time || 'TBD'}
                                        </div>
                                        {(() => {
                                            const alloc = myAllocations.find(a => a.exam_id === exam.id)

                                            // COE sees EVERYTHING
                                            if (role === 'coe') {
                                                if (exam.is_allocated) {
                                                    return (
                                                        <button
                                                            onClick={() => setPopupState({ isOpen: true, examId: exam.id, courseName: exam.course_name })}
                                                            className="flex items-center gap-2 text-sm font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-100 hover:bg-emerald-100 transition-all"
                                                        >
                                                            <CheckCircle2 className="w-4 h-4" />
                                                            SEATING READY
                                                        </button>
                                                    )
                                                }
                                                return (
                                                    <button
                                                        onClick={() => router.push(`/dashboard/seating?exam_id=${exam.id}`)}
                                                        className="flex items-center gap-2 text-xs font-black text-blue-600 bg-blue-50 px-3 py-1.5 rounded-xl hover:bg-blue-100 transition-all border border-blue-100 group"
                                                    >
                                                        <MapPin className="w-4 h-4" />
                                                        ALLOCATE NOW
                                                        <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                                                    </button>
                                                )
                                            }

                                            // Admin/Staff sees simple status
                                            if (role === 'admin' || role === 'seating_manager') {
                                                if (exam.is_allocated) {
                                                    return (
                                                        <button
                                                            onClick={() => setPopupState({ isOpen: true, examId: exam.id, courseName: exam.course_name })}
                                                            className="flex items-center gap-2 text-xs font-black text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-100 hover:bg-emerald-100 transition-all"
                                                        >
                                                            <CheckCircle2 className="w-4 h-4" />
                                                            ALLOCATED
                                                        </button>
                                                    )
                                                }
                                                return (
                                                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-2 py-1 rounded-lg">
                                                        Unassigned
                                                    </div>
                                                )
                                            }

                                            // Students see their specific seat
                                            if (alloc) {
                                                return (
                                                    <div className="flex items-center gap-2 text-xs font-black text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-100">
                                                        <MapPin className="w-4 h-4" />
                                                        {alloc.room_name} - {alloc.seat_number}
                                                    </div>
                                                )
                                            }

                                            return (
                                                <div className="flex items-center gap-2 text-xs font-black text-slate-400 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
                                                    <Clock className="w-4 h-4" />
                                                    TBD
                                                </div>
                                            )
                                        })()}

                                        {role === 'admin' && (
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => openResultModal(exam)}
                                                    className="bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider hover:bg-emerald-100 border border-emerald-100"
                                                >
                                                    Mark Results
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
                                    <select
                                        value={newExam.year_of_study}
                                        onChange={e => {
                                            const y = parseInt(e.target.value);
                                            // Auto-update semester to the first one of that year if current sem is not in range
                                            const minSem = (y - 1) * 2 + 1;
                                            const maxSem = y * 2;
                                            let nextSem = newExam.semester;
                                            if (nextSem < minSem || nextSem > maxSem) {
                                                nextSem = minSem;
                                            }
                                            setNewExam({ ...newExam, year_of_study: y, semester: nextSem });
                                        }}
                                        className="w-full bg-slate-50 border p-3 rounded-xl font-bold"
                                    >
                                        <option value={1}>1st Year</option>
                                        <option value={2}>2nd Year</option>
                                        <option value={3}>3rd Year</option>
                                        <option value={4}>4th Year</option>
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase text-slate-400">Semester</label>
                                    <select
                                        value={newExam.semester}
                                        onChange={e => {
                                            const s = parseInt(e.target.value);
                                            // Auto-update year based on semester
                                            const y = Math.ceil(s / 2);
                                            setNewExam({ ...newExam, semester: s, year_of_study: y });
                                        }}
                                        className="w-full bg-slate-50 border p-3 rounded-xl font-bold"
                                    >
                                        {[1, 2, 3, 4, 5, 6, 7, 8]
                                            .filter(s => {
                                                const yearForSem = Math.ceil(s / 2);
                                                return yearForSem === newExam.year_of_study;
                                            })
                                            .map(s => <option key={s} value={s}>Sem {s}</option>)
                                        }
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
                                Schedule Exam
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

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase text-slate-400">Year</label>
                                    <select
                                        value={editingExam.year_of_study}
                                        onChange={e => {
                                            const y = parseInt(e.target.value);
                                            const minSem = (y - 1) * 2 + 1;
                                            const maxSem = y * 2;
                                            let nextSem = editingExam.semester;
                                            if (nextSem < minSem || nextSem > maxSem) {
                                                nextSem = minSem;
                                            }
                                            setEditingExam({ ...editingExam, year_of_study: y, semester: nextSem });
                                        }}
                                        className="w-full bg-slate-50 border p-3 rounded-xl font-bold"
                                    >
                                        <option value={1}>1st Year</option>
                                        <option value={2}>2nd Year</option>
                                        <option value={3}>3rd Year</option>
                                        <option value={4}>4th Year</option>
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase text-slate-400">Semester</label>
                                    <select
                                        value={editingExam.semester}
                                        onChange={e => {
                                            const s = parseInt(e.target.value);
                                            const y = Math.ceil(s / 2);
                                            setEditingExam({ ...editingExam, semester: s, year_of_study: y });
                                        }}
                                        className="w-full bg-slate-50 border p-3 rounded-xl font-bold"
                                    >
                                        {[1, 2, 3, 4, 5, 6, 7, 8]
                                            .filter(s => Math.ceil(s / 2) === editingExam.year_of_study)
                                            .map(s => <option key={s} value={s}>Sem {s}</option>)
                                        }
                                    </select>
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
            {showResultModal && resultData && (
                <ResultModal
                    exam={resultData}
                    onClose={() => setShowResultModal(false)}
                />
            )}
            {/* Seating Plan Popup */}
            <SeatingPopup
                isOpen={popupState.isOpen}
                onClose={() => setPopupState({ ...popupState, isOpen: false })}
                examId={popupState.examId}
                courseName={popupState.courseName}
            />
        </div>
    )
}
