"use client"

import { useEffect, useState } from 'react'
import { BookOpen, Clock, Inbox } from 'lucide-react'
import { API_BASE, getAuthHeaders } from '@/lib/api'

export default function CoursesPage() {
    const [courses, setCourses] = useState<Record<string, string | number>[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        setLoading(true)
        fetch(`${API_BASE}/api/courses`, { headers: getAuthHeaders() })
            .then(r => r.json())
            .then(data => { setCourses(Array.isArray(data) ? data : []); setLoading(false) })
            .catch(() => setLoading(false))
    }, [])

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
                <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Academic Portal</p>
                <h1 className="text-4xl font-black text-[#001b5e]">My Courses</h1>
            </div>

            {courses.length === 0 ? (
                <div className="vantage-card p-16 flex flex-col items-center justify-center text-center space-y-4">
                    <Inbox className="w-16 h-16 text-slate-200" />
                    <h3 className="text-xl font-black text-[#001b5e]">No Courses Available</h3>
                    <p className="text-slate-400 max-w-sm">Courses have not been assigned yet. Your admin or faculty will add them to the system.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {courses.map((course, i) => (
                        <div key={i} className="vantage-card p-6 space-y-4 hover:shadow-xl transition-all group cursor-pointer">
                            <div className="flex justify-between items-start">
                                <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-[#001b5e] font-black text-sm border border-blue-100">
                                    {(course.course_code?.toString() || '??').slice(0, 2)}
                                </div>
                                <span className="text-[10px] font-black text-blue-500 bg-blue-50 px-3 py-1 rounded-full">{course.credits || 0} Credits</span>
                            </div>
                            <div>
                                <h3 className="font-black text-[#001b5e] leading-tight">{course.course_name}</h3>
                                <p className="text-xs font-bold text-slate-400 mt-1">{course.course_code} • {course.faculty}</p>
                            </div>
                            <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                                <div className="flex items-center gap-1 text-xs font-bold text-slate-500">
                                    <Clock className="w-3 h-3" />{course.schedule || 'TBD'}
                                </div>
                                <span className="text-xs font-bold text-slate-400">{course.department}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
