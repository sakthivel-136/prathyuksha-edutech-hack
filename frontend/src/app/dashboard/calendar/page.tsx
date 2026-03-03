"use client"

import { useState, useEffect, useMemo } from 'react'
import { Calendar as CalendarIcon, Filter, Layers, Inbox } from 'lucide-react'
import { API_BASE, getAuthHeaders } from '@/lib/api'
import { Calendar as BigCalendar, dateFnsLocalizer } from 'react-big-calendar'
import { format, parse, startOfWeek, getDay } from 'date-fns'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import './calendar-override.css' // custom styles placeholder

const locales = {
    'en-US': require('date-fns/locale/en-US'),
}

const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek,
    getDay,
    locales,
})

export default function AcademicCalendar() {
    const [events, setEvents] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [filterType, setFilterType] = useState('All')

    useEffect(() => {
        fetch(`${API_BASE}/api/calendar`, {
            headers: getAuthHeaders()
        })
            .then(r => r.json())
            .then(data => { setEvents(Array.isArray(data) ? data : []); setLoading(false) })
            .catch(() => setLoading(false))
    }, [])

    const filteredEvents = useMemo(() => {
        let filtered = events;
        if (filterType !== 'All') {
            filtered = filtered.filter(e => e.event_type === filterType);
        }

        return filtered.map(e => {
            const dateStr = (e.event_date || '2025-01-01');
            const [year, month, day] = dateStr.split('-');

            return {
                title: e.title,
                start: new Date(parseInt(year), parseInt(month) - 1, parseInt(day), 9, 0),
                end: new Date(parseInt(year), parseInt(month) - 1, parseInt(day), 17, 0),
                allDay: true,
                resource: e
            }
        });
    }, [events, filterType])

    const eventStyleGetter = (event: any) => {
        const typeColors: Record<string, string> = {
            exam: '#e11d48', // rose-600
            club_event: '#7c3aed', // violet-600
            holiday: '#059669', // emerald-600
            deadline: '#d97706', // amber-600
        }
        const bgColor = typeColors[event.resource.event_type] || '#001b5e';
        return {
            style: {
                backgroundColor: bgColor,
                borderRadius: '6px',
                opacity: 0.9,
                color: 'white',
                border: '0px',
                display: 'block',
                fontSize: '11px',
                fontWeight: '700',
                padding: '2px 6px'
            }
        }
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
                    <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Institutional</p>
                    <h1 className="text-4xl font-black text-[#001b5e]">Academic Calendar</h1>
                </div>

                <div className="flex items-center gap-4 bg-white p-2 rounded-xl border border-slate-200 shadow-sm">
                    <Filter className="w-4 h-4 text-slate-400 ml-2" />
                    <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                        className="bg-transparent text-sm font-bold text-slate-700 outline-none pr-4"
                    >
                        <option value="All">All Events</option>
                        <option value="exam">Exams</option>
                        <option value="club_event">Club Events</option>
                        <option value="holiday">Holidays</option>
                        <option value="deadline">Deadlines</option>
                    </select>
                </div>
            </div>

            <div className="vantage-card p-6 bg-white overflow-x-auto">
                <div className="min-w-[800px] h-[700px]">
                    <BigCalendar
                        localizer={localizer}
                        events={filteredEvents}
                        startAccessor="start"
                        endAccessor="end"
                        views={['month', 'agenda']}
                        eventPropGetter={eventStyleGetter}
                        tooltipAccessor={(e: any) => `${e.title}\nVenue: ${e.resource.venue || 'N/A'}\nDept: ${e.resource.department || 'All'}`}
                    />
                </div>
            </div>

            <div className="flex flex-wrap gap-4 mt-4">
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-rose-600"></div><span className="text-xs font-bold text-slate-600">Exam</span></div>
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-violet-600"></div><span className="text-xs font-bold text-slate-600">Club Event</span></div>
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-emerald-600"></div><span className="text-xs font-bold text-slate-600">Holiday</span></div>
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-amber-600"></div><span className="text-xs font-bold text-slate-600">Deadline</span></div>
            </div>
        </div>
    )
}
