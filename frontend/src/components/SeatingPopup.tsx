"use client"

import { useState, useEffect } from 'react'
import { X, MapPin, ShieldCheck, Users } from 'lucide-react'
import { API_BASE, getAuthHeaders } from '@/lib/api'

interface SeatingPopupProps {
    isOpen: boolean
    onClose: () => void
    examId: string
    courseName: string
}

export default function SeatingPopup({ isOpen, onClose, examId, courseName }: SeatingPopupProps) {
    const [loading, setLoading] = useState(false)
    const [allocations, setAllocations] = useState<any[]>([])
    const [config, setConfig] = useState({ rows: 5, cols: 6 })

    useEffect(() => {
        if (isOpen && examId) {
            fetchAllocations()
        }
    }, [isOpen, examId])

    const fetchAllocations = async () => {
        setLoading(true)
        try {
            const res = await fetch(`${API_BASE}/api/seating/search?exam_id=${examId}`, {
                headers: getAuthHeaders()
            })
            if (res.ok) {
                const data = await res.json()
                setAllocations(data)
            }
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    if (!isOpen) return null

    // Grouping by room
    const rooms = Array.from(new Set(allocations.map(a => a.room_name)))

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#001b5e]/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-3xl shadow-2xl flex flex-col animate-in zoom-in-95 duration-200">
                <div className="p-6 border-b flex justify-between items-center bg-slate-50">
                    <div>
                        <h2 className="text-2xl font-black text-[#001b5e] uppercase tracking-tight">{courseName}</h2>
                        <div className="flex gap-4 mt-1">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                                <MapPin className="w-3 h-3" /> Seating Plan
                            </span>
                            <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-1">
                                <ShieldCheck className="w-3 h-3" /> Live Data
                            </span>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-200 rounded-full transition-colors"
                    >
                        <X className="w-6 h-6 text-slate-400" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-[#fdfdfd]">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-4">
                            <div className="w-12 h-12 border-4 border-[#001b5e] border-t-transparent rounded-full animate-spin"></div>
                            <p className="text-sm font-black text-[#001b5e] uppercase tracking-widest animate-pulse">Retrieving Hall Plan...</p>
                        </div>
                    ) : allocations.length === 0 ? (
                        <div className="text-center py-20 grayscale opacity-50">
                            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Users className="w-10 h-10 text-slate-400" />
                            </div>
                            <h3 className="font-black text-slate-500 text-lg uppercase">Plan Not Generated</h3>
                            <p className="text-slate-400 text-sm font-bold mt-1">Seating allocation hasn't been finalized yet.</p>
                        </div>
                    ) : (
                        rooms.map((roomName: any) => {
                            const roomSeats = allocations.filter(a => a.room_name === roomName)
                            return (
                                <div key={roomName} className="vantage-card overflow-hidden">
                                    <div className="p-6 bg-slate-50 border-b flex justify-between items-center">
                                        <h3 className="font-black text-[#001b5e] text-lg">Hall {roomName}</h3>
                                        <span className="text-[10px] font-black bg-blue-100 text-blue-600 px-3 py-1 rounded-full uppercase">
                                            {roomSeats.length} Seats Filled
                                        </span>
                                    </div>
                                    <div className="p-6">
                                        <div className="grid grid-cols-6 gap-3">
                                            {roomSeats.map((s, idx) => (
                                                <div key={idx} className="p-3 bg-white border border-slate-100 rounded-xl text-center shadow-sm hover:border-[#001b5e] transition-all">
                                                    <p className="text-[9px] font-black text-blue-500 mb-1">{s.seat_number}</p>
                                                    <p className="text-[10px] font-bold text-[#001b5e] leading-tight break-all">
                                                        {s.user_profiles?.roll_number || s.roll_number || 'N/A'}
                                                    </p>
                                                    <p className="text-[8px] font-bold text-slate-400 uppercase mt-1">
                                                        {s.user_profiles?.department || s.department || ''}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )
                        })
                    )}
                </div>

                <div className="p-4 bg-slate-50 border-t flex justify-center">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em]">VANTAGE-EDU • Intelligent Seating System</p>
                </div>
            </div>
        </div>
    )
}
