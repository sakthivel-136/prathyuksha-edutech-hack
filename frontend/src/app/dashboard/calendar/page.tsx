"use client"

import { useState, useEffect } from 'react'
<<<<<<< HEAD
import { Calendar, Clock, MapPin, Inbox } from 'lucide-react'
import { API_BASE, getAuthHeaders } from '@/lib/api'
=======
import { Calendar, Clock, MapPin, Inbox, Tag } from 'lucide-react'
>>>>>>> 79c451c68c096aafd4b160be6e271f1e8d9434f5

export default function AcademicCalendar() {
    const [events, setEvents] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
<<<<<<< HEAD
        fetch(`${API_BASE}/api/calendar`, {
            headers: getAuthHeaders()
=======
        const token = localStorage.getItem('accessToken')
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
        fetch(`${apiUrl}/api/calendar`, {
            headers: { 'Authorization': `Bearer ${token}` }
>>>>>>> 79c451c68c096aafd4b160be6e271f1e8d9434f5
        })
            .then(r => r.json())
            .then(data => { setEvents(Array.isArray(data) ? data : []); setLoading(false) })
            .catch(() => setLoading(false))
    }, [])

    const typeColors: Record<string, string> = {
        exam: 'bg-rose-50 text-rose-700',
        club_event: 'bg-violet-50 text-violet-700',
        holiday: 'bg-emerald-50 text-emerald-700',
        deadline: 'bg-amber-50 text-amber-700',
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
            <div className="space-y-1">
                <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Institutional</p>
                <h1 className="text-4xl font-black text-[#001b5e]">Academic Calendar</h1>
            </div>

            {events.length === 0 ? (
                <div className="vantage-card p-16 flex flex-col items-center justify-center text-center space-y-4">
                    <Inbox className="w-16 h-16 text-slate-200" />
                    <h3 className="text-xl font-black text-[#001b5e]">No Calendar Events</h3>
                    <p className="text-slate-400 max-w-sm">The academic calendar is empty. Events approved by admin will appear here automatically.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {events.map((event: any, i: number) => (
                        <div key={i} className="vantage-card p-6 hover:shadow-lg transition-all">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-6">
                                    <div className="w-16 h-16 bg-blue-50 rounded-2xl flex flex-col items-center justify-center text-[#001b5e] border border-blue-100">
                                        <Calendar className="w-5 h-5 text-blue-400" />
                                        <span className="text-[10px] font-black mt-0.5">{(event.event_date || '').split('-').slice(1).join('/')}</span>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-black text-[#001b5e]">{event.title}</h3>
                                        <p className="text-sm text-slate-500 font-medium mt-1">{event.description}</p>
                                        <div className="flex items-center gap-6 mt-2 text-xs font-bold text-slate-400">
                                            <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{event.event_time}</span>
                                            <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{event.venue}</span>
                                            <span>{event.department}</span>
                                        </div>
                                    </div>
                                </div>
                                <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider ${typeColors[event.event_type] || 'bg-slate-50 text-slate-700'}`}>
                                    {(event.event_type || 'event').replace('_', ' ')}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
