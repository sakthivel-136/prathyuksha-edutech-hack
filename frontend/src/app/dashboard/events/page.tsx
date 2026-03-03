"use client"

import { useState, useEffect } from 'react'
import {
    Send,
    CheckCircle2,
    XCircle,
    Clock,
    FileText,
    Inbox,
    Plus
} from 'lucide-react'

export default function EventSubmissions() {
    const [role, setRole] = useState('student')
    const [submissions, setSubmissions] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [submitting, setSubmitting] = useState(false)
    const [form, setForm] = useState({ event_name: '', event_date: '', event_time: '', venue: '', description: '', department: 'CSE' })

    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : ''

    useEffect(() => {
        setRole(localStorage.getItem('userRole') || 'student')
        fetchSubmissions()
    }, [])

    const fetchSubmissions = () => {
        fetch('http://localhost:8000/api/events/submissions', {
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then(r => r.json())
            .then(data => { setSubmissions(Array.isArray(data) ? data : []); setLoading(false) })
            .catch(() => setLoading(false))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSubmitting(true)
        try {
            await fetch('http://localhost:8000/api/events/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(form)
            })
            setShowForm(false)
            setForm({ event_name: '', event_date: '', event_time: '', venue: '', description: '', department: 'CSE' })
            fetchSubmissions()
        } catch (err) {
            console.error(err)
        } finally {
            setSubmitting(false)
        }
    }

    const handleApprove = async (id: string, status: string) => {
        await fetch('http://localhost:8000/api/events/approve', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ event_id: id, status })
        })
        fetchSubmissions()
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="w-10 h-10 border-4 border-[#001b5e] border-t-transparent rounded-full animate-spin"></div>
            </div>
        )
    }

    return (
        <div className="space-y-8 fade-in">
            <div className="flex justify-between items-end">
                <div className="space-y-1">
                    <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Club & Events</p>
                    <h1 className="text-4xl font-black text-[#001b5e]">Event Submissions</h1>
                </div>
                <button onClick={() => setShowForm(!showForm)} className="bg-[#001b5e] text-white px-6 py-3 rounded-2xl font-black shadow-xl shadow-blue-900/20 flex items-center gap-2 hover:bg-blue-700 transition-all">
                    <Plus className="w-4 h-4" /> Submit Event
                </button>
            </div>

            {/* Submit Form */}
            {showForm && (
                <form onSubmit={handleSubmit} className="vantage-card p-8 space-y-6">
                    <h2 className="text-lg font-black text-[#001b5e]">New Event Submission</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Event Name</label>
                            <input value={form.event_name} onChange={e => setForm({ ...form, event_name: e.target.value })} required className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl font-bold text-[#001b5e] outline-none focus:ring-2 focus:ring-[#001b5e]" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</label>
                            <input type="date" value={form.event_date} onChange={e => setForm({ ...form, event_date: e.target.value })} required className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl font-bold text-[#001b5e] outline-none focus:ring-2 focus:ring-[#001b5e]" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Time</label>
                            <input type="time" value={form.event_time} onChange={e => setForm({ ...form, event_time: e.target.value })} required className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl font-bold text-[#001b5e] outline-none focus:ring-2 focus:ring-[#001b5e]" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Venue</label>
                            <input value={form.venue} onChange={e => setForm({ ...form, venue: e.target.value })} required className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl font-bold text-[#001b5e] outline-none focus:ring-2 focus:ring-[#001b5e]" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Department</label>
                            <select value={form.department} onChange={e => setForm({ ...form, department: e.target.value })} className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl font-bold text-[#001b5e] outline-none focus:ring-2 focus:ring-[#001b5e]">
                                <option>CSE</option><option>ECE</option><option>MECH</option><option>EEE</option><option>CIVIL</option><option>All</option>
                            </select>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Description</label>
                        <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} required className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl font-bold text-[#001b5e] outline-none focus:ring-2 focus:ring-[#001b5e] resize-none" />
                    </div>
                    <div className="flex gap-4">
                        <button type="submit" disabled={submitting} className="bg-[#001b5e] text-white px-8 py-3 rounded-2xl font-black flex items-center gap-2 disabled:opacity-50">
                            <Send className="w-4 h-4" /> {submitting ? 'Submitting...' : 'Submit for Approval'}
                        </button>
                        <button type="button" onClick={() => setShowForm(false)} className="bg-slate-100 text-slate-600 px-6 py-3 rounded-2xl font-bold">Cancel</button>
                    </div>
                </form>
            )}

            {/* Submissions List */}
            {submissions.length === 0 ? (
                <div className="vantage-card p-16 flex flex-col items-center justify-center text-center space-y-4">
                    <Inbox className="w-16 h-16 text-slate-200" />
                    <h3 className="text-xl font-black text-[#001b5e]">No Event Submissions</h3>
                    <p className="text-slate-400 max-w-sm">No events have been submitted yet. Click "Submit Event" to propose a new event for admin approval.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {submissions.map((sub: any, i: number) => (
                        <div key={i} className="vantage-card p-6 flex items-center justify-between hover:shadow-lg transition-all">
                            <div className="flex items-center gap-6">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${sub.status === 'approved' ? 'bg-emerald-50' : sub.status === 'rejected' ? 'bg-rose-50' : 'bg-amber-50'
                                    }`}>
                                    {sub.status === 'approved' ? <CheckCircle2 className="w-6 h-6 text-emerald-600" /> :
                                        sub.status === 'rejected' ? <XCircle className="w-6 h-6 text-rose-600" /> :
                                            <Clock className="w-6 h-6 text-amber-600" />}
                                </div>
                                <div>
                                    <h3 className="font-black text-[#001b5e]">{sub.event_name}</h3>
                                    <p className="text-xs font-bold text-slate-400 mt-1">{sub.event_date} • {sub.event_time} • {sub.venue} • by {sub.submitted_by_name || sub.submitted_by}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider ${sub.status === 'approved' ? 'bg-emerald-50 text-emerald-700' :
                                        sub.status === 'rejected' ? 'bg-rose-50 text-rose-700' :
                                            'bg-amber-50 text-amber-700'
                                    }`}>
                                    {sub.status}
                                </span>
                                {role === 'admin' && sub.status === 'pending' && (
                                    <div className="flex gap-2">
                                        <button onClick={() => handleApprove(sub.id, 'approved')} className="bg-emerald-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-emerald-700 transition-all">Approve</button>
                                        <button onClick={() => handleApprove(sub.id, 'rejected')} className="bg-rose-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-rose-700 transition-all">Reject</button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
