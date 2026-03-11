"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
    Calendar,
    Printer,
    Download,
    Send,
    CheckCircle2,
    Lock,
    Inbox,
    Shield,
    ArrowRight,
    Users,
    Eye,
    Search,
    X,
    Clock,
    User
} from 'lucide-react'
import { API_BASE, getAuthHeaders } from '@/lib/api'
import SeatingPopup from '@/components/SeatingPopup'

export default function HallTickets() {
    const [popupState, setPopupState] = useState({ isOpen: false, examId: '', courseName: '' })
    const [profile, setProfile] = useState<any>(null)
    const [exams, setExams] = useState<any[]>([])
    const [published, setPublished] = useState(false)
    const [coeApproved, setCoeApproved] = useState(false)
    const [loading, setLoading] = useState(true)
    const [myAllocations, setMyAllocations] = useState<any[]>([])
    const [publishing, setPublishing] = useState(false)
    const [role, setRole] = useState('student')
    const [viewAll, setViewAll] = useState(false)
    const [allStudents, setAllStudents] = useState<any[]>([])
    const [publications, setPublications] = useState<any[]>([])
    const [publishScope, setPublishScope] = useState({ department: 'CSE', year_of_study: 1, semester: 1 })
    const [rejFocus, setRejFocus] = useState<string | null>(null)
    const [rejReason, setRejReason] = useState('')
    const [selectedStudent, setSelectedStudent] = useState<any | null>(null)
    const [accessRequests, setAccessRequests] = useState<any[]>([])

    useEffect(() => {
        const headers = getAuthHeaders()
        const userRole = localStorage.getItem('userRole') || 'student'
        setRole(userRole)

        const fetchData = async () => {
            try {
                const [prof, ex, status] = await Promise.all([
                    fetch(`${API_BASE}/api/me/profile`, { headers }).then(r => r.json()),
                    fetch(`${API_BASE}/api/exams`, { headers }).then(r => r.json()),
                    fetch(`${API_BASE}/api/hall_tickets/status`, { headers }).then(r => r.json())
                ])
                setProfile(prof)
                setExams(Array.isArray(ex) ? ex : [])
                setPublished(status?.published ?? false)
                setCoeApproved(status?.coe_approved ?? false)
                setPublications(status?.publications || [])

                if (userRole === 'student' && prof.id) {
                    const allocRes = await fetch(`${API_BASE}/api/seating/search?student_id=${prof.id}`, { headers })
                    if (allocRes.ok) setMyAllocations(await allocRes.json())
                }
            } catch (e) {
                console.error("Fetch error:", e)
            } finally {
                setLoading(false)
            }
        }

        fetchData()

        if (userRole === 'coe') {
            fetch(`${API_BASE}/api/hall_tickets/requests`, { headers }).then(r => r.json()).then(data => {
                setAccessRequests(Array.isArray(data) ? data : [])
            }).catch(e => console.error("Error fetching requests:", e))
        }

        // Dynamic Updates: Poll status every 15s
        const poll = setInterval(fetchData, 15000)
        return () => clearInterval(poll)
    }, [])

    const handlePublishRequest = async () => {
        if (role !== 'admin') return alert("Only Admin can request issuance.")
        setPublishing(true)
        try {
            const res = await fetch(`${API_BASE}/api/hall_tickets/publish`, {
                method: 'POST',
                headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
                body: JSON.stringify(publishScope)
            })
            if (res.ok) {
                alert("Issuance Request Sent to COE!");
                refreshStatus()
            } else {
                const err = await res.json()
                alert(`Request failed: ${err.detail || JSON.stringify(err)}`)
            }
        } catch (e) {
            alert("Network error.")
        } finally {
            setPublishing(false)
        }
    }

    const refreshStatus = async () => {
        const res = await fetch(`${API_BASE}/api/hall_tickets/status`, { headers: getAuthHeaders() })
        const status = await res.json()
        setPublished(status?.published ?? false)
        setCoeApproved(status?.coe_approved ?? false)
        setPublications(status?.publications || [])
    }

    const handleApprove = async (pubId: string) => {
        if (role !== 'coe') return
        setPublishing(true)
        try {
            const res = await fetch(`${API_BASE}/api/hall_tickets/approve/${pubId}`, {
                method: 'POST',
                headers: getAuthHeaders()
            })
            if (res.ok) {
                alert("Publication Approved & Issued!");
                refreshStatus()
            }
        } catch (e) { console.error(e) }
        finally { setPublishing(false) }
    }

    const handleReject = async (pubId: string, reason: string) => {
        if (role !== 'coe') return
        if (!reason.trim()) return alert("Reason required.")
        setPublishing(true)
        try {
            const res = await fetch(`${API_BASE}/api/hall_tickets/reject/${pubId}`, {
                method: 'POST',
                headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
                body: JSON.stringify({ reason })
            })
            if (res.ok) {
                alert("Publication Revoked/Rejected.");
                refreshStatus()
            }
        } catch (e) { console.error(e) }
        finally { setPublishing(false) }
    }

    const handleHide = async (pubId: string, hide: boolean) => {
        const endpoint = hide ? 'hide' : 'unhide'
        try {
            const res = await fetch(`${API_BASE}/api/hall_tickets/${endpoint}/${pubId}`, {
                method: 'POST',
                headers: getAuthHeaders()
            })
            if (res.ok) refreshStatus()
        } catch (e) { console.error(e) }
    }

    const handleRequestAccess = async (pubId: string) => {
        setPublishing(true)
        try {
            const res = await fetch(`${API_BASE}/api/hall_tickets/request_access`, {
                method: 'POST',
                headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
                body: JSON.stringify({ pub_id: pubId })
            })
            if (res.ok) {
                alert("Access requested! Please wait for COE approval.")
                refreshStatus()
            }
        } catch (e) { console.error(e) }
        finally { setPublishing(false) }
    }

    const fetchMyAllocations = async (targetStudentId: string) => {
        try {
            const res = await fetch(`${API_BASE}/api/seating/search?student_id=${targetStudentId}`, { headers: getAuthHeaders() })
            if (res.ok) setMyAllocations(await res.json())
        } catch (e) { console.error(e) }
    }

    const handleViewAll = async () => {
        if (allStudents.length === 0) {
            setPublishing(true)
            try {
                const res = await fetch(`${API_BASE}/api/students`, { headers: getAuthHeaders() })
                const data = await res.json()
                setAllStudents(data)
            } finally {
                setPublishing(false)
            }
        }
        setViewAll(!viewAll)
    }

    const handleDownload = () => {
        const targetProfile = selectedStudent || profile
        if (!targetProfile) return

        const examRows = exams.map(e => {
            const alloc = myAllocations.find(a => a.exam_id === e.id)
            const roomDisplay = alloc ? alloc.room_name : (e.room || 'TBD')
            const seatDisplay = alloc ? alloc.seat_number : '—'
            return `<tr><td>${e.course_code}</td><td>${e.course_name}</td><td>${e.exam_date}</td><td>${e.exam_time}</td><td>${roomDisplay}</td><td>${seatDisplay}</td></tr>`
        }).join('')

        const rollNumber = targetProfile?.roll_number || ''
        const qrData = `ROLL:${rollNumber}|${targetProfile?.full_name || ''}|${targetProfile?.department || ''}`
        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrData)}`

        const htmlContent = `
      <html>
      <head><title>Hall Ticket - ${targetProfile.full_name}</title>
      <style>
        body{font-family:'Inter',system-ui,sans-serif;padding:40px;color:#0f172a;max-width:800px;margin:0 auto;}
        .header{display:flex;justify-content:space-between;align-items:center;border-bottom:3px solid #001b5e;padding-bottom:20px;margin-bottom:30px}
        .logo{font-size:28px;font-weight:900;color:#001b5e}
        .subtitle{font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:2px}
        .info-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:30px}
        .info-item label{font-size:10px;text-transform:uppercase;letter-spacing:1px;color:#94a3b8;font-weight:700}
        .info-item p{font-size:16px;font-weight:700;color:#001b5e;margin:4px 0 0}
        table{width:100%;border-collapse:collapse;margin-top:20px}
        th{background:#001b5e;color:white;padding:12px;text-align:left;font-size:11px;text-transform:uppercase;letter-spacing:1px}
        td{padding:12px;border-bottom:1px solid #e2e8f0;font-size:14px;font-weight:500}
        .qr-section{text-align:center;margin-top:30px;padding:20px;border:2px dashed #cbd5e1;border-radius:12px;}
        .seal{display:flex;justify-content:space-between;margin-top:60px}
        .seal-item{text-align:center;width:200px}
        .seal-line{border-top:1px solid #94a3b8;margin-bottom:8px}
        .seal-label{font-size:10px;font-weight:700;color:#64748b;text-transform:uppercase}
        .footer{text-align:center;font-size:10px;color:#94a3b8;margin-top:40px}
      </style>
      </head>
      <body>
        <div class="header">
          <div><div class="logo">VANTAGE-EDU</div><div class="subtitle">Academic & Examination Management</div></div>
        </div>
        <div class="info-grid">
          <div class="info-item"><label>Student Name</label><p>${targetProfile.full_name || targetProfile.username || 'N/A'}</p></div>
          <div class="info-item"><label>Roll Number</label><p>${targetProfile.roll_number || 'N/A'}</p></div>
          <div class="info-item"><label>Department</label><p>${targetProfile.department || 'N/A'}</p></div>
        </div>
        <table><thead><tr><th>Code</th><th>Subject</th><th>Date</th><th>Time</th><th>Room</th><th>Seat</th></tr></thead><tbody>${examRows}</tbody></table>
        <div class="qr-section">
          <img src="${qrUrl}" width="120" height="120" crossorigin="anonymous" />
          <div style="font-size:12px;font-weight:700;margin-top:10px">VANTAGE-EDU Digital Identity Verification</div>
        </div>
        <div class="seal">
          <div class="seal-item"><div class="seal-line"></div><div class="seal-label">Student Signature</div></div>
          ${coeApproved ? '<div class="seal-item" style="color:#10b981;font-weight:900;">✅ APPROVED BY COE</div>' : ''}
          <div class="seal-item"><div class="seal-line"></div><div class="seal-label">Controller of Examinations</div></div>
        </div>
        <div class="footer">Generated: ${new Date().toLocaleString()} | VANTAGE-EDU v1.0</div>
      </body></html>
    `;

        import('html2pdf.js').then((html2pdfModule) => {
            const html2pdf = html2pdfModule.default;
            const element = document.createElement('div');
            element.innerHTML = htmlContent;
            const opt = {
                margin: 10,
                filename: 'HallTicket_' + rollNumber + '.pdf',
                image: { type: 'jpeg' as const, quality: 0.98 },
                html2canvas: { scale: 2, useCORS: true },
                jsPDF: { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const }
            };
            html2pdf().set(opt).from(element).save();
        });
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="w-10 h-10 border-4 border-[#001b5e] border-t-transparent rounded-full animate-spin"></div>
            </div>
        )
    }

    const isAdmin = role === 'admin'
    const isCoe = role === 'coe'
    const isStudent = !isAdmin && !isCoe

    const isStudentScopePublished = publications.some(p => {
        return p.is_coe_approved && (!p.department || p.department === profile?.department) &&
            (!p.year_of_study || p.year_of_study === profile?.year_of_study)
    })

    const canDownload = (isStudentScopePublished || !isStudent) && published && coeApproved && exams.length > 0 && (selectedStudent || profile)
    const activeStudent = selectedStudent || profile
    const rollNumber = activeStudent?.roll_number || ''
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent('ROLL:' + rollNumber)}`

    const currentScopeExams = exams.filter(ex =>
        ex.department === publishScope.department &&
        ex.year_of_study === publishScope.year_of_study &&
        ex.semester === publishScope.semester
    )
    const isScopeReady = currentScopeExams.length > 0 && currentScopeExams.every(ex => ex.is_allocated)

    return (
        <div className="space-y-8 fade-in pb-20">
            <div className="flex justify-between items-end">
                <div className="space-y-1">
                    <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Exams Portal</p>
                    <h1 className="text-4xl font-black text-[#001b5e]">Hall Tickets</h1>
                </div>
                {canDownload && (
                    <button
                        onClick={handleDownload}
                        className="bg-[#001b5e] text-white px-8 py-3 rounded-2xl font-black shadow-xl flex items-center gap-2 hover:scale-105 transition-transform"
                    >
                        <Download className="w-4 h-4" /> Download ${selectedStudent ? 'Student' : 'Personal'} Ticket
                    </button>
                )}
            </div>

            {/* Admin Issue Section */}
            {isAdmin && (
                <div className="vantage-card p-6 border-blue-100 bg-blue-50/30">
                    <h3 className="font-black text-[#001b5e] mb-2 flex items-center gap-2">
                        <Send className="w-5 h-5" /> Admin: Request Issuance
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-slate-400">Department</label>
                            <select
                                value={publishScope.department}
                                onChange={e => setPublishScope({ ...publishScope, department: e.target.value })}
                                className="w-full bg-white border border-slate-200 rounded-xl p-3 font-bold text-sm"
                            >
                                {['CSE', 'ECE', 'MECH', 'IT'].map(d => <option key={d} value={d}>{d}</option>)}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-slate-400">Year</label>
                            <select
                                value={publishScope.year_of_study}
                                onChange={e => setPublishScope({ ...publishScope, year_of_study: parseInt(e.target.value) })}
                                className="w-full bg-white border border-slate-200 rounded-xl p-3 font-bold text-sm"
                            >
                                {[1, 2, 3, 4].map(y => <option key={y} value={y}>Year {y}</option>)}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-slate-400">Semester</label>
                            <select
                                value={publishScope.semester}
                                onChange={e => setPublishScope({ ...publishScope, semester: parseInt(e.target.value) })}
                                className="w-full bg-white border border-slate-200 rounded-xl p-3 font-bold text-sm"
                            >
                                {[1, 2, 3, 4, 5, 6, 7, 8].map(s => <option key={s} value={s}>Sem {s}</option>)}
                            </select>
                        </div>
                    </div>
                    <button
                        onClick={handlePublishRequest}
                        disabled={publishing || !isScopeReady}
                        className={`w-full py-4 rounded-2xl font-black transition-all ${isScopeReady ? 'bg-[#001b5e] text-white shadow-xl hover:scale-[1.02]' : 'bg-slate-100 text-slate-300 border border-slate-200 cursor-not-allowed'}`}
                    >
                        {publishing ? 'Sending Request...' : 'REQUEST COE TO ISSUE HALL TICKETS'}
                    </button>
                    {!isScopeReady && currentScopeExams.length > 0 && (
                        <p className="mt-3 text-[10px] font-bold text-rose-500 text-center uppercase tracking-widest">
                            ⚠️ Blocked: {currentScopeExams.filter(e => !e.is_allocated).length} courses missing seating allocation
                        </p>
                    )}
                </div>
            )}

            {/* COE View Section */}
            {isCoe && (
                <div className="space-y-12">
                    {/* View All Premium Button */}
                    <div className="mb-12">
                        <button
                            onClick={handleViewAll}
                            className="w-full bg-gradient-to-r from-[#001b5e] to-blue-800 text-white py-12 rounded-[2rem] font-black text-3xl shadow-[0_20px_50px_rgba(0,27,94,0.3)] flex items-center justify-center gap-6 hover:scale-[1.01] transition-all group"
                        >
                            <Users className="w-12 h-12 group-hover:rotate-6 transition-transform" /> VIEW ALL STUDENT HALL TICKETS
                        </button>
                        <p className="text-center text-slate-400 mt-6 font-black text-sm uppercase tracking-[0.3em]">VANTAGE-EDU: Central Quality Assurance Hub</p>
                    </div>

                    <div className="space-y-8">
                        <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest px-2 flex items-center gap-2">
                            <Clock className="w-4 h-4" /> CURRENTLY ISSUED SCOPES:
                        </h4>
                        {publications.length === 0 ? (
                            <div className="bg-slate-50/50 border-2 border-dashed border-slate-200 rounded-[3rem] p-24 text-center">
                                <Inbox className="w-20 h-20 text-slate-200 mx-auto mb-6" />
                                <p className="text-slate-400 font-black text-xl uppercase tracking-widest">No Pending Requests</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-8">
                                {publications.map((p, i) => (
                                    <div key={i} className="bg-white border-2 border-blue-100 rounded-[3rem] p-16 flex flex-col lg:flex-row items-center justify-between gap-12 group shadow-[0_15px_40px_rgba(0,0,0,0.03)] hover:shadow-2xl hover:border-blue-300 transition-all">
                                        <div className="space-y-6 text-center lg:text-left">
                                            <div className="space-y-2">
                                                <p className="text-sm font-black text-blue-500 uppercase tracking-widest">Requested by Admin</p>
                                                <h4 className="font-black text-[#001b5e] text-7xl tracking-tight">
                                                    {p.department} <span className="opacity-20 text-slate-400">/</span> YR {p.year_of_study} <span className="opacity-20 text-slate-400">/</span> SEM {p.semester}
                                                </h4>
                                            </div>
                                            <div className="flex flex-wrap justify-center lg:justify-start gap-4">
                                                <div className="bg-slate-50 px-6 py-2.5 rounded-2xl flex items-center gap-3">
                                                    <Calendar className="w-5 h-5 text-slate-400" />
                                                    <p className="text-xs font-black text-slate-600 uppercase tracking-wider">{new Date(p.published_at).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex flex-col sm:flex-row items-center gap-6 w-full lg:w-auto">
                                            {p.is_coe_approved ? (
                                                <div className="w-full sm:w-auto bg-emerald-100 text-emerald-800 px-10 py-5 rounded-3xl flex items-center justify-center gap-4 border-2 border-emerald-200">
                                                    <CheckCircle2 className="w-6 h-6" />
                                                    <span className="font-black text-lg uppercase tracking-tight">PUBLISHED</span>
                                                </div>
                                            ) : (
                                                <>
                                                    <button
                                                        onClick={() => {
                                                            const reason = prompt("Reason for Revoke/Reject:");
                                                            if (reason) handleReject(p.id, reason);
                                                        }}
                                                        className="w-full sm:w-auto bg-white border-2 border-rose-200 text-rose-600 px-10 py-5 rounded-3xl font-black text-sm hover:bg-rose-50 transition-all uppercase tracking-widest"
                                                    >
                                                        REVOKE
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            // Set filters to match this scope and show students
                                                            setPublishScope({
                                                                department: p.department,
                                                                year_of_study: p.year_of_study,
                                                                semester: p.semester
                                                            });
                                                            handleViewAll();
                                                        }}
                                                        className="w-full sm:w-auto bg-blue-50 text-[#001b5e] border-2 border-blue-100 px-10 py-5 rounded-3xl font-black text-sm hover:bg-blue-100 transition-all uppercase tracking-widest flex items-center gap-3"
                                                    >
                                                        <Eye className="w-5 h-5" /> VIEW TICKETS
                                                    </button>
                                                    <button
                                                        onClick={() => handleApprove(p.id)}
                                                        className="w-full sm:w-auto bg-emerald-600 text-white px-14 py-6 rounded-3xl font-black text-xl hover:bg-emerald-700 transition-all shadow-[0_15px_40px_rgba(16,185,129,0.4)] uppercase tracking-tight flex items-center gap-3"
                                                    >
                                                        <CheckCircle2 className="w-6 h-6" />
                                                        Approve & Publish to Students
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* View All Student List (COE only) */}
            {isCoe && viewAll && (
                <div className="space-y-6 animate-in fade-in zoom-in duration-500">
                    <div className="flex items-center justify-between border-b-2 border-slate-100 pb-4">
                        <h2 className="text-2xl font-black text-[#001b5e]">Student Directory</h2>
                        <button onClick={() => setViewAll(false)} className="text-slate-400 hover:text-rose-500"><X /></button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-h-[600px] overflow-y-auto pr-4 custom-scrollbar">
                        {allStudents.map((st, idx) => (
                            <div key={idx} className="bg-white p-6 rounded-[2rem] border-2 border-slate-50 flex items-center justify-between group hover:border-blue-200 hover:shadow-xl transition-all">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 bg-[#001b5e] text-white rounded-2xl flex items-center justify-center font-black text-xl shadow-lg shadow-blue-900/10">
                                        {st.full_name?.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="font-black text-lg text-slate-800">{st.full_name}</p>
                                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">{st.roll_number}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => { setSelectedStudent(st); fetchMyAllocations(st.id); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                                    className="bg-blue-50 text-blue-600 p-4 rounded-2xl hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                                >
                                    <Eye className="w-5 h-5" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Student Preview Section */}
            {isStudent && !isStudentScopePublished && (
                <div className="bg-slate-100/50 border-2 border-dashed border-slate-200 rounded-[3rem] p-24 text-center">
                    <Lock className="w-16 h-16 text-slate-200 mx-auto mb-6" />
                    <h3 className="text-xl font-black text-slate-400 uppercase tracking-widest">Hall Ticket Not Yet Published</h3>
                    <p className="text-slate-400 font-bold mt-2">Your department and year's tickets are being verified by the COE.</p>
                </div>
            )}

            {/* Hall Ticket Card */}
            {(isStudentScopePublished || !isStudent) && activeStudent && (
                <div className="vantage-card overflow-hidden rounded-[2.5rem] border-0 shadow-2xl relative">
                    <div className="bg-[#001b5e] p-12 text-white relative overflow-hidden">
                        <div className="relative z-10">
                            <h2 className="text-4xl font-black tracking-tighter mb-2">VANTAGE-EDU</h2>
                            <p className="text-blue-300 text-sm font-black uppercase tracking-[0.4em]">Official Hall Ticket <span className="text-white/40 font-light mx-2">|</span> 2025-26 ACADEMIC SESSION</p>
                        </div>
                        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-400/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
                    </div>

                    <div className="p-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 bg-white">
                        <div className="space-y-1">
                            <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">Student Full Name</p>
                            <p className="text-2xl font-black text-[#001b5e]">{activeStudent.full_name}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">Roll Identification</p>
                            <p className="text-2xl font-black text-[#001b5e] tracking-tight">{activeStudent.roll_number}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">Faculty/Dept</p>
                            <p className="text-2xl font-black text-[#001b5e]">{activeStudent.department}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">Academic Year</p>
                            <p className="text-2xl font-black text-[#001b5e]">Year {activeStudent.year_of_study}</p>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="bg-slate-50 border-y border-slate-100">
                                    <th className="px-10 py-6 text-left font-black text-[#001b5e] uppercase tracking-widest text-xs">Course Code</th>
                                    <th className="px-10 py-6 text-left font-black text-[#001b5e] uppercase tracking-widest text-xs">Subject Description</th>
                                    <th className="px-10 py-6 text-left font-black text-[#001b5e] uppercase tracking-widest text-xs">Exam Date</th>
                                    <th className="px-10 py-6 text-left font-black text-[#001b5e] uppercase tracking-widest text-xs">Assigned Room</th>
                                    <th className="px-10 py-6 text-left font-black text-[#001b5e] uppercase tracking-widest text-xs">Seat No.</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {exams.map((exam, i) => {
                                    const alloc = myAllocations.find(a => a.exam_id === exam.id)
                                    return (
                                        <tr key={i} className="hover:bg-blue-50/30 transition-colors group">
                                            <td className="px-10 py-8 font-black text-[#001b5e] text-lg">{exam.course_code}</td>
                                            <td className="px-10 py-8 font-bold text-slate-800 text-lg">{exam.course_name}</td>
                                            <td className="px-10 py-8 font-black text-slate-500">{exam.exam_date}</td>
                                            <td className="px-10 py-8">
                                                <span className="bg-blue-50 text-[#001b5e] px-4 py-2 rounded-xl font-black text-sm border border-blue-100">
                                                    {alloc?.room_name || exam.room || 'TBD'}
                                                </span>
                                            </td>
                                            <td className="px-10 py-8 font-black text-3xl text-[#001b5e] tracking-tighter">
                                                {alloc?.seat_number || '—'}
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>

                    <div className="p-12 flex flex-col md:flex-row items-center justify-between gap-12 bg-slate-50/50">
                        <div className="flex items-center gap-8">
                            <div className="p-4 bg-white rounded-3xl shadow-xl border border-slate-100">
                                <img src={qrUrl} alt="VANTAGE-EDU IDENTITY" width={140} height={140} />
                            </div>
                            <div className="space-y-2">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Identity Verified</p>
                                <p className="text-xs font-bold text-slate-500 max-w-[200px] leading-relaxed">
                                    This QR code validates the student's identity via the VANTAGE-EDU central secure database.
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-12">
                            <div className="text-center space-y-4">
                                <div className="w-48 h-12 border-b-2 border-slate-200"></div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Student Signature</p>
                            </div>
                            <div className="text-center space-y-4">
                                <div className="w-48 h-12 flex items-center justify-center">
                                    {coeApproved && <CheckCircle2 className="w-8 h-8 text-emerald-500" />}
                                </div>
                                <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">COE Certified</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <SeatingPopup
                isOpen={popupState.isOpen}
                onClose={() => setPopupState({ ...popupState, isOpen: false })}
                examId={popupState.examId}
                courseName={popupState.courseName}
            />
        </div>
    )
}
