"use client"

import { useEffect, useState } from 'react'
import { API_BASE, getAuthHeaders } from '@/lib/api'
import { GraduationCap, Trophy, Lock, Unlock, Eye, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react'

export default function ResultsPage() {
    const [results, setResults] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [role, setRole] = useState('student')
    const [publishing, setPublishing] = useState<string | null>(null)

    useEffect(() => {
        const userRole = localStorage.getItem('userRole') || 'student'
        setRole(userRole)
        fetchResults(userRole)

        // Dynamic Updates: Poll every 10s to keep UI interactive without refresh
        const poll = setInterval(() => fetchResults(userRole), 10000)
        return () => clearInterval(poll)
    }, [])

    const fetchResults = async (userRole: string) => {
        // Only show loading on initial fetch
        if (results.length === 0) setLoading(true)
        try {
            const endpoint = userRole === 'student' ? '/api/results/my' : '/api/results/all'
            const res = await fetch(`${API_BASE}${endpoint}`, { headers: getAuthHeaders() })
            if (res.ok) {
                const data = await res.json()
                setResults(Array.isArray(data) ? data : [])
            }
        } catch (e) {
            console.error("Failed to fetch results", e)
        } finally {
            setLoading(false)
        }
    }

    const handlePublish = async (courseId?: string, semester?: number) => {
        if (role !== 'coe') return alert("Only COE can publish results.")
        setPublishing(courseId || 'all')
        try {
            const res = await fetch(`${API_BASE}/api/results/publish`, {
                method: 'POST',
                headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
                body: JSON.stringify({ course_id: courseId, semester })
            })
            if (res.ok) {
                alert("✅ Results published successfully!")
                fetchResults(role)
            }
        } catch (e) {
            console.error("Publish failed", e)
        } finally {
            setPublishing(null)
        }
    }

    if (loading && results.length === 0) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="w-10 h-10 border-4 border-blue-900 border-t-transparent rounded-full animate-spin"></div>
        </div>
    )

    const isCoe = role === 'coe' || role === 'admin'
    const canPublish = role === 'coe'

    return (
        <div className="space-y-8 fade-in">
            <div className="flex justify-between items-end">
                <div className="space-y-1">
                    <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Academic Performance</p>
                    <h1 className="text-4xl font-black text-[#001b5e]">Examination Results</h1>
                </div>
                {canPublish && (
                    <button
                        onClick={() => handlePublish()}
                        disabled={!!publishing}
                        className="bg-[#001b5e] text-white px-6 py-3 rounded-2xl font-black shadow-xl hover:bg-blue-700 transition-all flex items-center gap-2"
                    >
                        <Unlock className="w-4 h-4" /> {publishing ? 'Publishing...' : 'Publish All Results'}
                    </button>
                )}
            </div>

            {results.length === 0 ? (
                <div className="vantage-card p-16 flex flex-col items-center justify-center text-center space-y-4">
                    <Lock className="w-16 h-16 text-slate-200" />
                    <h3 className="text-xl font-black text-[#001b5e]">No Results Published</h3>
                    <p className="text-slate-400 max-w-sm">
                        {role === 'student'
                            ? "Your results haven't been published by the COE yet. Please check back later."
                            : "No student results found in the system yet."}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6">
                    {/* Summary Card for Students */}
                    {!isCoe && (
                        <div className="vantage-card bg-gradient-to-br from-[#001b5e] to-blue-900 p-8 text-white flex items-center justify-between">
                            <div className="space-y-2">
                                <h2 className="text-2xl font-black">Good Job!</h2>
                                <p className="text-blue-200 font-bold">You have cleared {results.filter(r => r.status === 'Pass').length} out of {results.length} subjects.</p>
                            </div>
                            <Trophy className="w-16 h-16 text-amber-400 opacity-80" />
                        </div>
                    )}

                    <div className="vantage-card overflow-hidden">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-100">
                                    <th className="px-6 py-4 text-left text-[10px] font-black uppercase text-slate-400 tracking-widest">Course</th>
                                    {isCoe && <th className="px-6 py-4 text-left text-[10px] font-black uppercase text-slate-400 tracking-widest">Student</th>}
                                    <th className="px-6 py-4 text-left text-[10px] font-black uppercase text-slate-400 tracking-widest">Semester</th>
                                    <th className="px-6 py-4 text-left text-[10px] font-black uppercase text-slate-400 tracking-widest">Marks/Result</th>
                                    <th className="px-6 py-4 text-left text-[10px] font-black uppercase text-slate-400 tracking-widest">Grade</th>
                                    <th className="px-6 py-4 text-left text-[10px] font-black uppercase text-slate-400 tracking-widest">Status</th>
                                    {isCoe && <th className="px-6 py-4 text-left text-[10px] font-black uppercase text-slate-400 tracking-widest">Visibility</th>}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {results.map((r, i) => (
                                    <tr key={r.id || i} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <p className="font-black text-[#001b5e] uppercase">{r.course_code}</p>
                                            <p className="text-xs font-bold text-slate-400 truncate max-w-[200px]">{r.course_name || 'Major Course'}</p>
                                        </td>
                                        {isCoe && (
                                            <td className="px-6 py-4">
                                                <p className="font-black text-slate-700">{r.user_profiles?.full_name}</p>
                                                <p className="text-[10px] font-bold text-slate-400">{r.user_profiles?.roll_number}</p>
                                            </td>
                                        )}
                                        <td className="px-6 py-4 font-black text-slate-600">SEM {r.semester}</td>
                                        <td className="px-6 py-4">
                                            <span className="font-black text-slate-700 text-lg">
                                                {r.marks ?? r.grade_points ?? '—'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="w-10 h-10 bg-blue-50 text-[#001b5e] rounded-xl flex items-center justify-center font-black text-lg border border-blue-100">
                                                {r.grade || '—'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider ${r.status === 'Pass' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-600 border border-rose-100'
                                                }`}>
                                                {r.status || 'Pending'}
                                            </span>
                                        </td>
                                        {isCoe && (
                                            <td className="px-6 py-4">
                                                {r.is_published ? (
                                                    <span className="flex items-center gap-1.5 text-emerald-600 font-black text-[10px] uppercase">
                                                        <CheckCircle2 className="w-3.5 h-3.5" /> Published
                                                    </span>
                                                ) : (
                                                    <button
                                                        onClick={() => handlePublish(r.course_id)}
                                                        className="text-blue-600 hover:text-blue-800 font-black text-[10px] uppercase flex items-center gap-1 underline decoration-2 underline-offset-4"
                                                    >
                                                        Publish Now
                                                    </button>
                                                )}
                                            </td>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    )
}
