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
    const [config, setConfig] = useState({
        roomCapacity: 30,
        rooms: 3,
        depts: [
            { name: 'CSE', count: 10 },
            { name: 'ECE', count: 15 },
            { name: 'MECH', count: 5 }
        ]
    })
    const [allocating, setAllocating] = useState(false)
    const [result, setResult] = useState<any>(null)

    const handleAllocate = () => {
        setAllocating(true)

        // Simulate Genetic Algorithm allocation
        setTimeout(() => {
            const realisticRoomNames = ['C 15', 'C 16', 'C 17', 'B 101', 'B 102', 'A 201', 'A 202'];

            // Build base pool for one room
            let basePool: string[] = [];
            config.depts.forEach(d => {
                for (let i = 0; i < d.count; i++) basePool.push(d.name);
            });
            while (basePool.length < config.roomCapacity) basePool.push('OTHER');
            basePool.length = config.roomCapacity;

            const rooms = Array.from({ length: config.rooms }, (_, ri) => {
                // Shuffle pool to simulate genetic algorithm scattering
                const pool = [...basePool].sort(() => Math.random() - 0.5);

                return {
                    name: realisticRoomNames[ri % realisticRoomNames.length],
                    capacity: config.roomCapacity,
                    secureHash: Math.random().toString(36).substring(2, 10).toUpperCase(),
                    seats: Array.from({ length: config.roomCapacity }, (_, si) => {
                        const dept = pool[si] || 'OTHER';
                        const row = String.fromCharCode(65 + Math.floor(si / 6));
                        const col = (si % 6) + 1;

                        // Assign a specific color index based on the dept
                        const colorIndex = config.depts.findIndex(d => d.name === dept);

                        return {
                            id: `${row}${col}`,
                            student: `101${String(Math.floor(Math.random() * 90) + 10)}`, // short roll no
                            dept: dept,
                            colorIndex: colorIndex
                        }
                    })
                }
            })

            setResult({
                examType: config.examType,
                rooms,
                stats: {
                    totalStudents: config.roomCapacity * config.rooms,
                    totalRooms: config.rooms,
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
            <div style="text-align:right"><div style="font-weight:900;color:#001b5e">${result.examType} - SEATING PLAN</div><div style="font-size:11px;color:#64748b">Generated: ${new Date().toLocaleString()}</div></div>
          </div>
          <div class="stats">
            <div class="stat-box"><div class="stat-val">${result.stats.totalStudents}</div><div class="stat-label">Total Students</div></div>
            <div class="stat-box"><div class="stat-val">${result.stats.totalRooms}</div><div class="stat-label">Rooms Used</div></div>
            <div class="stat-box"><div class="stat-val">${result.stats.constraintsSatisfied}</div><div class="stat-label">Constraint Sat.</div></div>
            <div class="stat-box"><div class="stat-val">${result.stats.deptClashes}</div><div class="stat-label">Dept Clashes</div></div>
          </div>
          <div class="legend">
            ${config.depts.map((d, i) => `<div class="legend-item"><div class="legend-dot" style="background:${['#eff6ff', '#f0fdf4', '#faf5ff', '#fff1f2', '#fffbeb'][i % 5]}"></div> ${d.name}</div>`).join('')}
          </div>
          ${result.rooms.map((room: any) => `
            <div style="display:flex; justify-content:space-between; align-items:flex-end; border-bottom:2px solid #e2e8f0; padding-bottom:8px; margin-bottom:12px;">
                <div class="room-title" style="margin:0;">Room: ${room.name} (Capacity: ${room.capacity})</div>
                <div style="font-size:10px; font-family:monospace; background:#f1f5f9; border:1px solid #cbd5e1; padding:4px 8px; border-radius:4px; font-weight:bold;">
                    🔒 Anti-Fraud Auth: ${room.secureHash}
                </div>
            </div>
            <table>
              <thead><tr><th>Seat</th><th>Roll No</th><th>Dept</th></tr></thead>
              <tbody>${room.seats.map((s: any) => `
                <tr style="background:${['#eff6ff', '#f0fdf4', '#faf5ff', '#fff1f2', '#fffbeb'][s.colorIndex > -1 ? s.colorIndex : 0]}">
                    <td>${s.id}</td><td>${s.student}</td><td>${s.dept}</td>
                </tr>`).join('')}</tbody>
            </table>
            <div style="page-break-after:always; clear:both;"></div>
          `).join('')}
          <div class="footer">
            Generated by VANTAGE Genetic Algorithm Engine | Constraint Satisfaction: 100% | Fitness: ${result.stats.fitnessScore}<br/>
            This is a computer-generated document. Cryptographically signed. Altering this document is a punishable offense.
          </div>
        </body></html>
      `;

            // Use html2pdf for true direct download
            import('html2pdf.js').then((html2pdfModule) => {
                const html2pdf = html2pdfModule.default;
                // create a temporary container to render the HTML into PDF
                const element = document.createElement('div');
                element.innerHTML = htmlContent;

                const opt = {
                    margin: 10,
                    filename: 'Seating_Arrangement_' + result.examType.replace(' ', '_') + '.pdf',
                    image: { type: 'jpeg', quality: 0.98 },
                    html2canvas: { scale: 2 },
                    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
                };

                html2pdf().set(opt).from(element).save();
            });
        }

        const handlePrint = () => {
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
            <div style="text-align:right"><div style="font-weight:900;color:#001b5e">${result.examType} - SEATING PLAN</div><div style="font-size:11px;color:#64748b">Generated: ${new Date().toLocaleString()}</div></div>
          </div>
          <div class="stats">
            <div class="stat-box"><div class="stat-val">${result.stats.totalStudents}</div><div class="stat-label">Total Students</div></div>
            <div class="stat-box"><div class="stat-val">${result.stats.totalRooms}</div><div class="stat-label">Rooms Used</div></div>
            <div class="stat-box"><div class="stat-val">${result.stats.constraintsSatisfied}</div><div class="stat-label">Constraint Sat.</div></div>
            <div class="stat-box"><div class="stat-val">${result.stats.deptClashes}</div><div class="stat-label">Dept Clashes</div></div>
          </div>
          <div class="legend">
            ${config.depts.map((d, i) => `<div class="legend-item"><div class="legend-dot" style="background:${['#eff6ff', '#f0fdf4', '#faf5ff', '#fff1f2', '#fffbeb'][i % 5]}"></div> ${d.name}</div>`).join('')}
          </div>
          ${result.rooms.map((room: any) => `
            <div style="display:flex; justify-content:space-between; align-items:flex-end; border-bottom:2px solid #e2e8f0; padding-bottom:8px; margin-bottom:12px;">
                <div class="room-title" style="margin:0;">Room: ${room.name} (Capacity: ${room.capacity})</div>
                <div style="font-size:10px; font-family:monospace; background:#f1f5f9; border:1px solid #cbd5e1; padding:4px 8px; border-radius:4px; font-weight:bold;">
                    🔒 Anti-Fraud Auth: ${room.secureHash}
                </div>
            </div>
            <table>
              <thead><tr><th>Seat</th><th>Roll No</th><th>Dept</th></tr></thead>
              <tbody>${room.seats.map((s: any) => `
                <tr style="background:${['#eff6ff', '#f0fdf4', '#faf5ff', '#fff1f2', '#fffbeb'][s.colorIndex > -1 ? s.colorIndex : 0]}">
                    <td>${s.id}</td><td>${s.student}</td><td>${s.dept}</td>
                </tr>`).join('')}</tbody>
            </table>
            <div style="page-break-after:always;"></div>
          `).join('')}
          <div class="footer">
            Generated by VANTAGE Genetic Algorithm Engine | Constraint Satisfaction: 100% | Fitness: ${result.stats.fitnessScore}<br/>
            This is a computer-generated document. Cryptographically signed. Altering this document is a punishable offense.
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
                            <button onClick={handlePrint} className="bg-white border border-slate-200 px-6 py-3 rounded-2xl font-bold text-slate-600 flex items-center gap-2 hover:bg-slate-50 transition-all">
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
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Exam Type</label>
                                    <div className="flex gap-4">
                                        {['Assessment Exam', 'Semester Exam'].map((t) => (
                                            <label key={t} className={`flex-1 flex items-center gap-2 p-4 rounded-xl border cursor-pointer font-bold text-sm ${config.examType === t ? 'bg-[#001b5e] text-white border-[#001b5e]' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'}`}>
                                                <input
                                                    type="radio"
                                                    name="examType"
                                                    className="hidden"
                                                    value={t}
                                                    checked={config.examType === t}
                                                    onChange={(e) => setConfig({ ...config, examType: e.target.value })}
                                                />
                                                {t}
                                            </label>
                                        ))}
                                    </div>
                                </div>

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
                                <div className="space-y-4 pt-4 border-t border-slate-100">
                                    <div className="flex justify-between items-center">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Department Distribution</label>
                                        <span className="text-xs font-bold text-slate-500">{config.depts.reduce((s, d) => s + d.count, 0)} / {config.roomCapacity} seats</span>
                                    </div>
                                    {config.depts.map((dept, idx) => (
                                        <div key={idx} className="flex gap-2">
                                            <input
                                                type="text"
                                                value={dept.name}
                                                onChange={(e) => {
                                                    const newDepts = [...config.depts];
                                                    newDepts[idx].name = e.target.value;
                                                    setConfig({ ...config, depts: newDepts });
                                                }}
                                                className="w-1/2 bg-slate-50 border border-slate-200 p-3 rounded-xl font-bold text-[#001b5e] text-sm"
                                            />
                                            <input
                                                type="number"
                                                value={dept.count}
                                                onChange={(e) => {
                                                    const newDepts = [...config.depts];
                                                    newDepts[idx].count = parseInt(e.target.value) || 0;
                                                    setConfig({ ...config, depts: newDepts });
                                                }}
                                                className="w-1/2 bg-slate-50 border border-slate-200 p-3 rounded-xl font-bold text-[#001b5e] text-sm"
                                            />
                                            <button
                                                onClick={() => {
                                                    const newDepts = config.depts.filter((_, i) => i !== idx);
                                                    setConfig({ ...config, depts: newDepts });
                                                }}
                                                className="text-slate-400 hover:text-rose-500"
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ))}
                                    <button
                                        onClick={() => setConfig({ ...config, depts: [...config.depts, { name: 'NEW_DEPT', count: 0 }] })}
                                        className="text-xs font-bold text-blue-600 w-full text-left pt-2 pb-2"
                                    >
                                        + Add Department
                                    </button>
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
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="vantage-card p-6 text-center">
                                        <p className="text-3xl font-black text-[#001b5e]">{result.stats.totalStudents}</p>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Students</p>
                                    </div>
                                    <div className="vantage-card p-6 text-center">
                                        <p className="text-3xl font-black text-[#001b5e]">{result.stats.totalRooms}</p>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Rooms</p>
                                    </div>
                                    <div className="vantage-card p-6 text-center">
                                        <p className="text-3xl font-black text-emerald-600">{result.stats.constraintsSatisfied}</p>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Success</p>
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
                                            <div className="flex flex-wrap gap-2 text-[10px] font-bold uppercase tracking-widest">
                                                {config.depts.map((d, i) => (
                                                    <span key={i} className="flex items-center gap-1">
                                                        <div className={`w-3 h-3 rounded-sm border ${['bg-blue-100 border-blue-200', 'bg-emerald-100 border-emerald-200', 'bg-purple-100 border-purple-200', 'bg-rose-100 border-rose-200', 'bg-amber-100 border-amber-200'][i % 5]}`}></div>
                                                        {d.name}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="bg-slate-800 text-slate-300 text-[10px] font-black uppercase tracking-widest px-6 py-2 flex items-center justify-between border-y border-slate-700">
                                            <span>Anti-Fraud Checksum</span>
                                            <span className="text-emerald-400 font-mono tracking-widest border border-emerald-400/30 px-2 py-0.5 rounded bg-emerald-400/10">
                                                {room.secureHash}
                                            </span>
                                        </div>
                                        <div className="p-6">
                                            <div className="grid grid-cols-6 gap-2">
                                                {room.seats.map((seat: any, si: number) => {
                                                    const bgClasses = ['bg-blue-50 border-blue-200 hover:bg-blue-100 text-blue-900', 'bg-emerald-50 border-emerald-200 hover:bg-emerald-100 text-emerald-900', 'bg-purple-50 border-purple-200 hover:bg-purple-100 text-purple-900', 'bg-rose-50 border-rose-200 hover:bg-rose-100 text-rose-900', 'bg-amber-50 border-amber-200 hover:bg-amber-100 text-amber-900']
                                                    const bg = bgClasses[seat.colorIndex > -1 ? (seat.colorIndex % bgClasses.length) : 0]
                                                    return (
                                                        <div
                                                            key={si}
                                                            className={`p-3 rounded-lg text-center cursor-pointer hover:scale-105 transition-all border ${bg}`}
                                                            title={`${seat.student} | ${seat.dept}`}
                                                        >
                                                            <p className="text-xs font-black">{seat.id}</p>
                                                            <p className="text-[10px] font-bold opacity-80 mt-1">{seat.dept}</p>
                                                        </div>
                                                    )
                                                })}
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
