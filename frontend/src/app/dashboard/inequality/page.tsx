"use client"

import { useEffect, useState } from 'react'
import { API_BASE, getAuthHeaders } from '@/lib/api'
import { Scale, Activity, ArrowRight, ShieldAlert, BarChart3, TrendingUp, TrendingDown, Minus } from 'lucide-react'

export default function InequalityPage() {
    const [inequalityData, setInequalityData] = useState<any[]>([])
    const [heatmapData, setHeatmapData] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true)
            try {
                const [ineqRes, heatRes] = await Promise.all([
                    fetch(`${API_BASE}/api/academic_inequality`, { headers: getAuthHeaders() }),
                    fetch(`${API_BASE}/api/risk_heatmap`, { headers: getAuthHeaders() })
                ])
                if (ineqRes.ok) {
                    const data = await ineqRes.json()
                    setInequalityData(data.inequality_metrics || [])
                }
                if (heatRes.ok) {
                    const data = await heatRes.json()
                    setHeatmapData(data.current_semester_drivers || [])
                }
            } catch (error) {
                console.error("Failed to fetch data")
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="w-10 h-10 border-4 border-[#001b5e] border-t-transparent rounded-full animate-spin"></div>
            </div>
        )
    }

    return (
        <div className="space-y-12 fade-in">
            <div className="space-y-1 bg-gradient-to-r from-[#001b5e] to-blue-900 p-8 rounded-3xl text-white shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                    <Scale className="w-48 h-48" />
                </div>
                <p className="font-bold uppercase tracking-widest text-xs text-blue-300">AI Ethics & Fairness Hub</p>
                <h1 className="text-4xl font-black mb-4">Academic Inequality Detector</h1>
                <p className="max-w-xl text-blue-100 font-medium">
                    Our system doesn’t just predict failure — it audits fairness, monitors institutional bias, and tracks dynamic risk drivers fully offline and privacy-preserving.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Academic Inequality Detector Section */}
                <div className="space-y-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-rose-100 text-rose-600 rounded-xl flex items-center justify-center">
                            <ShieldAlert className="w-5 h-5" />
                        </div>
                        <h2 className="text-2xl font-black text-[#001b5e]">Statistical Parity Flags</h2>
                    </div>

                    <div className="space-y-4">
                        {inequalityData.map((item, idx) => (
                            <div key={idx} className="vantage-card p-6 border-l-4" style={{ borderLeftColor: item.impact === 'High' ? '#e11d48' : item.impact === 'Moderate' ? '#f59e0b' : '#10b981' }}>
                                <div className="flex justify-between items-start mb-4">
                                    <h3 className="font-black text-lg text-[#001b5e]">{item.factor}</h3>
                                    <span className={`text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full ${item.impact === 'High' ? 'bg-rose-100 text-rose-700' :
                                            item.impact === 'Moderate' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                                        }`}>
                                        {item.impact} Bias
                                    </span>
                                </div>
                                <div className="flex items-center gap-6">
                                    <div className="flex-1">
                                        <p className="text-xs font-bold text-slate-400 mb-1">{item.group_a}</p>
                                        <div className="flex items-end gap-2">
                                            <span className="text-2xl font-black text-slate-800">{item.risk_a}%</span>
                                            <span className="text-[10px] font-bold text-slate-400 mb-1">Avg Risk</span>
                                        </div>
                                    </div>
                                    <div className="text-slate-300">
                                        <ArrowRight className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-xs font-bold text-slate-400 mb-1">{item.group_b}</p>
                                        <div className="flex items-end gap-2">
                                            <span className="text-2xl font-black text-slate-800">{item.risk_b}%</span>
                                            <span className="text-[10px] font-bold text-slate-400 mb-1">Avg Risk</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-4 pt-4 border-t border-slate-100">
                                    <p className="text-sm font-bold text-slate-600 flex items-center gap-2">
                                        <span className="text-[#001b5e]">Statistical Risk Gap:</span>
                                        <span className="font-black">{item.gap}%</span>
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Risk Sensitivity Heatmap Section */}
                <div className="space-y-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
                            <Activity className="w-5 h-5" />
                        </div>
                        <h2 className="text-2xl font-black text-[#001b5e]">Risk Sensitivity Heatmap</h2>
                    </div>

                    <div className="vantage-card p-6">
                        <p className="text-sm text-slate-500 mb-6 font-medium">
                            Derived via Average Absolute SHAP Impact. Assesses which features are actively driving student failure predictions this semester compared to historical baselines.
                        </p>

                        <div className="space-y-4">
                            {heatmapData.map((item, idx) => {
                                const maxImpact = Math.max(...heatmapData.map(d => d.impact))
                                const percentage = (item.impact / maxImpact) * 100
                                const shift = item.impact - item.previous_impact

                                return (
                                    <div key={idx} className="space-y-2">
                                        <div className="flex justify-between items-end">
                                            <span className="font-bold text-slate-700 capitalize text-sm">{item.feature.replace('_', ' ')}</span>
                                            <div className="flex items-center gap-2">
                                                {shift > 0.05 ? <TrendingUp className="w-3 h-3 text-rose-500" /> :
                                                    shift < -0.05 ? <TrendingDown className="w-3 h-3 text-emerald-500" /> :
                                                        <Minus className="w-3 h-3 text-slate-400" />}
                                                <span className="text-xs font-black text-slate-500">{item.impact.toFixed(3)}</span>
                                            </div>
                                        </div>
                                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden flex">
                                            <div
                                                className={`h-full rounded-full transition-all duration-1000 ${percentage > 70 ? 'bg-gradient-to-r from-rose-400 to-rose-600' :
                                                        percentage > 40 ? 'bg-gradient-to-r from-amber-400 to-amber-500' : 'bg-gradient-to-r from-blue-400 to-blue-500'
                                                    }`}
                                                style={{ width: `${percentage}%` }}
                                            />
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
