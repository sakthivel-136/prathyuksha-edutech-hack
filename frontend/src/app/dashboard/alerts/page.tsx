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
    RefreshCw
} from 'lucide-react'
import { API_BASE, getAuthHeaders } from '@/lib/api'

const FALLBACK_AT_RISK = [
    { name: 'John Doe', roll: 'STU102', risk: '85%', reason: 'High absences (12)', trend: 'up' as const },
    { name: 'Kavin M', roll: 'STU205', risk: '72%', reason: 'Low study hours (<2h)', trend: 'stable' as const },
    { name: 'Swetha P', roll: 'STU311', risk: '64%', reason: 'Past grade volatility', trend: 'down' as const },
]

export default function EarlyWarning() {
    const [atRisk, setAtRisk] = useState<typeof FALLBACK_AT_RISK>(FALLBACK_AT_RISK)
    const [loading, setLoading] = useState(true)
    const [selectedStudent, setSelectedStudent] = useState<any>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleScheduleCounseling = async (student: any, staff: string, date: string, time: string) => {
        setIsSubmitting(true)
        try {
            await fetch(`${API_BASE}/api/notifications`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
                body: JSON.stringify({
                    title: 'Counseling Scheduled',
                    message: `Your counseling has been scheduled with ${staff} on ${date} at ${time}.`,
                    target_role: 'student',
                    target_user_id: student.name // sending name since user profile mock doesn't match ID easily in demo
                })
            })
            alert('Counseling scheduled successfully! Notification sent to student.')
            setSelectedStudent(null)
        } catch (error) {
            console.error(error)
            alert('Failed to schedule counseling')
        } finally {
            setIsSubmitting(false)
        }
    }

    const fetchAlerts = () => {
        setLoading(true)
        fetch(`${API_BASE}/api/at_risk_students`, { headers: getAuthHeaders() })
            .then(r => r.json())
            .then((data: Array<{ id: string; name: string; risk_probability: number; reason: string }>) => {
                if (Array.isArray(data) && data.length > 0) {
                    setAtRisk(data.map(s => ({
                        name: s.name,
                        roll: s.id,
                        risk: `${Math.round(s.risk_probability * 100)}%`,
                        reason: s.reason,
                        trend: 'stable' as const
                    })))
                }
            })
            .catch(() => { })
            .finally(() => setLoading(false))
    }

    useEffect(() => { fetchAlerts() }, [])

    return (
        <div className="space-y-8 fade-in">
            <div className="flex justify-between items-end">
                <div className="space-y-1">
                    <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Early Warning System</p>
                    <h1 className="text-4xl font-black text-[#001b5e]">At-Risk Students Panel</h1>
                </div>
                <div className="flex gap-4">
                    <button onClick={fetchAlerts} disabled={loading} className="bg-white border border-slate-200 px-6 py-3 rounded-2xl font-bold text-slate-600 flex items-center gap-2 hover:bg-slate-50 transition-all disabled:opacity-50">
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </button>
                    <div className="vantage-card overflow-hidden">
                        <div className="divide-y divide-slate-100">
                            {atRisk.length === 0 ? (
                                <div className="p-8 text-center text-slate-500">No students are currently marked as at-risk.</div>
                            ) : (
                                atRisk.map((student, i) => (
                                    <div key={i} className="p-8 hover:bg-slate-50 transition-all flex flex-col md:flex-row items-start md:items-center justify-between group gap-4">
                                        <div className="flex items-center gap-6">
                                            <div className="w-16 h-16 bg-white rounded-3xl shadow-sm flex items-center justify-center text-rose-600 border border-slate-100 relative group-hover:scale-110 transition-transform">
                                                <Users className="w-8 h-8" />
                                            </div>
                                            <div className="space-y-1">
                                                <h4 className="font-black text-[#001b5e] text-lg leading-tight">{student.name}</h4>
                                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{student.roll} • <span className="text-rose-500">{student.reason}</span></p>
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap items-center gap-6 md:gap-12">
                                            <div className="text-right">
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Risk Factor</p>
                                                <div className="flex items-center gap-2 justify-end">
                                                    {student.trend === 'up' ? <TrendingUp className="w-4 h-4 text-rose-600" /> : student.trend === 'down' ? <TrendingDown className="w-4 h-4 text-emerald-600" /> : <div className="w-4 h-4 bg-slate-200 rounded-full" />}
                                                    <span className={`text-2xl font-black ${parseInt(student.risk) > 80 ? 'text-rose-600' : 'text-[#001b5e]'}`}>{student.risk}</span>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => setSelectedStudent(student)}
                                                className="bg-white border border-slate-200 px-4 py-3 rounded-2xl hover:bg-[#001b5e] hover:border-[#001b5e] hover:text-white transition-all shadow-sm text-sm font-bold text-slate-600 flex items-center gap-2"
                                            >
                                                <UserPlus className="w-4 h-4" /> Schedule Counseling
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                <div className="space-y-8">
                    <div className="vantage-card p-8 bg-rose-50 border-rose-100">
                        <ShieldAlert className="w-10 h-10 text-rose-600 mb-6" />
                        <h3 className="text-xl font-black text-[#001b5e] mb-2">Automated Early Warning</h3>
                        <p className="text-sm text-slate-600 leading-relaxed font-medium mb-8">
                            The Early Warning Engine integrates interaction logs and academic benchmarks to flag students before major assessments.
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

                    <div className="vantage-card p-8">
                        <h3 className="font-black text-[#001b5e] mb-6">Action Quick Links</h3>
                        <div className="space-y-3">
                            {[
                                { label: 'Add to Watchlist', icon: MessageSquare },
                                { label: 'Contact Parents', icon: Mail },
                            ].map((link, i) => (
                                <button key={i} className="w-full flex items-center justify-between p-4 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-all group">
                                    <div className="flex items-center gap-3">
                                        <link.icon className="w-4 h-4 text-slate-400 group-hover:text-[#001b5e]" />
                                        <span className="text-sm font-bold text-slate-600">{link.label}</span>
                                    </div>
                                    <ArrowUpRight className="w-4 h-4 text-slate-300" />
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Counseling Modal */}
            {selectedStudent && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm px-4 fade-in">
                    <div className="bg-white p-8 rounded-3xl w-full max-w-lg shadow-2xl relative">
                        <h2 className="text-2xl font-black text-[#001b5e] mb-2">Schedule Counseling</h2>
                        <p className="text-sm text-slate-500 mb-6">For: <strong className="text-slate-800">{selectedStudent.name}</strong> ({selectedStudent.roll})</p>

                        <form onSubmit={(e) => {
                            e.preventDefault();
                            const target = e.target as any;
                            const staff = target.staff.value;
                            const date = target.date.value;
                            const time = target.time.value;
                            handleScheduleCounseling(selectedStudent, staff, date, time);
                        }} className="space-y-4">
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
        </div>
    )
}
