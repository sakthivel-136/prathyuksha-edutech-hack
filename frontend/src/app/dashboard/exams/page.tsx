"use client"

import { useEffect, useState } from 'react'
import { API_BASE, getAuthHeaders } from '@/lib/api'
        })
            .then(r => r.json())
            .then(data => { setExams(Array.isArray(data) ? data : []); setLoading(false) })
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
                <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Examination</p>
                <h1 className="text-4xl font-black text-[#001b5e]">Exam Schedule</h1>
            </div>

            {exams.length === 0 ? (
                <div className="vantage-card p-16 flex flex-col items-center justify-center text-center space-y-4">
                    <Inbox className="w-16 h-16 text-slate-200" />
                    <h3 className="text-xl font-black text-[#001b5e]">No Exams Scheduled</h3>
                    <p className="text-slate-400 max-w-sm">No exam schedule has been published yet. Your admin will update this when the schedule is ready.</p>
                </div>
            ) : (
                <div className="vantage-card overflow-hidden">
                    <div className="divide-y divide-slate-100">
                        {exams.map((exam: any, i: number) => (
                            <div key={i} className="p-6 hover:bg-slate-50 transition-all flex items-center justify-between">
                                <div className="flex items-center gap-6">
                                    <div className="w-14 h-14 bg-blue-50 rounded-2xl flex flex-col items-center justify-center text-[#001b5e] border border-blue-100">
                                        <span className="text-xs font-black leading-tight">{(exam.exam_date || '').split(' ')[0] || '—'}</span>
                                        <span className="text-lg font-black leading-tight">{(exam.exam_date || '').split(' ')[1]?.replace(',', '') || '—'}</span>
                                    </div>
                                    <div>
                                        <h4 className="font-black text-[#001b5e]">{exam.course_name}</h4>
                                        <p className="text-xs font-bold text-slate-400 mt-1">{exam.course_code} • {exam.exam_type}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-8">
                                    <div className="flex items-center gap-2 text-sm font-bold text-slate-600">
                                        <Clock className="w-4 h-4 text-slate-400" />
                                        {exam.exam_time || 'TBD'}
                                    </div>
                                    <div className="flex items-center gap-2 text-sm font-bold text-slate-600">
                                        <MapPin className="w-4 h-4 text-slate-400" />
                                        {exam.room || 'TBD'}
                                    </div>
                                    <span className="bg-blue-50 text-blue-700 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider">
                                        Upcoming
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
