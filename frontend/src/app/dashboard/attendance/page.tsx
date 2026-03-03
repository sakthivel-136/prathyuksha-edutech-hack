"use client"

import { useEffect, useState } from 'react'
import { API_BASE, getAuthHeaders } from '@/lib/api'
import { Trophy, TrendingUp, TrendingDown, Target, Zap, Activity } from 'lucide-react'

export default function AttendanceLeaderboard() {
    const [loading, setLoading] = useState(true)
    const [leaderboard, setLeaderboard] = useState<any[]>([])

    useEffect(() => {
        fetch(`${API_BASE}/api/attendance_leaderboard`, { headers: getAuthHeaders() })
            .then(res => res.json())
            .then(data => {
                setLeaderboard(data.leaderboard || [])
                setLoading(false)
            })
            .catch(console.error)
    }, [])

    if (loading) return <div className="p-8 text-center text-[#001b5e] font-black animate-pulse">Loading Leaderboard...</div>

    return (
        <div className="space-y-8 fade-in pb-10">
            <div className="flex justify-between items-end">
                <div className="space-y-1">
                    <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Gamification Engine</p>
                    <h1 className="text-4xl font-black text-[#001b5e]">Consistency Leaderboard</h1>
                </div>
                <div className="flex items-center gap-2 bg-rose-50 px-4 py-2 rounded-xl border border-rose-100">
                    <Zap className="w-5 h-5 text-rose-500" />
                    <span className="text-xs font-black text-rose-700 uppercase tracking-widest">Live Updates</span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Top 3 Podium */}
                <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6 items-end mb-8 mt-12">
                    {/* Rank 2 */}
                    {leaderboard[1] && (
                        <div className="vantage-card p-6 border-t-4 border-slate-300 relative text-center flex flex-col items-center">
                            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center font-black text-2xl text-slate-400 absolute -top-8 border-4 border-white shadow-sm">2</div>
                            <div className="mt-8 space-y-1">
                                <h3 className="text-xl font-black text-[#001b5e]">{leaderboard[1].name}</h3>
                                <p className="text-xs font-bold text-slate-400">{leaderboard[1].department}</p>
                            </div>
                            <div className="mt-6 text-center">
                                <span className="text-3xl font-black text-slate-700">{leaderboard[1].final_score.toFixed(1)}</span>
                                <span className="text-xs font-bold text-slate-400 ml-1 uppercase">Score</span>
                            </div>
                        </div>
                    )}

                    {/* Rank 1 */}
                    {leaderboard[0] && (
                        <div className="vantage-card p-8 border-t-4 border-yellow-400 relative text-center flex flex-col items-center transform scale-105 z-10 shadow-2xl">
                            <div className="w-20 h-20 bg-yellow-50 rounded-full flex items-center justify-center font-black text-4xl text-yellow-500 absolute -top-10 border-4 border-white shadow-xl">
                                <Trophy className="w-8 h-8" />
                            </div>
                            <div className="mt-10 space-y-1">
                                <h3 className="text-2xl font-black text-[#001b5e]">{leaderboard[0].name}</h3>
                                <p className="text-xs font-bold text-slate-400">{leaderboard[0].department}</p>
                            </div>
                            <div className="mt-6 text-center bg-yellow-50 w-full rounded-2xl p-4 border border-yellow-100">
                                <span className="text-4xl font-black text-yellow-600">{leaderboard[0].final_score.toFixed(1)}</span>
                                <span className="text-xs font-bold text-yellow-500 block uppercase pt-1">Vantage Score</span>
                            </div>
                        </div>
                    )}

                    {/* Rank 3 */}
                    {leaderboard[2] && (
                        <div className="vantage-card p-6 border-t-4 border-orange-300 relative text-center flex flex-col items-center">
                            <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center font-black text-2xl text-orange-400 absolute -top-8 border-4 border-white shadow-sm">3</div>
                            <div className="mt-8 space-y-1">
                                <h3 className="text-xl font-black text-[#001b5e]">{leaderboard[2].name}</h3>
                                <p className="text-xs font-bold text-slate-400">{leaderboard[2].department}</p>
                            </div>
                            <div className="mt-6 text-center">
                                <span className="text-3xl font-black text-orange-600">{leaderboard[2].final_score.toFixed(1)}</span>
                                <span className="text-xs font-bold text-slate-400 ml-1 uppercase">Score</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Full List */}
                <div className="lg:col-span-2">
                    <div className="vantage-card overflow-hidden">
                        <div className="p-6 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                            <h3 className="font-black text-[#001b5e] text-lg">Global Rankings</h3>
                            <span className="text-xs font-bold text-slate-500">Algorithm: (Raw Avg × 0.7) + (Consistency × 0.3)</span>
                        </div>
                        <div className="divide-y divide-slate-50">
                            {leaderboard.slice(3).map((student, idx) => (
                                <div key={student.id} className="p-4 sm:p-6 hover:bg-slate-50 transition-all flex items-center gap-6 group">
                                    <div className="w-10 text-center flex-shrink-0">
                                        <span className="text-2xl font-black text-slate-300 group-hover:text-blue-200 transition-colors">#{idx + 4}</span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-black text-[#001b5e] text-lg truncate">{student.name}</h4>
                                        <div className="flex items-center gap-4 mt-1">
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{student.department}</span>
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">• {student.id}</span>
                                        </div>
                                    </div>
                                    <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 sm:gap-6 text-right">
                                        <div className="hidden sm:block">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Consistency</p>
                                            <span className="text-sm font-bold text-emerald-600">{student.consistency_score.toFixed(1)}/100</span>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Raw Avg</p>
                                            <span className="text-sm font-bold text-blue-600">{student.attendance_avg.toFixed(1)}%</span>
                                        </div>
                                        <div className="bg-[#001b5e]/5 px-4 py-2 rounded-xl min-w-[5rem] text-center border border-[#001b5e]/10">
                                            <span className="text-xl font-black text-[#001b5e]">{student.final_score.toFixed(1)}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Score Explainer */}
                <div className="space-y-6">
                    <div className="vantage-card p-8 bg-[#001b5e] text-white">
                        <Target className="w-8 h-8 text-blue-400 mb-6" />
                        <h3 className="text-xl font-black mb-2">How It Works</h3>
                        <p className="text-sm text-blue-100 font-medium leading-relaxed mb-6">
                            VANTAGE doesn't just measure raw attendance percentage. We calculate a mathematically proven Consistency Score to reward students who maintain disciplined, daily habits.
                        </p>
                        <ul className="space-y-4">
                            <li className="flex items-start gap-3">
                                <TrendingUp className="w-5 h-5 text-emerald-400 shrink-0" />
                                <span className="text-xs font-bold text-blue-100">70% Weight on Raw Attendance Average</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <Activity className="w-5 h-5 text-purple-400 shrink-0" />
                                <span className="text-xs font-bold text-blue-100">30% Weight on Consistency (Low Standard Deviation)</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    )
}
