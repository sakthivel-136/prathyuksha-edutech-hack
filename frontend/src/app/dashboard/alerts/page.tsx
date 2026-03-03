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
            .catch(() => {})
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
                                <div key={i} className="p-8 hover:bg-slate-50 transition-all flex items-center justify-between group">
                                    <div className="flex items-center gap-6">
                                        <div className="w-16 h-16 bg-white rounded-3xl shadow-sm flex items-center justify-center text-rose-600 border border-slate-100 relative group-hover:scale-110 transition-transform">
                                            <Users className="w-8 h-8" />
                                        </div>
                                        <div className="space-y-1">
                                            <h4 className="font-black text-[#001b5e] text-lg leading-tight">{student.name}</h4>
                                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{student.roll} • <span className="text-rose-500">{student.reason}</span></p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-12">
                                        <div className="text-right">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Risk Factor</p>
                                            <div className="flex items-center gap-2 justify-end">
                                                {student.trend === 'up' ? <TrendingUp className="w-4 h-4 text-rose-600" /> : student.trend === 'down' ? <TrendingDown className="w-4 h-4 text-emerald-600" /> : <div className="w-4 h-4 bg-slate-200 rounded-full" />}
                                                <span className={`text-2xl font-black ${parseInt(student.risk) > 80 ? 'text-rose-600' : 'text-[#001b5e]'}`}>{student.risk}</span>
                                            </div>
                                        </div>
                                        <button className="bg-white border border-slate-200 p-4 rounded-2xl group-hover:bg-[#001b5e] group-hover:text-white transition-all shadow-sm">
                                            <ChevronRight className="w-5 h-5" />
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
                                <span className="text-rose-600">90.4% F1</span>
                            </div>
                            <div className="h-2 bg-rose-100 rounded-full overflow-hidden">
                                <div className="h-full bg-rose-600 w-[90%]" />
                            </div>
                        </div>
                    </div>

                    <div className="vantage-card p-8">
                        <h3 className="font-black text-[#001b5e] mb-6">Action Quick Links</h3>
                        <div className="space-y-3">
                            {[
                                { label: 'Schedule Counseling', icon: UserPlus },
                                { label: 'View Performance Shocks', icon: TrendingDown },
                                { label: 'Add to Watchlist', icon: MessageSquare },
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
        </div>
    )
}
