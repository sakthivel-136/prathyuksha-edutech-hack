"use client"

import { useEffect, useState } from 'react'
import { BookOpen, Clock, Inbox, Plus } from 'lucide-react'
import { API_BASE, getAuthHeaders } from '@/lib/api'

export default function CoursesPage() {
    const [courses, setCourses] = useState<any[]>([])
    const [recommendations, setRecommendations] = useState<any[]>([])
    const [curriculum, setCurriculum] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [role, setRole] = useState('')
    const [showAddModal, setShowAddModal] = useState(false)
    const [submitting, setSubmitting] = useState(false)
    const [modalType, setModalType] = useState<'global' | 'study'>('global')
    const [curriculumFilter, setCurriculumFilter] = useState({
        dept: 'CSE',
        year: '1',
        sem: '1'
    })

    useEffect(() => {
        setRole(localStorage.getItem('userRole') || 'student')
        fetchData()
        fetchCurriculum()
    }, [curriculumFilter])

    const fetchCurriculum = async () => {
        try {
            const params = new URLSearchParams({
                dept: curriculumFilter.dept,
                year: curriculumFilter.year,
                sem: curriculumFilter.sem
            })
            const res = await fetch(`${API_BASE}/api/curriculum?${params.toString()}`, { headers: getAuthHeaders() })
            if (res.ok) setCurriculum(await res.json())
        } catch (e) { console.error(e) }
    }

    const fetchData = async () => {
        setLoading(true)
        try {
            const courseRes = await fetch(`${API_BASE}/api/courses`, { headers: getAuthHeaders() })
            if (courseRes.ok) setCourses(await courseRes.json())

            const recRes = await fetch(`${API_BASE}/api/recommendations`, { headers: getAuthHeaders() })
            if (recRes.ok) setRecommendations(await recRes.json())
        } catch (e) { console.error(e) }
        setLoading(false)
    }

    const handleAddRecommendation = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setSubmitting(true)
        const formData = new FormData(e.currentTarget)
        const payload = {
            title: formData.get('title'),
            description: formData.get('description'),
            link: formData.get('link'),
            type: formData.get('type') // 'course' or 'resource'
        }

        try {
            const res = await fetch(`${API_BASE}/api/recommendations`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
                body: JSON.stringify(payload)
            })
            if (res.ok) {
                alert('Recommendation added!')
                setShowAddModal(false)
                fetchData()
            }
        } catch (e) { alert('Failed to add') }
        setSubmitting(false)
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="w-10 h-10 border-4 border-[#001b5e] border-t-transparent rounded-full animate-spin"></div>
            </div>
        )
    }

    return (
        <div className="space-y-12 fade-in pb-20">
            <div className="flex justify-between items-end">
                <div className="space-y-1">
                    <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Academic Portal</p>
                    <h1 className="text-4xl font-black text-[#001b5e]">Courses & Recommendations</h1>
                </div>
                <div className="flex gap-3">
                    {(role === 'admin' || role === 'coe') && (
                        <>
                            <button
                                onClick={() => { setModalType('global'); setShowAddModal(true) }}
                                className="bg-[#001b5e] text-white px-6 py-3 rounded-2xl font-black shadow-xl hover:scale-105 transition-all flex items-center gap-2 text-sm"
                            >
                                <Plus className="w-4 h-4" /> Add Global Course
                            </button>
                            <button
                                onClick={() => { setModalType('study'); setShowAddModal(true) }}
                                className="bg-emerald-600 text-white px-6 py-3 rounded-2xl font-black shadow-xl hover:scale-105 transition-all flex items-center gap-2 text-sm"
                            >
                                <BookOpen className="w-4 h-4" /> Assign Personal Study Path
                            </button>
                        </>
                    )}
                </div>
            </div>

            <section className="space-y-6">
                <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-black text-[#001b5e]">Overall Curriculum Explorer</h2>
                    <div className="flex gap-2">
                        {['CSE', 'ECE', 'MECH', 'IT', 'AI-DS'].map(d => (
                            <button
                                key={d}
                                onClick={() => setCurriculumFilter({ ...curriculumFilter, dept: d })}
                                className={`px-4 py-1.5 rounded-full text-[10px] font-black transition-all ${curriculumFilter.dept === d ? 'bg-[#001b5e] text-white' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
                            >
                                {d}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex gap-4 p-2 bg-slate-50 rounded-2xl w-fit">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                        <button
                            key={s}
                            onClick={() => setCurriculumFilter({ ...curriculumFilter, sem: s.toString() })}
                            className={`px-6 py-2 rounded-xl text-xs font-bold transition-all ${curriculumFilter.sem === s.toString() ? 'bg-white text-[#001b5e] shadow-sm' : 'text-slate-400'}`}
                        >
                            Sem {s}
                        </button>
                    ))}
                </div>

                {curriculum.length === 0 ? (
                    <div className="lumina-card p-12 text-center text-slate-400 font-bold border-dashed border-2">
                        No curriculum data available for this selection.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {curriculum.map((c, i) => (
                            <div key={i} className="bg-white border border-slate-100 p-5 rounded-2xl hover:shadow-lg transition-all">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{c.course_code}</p>
                                <h4 className="font-bold text-[#001b5e] mt-1">{c.course_name}</h4>
                                <div className="flex justify-between items-center mt-4 pt-3 border-t border-slate-50">
                                    <span className="text-[10px] font-bold text-slate-400">{c.department}</span>
                                    <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-1 rounded-lg">{c.credits} Credits</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            <section className="space-y-6">
                <h2 className="text-2xl font-black text-[#001b5e]">Your Enrolled Courses</h2>
                {courses.length === 0 ? (
                    <div className="lumina-card p-16 flex flex-col items-center justify-center text-center space-y-4">
                        <Inbox className="w-16 h-16 text-slate-200" />
                        <h3 className="text-xl font-black text-[#001b5e]">No Active Enrollments</h3>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {courses.map((course, i) => (
                            <div key={i} className="lumina-card p-6 space-y-4 hover:shadow-xl transition-all group">
                                <div className="flex justify-between items-start">
                                    <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-[#001b5e] font-black text-sm border border-blue-100">
                                        {(course.course_code?.toString() || '??').slice(0, 2)}
                                    </div>
                                    <span className="text-[10px] font-black text-blue-500 bg-blue-50 px-3 py-1 rounded-full">{course.credits || 0} Credits</span>
                                </div>
                                <div>
                                    <h3 className="font-black text-[#001b5e] leading-tight">{course.course_name}</h3>
                                    <p className="text-xs font-bold text-slate-400 mt-1">{course.course_code} • {course.faculty || 'Dept Faculty'}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            <section className="space-y-6">
                <h2 className="text-2xl font-black text-[#001b5e]">Curated Study Path & Recommendations</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {recommendations.length === 0 ? (
                        <div className="lumina-card p-8 text-center text-slate-400">No recommendations available yet.</div>
                    ) : (
                        recommendations.map((rec, i) => (
                            <div key={i} className={`lumina-card p-8 border-l-4 ${rec.type === 'course' ? 'border-l-blue-600' : 'border-l-emerald-500'} flex justify-between items-start gap-6`}>
                                <div className="space-y-2">
                                    <span className={`text-[10px] font-black uppercase tracking-widest ${rec.type === 'course' ? 'text-blue-600' : 'text-emerald-600'}`}>{rec.type}</span>
                                    <h3 className="text-xl font-black text-[#001b5e]">{rec.title}</h3>
                                    <p className="text-sm text-slate-500 leading-relaxed font-medium">{rec.description}</p>
                                    {rec.link && (
                                        <a href={rec.link} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-blue-600 font-bold text-sm mt-2 hover:underline">
                                            View Resource <BookOpen className="w-4 h-4" />
                                        </a>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </section>

            {showAddModal && (
                <COEActionModal
                    type={modalType}
                    onClose={() => setShowAddModal(false)}
                    onSuccess={() => { fetchData(); fetchCurriculum() }}
                />
            )}
        </div>
    )
}

function COEActionModal({ type, onClose, onSuccess }: { type: 'global' | 'study', onClose: () => void, onSuccess: () => void }) {
    const [students, setStudents] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)

    useEffect(() => {
        const fetchMeta = async () => {
            try {
                const sRes = await fetch(`${API_BASE}/api/students`, { headers: getAuthHeaders() })
                if (sRes.ok) setStudents(await sRes.json())
            } catch (e) { console.error(e) }
            setLoading(false)
        }
        if (type === 'study') fetchMeta()
        else setLoading(false)
    }, [type])

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setSubmitting(true)
        const formData = new FormData(e.currentTarget)
        const isGlobal = type === 'global'

        const url = isGlobal ? `${API_BASE}/api/admin/courses` : `${API_BASE}/api/recommendations`
        const payload = isGlobal ? {
            course_name: formData.get('course_name'),
            course_code: formData.get('course_code'),
            department: formData.get('department'),
            credits: parseInt(formData.get('credits') as string),
            faculty: formData.get('faculty'),
            semester: parseInt(formData.get('semester') as string),
            year_group: parseInt(formData.get('year_group') as string)
        } : {
            title: formData.get('title'),
            description: formData.get('description'),
            link: formData.get('link'),
            student_id: formData.get('student_id'),
            category: 'Study Path'
        }

        try {
            const res = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
                body: JSON.stringify(payload)
            })
            if (res.ok) {
                alert(isGlobal ? 'Course added to curriculum!' : 'Personal study path assigned!')
                onSuccess()
                onClose()
            } else {
                const err = await res.json()
                alert(err.detail || 'Action failed')
            }
        } catch (e) {
            alert('Error processing request')
        }
        setSubmitting(false)
    }

    if (loading) return <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4"><div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div></div>

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
            <div className="bg-white p-8 rounded-3xl w-full max-w-md shadow-2xl space-y-6">
                <h2 className="text-2xl font-black text-[#001b5e]">
                    {type === 'global' ? 'Add Global Course' : 'Assign Study Path'}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {type === 'global' ? (
                        <>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-400 uppercase">Dept</label>
                                    <select name="department" className="w-full bg-slate-50 border p-3 rounded-xl font-bold">
                                        {['CSE', 'ECE', 'MECH', 'IT', 'AI-DS'].map(d => <option key={d} value={d}>{d}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-400 uppercase">Sem</label>
                                    <select name="semester" className="w-full bg-slate-50 border p-3 rounded-xl font-bold">
                                        {[1, 2, 3, 4, 5, 6, 7, 8].map(s => <option key={s} value={s}>Sem {s}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase">Course Name</label>
                                <input required name="course_name" className="w-full bg-slate-50 border p-3 rounded-xl font-bold" placeholder="e.g. Data Structures" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-400 uppercase">Code</label>
                                    <input required name="course_code" className="w-full bg-slate-50 border p-3 rounded-xl font-bold" placeholder="CS301" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-400 uppercase">Credits</label>
                                    <input type="number" name="credits" defaultValue={3} className="w-full bg-slate-50 border p-3 rounded-xl font-bold" />
                                </div>
                            </div>
                            <input type="hidden" name="year_group" value={1} />
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase">Faculty</label>
                                <input name="faculty" className="w-full bg-slate-50 border p-3 rounded-xl font-bold" placeholder="Dr. Smith" />
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase">Select Student</label>
                                <select required name="student_id" className="w-full bg-slate-50 border p-3 rounded-xl font-bold">
                                    <option value="">Choose Student...</option>
                                    {students.map(s => <option key={s.id} value={s.id}>{s.full_name} ({s.roll_number})</option>)}
                                </select>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase">Path Title</label>
                                <input required name="title" className="w-full bg-slate-50 border p-3 rounded-xl font-bold" placeholder="e.g. Backtracking Mastery" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase">Description</label>
                                <textarea required name="description" className="w-full bg-slate-50 border p-3 rounded-xl font-bold h-24" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase">Link</label>
                                <input name="link" className="w-full bg-slate-50 border p-3 rounded-xl font-bold" placeholder="https://..." />
                            </div>
                        </>
                    )}

                    <div className="flex gap-4 pt-4">
                        <button type="button" onClick={onClose} className="flex-1 bg-slate-100 py-3 rounded-xl font-bold">Cancel</button>
                        <button type="submit" disabled={submitting} className="flex-1 bg-[#001b5e] text-white py-3 rounded-xl font-black">
                            {submitting ? 'Processing...' : 'Save'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

