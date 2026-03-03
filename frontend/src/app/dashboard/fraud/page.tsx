"use client"

import { useState } from 'react'
import {
    ShieldAlert,
    Search,
    AlertTriangle,
    UserX,
    History,
    Filter,
    MoreVertical,
    Flag,
    CheckCircle2,
    XCircle
} from 'lucide-react'

export default function FraudDetection() {
    const [scanning, setScanning] = useState(false)

    const flaggedTickets = [
        { id: 'HT2025-0042', student: 'Oviya', reason: 'Multiple IP Downloads', confidence: '98%', status: 'Flagged', risk: 'critical' },
        { id: 'HT2025-0105', student: 'Maranok', reason: 'Abnormal Download Frequency', confidence: '82%', status: 'Under Review', risk: 'high' },
        { id: 'HT2024-0982', student: 'Sarvesh', reason: 'Proxied Access Detected', confidence: '74%', status: 'Flagged', risk: 'medium' },
    ]

    return (
        <div className="space-y-8 fade-in">
            <div className="flex justify-between items-end">
                <div className="space-y-1">
                    <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Security Analytics</p>
                    <h1 className="text-4xl font-black text-[#001b5e]">Hall Ticket Fraud Detector</h1>
                </div>
                <div className="flex gap-4">
                    <button className="bg-white border border-slate-200 p-3 rounded-2xl hover:bg-slate-50 transition-all"><Search className="w-5 h-5 text-slate-400" /></button>
                    <button className="bg-white border border-slate-200 p-3 rounded-2xl hover:bg-slate-50 transition-all"><Filter className="w-5 h-5 text-slate-400" /></button>
                    <button
                        onClick={() => { setScanning(true); setTimeout(() => setScanning(false), 2000); }}
                        className="bg-rose-600 text-white px-8 py-3 rounded-2xl font-black shadow-xl shadow-rose-900/20 active:scale-95 transition-all flex items-center gap-2"
                    >
                        {scanning ? "Isolation Forest Scanning..." : "Scan for Anomalies"}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    <div className="vantage-card overflow-hidden">
                        <div className="p-8 border-b border-slate-100 flex justify-between items-center">
                            <h2 className="text-xl font-black text-[#001b5e]">Suspicious Activities</h2>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Real-time Isolation Engine</span>
                            </div>
                        </div>

                        <div className="divide-y divide-slate-100">
                            {flaggedTickets.map((ticket, i) => (
                                <div key={i} className="p-6 hover:bg-slate-50 transition-all flex items-center justify-between group">
                                    <div className="flex items-center gap-6">
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${ticket.risk === 'critical' ? 'bg-rose-100 text-rose-600' : 'bg-amber-100 text-amber-600'
                                            }`}>
                                            <UserX className="w-6 h-6" />
                                        </div>
                                        <div className="space-y-0.5">
                                            <div className="flex items-center gap-2">
                                                <span className="font-black text-[#001b5e] uppercase tracking-wider text-sm">{ticket.id}</span>
                                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${ticket.risk === 'critical' ? 'bg-rose-600 text-white' : 'bg-amber-500 text-white'
                                                    }`}>
                                                    {ticket.risk}
                                                </span>
                                            </div>
                                            <p className="text-slate-500 text-xs font-bold leading-none">{ticket.student} • <span className="text-slate-400">{ticket.reason}</span></p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-8">
                                        <div className="text-right">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Confidence</p>
                                            <p className="text-sm font-black text-[#001b5e]">{ticket.confidence}</p>
                                        </div>
                                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                            <button className="p-2 rounded-lg bg-white border border-slate-200 text-emerald-600 hover:bg-emerald-50 transition-all"><CheckCircle2 className="w-5 h-5" /></button>
                                            <button className="p-2 rounded-lg bg-white border border-slate-200 text-rose-600 hover:bg-rose-50 transition-all"><XCircle className="w-5 h-5" /></button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="p-6 bg-slate-50 text-center">
                            <button className="text-xs font-black text-[#001b5e] uppercase tracking-widest hover:underline">
                                View All Flagged Records
                            </button>
                        </div>
                    </div>
                </div>

                <div className="space-y-8">
                    <div className="vantage-card p-8 bg-[#001b5e] text-white border-none shadow-blue-900/20 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16"></div>
                        <ShieldAlert className="w-12 h-12 text-rose-400 mb-6" />
                        <h3 className="text-2xl font-black mb-2">Anomaly Protection</h3>
                        <p className="text-slate-400 text-sm leading-relaxed mb-8">Vantage Guard AI uses Isolation Forest algorithms to detect out-of-distribution ticket behaviors across global endpoints.</p>
                        <div className="space-y-3">
                            <div className="flex justify-between text-xs font-bold">
                                <span>System Health</span>
                                <span>99.9%</span>
                            </div>
                            <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                                <div className="h-full bg-emerald-400 w-[99.9%]"></div>
                            </div>
                        </div>
                    </div>

                    <div className="vantage-card p-8">
                        <h2 className="text-lg font-black text-[#001b5e] mb-6 flex items-center gap-2">
                            <History className="w-5 h-5 text-blue-500" />
                            Recent Audits
                        </h2>
                        <div className="space-y-6">
                            {[
                                { user: 'Admin', action: 'Scan Triggered', time: '2m ago' },
                                { user: 'System', action: 'HT2025-0042 Flagged', time: '15m ago' },
                                { user: 'Staff', action: 'Ticket Revoked', time: '1h ago' },
                            ].map((audit, i) => (
                                <div key={i} className="flex justify-between items-start border-b border-slate-100 pb-4 last:border-0 last:pb-0">
                                    <div className="space-y-1">
                                        <p className="text-sm font-black text-[#001b5e]">{audit.action}</p>
                                        <p className="text-[10px] font-bold text-slate-400">{audit.user}</p>
                                    </div>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{audit.time}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
