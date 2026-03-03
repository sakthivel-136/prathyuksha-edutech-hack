"use client"

import { useEffect, useState } from 'react'
import { API_BASE, getAuthHeaders } from '@/lib/api'
import { Activity, Users, Settings2, ShieldAlert, ArrowRight, HeartPulse, BookOpen, Clock, Coffee } from 'lucide-react'

export default function DigitalTwin() {
    const [loading, setLoading] = useState(true)
    const [student, setStudent] = useState<any>(null)
    const [mods, setMods] = useState({
        studytime: 0,
        absences: 0,
        goout: 0,
        health: 0
    })
    const [simulatedRisk, setSimulatedRisk] = useState<number | null>(null)
    const [simulating, setSimulating] = useState(false)

    useEffect(() => {
        fetch(`${API_BASE}/api/digital_twin/student`, { headers: getAuthHeaders() })
            .then(res => res.json())
            .then(data => {
                setStudent(data)
                setMods(data.features)
                setSimulatedRisk(data.base_risk)
                setLoading(false)
            })
            .catch(console.error)
    }, [])

    const handleSimulate = async () => {
        setSimulating(true)
        try {
            const res = await fetch(`${API_BASE}/api/digital_twin/simulate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
                body: JSON.stringify({
                    raw_features: student.raw_features,
                    modifications: mods
                })
            })
            const data = await res.json()
            setSimulatedRisk(data.new_risk)
        } catch (error) {
            console.error(error)
        } finally {
            setSimulating(false)
        }
    }

    if (loading) return <div className="p-8 text-center text-[#001b5e] font-black animate-pulse">Loading Twin Data...</div>
    if (!student) return <div className="p-8 text-center text-rose-500 font-bold">Failed to load twin profile.</div>

    return (
        <div className="space-y-8 fade-in pb-10">
            <div className="flex justify-between items-end">
                <div className="space-y-1">
                    <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Admin • Explainable AI</p>
                    <h1 className="text-4xl font-black text-[#001b5e]">Digital Twin Simulator</h1>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Profile & Current Risk */}
                <div className="space-y-8">
                    <div className="vantage-card p-8 bg-slate-50 border-slate-100 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-[#001b5e]/5 rounded-bl-full grid place-items-center">
                            <Users className="w-10 h-10 text-[#001b5e]/20" />
                        </div>
                        <h2 className="text-2xl font-black text-[#001b5e] mb-2">{student.name}</h2>
                        <p className="text-sm font-bold text-slate-500 mb-8 tracking-widest uppercase text-[10px]">Anonymized Student Profile</p>

                        <div className="flex items-center gap-8 border-t border-slate-200 pt-8">
                            <div className="flex-1">
                                <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Base Risk Propensity</p>
                                <div className="flex items-end gap-2">
                                    <span className="text-5xl font-black text-rose-600">{(student.base_risk * 100).toFixed(1)}%</span>
                                </div>
                            </div>
                            <Activity className="w-12 h-12 text-rose-300" />
                        </div>
                    </div>

                    <div className="vantage-card p-8 bg-emerald-50 border-emerald-100">
                        <div className="flex justify-between items-start mb-6">
                            <h3 className="font-black text-[#001b5e] text-lg">Simulated Outcome</h3>
                            {simulating && <Settings2 className="w-5 h-5 text-emerald-600 animate-spin" />}
                        </div>

                        <div className="flex items-center gap-6">
                            <div className="flex-1">
                                <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">New Projected Risk</p>
                                <div className="flex items-end gap-2">
                                    <span className={`text-6xl font-black ${(simulatedRisk || 0) > 0.6 ? 'text-rose-600' : 'text-emerald-600'}`}>
                                        {((simulatedRisk || 0) * 100).toFixed(1)}%
                                    </span>
                                </div>
                            </div>

                            {simulatedRisk !== null && simulatedRisk < student.base_risk ? (
                                <div className="text-right">
                                    <span className="bg-emerald-100 text-emerald-700 text-xs font-black px-3 py-1 rounded-full border border-emerald-200">
                                        -{((student.base_risk - simulatedRisk) * 100).toFixed(1)}% Dropped
                                    </span>
                                </div>
                            ) : null}
                        </div>
                    </div>
                </div>

                {/* Intervention Modifiers */}
                <div className="vantage-card p-8">
                    <h3 className="font-black text-[#001b5e] mb-2 flex items-center gap-2 text-xl">
                        <Settings2 className="w-5 h-5 text-blue-500" /> Intervention Tuning
                    </h3>
                    <p className="text-xs font-bold text-slate-500 mb-8">What-if analysis: Adjust parameters to simulate the impact of college interventions.</p>

                    <div className="space-y-8">
                        {/* Weekly Study Time */}
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <label className="text-xs font-black text-slate-700 uppercase tracking-widest flex items-center gap-2">
                                    <BookOpen className="w-4 h-4 text-blue-500" /> Weekly Study Time
                                </label>
                                <span className="font-mono font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">{mods.studytime} Hrs</span>
                            </div>
                            <input
                                type="range" min="1" max="10" value={mods.studytime}
                                onChange={(e) => setMods({ ...mods, studytime: parseInt(e.target.value) })}
                                className="w-full accent-blue-600"
                            />
                        </div>

                        {/* Absences */}
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <label className="text-xs font-black text-slate-700 uppercase tracking-widest flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-rose-500" /> Total Absences
                                </label>
                                <span className="font-mono font-bold text-rose-600 bg-rose-50 px-2 py-1 rounded">{mods.absences} Days</span>
                            </div>
                            <input
                                type="range" min="0" max="30" value={mods.absences}
                                onChange={(e) => setMods({ ...mods, absences: parseInt(e.target.value) })}
                                className="w-full accent-rose-600"
                            />
                        </div>

                        {/* Social / Go Out */}
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <label className="text-xs font-black text-slate-700 uppercase tracking-widest flex items-center gap-2">
                                    <Coffee className="w-4 h-4 text-purple-500" /> Socializing Rate
                                </label>
                                <span className="font-mono font-bold text-purple-600 bg-purple-50 px-2 py-1 rounded">Level {mods.goout}</span>
                            </div>
                            <input
                                type="range" min="1" max="5" value={mods.goout}
                                onChange={(e) => setMods({ ...mods, goout: parseInt(e.target.value) })}
                                className="w-full accent-purple-600"
                            />
                        </div>

                        {/* Health */}
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <label className="text-xs font-black text-slate-700 uppercase tracking-widest flex items-center gap-2">
                                    <HeartPulse className="w-4 h-4 text-emerald-500" /> Physical Health
                                </label>
                                <span className="font-mono font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">Level {mods.health}</span>
                            </div>
                            <input
                                type="range" min="1" max="5" value={mods.health}
                                onChange={(e) => setMods({ ...mods, health: parseInt(e.target.value) })}
                                className="w-full accent-emerald-600"
                            />
                        </div>
                    </div>

                    <button
                        onClick={handleSimulate}
                        disabled={simulating}
                        className="w-full mt-10 bg-[#001b5e] hover:bg-blue-800 text-white font-black py-4 rounded-xl flex items-center justify-center gap-2 shadow-xl transition-all disabled:opacity-50"
                    >
                        Re-calculate Risk Projectory <ArrowRight className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    )
}
