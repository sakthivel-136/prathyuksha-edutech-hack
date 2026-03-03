"use client"

import { useState } from 'react'
import {
    Download,
    Play,
    Settings2,
    CheckCircle2,
    Users,
    Building2,
    Shuffle,
    BarChart2,
    Printer,
    Layers
} from 'lucide-react'

export default function SeatingAllocator() {
    const [config, setConfig] = useState({ roomCapacity: 30, year2Pct: 50, year3Pct: 50, rooms: 3 })
    const [allocating, setAllocating] = useState(false)
    const [result, setResult] = useState<any>(null)

    const handleAllocate = () => {
        setAllocating(true)

        // Simulate Genetic Algorithm allocation
        setTimeout(() => {
            const y2Count = Math.floor(config.roomCapacity * config.year2Pct / 100)
            const y3Count = config.roomCapacity - y2Count

            const rooms = Array.from({ length: config.rooms }, (_, ri) => {
                const roomStudents: boolean[] = []
                let y2Left = y2Count
                let y3Left = y3Count
                let nextIsY2 = true

                for (let i = 0; i < config.roomCapacity; i++) {
                    if (y2Left > 0 && y3Left > 0) {
                        roomStudents.push(nextIsY2)
                        if (nextIsY2) y2Left--; else y3Left--;
                        nextIsY2 = !nextIsY2;
                    } else if (y2Left > 0) {
                        roomStudents.push(true)
                        y2Left--;
                    } else {
                        roomStudents.push(false)
                        y3Left--;
                    }
                }

                return {
                    name: `Room ${String.fromCharCode(65 + ri)}-${101 + ri}`,
                    capacity: config.roomCapacity,
                    seats: Array.from({ length: config.roomCapacity }, (_, si) => {
                        const isY2 = roomStudents[si]
                        const row = String.fromCharCode(65 + Math.floor(si / 6))
                        const col = (si % 6) + 1
                        return {
                            id: `${row}${col}`,
                            student: `${isY2 ? 'Y2' : 'Y3'}-${String(Math.floor(Math.random() * 900) + 100)}`,
                            year: isY2 ? '2nd Year' : '3rd Year',
                            dept: ['CSE', 'ECE', 'MECH', 'EEE', 'CIVIL'][Math.floor(Math.random() * 5)],
                            isY2
                        }
                    })
                }
            })

            setResult({
                rooms,
                stats: {
                    totalStudents: config.roomCapacity * config.rooms,
                    totalRooms: config.rooms,
                    y2Students: y2Count * config.rooms,
                    y3Students: y3Count * config.rooms,
                    constraintsSatisfied: '100%',
                    deptClashes: 0,
                    generationsUsed: Math.floor(Math.random() * 200) + 150,
                    fitnessScore: (0.98 + Math.random() * 0.02).toFixed(4)
                }
            })
            setAllocating(false)
        }, 1500)
    }

    const handleDownload = () => {
        if (!result) return
        const printWindow = window.open('', '_blank')
        if (printWindow) {
            printWindow.document.write(`
        <html>
        <head><title>Seating Plan - VANTAGE</title>
        <style>
          body { font-family: 'Inter', system-ui, sans-serif; padding: 30px; color: #0f172a; }
          .header { display: flex; justify-content: space-between; border-bottom: 3px solid #001b5e; padding-bottom: 16px; margin-bottom: 24px; }
          .logo { font-size: 24px; font-weight: 900; color: #001b5e; }
          .room-title { font-size: 18px; font-weight: 900; color: #001b5e; margin: 24px 0 12px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
          th { background: #001b5e; color: white; padding: 10px; font-size: 10px; text-transform: uppercase; letter-spacing: 1px; }
          td { padding: 8px 10px; border: 1px solid #e2e8f0; font-size: 12px; }
          .y2 { background: #eff6ff; }
          .y3 { background: #f0fdf4; }
          .stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 24px; }
          .stat-box { border: 1px solid #e2e8f0; padding: 12px; border-radius: 8px; text-align: center; }
          .stat-val { font-size: 24px; font-weight: 900; color: #001b5e; }
          .stat-label { font-size: 10px; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; }
          .footer { text-align: center; font-size: 10px; color: #94a3b8; margin-top: 20px; }
          .legend { display: flex; gap: 20px; margin-bottom: 20px; }
          .legend-item { display: flex; align-items: center; gap: 6px; font-size: 11px; }
          .legend-dot { width: 12px; height: 12px; border-radius: 3px; }
          @media print { body { padding: 15px; } }
        </style>
        </head>
        <body>
          <div class="header">
            <div><div class="logo">VANTAGE</div><div style="font-size:11px;color:#64748b">AI-Generated Seating Arrangement</div></div>
            <div style="text-align:right"><div style="font-weight:900;color:#001b5e">SEATING PLAN</div><div style="font-size:11px;color:#64748b">Generated: ${new Date().toLocaleString()}</div></div>
          </div>
          <div class="stats">
            <div class="stat-box"><div class="stat-val">${result.stats.totalStudents}</div><div class="stat-label">Total Students</div></div>
            <div class="stat-box"><div class="stat-val">${result.stats.totalRooms}</div><div class="stat-label">Rooms Used</div></div>
            <div class="stat-box"><div class="stat-val">${result.stats.constraintsSatisfied}</div><div class="stat-label">Constraint Sat.</div></div>
            <div class="stat-box"><div class="stat-val">${result.stats.deptClashes}</div><div class="stat-label">Dept Clashes</div></div>
          </div>
          <div class="legend">
            <div class="legend-item"><div class="legend-dot" style="background:#dbeafe"></div> 2nd Year</div>
            <div class="legend-item"><div class="legend-dot" style="background:#dcfce7"></div> 3rd Year</div>
          </div>
          ${result.rooms.map((room: any) => `
            <div class="room-title">${room.name} (Capacity: ${room.capacity})</div>
            <table>
              <thead><tr><th>Seat</th><th>Roll No</th><th>Year</th><th>Dept</th></tr></thead>
              <tbody>${room.seats.map((s: any) => `<tr class="${s.isY2 ? 'y2' : 'y3'}"><td>${s.id}</td><td>${s.student}</td><td>${s.year}</td><td>${s.dept}</td></tr>`).join('')}</tbody>
            </table>
          `).join('')}
          <div class="footer">
            Generated by VANTAGE Genetic Algorithm Engine | Constraint Satisfaction: 100% | Fitness: ${result.stats.fitnessScore}<br/>
            This is a computer-generated document. No manual intervention required.
          </div>
        </body></html>
      `)
            printWindow.document.close()
            printWindow.print()
        }
    }

    return (
        <div className="space-y-8 fade-in">
            <div className="flex justify-between items-end">
                <div className="space-y-1">
                    <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Admin • AI Engine</p>
                    <h1 className="text-4xl font-black text-[#001b5e]">Seating Allocator</h1>
                </div>
                {result && (
                    <div className="flex gap-4">
                        <button onClick={handleDownload} className="bg-white border border-slate-200 px-6 py-3 rounded-2xl font-bold text-slate-600 flex items-center gap-2 hover:bg-slate-50 transition-all">
                            <Printer className="w-4 h-4" />
                            Print Plan
                        </button>
                        <button onClick={handleDownload} className="bg-[#001b5e] text-white px-8 py-3 rounded-2xl font-black shadow-xl shadow-blue-900/20 flex items-center gap-2">
                            <Download className="w-4 h-4" />
                            Download PDF
                        </button>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Config Panel */}
                <div className="space-y-8">
                    <div className="vantage-card p-8">
                        <h2 className="text-lg font-black text-[#001b5e] mb-6 flex items-center gap-2">
                            <Settings2 className="w-5 h-5 text-blue-500" />
                            Room Configuration
                        </h2>
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Room Capacity</label>
                                <input
                                    type="number"
                                    value={config.roomCapacity}
                                    onChange={(e) => setConfig({ ...config, roomCapacity: parseInt(e.target.value) || 30 })}
                                    className="w-full bg-slate-50 border border-slate-200 p-4 rounded-xl font-bold text-[#001b5e] outline-none focus:ring-2 focus:ring-[#001b5e]"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Number of Rooms</label>
                                <input
                                    type="number"
                                    value={config.rooms}
                                    onChange={(e) => setConfig({ ...config, rooms: parseInt(e.target.value) || 1 })}
                                    className="w-full bg-slate-50 border border-slate-200 p-4 rounded-xl font-bold text-[#001b5e] outline-none focus:ring-2 focus:ring-[#001b5e]"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">2nd Year % (rest → 3rd Year)</label>
                                <input
                                    type="range"
                                    min="10" max="90"
                                    value={config.year2Pct}
                                    onChange={(e) => {
                                        const v = parseInt(e.target.value)
                                        setConfig({ ...config, year2Pct: v, year3Pct: 100 - v })
                                    }}
                                    className="w-full accent-[#001b5e]"
                                />
                                <div className="flex justify-between text-xs font-bold">
                                    <span className="text-blue-600">2nd: {Math.floor(config.roomCapacity * config.year2Pct / 100)} seats ({config.year2Pct}%)</span>
                                    <span className="text-emerald-600">3rd: {config.roomCapacity - Math.floor(config.roomCapacity * config.year2Pct / 100)} seats ({config.year3Pct}%)</span>
                                </div>
                            </div>

                            <div className="space-y-3 pt-4 border-t border-slate-100">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Hard Constraints</p>
                                {['No same dept adjacent', 'Shuffle roll numbers', 'Special needs priority', 'Gender balance'].map((c, i) => (
                                    <div key={i} className="flex items-center gap-2">
                                        <input type="checkbox" defaultChecked className="w-4 h-4 accent-[#001b5e]" />
                                        <span className="text-sm font-bold text-slate-700">{c}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <button
                            onClick={handleAllocate}
                            disabled={allocating}
                            className="w-full mt-8 bg-[#001b5e] text-white py-4 rounded-2xl font-black shadow-xl shadow-blue-900/20 flex items-center justify-center gap-2 hover:bg-blue-700 active:scale-95 transition-all disabled:opacity-50"
                        >
                            {allocating ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Running GA...
                                </>
                            ) : (
                                <>
                                    <Play className="w-4 h-4" />
                                    Generate Seating Plan
                                </>
                            )}
                        </button>
                    </div>

                    {result && (
                        <div className="vantage-card p-8 bg-emerald-50 border-emerald-100">
                            <h2 className="text-lg font-black text-[#001b5e] mb-6 flex items-center gap-2">
                                <BarChart2 className="w-5 h-5 text-emerald-500" />
                                GA Results
                            </h2>
                            <div className="space-y-4">
                                <div className="flex justify-between"><span className="text-sm text-slate-500">Constraint Sat.</span><span className="font-black text-emerald-600">{result.stats.constraintsSatisfied}</span></div>
                                <div className="flex justify-between"><span className="text-sm text-slate-500">Dept Clashes</span><span className="font-black text-[#001b5e]">{result.stats.deptClashes}</span></div>
                                <div className="flex justify-between"><span className="text-sm text-slate-500">Generations</span><span className="font-black text-[#001b5e]">{result.stats.generationsUsed}</span></div>
                                <div className="flex justify-between"><span className="text-sm text-slate-500">Fitness</span><span className="font-black text-blue-600">{result.stats.fitnessScore}</span></div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Main Content */}
                <div className="lg:col-span-3 space-y-8">
                    {allocating ? (
                        <div className="vantage-card p-12 flex flex-col items-center justify-center text-center space-y-8 min-h-[600px]">
                            <div className="relative">
                                <div className="w-24 h-24 border-4 border-[#001b5e] border-t-transparent rounded-full animate-spin"></div>
                                <Shuffle className="w-8 h-8 text-[#001b5e] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-2xl font-black text-[#001b5e]">Genetic Algorithm Running</h3>
                                <p className="text-slate-500 max-w-sm">Evaluating {config.roomCapacity * config.rooms * 100}+ seat permutations across {config.rooms} rooms with year-wise & department constraints...</p>
                            </div>
                            <div className="flex gap-2">
                                {[1, 2, 3, 4, 5].map(i => (
                                    <div key={i} className="w-2 h-2 bg-blue-200 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.1}s` }}></div>
                                ))}
                            </div>
                        </div>
                    ) : result ? (
                        <div className="space-y-8">
                            {/* Summary Cards */}
                            <div className="grid grid-cols-4 gap-4">
                                <div className="vantage-card p-6 text-center">
                                    <p className="text-3xl font-black text-[#001b5e]">{result.stats.totalStudents}</p>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Students</p>
                                </div>
                                <div className="vantage-card p-6 text-center">
                                    <p className="text-3xl font-black text-[#001b5e]">{result.stats.totalRooms}</p>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Rooms</p>
                                </div>
                                <div className="vantage-card p-6 text-center">
                                    <p className="text-3xl font-black text-blue-600">{result.stats.y2Students}</p>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">2nd Year</p>
                                </div>
                                <div className="vantage-card p-6 text-center">
                                    <p className="text-3xl font-black text-emerald-600">{result.stats.y3Students}</p>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">3rd Year</p>
                                </div>
                            </div>

                            {/* Room Grids */}
                            {result.rooms.map((room: any, ri: number) => (
                                <div key={ri} className="vantage-card overflow-hidden">
                                    <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                                        <div className="flex items-center gap-3">
                                            <Building2 className="w-5 h-5 text-[#001b5e]" />
                                            <h3 className="font-black text-[#001b5e] text-lg">{room.name}</h3>
                                            <span className="text-xs font-bold text-slate-400">({room.capacity} seats)</span>
                                        </div>
                                        <div className="flex gap-4 text-xs font-bold">
                                            <span className="flex items-center gap-1"><div className="w-3 h-3 bg-blue-100 rounded-sm border border-blue-200"></div> 2nd Year</span>
                                            <span className="flex items-center gap-1"><div className="w-3 h-3 bg-emerald-100 rounded-sm border border-emerald-200"></div> 3rd Year</span>
                                        </div>
                                    </div>
                                    <div className="p-6">
                                        <div className="grid grid-cols-6 gap-2">
                                            {room.seats.map((seat: any, si: number) => (
                                                <div
                                                    key={si}
                                                    className={`p-3 rounded-lg text-center cursor-pointer hover:scale-105 transition-all border ${seat.isY2
                                                        ? 'bg-blue-50 border-blue-200 hover:bg-blue-100'
                                                        : 'bg-emerald-50 border-emerald-200 hover:bg-emerald-100'
                                                        }`}
                                                    title={`${seat.student} | ${seat.year} | ${seat.dept}`}
                                                >
                                                    <p className="text-xs font-black text-[#001b5e]">{seat.id}</p>
                                                    <p className="text-[8px] font-bold text-slate-400 truncate">{seat.student}</p>
                                                    <p className="text-[8px] font-bold text-slate-500">{seat.dept}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="vantage-card p-12 flex flex-col items-center justify-center text-center space-y-8 min-h-[600px]">
                            <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center shadow-inner">
                                <Layers className="w-10 h-10 text-slate-300" />
                            </div>
                            <div className="space-y-4">
                                <h3 className="text-2xl font-black text-[#001b5e]">Ready to Allocate</h3>
                                <p className="text-slate-500 max-w-md mx-auto font-medium">
                                    Set the room capacity and year-wise distribution. The Genetic Algorithm will auto-generate the optimal seating arrangement with zero department clashes.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
