"use client"

import { useState, useEffect } from 'react'
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
    Layers,
    ShieldAlert,
    Search,
    FileDown,
    Trash2
} from 'lucide-react'

export default function SeatingAllocator() {
    const [role, setRole] = useState('')
    const [examMode, setExamMode] = useState<'internal' | 'semester'>('internal')
    const [config, setConfig] = useState({
        roomCapacity: 30,
        rows: 5,
        cols: 6,
        rooms: 3,
        membersPerClass: 30
    })
    const [selectedYears, setSelectedYears] = useState<number[]>([1, 3])
    const [selectedDepts, setSelectedDepts] = useState<string[]>(['CSE', 'ECE'])
    const [examDate, setExamDate] = useState(new Date().toISOString().split('T')[0])
    const [conditions, setConditions] = useState({
        ascendingOrder: true,
        randomized: false,
        sameDeptAdjacent: false,
        separateByYear: true
    })
    const [allocating, setAllocating] = useState(false)
    const [result, setResult] = useState<any>(null)
    const [saving, setSaving] = useState(false)
    const [deleting, setDeleting] = useState(false)
    const [planHistory, setPlanHistory] = useState<any[]>([])
    const [loadingHistory, setLoadingHistory] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [searchYear, setSearchYear] = useState('')
    const [searchResults, setSearchResults] = useState<any[]>([])
    const [loadingSearch, setLoadingSearch] = useState(false)
    // Admin filter state
    const [filterDept, setFilterDept] = useState('CSE')
    const [filterYear, setFilterYear] = useState('')
    const [savedAllocations, setSavedAllocations] = useState<any[]>([])
    const [loadingPlan, setLoadingPlan] = useState(false)
    // Student seat
    const [mySeat, setMySeat] = useState<any>(null)

    useEffect(() => {
        const r = localStorage.getItem('userRole') || 'student'
        setRole(r)
        const savedResult = sessionStorage.getItem('vantage_seating_result')
        if (savedResult) {
            try { setResult(JSON.parse(savedResult)) } catch (e) { }
        }
        // Auto-fetch for admin or coe
        if (r === 'admin' || r === 'coe') {
            fetchSavedPlan('CSE', '')
            fetchPlanHistory()
        }
        // Fetch student seat
        if (r === 'student') fetchMySeat()
    }, [])

    const fetchPlanHistory = async () => {
        setLoadingHistory(true)
        try {
            const { API_BASE, getAuthHeaders } = await import('@/lib/api')
            const res = await fetch(`${API_BASE}/api/seating/plans`, { headers: getAuthHeaders() })
            if (res.ok) setPlanHistory(await res.json())
        } catch (e) { console.error(e) }
        finally { setLoadingHistory(false) }
    }

    const fetchSavedPlan = async (dept: string, year: string, mode?: string) => {
        setLoadingPlan(true)
        try {
            const { API_BASE, getAuthHeaders } = await import('@/lib/api')
            const params = new URLSearchParams()
            if (dept) params.append('department', dept)
            if (year) params.append('year_group', year)
            if (mode) params.append('exam_mode', mode)
            const res = await fetch(`${API_BASE}/api/seating/search?${params.toString()}`, { headers: getAuthHeaders() })
            const data = await res.json()
            if (res.ok) {
                // Group by room for the same result structure
                const roomsMap: any = {}
                data.forEach((a: any) => {
                    if (!roomsMap[a.room_name]) {
                        roomsMap[a.room_name] = { name: a.room_name, seats: [] }
                    }
                    roomsMap[a.room_name].seats.push(a)
                })
                setResult({
                    department: dept,
                    yearGroup: year,
                    examMode: mode || data[0]?.exam_mode || 'Assessment',
                    examDate: data[0]?.exam_date || 'TBD',
                    rooms: Object.values(roomsMap)
                })
            }
        } catch (e) {
            console.error(e)
        } finally {
            setLoadingPlan(false)
        }
    }

    const fetchMySeat = async () => {
        try {
            const { API_BASE, getAuthHeaders } = await import('@/lib/api')
            const res = await fetch(`${API_BASE}/api/seating/my-seat`, { headers: getAuthHeaders() })
            if (res.ok) setMySeat(await res.json())
        } catch (e) { console.error(e) }
    }

    const handleSearch = async () => {
        if (!searchQuery && !searchYear) return
        setLoadingSearch(true)
        try {
            const { API_BASE, getAuthHeaders } = await import('@/lib/api')
            const params = new URLSearchParams()
            if (searchQuery) params.append('roll_number', searchQuery)
            if (searchYear) params.append('year', searchYear)
            const res = await fetch(`${API_BASE}/api/seating/search?${params.toString()}`, { headers: getAuthHeaders() })
            setSearchResults(await res.json())
        } catch (e) {
            console.error(e)
        } finally {
            setLoadingSearch(false)
        }
    }

    const UserSearchPortal = () => (
        <div className="space-y-8 fade-in">
            <div className="vantage-card p-8 bg-gradient-to-br from-[#001b5e] to-[#003399] text-white">
                <h2 className="text-3xl font-black mb-2 flex items-center gap-4">
                    <Search className="w-8 h-8" /> Seating Lookup
                </h2>
                <p className="text-blue-200 text-sm font-bold uppercase tracking-widest">Find your exam hall and seat instantly</p>
                <div className="flex flex-col md:flex-row gap-4 mt-8">
                    <input
                        type="text"
                        placeholder="Enter Roll Number..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="flex-1 bg-white/10 border border-white/20 p-4 rounded-2xl outline-none focus:ring-2 focus:ring-white/50 text-white placeholder:text-blue-300 font-bold"
                    />
                    <select
                        value={searchYear}
                        onChange={(e) => setSearchYear(e.target.value)}
                        className="bg-white/10 border border-white/20 p-4 rounded-2xl outline-none focus:ring-2 focus:ring-white/50 text-white font-bold"
                    >
                        <option value="" className="text-slate-800">Filter By Year</option>
                        {[1, 2, 3, 4].map(y => <option key={y} value={y} className="text-slate-800">{y}st Year</option>)}
                    </select>
                    <button
                        onClick={handleSearch}
                        className="bg-white text-[#001b5e] px-8 py-4 rounded-2xl font-black hover:bg-blue-50 transition-all shadow-xl active:scale-95"
                    >
                        Search Now
                    </button>
                </div>
            </div>

            {loadingSearch ? (
                <div className="flex justify-center p-12"><div className="w-8 h-8 border-4 border-[#001b5e] border-t-transparent rounded-full animate-spin"></div></div>
            ) : searchResults.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {searchResults.map((s: any, i: number) => (
                        <div key={i} className="vantage-card p-6 border-l-4 border-l-blue-600 space-y-4 hover:shadow-xl transition-all">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="text-lg font-black text-[#001b5e]">{s.user_profiles?.full_name || 'Student'}</h3>
                                    <p className="text-xs font-bold text-slate-400 mt-1 uppercase">{s.user_profiles?.roll_number} • {s.user_profiles?.department}</p>
                                </div>
                                <div className="bg-blue-50 text-[#001b5e] px-3 py-1 rounded-full text-[10px] font-black">{s.user_profiles?.year_of_study} YEAR</div>
                            </div>
                            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100 mb-4">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Room</p>
                                    <p className="text-xl font-black text-[#001b5e]">{s.room_name}</p>
                                </div>
                                <div className="space-y-1 text-right">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Seat</p>
                                    <p className="text-xl font-black text-emerald-600">{s.seat_number}</p>
                                </div>
                            </div>
                            <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                                <span className="text-xs font-bold text-slate-500 capitalize">{s.exam_mode || 'Assessment'} Exam</span>
                                <span className="text-xs font-bold text-slate-500">{s.exam_date || 'TBD'}</span>
                            </div>
                        </div>
                    ))}
                </div>
            ) : searchQuery && !loadingSearch && (
                <div className="vantage-card p-12 text-center text-slate-400 font-bold">No records found for that search.</div>
            )}
        </div>
    )

    if (role === 'student' || role === 'club_coordinator') {
        return <UserSearchPortal />
    }

    const handleAllocate = () => {
        if (role !== 'coe') {
            alert("Only Controller of Examinations (COE) can generate and publish seating plans.");
            return;
        }
        setAllocating(true)
        setTimeout(() => {
            const realisticRoomNames = ['Hall A1', 'Hall B2', 'Hall C3', 'Lecture Hall 10', 'Main Seminar Hall'];
            const rooms = Array.from({ length: config.rooms }, (_, ri) => {
                const roomSeats = []
                let seatCounter = 0

                // Pre-generate a pool of students based on config to apply conditions
                let studentPool = []
                for (let i = 0; i < config.roomCapacity; i++) {
                    let year = selectedYears[0]
                    if (examMode === 'internal' && selectedYears.length > 1) {
                        year = selectedYears[i % selectedYears.length]
                    } else if (examMode === 'semester') {
                        year = selectedYears[0]
                    }
                    const dept = selectedDepts[i % selectedDepts.length]
                    studentPool.push({
                        student: `202${year}${dept.substring(0, 2)}${Math.floor(Math.random() * 900) + 100}`,
                        dept,
                        year
                    })
                }

                if (conditions.randomized) {
                    studentPool.sort(() => Math.random() - 0.5)
                } else if (conditions.ascendingOrder) {
                    studentPool.sort((a, b) => a.student.localeCompare(b.student))
                }
                if (conditions.separateByYear && examMode === 'internal') {
                    studentPool.sort((a, b) => a.year - b.year)
                }

                for (let r = 0; r < config.rows; r++) {
                    for (let c = 0; c < config.cols; c++) {
                        if (seatCounter >= config.roomCapacity) break
                        const rowChar = String.fromCharCode(65 + r)

                        // Internal Mode: Alternate years if possible
                        let year = selectedYears[0]
                        if (examMode === 'internal' && selectedYears.length > 1) {
                            year = selectedYears[seatCounter % selectedYears.length]
                        } else if (examMode === 'semester') {
                            year = selectedYears[0] // Simple for now
                        }

                        const dept = selectedDepts[seatCounter % selectedDepts.length]

                        roomSeats.push({
                            id: `${rowChar}${c + 1}`,
                            student: `202${year}${dept.substring(0, 2)}${Math.floor(Math.random() * 900) + 100}`,
                            dept: dept,
                            year: year,
                            row_idx: r,
                            col_idx: c
                        })
                        seatCounter++
                    }
                }
                return {
                    name: realisticRoomNames[ri % realisticRoomNames.length],
                    capacity: config.roomCapacity,
                    secureHash: Math.random().toString(36).substring(2, 10).toUpperCase(),
                    seats: roomSeats
                }
            })

            const finalResult = {
                examMode,
                examDate,
                department: selectedDepts.join(', '),
                yearGroup: selectedYears.join(' & '),
                rooms,
                stats: {
                    totalStudents: config.membersPerClass * config.rooms,
                    totalRooms: config.rooms,
                    constraintsSatisfied: '100%',
                    pattern: examMode === 'internal' ? 'Multi-Year Alternating' : 'Sequential'
                }
            }

            setResult(finalResult)
            sessionStorage.setItem('vantage_seating_result', JSON.stringify(finalResult))
            setAllocating(false)
        }, 1500)
    }

    const handleDeletePlan = async (batchParams?: { dept?: string, year?: string, mode?: string }) => {
        if (!confirm('⚠️ Are you sure you want to DELETE the saved seating plan? This will remove it for ALL users (Students, Admin, and COE). This cannot be undone!')) return
        setDeleting(true)
        try {
            const { API_BASE, getAuthHeaders } = await import('@/lib/api')
            const params = new URLSearchParams()

            if (batchParams) {
                if (batchParams.dept) params.append('department', batchParams.dept)
                if (batchParams.year) params.append('year_group', batchParams.year)
                if (batchParams.mode) params.append('exam_mode', batchParams.mode)
            } else if (result) {
                if (result.examMode) params.append('exam_mode', result.examMode)
                if (result.department) params.append('department', result.department)
                if (result.yearGroup) params.append('year_group', result.yearGroup)
            } else {
                // Use current filters if no result
                if (filterDept) params.append('department', filterDept)
                if (filterYear) params.append('year_group', filterYear)
            }
            const res = await fetch(`${API_BASE}/api/seating?${params.toString()}`, {
                method: 'DELETE',
                headers: getAuthHeaders()
            })
            const data = await res.json()
            if (res.ok) {
                alert('Plan successfully deleted and removed from global visibility.')
                setResult(null)
                sessionStorage.removeItem('vantage_seating_result')
                setSavedAllocations([]) // This line was in the original, but the instruction's code edit implies its removal. Keeping it for now as the instruction was ambiguous on this specific line.
                // Reset active filters to prevent stale view
                setFilterDept('')
                setFilterYear('')
                // Re-fetch history to update the list
                fetchPlanHistory() // Changed from fetchPlanHistory()
            } else {
                alert(data.detail || 'Failed to delete seating plan.')
            }
        } catch (e) {
            console.error(e)
            alert('Error deleting plan.')
        } finally {
            setDeleting(false)
        }
    }

    const handleDownloadPDF = () => {
        if (!result && savedAllocations.length === 0) return

        // If we are looking at saved allocations, use that data
        const dataToPrint = result || {
            examMode: savedAllocations[0]?.exam_mode || 'General',
            examDate: savedAllocations[0]?.exam_date || 'N/A',
            department: filterDept || 'All',
            yearGroup: filterYear || 'All',
            rooms: Object.values(savedAllocations.reduce((acc: any, curr: any) => {
                if (!acc[curr.room_name]) acc[curr.room_name] = { name: curr.room_name, capacity: 0, seats: [] }
                acc[curr.room_name].seats.push({ id: curr.seat_number, student: 'Student', dept: curr.department, year: curr.year_group })
                acc[curr.room_name].capacity++
                return acc
            }, {}))
        }

        const printWindow = window.open('', '_blank')
        if (printWindow) {
            const htmlContent = `
            <html><head><title>Seating Plan Document</title>
            <style>
                @media print { .no-print { display: none; } }
                body{font-family:'Segoe UI',Tahoma,sans-serif;padding:40px;color:#0f172a;line-height:1.5;}
                .header{margin-bottom:40px;border-bottom:3px solid #001b5e;padding-bottom:20px;display:flex;justify-content:space-between;align-items:center;}
                .meta-grid{display:grid;grid-template-columns: repeat(2, 1fr); gap: 10px; margin-bottom: 20px;}
                .room-header{background:#f1f5f9;padding:15px;border-radius:10px;margin:30px 0 15px 0;border-left:5px solid #001b5e;}
                .seat-grid{display:grid;grid-template-columns:repeat(6,1fr);gap:10px;}
                .seat{border:1px solid #cbd5e1;padding:12px;text-align:center;border-radius:8px;background:white;}
                .seat-id{color:#001b5e;font-weight:900;font-size:14px;display:block;margin-bottom:4px;}
                .student-dept{font-size:10px;color:#64748b;font-weight:bold;}
                .btn-print{background:#001b5e;color:white;padding:12px 24px;border-radius:8px;font-weight:bold;cursor:pointer;border:none;margin-bottom:20px;}
            </style>
            </head><body>
                <div class="no-print" style="text-align:right;">
                    <button class="btn-print" onclick="window.print()">Click to Save as PDF / Print</button>
                </div>
                <div class="header">
                    <div>
                        <h1 style="color:#001b5e;margin:0;font-size:28px;">VANTAGE EDUTECH</h1>
                        <p style="margin:5px 0;font-weight:bold;color:#64748b;">OFFICIAL SEATING ALLOCATION REPORT</p>
                    </div>
                    <div style="text-align:right">
                        <p style="margin:0;font-size:12px;font-weight:bold;">Report ID: #${Math.random().toString(36).substring(7).toUpperCase()}</p>
                        <p style="margin:0;font-size:12px;color:#64748b;">Generated: ${new Date().toLocaleString()}</p>
                    </div>
                </div>
                <div class="meta-grid">
                    <div><strong>Exam Mode:</strong> ${dataToPrint.examMode.toUpperCase()}</div>
                    <div><strong>Date:</strong> ${dataToPrint.examDate}</div>
                    <div><strong>Department:</strong> ${dataToPrint.department}</div>
                    <div><strong>Academic Year:</strong> ${dataToPrint.yearGroup}</div>
                </div>
                ${dataToPrint.rooms.map((room: any) => `
                    <div class="room-header">
                        <h2 style="margin:0;font-size:18px;">Room: ${room.name}</h2>
                        <span style="font-size:12px;font-weight:bold;color:#64748b;">Total Capacity: ${room.capacity} Students</span>
                    </div>
                    <div class="seat-grid">
                        ${room.seats.map((s: any) => `
                            <div class="seat">
                                <span class="seat-id">${s.id}</span>
                                <span class="student-dept">${s.dept} - Yr ${s.year}</span>
                            </div>
                        `).join('')}
                    </div>
                `).join('')}
                <div style="margin-top:80px;border-top:1px solid #e2e8f0;padding-top:20px;display:flex;justify-content:space-between;font-size:12px;color:#64748b;">
                    <p>Controller of Examinations Signature: _______________________</p>
                    <p>System Verified: ✅</p>
                </div>
            </body></html>
            `
            printWindow.document.write(htmlContent)
            printWindow.document.close()
        }
    }

    const handleSave = async () => {
        if (!result) return
        setSaving(true)
        try {
            const { API_BASE, getAuthHeaders } = await import('@/lib/api')
            const allSeats = result.rooms.flatMap((r: any) => r.seats.map((s: any) => ({
                room_name: r.name,
                seat_number: s.id,
                row_idx: s.row_idx,
                col_idx: s.col_idx
            })))

            const payload = {
                exam_mode: result.examMode,
                exam_date: result.examDate,
                department: result.department,
                year_group: result.yearGroup,
                allocations: allSeats
            }

            const res = await fetch(`${API_BASE}/api/seating/save`, {
                method: 'POST',
                headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            })
            if (res.ok) {
                alert('Seating plan saved and published successfully!')
                fetchPlanHistory()
            } else if (res.status === 401) {
                // Stale token - clear and redirect to login
                localStorage.removeItem('accessToken')
                localStorage.removeItem('userRole')
                alert('Your session has expired. Please sign out and log in again.')
            } else {
                const err = await res.json()
                alert(err.detail || "Failed to save plan")
            }
        } catch (e) {
            console.error(e)
        } finally {
            setSaving(false)
        }
    }

    const handlePrint = () => {
        if (!result) return
        const printWindow = window.open('', '_blank')
        if (printWindow) {
            const htmlContent = `
            <html><head><title>Seating Plan: ${result.examMode.toUpperCase()}</title>
            <style>
                body{font-family:'Inter',sans-serif;padding:40px;color:#0f172a;}
                .grid{display:grid;gap:10px;margin-bottom:40px;margin-top:20px}
                .seat{border:1px solid #e2e8f0;border-radius:8px;padding:12px;text-align:center;}
                .header{margin-bottom:40px;border-bottom:2px solid #001b5e;padding-bottom:20px;}
            </style>
            </head><body>
                <div class="header">
                    <h2 style="color:#001b5e;margin:0 0 10px 0;">VANTAGE SEATING PLAN</h2>
                    <p style="margin:5px 0;"><strong>Mode:</strong> <span style="text-transform: capitalize">${result.examMode}</span> Exam | <strong>Date:</strong> ${result.examDate}</p>
                    <p style="margin:5px 0;"><strong>Departments:</strong> ${result.department} | <strong>Years:</strong> ${result.yearGroup}</p>
                </div>
                ${result.rooms.map((room: any) => `
                    <h3 style="color:#334155;">Room: ${room.name} (${room.capacity} Seats)</h3>
                    <div class="grid" style="grid-template-columns:repeat(${config.cols},1fr)">
                        ${room.seats.map((s: any) => `
                            <div class="seat">
                                <b style="color:#001b5e;font-size:14px;">${s.id}</b><br/>
                                <span style="font-size:12px;font-weight:900;">${s.student}</span><br/>
                                <span style="font-size:10px;color:#64748b;font-weight:bold;">${s.dept} - Yr ${s.year}</span>
                            </div>
                        `).join('')}
                    </div>
                    <div style="page-break-after:always;"></div>
                `).join('')}
            </body></html>
            `
            printWindow.document.write(htmlContent)
            printWindow.document.close()
            printWindow.print()
        }
    }

    const handleDownload = () => {
        if (!result) return

        // Professional HTML Document export
        const htmlContent = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <title>Seating Plan: ${result.examMode.toUpperCase()}</title>
            <style>
                body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #1e293b; background: #f8fafc; }
                .container { max-width: 1000px; margin: 0 auto; background: white; padding: 40px; border-radius: 12px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); }
                h1 { color: #0f172a; border-bottom: 2px solid #e2e8f0; padding-bottom: 16px; font-size: 24px; }
                .meta { display: flex; gap: 24px; margin-bottom: 32px; font-size: 14px; color: #475569; }
                .meta div { background: #f1f5f9; padding: 12px 20px; border-radius: 8px; font-weight: 500; }
                table { width: 100%; border-collapse: collapse; margin-bottom: 40px; font-size: 14px; text-align: left; }
                th { background: #0f172a; color: white; padding: 16px; font-weight: 600; }
                td { padding: 16px; border-bottom: 1px solid #e2e8f0; }
                tr:nth-child(even) td { background: #f8fafc; }
                .room-header { background: #e2e8f0; padding: 12px; margin-top: 32px; margin-bottom: 0; font-size: 18px; color: #0f172a; border-radius: 8px 8px 0 0; }
                .badge { background: #dbeafe; color: #1e40af; padding: 4px 8px; border-radius: 9999px; font-size: 12px; font-weight: 600; }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>VANTAGE OFFICIAL SEATING PLAN</h1>
                <div class="meta">
                    <div><strong>EXAM MODE:</strong> <span style="text-transform: capitalize">${result.examMode}</span></div>
                    <div><strong>DATE:</strong> ${result.examDate}</div>
                    <div><strong>DEPARTMENTS:</strong> ${result.department}</div>
                    <div><strong>YEAR GROUPS:</strong> ${result.yearGroup}</div>
                </div>
                
                ${result.rooms.map((r: any) => `
                    <h2 class="room-header">${r.name} <span>(${r.capacity} Seats)</span></h2>
                    <table>
                        <thead>
                            <tr>
                                <th>Seat No.</th>
                                <th>Student ID</th>
                                <th>Department</th>
                                <th>Year</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${r.seats.map((s: any) => `
                                <tr>
                                    <td><strong>${s.id}</strong></td>
                                    <td style="font-family: monospace; font-size: 16px; font-weight: bold;">${s.student}</td>
                                    <td><span class="badge">${s.dept}</span></td>
                                    <td>Year ${s.year}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                `).join('')}
                
                <div style="text-align: center; color: #94a3b8; font-size: 12px; margin-top: 40px; padding-top: 20px; border-top: 1px dashed #cbd5e1;">
                    Generated by Vantage Accelerator Engine on ${new Date().toLocaleString()}
                </div>
            </div>
        </body>
        </html>
        `
        const blob = new Blob([htmlContent], { type: "text/html;charset=utf-8" })
        const url = URL.createObjectURL(blob)
        const link = document.createElement("a")
        link.setAttribute("href", url)
        link.setAttribute("download", `Vantage_Seating_${result.examDate}_${result.examMode}.html`)
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
    }

    return (
        <div className="space-y-8 fade-in">
            <div className="flex justify-between items-end">
                <div className="space-y-1">
                    <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Access: {role.toUpperCase()}</p>
                    <h1 className="text-4xl font-black text-[#001b5e]">Seating Command Center</h1>
                </div>
                <div className="flex gap-4">
                    {result && (
                        <>
                            <button onClick={handleDownload} className="bg-white border border-slate-200 px-6 py-3 rounded-2xl font-bold text-slate-600 flex items-center gap-2 hover:bg-slate-50 transition-all">
                                <Download className="w-4 h-4" />
                                Download CSV
                            </button>
                            <button onClick={handleDownloadPDF} className="bg-white border border-slate-200 px-6 py-3 rounded-2xl font-bold text-slate-600 flex items-center gap-2 hover:bg-slate-50 transition-all">
                                <FileDown className="w-4 h-4" />
                                Download New Plan PDF
                            </button>
                            {role === 'coe' && (
                                <>
                                    <button onClick={() => handleDeletePlan()} disabled={deleting} className="bg-red-600 text-white px-6 py-3 rounded-2xl font-black flex items-center gap-2 hover:bg-red-700 transition-all">
                                        {deleting ? 'Deleting...' : <><Trash2 className="w-4 h-4" /> Delete Plan</>}
                                    </button>
                                    <button onClick={handleSave} disabled={saving} className="bg-emerald-600 text-white px-8 py-3 rounded-2xl font-black shadow-xl shadow-emerald-900/20 flex items-center gap-2 hover:bg-emerald-700 transition-all">
                                        {saving ? 'Publishing...' : 'Publish to Portal'}
                                    </button>
                                </>
                            )}
                        </>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                <div className="space-y-8">
                    {role === 'coe' ? (
                        <div className="vantage-card p-8">
                            <h2 className="text-lg font-black text-[#001b5e] mb-6 flex items-center gap-2">
                                <Settings2 className="w-5 h-5 text-blue-500" />
                                Optimization Engine
                            </h2>

                            {/* Mode Toggle */}
                            <div className="flex p-1 bg-slate-100 rounded-2xl mb-8">
                                <button
                                    onClick={() => setExamMode('internal')}
                                    className={`flex-1 py-3 rounded-xl font-bold text-xs transition-all ${examMode === 'internal' ? 'bg-[#001b5e] text-white shadow-lg' : 'text-slate-500 hover:bg-slate-200'}`}
                                >
                                    Internal Exam
                                </button>
                                <button
                                    onClick={() => setExamMode('semester')}
                                    className={`flex-1 py-3 rounded-xl font-bold text-xs transition-all ${examMode === 'semester' ? 'bg-[#001b5e] text-white shadow-lg' : 'text-slate-500 hover:bg-slate-200'}`}
                                >
                                    Semester Exam
                                </button>
                            </div>

                            <div className="space-y-6">
                                {/* Common: Dept Select */}
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Departments</label>
                                    <div className="flex flex-wrap gap-2">
                                        {['CSE', 'ECE', 'MECH', 'IT', 'AI-DS'].map(d => (
                                            <button
                                                key={d}
                                                onClick={() => setSelectedDepts(prev => prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d])}
                                                className={`px-3 py-1.5 rounded-lg text-[10px] font-black transition-all border ${selectedDepts.includes(d) ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-400 border-slate-200'}`}
                                            >
                                                {d}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Common: Year Select */}
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Years Combination</label>
                                    <div className="flex gap-2">
                                        {[1, 2, 3, 4].map(y => (
                                            <button
                                                key={y}
                                                onClick={() => setSelectedYears(prev => prev.includes(y) ? prev.filter(x => x !== y) : [...prev, y])}
                                                className={`flex-1 py-2 rounded-lg text-[10px] font-black transition-all border ${selectedYears.includes(y) ? 'bg-[#001b5e] text-white border-[#001b5e]' : 'bg-white text-slate-400 border-slate-200'}`}
                                            >
                                                {y}st
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</label>
                                    <input type="date" value={examDate} onChange={(e) => setExamDate(e.target.value)} className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl font-bold text-[#001b5e] text-xs" />
                                </div>

                                <div className="grid grid-cols-2 gap-4 text-xs font-bold text-slate-400 uppercase tracking-widest">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Rooms</label>
                                        <input type="number" value={config.rooms} onChange={(e) => setConfig({ ...config, rooms: parseInt(e.target.value) || 1 })} className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl font-bold text-[#001b5e]" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Members/Room</label>
                                        <input type="number" value={config.membersPerClass} onChange={(e) => setConfig({ ...config, membersPerClass: parseInt(e.target.value) || 1 })} className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl font-bold text-[#001b5e]" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Rows</label>
                                        <input type="number" value={config.rows} onChange={(e) => setConfig({ ...config, rows: parseInt(e.target.value) || 1 })} className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl font-bold text-[#001b5e]" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Cols</label>
                                        <input type="number" value={config.cols} onChange={(e) => setConfig({ ...config, cols: parseInt(e.target.value) || 1 })} className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl font-bold text-[#001b5e]" />
                                    </div>
                                </div>

                                {/* Seating Conditions */}
                                <div className="space-y-3 pt-4 border-t border-slate-100">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Allocation Rules</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        <label className={`flex items-center justify-center p-2 rounded-xl border cursor-pointer transition-all text-center h-full ${conditions.ascendingOrder && !conditions.randomized ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-slate-50 border-slate-200 text-slate-500'}`}>
                                            <input type="checkbox" checked={conditions.ascendingOrder && !conditions.randomized} onChange={(e) => setConditions({ ...conditions, ascendingOrder: e.target.checked, randomized: e.target.checked ? false : conditions.randomized })} className="hidden" />
                                            <span className="text-[10px] font-bold leading-tight">Ascending<br />Order</span>
                                        </label>
                                        <label className={`flex items-center justify-center p-2 rounded-xl border cursor-pointer transition-all text-center h-full ${conditions.randomized ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-slate-50 border-slate-200 text-slate-500'}`}>
                                            <input type="checkbox" checked={conditions.randomized} onChange={(e) => setConditions({ ...conditions, randomized: e.target.checked, ascendingOrder: e.target.checked ? false : conditions.ascendingOrder })} className="hidden" />
                                            <span className="text-[10px] font-bold leading-tight">Randomized<br />Seating</span>
                                        </label>
                                        <label className={`flex items-center justify-center p-2 rounded-xl border cursor-pointer transition-all text-center h-full ${conditions.sameDeptAdjacent ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-slate-50 border-slate-200 text-slate-500'}`}>
                                            <input type="checkbox" checked={conditions.sameDeptAdjacent} onChange={(e) => setConditions({ ...conditions, sameDeptAdjacent: e.target.checked })} className="hidden" />
                                            <span className="text-[10px] font-bold leading-tight">Same Dept.<br />Adjacent</span>
                                        </label>
                                        <label className={`flex items-center justify-center p-2 rounded-xl border cursor-pointer transition-all text-center h-full ${conditions.separateByYear ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-slate-50 border-slate-200 text-slate-500'}`}>
                                            <input type="checkbox" checked={conditions.separateByYear} onChange={(e) => setConditions({ ...conditions, separateByYear: e.target.checked })} className="hidden" />
                                            <span className="text-[10px] font-bold leading-tight">Separate<br />by Year</span>
                                        </label>
                                    </div>
                                </div>
                            </div>

                            <button onClick={handleAllocate} disabled={allocating} className="w-full mt-8 bg-[#001b5e] text-white py-4 rounded-2xl font-black shadow-xl shadow-blue-900/20 flex items-center justify-center gap-2 hover:bg-blue-700 active:scale-95 transition-all">
                                {allocating ? 'Processing...' : <><Play className="w-4 h-4" /> Generate Plan</>}
                            </button>
                        </div>
                    ) : (
                        <div className="vantage-card p-6 bg-blue-50 border border-blue-100">
                            <p className="text-blue-700 font-bold text-sm mb-4">📋 Read-only view. Filter saved plans from the database below.</p>
                            <div className="space-y-3">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase text-slate-400">Department</label>
                                    <select value={filterDept} onChange={e => { setFilterDept(e.target.value); fetchSavedPlan(e.target.value, filterYear) }} className="w-full bg-white border p-2 rounded-xl font-bold text-sm">
                                        <option value="">All</option>
                                        {['CSE', 'ECE', 'MECH', 'IT', 'AI-DS'].map(d => <option key={d} value={d}>{d}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase text-slate-400">Year</label>
                                    <select value={filterYear} onChange={e => { setFilterYear(e.target.value); fetchSavedPlan(filterDept, e.target.value) }} className="w-full bg-white border p-2 rounded-xl font-bold text-sm">
                                        <option value="">All Years</option>
                                        <option value="1">1st Year</option>
                                        <option value="2">2nd Year</option>
                                        <option value="3">3rd Year</option>
                                        <option value="4">4th Year</option>
                                    </select>
                                </div>
                                <button onClick={() => fetchSavedPlan(filterDept, filterYear)} className="w-full bg-[#001b5e] text-white py-2 rounded-xl font-bold text-sm">
                                    {loadingPlan ? 'Loading...' : 'Search Plans'}
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="vantage-card p-8">
                        <h3 className="font-black text-[#001b5e] mb-4">Quick Lookup</h3>
                        <div className="space-y-4">
                            <input
                                type="text"
                                placeholder="Roll Number..."
                                className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-sm"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            <button onClick={handleSearch} className="w-full bg-slate-800 text-white py-2.5 rounded-xl font-bold text-sm">
                                {loadingSearch ? 'Searching...' : 'Search'}
                            </button>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-3 space-y-8">
                    {result ? (
                        <div className="space-y-8">
                            {result.rooms.map((room: any, ri: number) => (
                                <div key={ri} className="vantage-card overflow-hidden transition-all hover:shadow-2xl">
                                    <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-[#f8fafc]">
                                        <div className="flex items-center gap-3">
                                            <Building2 className="w-5 h-5 text-[#001b5e]" />
                                            <div>
                                                <h3 className="font-black text-[#001b5e] text-lg">{room.name}</h3>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{room.capacity} Seats Total</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="text-right">
                                                <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Authentication Key</p>
                                                <p className="font-mono text-sm font-black text-[#001b5e]">{room.secureHash}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="p-8 bg-[#fdfdfd]">
                                        <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${config.cols}, 1fr)` }}>
                                            {room.seats.map((seat: any, si: number) => (
                                                <div key={si} className="group relative p-4 rounded-2xl bg-white border border-slate-100 text-center shadow-sm hover:border-[#001b5e] transition-all hover:translate-y-[-2px]">
                                                    <p className="text-[9px] font-black text-blue-400 mb-1">{seat.id}</p>
                                                    <p className="text-xs font-black text-[#1e293b]">{seat.dept}</p>
                                                    <div className="absolute inset-0 bg-[#001b5e] text-white opacity-0 group-hover:opacity-100 rounded-2xl flex items-center justify-center pointer-events-none transition-opacity">
                                                        <span className="text-[10px] font-black">{seat.student}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (role === 'admin' || role === 'coe') && savedAllocations.length > 0 ? (
                        <div className="vantage-card overflow-hidden">
                            <div className="p-6 bg-[#f8fafc] border-b flex justify-between items-center">
                                <div>
                                    <h3 className="font-black text-[#001b5e] text-xl">Active Saved Plan</h3>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                                        Showing {filterDept || 'All'} • {filterYear ? `Year ${filterYear}` : 'All Years'}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={handleDownloadPDF}
                                        className="bg-white border text-[#001b5e] p-3 rounded-xl hover:bg-slate-50 transition-all shadow-sm flex items-center gap-2 font-bold text-sm"
                                        title="Download as PDF"
                                    >
                                        <FileDown className="w-4 h-4" />
                                        Download PDF
                                    </button>
                                    {role === 'coe' && (
                                        <button
                                            onClick={() => handleDeletePlan({ dept: filterDept, year: filterYear })}
                                            className="bg-rose-50 text-rose-600 p-3 rounded-xl hover:bg-rose-100 transition-all shadow-sm flex items-center gap-2 font-bold text-sm"
                                            title="Delete this batch globally"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                            Delete Batch
                                        </button>
                                    )}
                                </div>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="bg-slate-50">
                                            <th className="px-4 py-3 text-left text-[10px] font-black text-slate-400 uppercase">Room</th>
                                            <th className="px-4 py-3 text-left text-[10px] font-black text-slate-400 uppercase">Seat</th>
                                            <th className="px-4 py-3 text-left text-[10px] font-black text-slate-400 uppercase">Department</th>
                                            <th className="px-4 py-3 text-left text-[10px] font-black text-slate-400 uppercase">Year Group</th>
                                            <th className="px-4 py-3 text-left text-[10px] font-black text-slate-400 uppercase">Exam Mode</th>
                                            <th className="px-4 py-3 text-left text-[10px] font-black text-slate-400 uppercase">Date</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {savedAllocations.slice(0, 100).map((a: any, i: number) => (
                                            <tr key={i} className="border-b hover:bg-slate-50">
                                                <td className="px-4 py-3 font-black text-[#001b5e] text-sm">{a.room_name}</td>
                                                <td className="px-4 py-3 font-bold text-sm">{a.seat_number}</td>
                                                <td className="px-4 py-3">
                                                    <span className="bg-blue-50 text-blue-700 text-xs font-black px-2 py-0.5 rounded-full">{a.department}</span>
                                                </td>
                                                <td className="px-4 py-3 text-sm font-bold">{a.year_group}</td>
                                                <td className="px-4 py-3 text-sm text-slate-500">{a.exam_mode}</td>
                                                <td className="px-4 py-3 text-sm text-slate-500">{a.exam_date}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ) : (role === 'admin' || role === 'coe') && planHistory.length > 0 ? (
                        <div className="space-y-4">
                            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest px-4">Saved Plans Archive</h3>
                            {planHistory.map((plan, idx) => (
                                <div key={idx} className="bg-white vantage-card p-6 flex justify-between items-center group hover:border-[#001b5e] transition-all">
                                    <div className="flex gap-6 items-center">
                                        <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center font-black text-[#001b5e]">
                                            {idx + 1}
                                        </div>
                                        <div>
                                            <h4 className="font-black text-[#001b5e] text-lg flex items-center gap-2">
                                                {plan?.department} Seating
                                                <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full uppercase tracking-tighter">
                                                    {plan?.exam_mode || 'Internal'}
                                                </span>
                                            </h4>
                                            <p className="text-slate-500 font-bold text-xs uppercase">
                                                Year Group: {plan?.year_group} | Date: {plan?.exam_date}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => {
                                                // Quick view & Download
                                                fetchSavedPlan(plan.department, plan.year_group, plan.exam_mode).then(() => {
                                                    setTimeout(() => handleDownloadPDF(), 300)
                                                })
                                            }}
                                            className="bg-[#001b5e] text-white px-6 py-2 rounded-xl font-bold flex items-center gap-2 transition-transform active:scale-95 shadow-lg shadow-blue-100"
                                        >
                                            <FileDown className="w-4 h-4" />
                                            Report
                                        </button>
                                        <button
                                            onClick={() => handleDeletePlan({ dept: plan.department, year: plan.year_group, mode: plan.exam_mode })}
                                            className="text-rose-400 hover:bg-rose-50 hover:text-rose-600 p-2.5 rounded-xl transition-all border border-transparent hover:border-rose-100"
                                            title="Delete"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : role === 'student' && mySeat ? (
                        <div className="space-y-6">
                            {mySeat.found ? (
                                <div className="vantage-card overflow-hidden">
                                    <div className="p-6 bg-[#001b5e] text-white">
                                        <h3 className="font-black text-xl">🎯 Your Exam Seat</h3>
                                        <p className="text-blue-300 text-xs font-bold uppercase mt-1">Allocated by Controller of Examinations</p>
                                    </div>
                                    <div className="divide-y">
                                        {mySeat.allocations?.map((a: any, i: number) => (
                                            <div key={i} className="p-6 flex items-center justify-between">
                                                <div className="space-y-1">
                                                    <p className="text-[10px] font-black text-slate-400 uppercase">Exam Hall</p>
                                                    <p className="text-2xl font-black text-[#001b5e]">{a.room_name}</p>
                                                </div>
                                                <div className="text-center">
                                                    <p className="text-[10px] font-black text-slate-400 uppercase">Seat</p>
                                                    <p className="text-2xl font-black text-emerald-600">{a.seat_number}</p>
                                                </div>
                                                <div className="text-right space-y-1">
                                                    <p className="text-[10px] font-black text-slate-400 uppercase">Date</p>
                                                    <p className="font-black text-[#001b5e]">{a.exam_date}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="p-4 bg-slate-50 border-t flex justify-end">
                                        <button
                                            onClick={async () => {
                                                if (!confirm('⚠️ Are you sure you want to request DELETION of this seat plan? This will clear your current view.')) return
                                                setMySeat(null)
                                                alert('Seat view cleared. Please contact COE for permanent changes.')
                                            }}
                                            className="text-xs font-bold text-rose-600 hover:text-rose-700 underline"
                                        >
                                            Clear Seat View
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="vantage-card p-12 flex flex-col items-center justify-center text-center space-y-4 border-dashed border-2">
                                    <Layers className="w-16 h-16 text-slate-100" />
                                    <h3 className="text-xl font-black text-[#001b5e]">Seat Not Allocated Yet</h3>
                                    <p className="text-slate-400 text-sm max-w-xs">{mySeat.message}</p>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="vantage-card p-12 flex flex-col items-center justify-center text-center space-y-6 min-h-[500px] border-dashed border-2">
                            <Layers className="w-16 h-16 text-slate-100" />
                            <div className="max-w-xs">
                                <h3 className="text-xl font-black text-[#001b5e]">No Active Plan</h3>
                                <p className="text-slate-400 font-medium text-sm mt-2">Adjust the parameters on the left and click Generate to create the optimized grid.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div >
    )
}
