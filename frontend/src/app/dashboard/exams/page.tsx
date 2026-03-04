"use client"

import { useEffect, useState } from 'react'
import { Clock, MapPin, Inbox, Plus, Trash2, X, Edit2 } from 'lucide-react'
import { API_BASE, getAuthHeaders } from '@/lib/api'

export default function ExamsPage() {
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
        department: 'CSE'
    })

    // Edit Modal State
    const [showEditModal, setShowEditModal] = useState(false)
    const [editingExam, setEditingExam] = useState<any>(null)

    const fetchExams = () => {
        setLoading(true)
        fetch(`${API_BASE}/api/exams`, { headers: getAuthHeaders() })
            .then(r => r.json())
            .then(data => { setExams(Array.isArray(data) ? data : []); setLoading(false) })
            .catch(() => setLoading(false))
    }

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setRole(localStorage.getItem('userRole') || 'student')
        }
        fetchExams()
    }, [])

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
                body: JSON.stringify({ ...newExam, room: '' }) // Room is allotted later
            })
            if (res.ok) {
                setShowCreateModal(false)
                setNewExam({
                    course_code: '',
                    course_name: '',
                    exam_date: '',
                    exam_time: '',
                    exam_type: 'End Sem',
                    department: 'CSE'
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

    if (loading && exams.length === 0) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="w-10 h-10 border-4 border-[#001b5e] border-t-transparent rounded-full animate-spin"></div>
            </div>
        )
    }

    const isAdmin = role === 'admin'

    return (
        <div className="space-y-8 fade-in relative">
            <div className="flex justify-between items-end">
                <div className="space-y-1">
                    <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Examination</p>
                    <h1 className="text-4xl font-black text-[#001b5e]">Exam Schedule</h1>
                </div>
                {isAdmin && (
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="bg-[#001b5e] text-white px-6 py-3 rounded-2xl font-black shadow-xl shadow-blue-900/20 flex items-center gap-2 hover:bg-blue-700 transition-all"
                    >
                        <Plus className="w-4 h-4" /> Add Exam
                    </button>
                )}
            </div>

            {exams.length === 0 ? (
                <div className="vantage-card p-16 flex flex-col items-center justify-center text-center space-y-4">
                    <Inbox className="w-16 h-16 text-slate-200" />
                    <h3 className="text-xl font-black text-[#001b5e]">No Exams Scheduled</h3>
                    <p className="text-slate-400 max-w-sm">No exam schedule has been published yet. Check back later.</p>
                </div>
            ) : (
                <div className="vantage-card overflow-hidden">
                    <div className="divide-y divide-slate-100">
                        {exams.map((exam, i: number) => (
                            <div key={i} className="p-6 hover:bg-slate-50 transition-all flex items-center justify-between group">
                                <div className="flex items-center gap-6">
                                    <div className="w-14 h-14 bg-blue-50 rounded-2xl flex flex-col items-center justify-center text-[#001b5e] border border-blue-100">
                                        <span className="text-xs font-black leading-tight">{(exam.exam_date || '').split(' ')[0] || '—'}</span>
                                        <span className="text-lg font-black leading-tight">{(exam.exam_date || '').split('-')[2] || '—'}</span>
                                    </div>
                                    <div>
                                        <h4 className="font-black text-[#001b5e] text-lg">{exam.course_name}</h4>
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
                                    <span className="bg-blue-50 text-blue-700 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider">
                                        Upcoming
                                    </span>
                                    {isAdmin && (
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => openEditModal(exam)}
                                                className="p-2 text-slate-300 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all opacity-0 group-hover:opacity-100"
                                                title="Edit Exam"
                                            >
                                                <Edit2 className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(exam.id)}
                                                className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-full transition-all opacity-0 group-hover:opacity-100"
                                                title="Delete Exam"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
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
                                    <label className="text-[10px] font-black uppercase text-slate-400">Department</label>
                                    <input required type="text" value={newExam.department} onChange={e => setNewExam({ ...newExam, department: e.target.value })} className="w-full bg-slate-50 border p-3 rounded-xl font-bold" placeholder="CSE" />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase text-slate-400">Course Name</label>
                                <input required type="text" value={newExam.course_name} onChange={e => setNewExam({ ...newExam, course_name: e.target.value })} className="w-full bg-slate-50 border p-3 rounded-xl font-bold" placeholder="Data Structures" />
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

                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase text-slate-400">Exam Type</label>
                                <select value={newExam.exam_type} onChange={e => setNewExam({ ...newExam, exam_type: e.target.value })} className="w-full bg-slate-50 border p-3 rounded-xl font-bold">
                                    <option>Mid Sem</option>
                                    <option>End Sem</option>
                                    <option>Lab</option>
                                </select>
                            </div>
                            <p className="text-xs text-slate-400 italic mb-2">Note: Exam room will be allotted later by the Seating Manager.</p>

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
                                <input type="text" value={editingExam.room || ''} onChange={e => setEditingExam({ ...editingExam, room: e.target.value })} className="w-full bg-slate-50 border p-3 rounded-xl font-bold" placeholder="e.g. B-101 (Leave blank to allocate later)" />
                            </div>

                            <button type="submit" className="w-full mt-4 bg-[#001b5e] text-white py-4 rounded-xl font-black shadow-xl hover:bg-blue-800 transition-all">
                                Save Changes
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
