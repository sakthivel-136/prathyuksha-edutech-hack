"use client"

import { useState, useEffect } from 'react'
import {
    Calendar,
    Printer,
    Download,
    Send,
    CheckCircle2,
    Lock,
    Inbox,
    Shield
} from 'lucide-react'
import { API_BASE, getAuthHeaders } from '@/lib/api'

export default function HallTickets() {
    const [profile, setProfile] = useState<any>(null)
    const [exams, setExams] = useState<any[]>([])
    const [published, setPublished] = useState(false)
    const [coeApproved, setCoeApproved] = useState(false)
    const [loading, setLoading] = useState(true)
    const [publishing, setPublishing] = useState(false)
    const [role, setRole] = useState('student')
    const [viewAll, setViewAll] = useState(false)
    const [allStudents, setAllStudents] = useState<any[]>([])
    const [publications, setPublications] = useState<any[]>([])
    const [publishScope, setPublishScope] = useState({ department: 'CSE', year_of_study: 1, semester: 1 })

    useEffect(() => {
        const headers = getAuthHeaders()
        setRole(localStorage.getItem('userRole') || 'student')
        Promise.all([
            fetch(`${API_BASE}/api/me/profile`, { headers }).then(r => r.json()),
            fetch(`${API_BASE}/api/exams`, { headers }).then(r => r.json()),
            fetch(`${API_BASE}/api/hall_tickets/status`, { headers }).then(r => r.json()),
        ]).then(([prof, ex, status]) => {
            setProfile(prof)
            setExams(Array.isArray(ex) ? ex : [])
            setPublished(status?.published ?? false)
            setCoeApproved(status?.coe_approved ?? false)
            setPublications(status?.publications || [])
            setLoading(false)
        }).catch(() => setLoading(false))
    }, [])

    const handlePublish = async () => {
        setPublishing(true)
        try {
            const res = await fetch(`${API_BASE}/api/hall_tickets/publish`, {
                method: 'POST',
                headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
                body: JSON.stringify(publishScope)
            })
            if (res.ok) {
                // Refresh status
                const statusRes = await fetch(`${API_BASE}/api/hall_tickets/status`, { headers: getAuthHeaders() })
                const status = await statusRes.json()
                setPublished(status?.published ?? false)
                setCoeApproved(status?.coe_approved ?? false)
                setPublications(status?.publications || [])
            }
        } catch (e) {
            console.error(e)
        } finally {
            setPublishing(false)
        }
    }

    const handleUnpublish = async () => {
        if (!confirm('Are you sure you want to revoke/reset all hall tickets? This will also clear seating results.')) return
        setPublishing(true)
        try {
            const res = await fetch(`${API_BASE}/api/hall_tickets/unpublish`, {
                method: 'POST',
                headers: getAuthHeaders()
            })
            if (res.ok) {
                alert("Hall tickets revoked and reset successfully.")
                setPublished(false)
                setCoeApproved(false)
                setPublications([])
            } else {
                const data = await res.json()
                alert(`Error: ${data.detail || 'Failed to unpublish'}`)
            }
        } catch (e) {
            alert("Connection error. Please try again.")
        } finally {
            setPublishing(false)
        }
    }

    const handleViewAll = async () => {
        if (!viewAll && allStudents.length === 0) {
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
        if (!profile) return

        const examRows = exams.map(e =>
            `<tr><td>${e.course_code}</td><td>${e.course_name}</td><td>${e.exam_date}</td><td>${e.exam_time}</td><td>${e.room}</td></tr>`
        ).join('')

        const rollNumber = profile?.roll_number || ''
        const qrData = `ROLL:${rollNumber}|${profile?.full_name || ''}|${profile?.department || ''}`
        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrData)}`

        const htmlContent = `
      <html>
      <head><title>Hall Ticket - ${profile.full_name}</title>
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
          <div><div class="logo">LUMINA</div><div class="subtitle">Academic & Examination Management</div></div>
        </div>
        <div class="info-grid">
          <div class="info-item"><label>Student Name</label><p>${profile.full_name}</p></div>
          <div class="info-item"><label>Roll Number</label><p>${profile.roll_number}</p></div>
          <div class="info-item"><label>Department</label><p>${profile.department}</p></div>
        </div>
        <table><thead><tr><th>Code</th><th>Subject</th><th>Date</th><th>Time</th><th>Room</th></tr></thead><tbody>${examRows}</tbody></table>
        <div class="qr-section">
          <img src="${qrUrl}" width="120" height="120" crossorigin="anonymous" />
          <div style="font-size:12px;font-weight:700;margin-top:10px">LUMINA Digital Identity Verification</div>
        </div>
        <div class="seal">
          <div class="seal-item"><div class="seal-line"></div><div class="seal-label">Student Signature</div></div>
          ${coeApproved ? '<div class="seal-item" style="color:#10b981;font-weight:900;">✅ APPROVED BY COE</div>' : ''}
          <div class="seal-item"><div class="seal-line"></div><div class="seal-label">Controller of Examinations</div></div>
        </div>
        <div class="footer">Generated: ${new Date().toLocaleString()} | Lumina v1.0</div>
      </body></html>
    `;

        import('html2pdf.js').then((html2pdfModule) => {
            const html2pdf = html2pdfModule.default;
            const element = document.createElement('div');
            element.innerHTML = htmlContent;
            const opt = {
                margin: 10,
                filename: 'HallTicket_' + profile.roll_number + '.pdf',
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

    // Check if student's specific scope is published
    const isStudentScopePublished = publications.some(p => {
        return (!p.department || p.department === profile?.department) &&
            (!p.year_of_study || p.year_of_study === profile?.year_of_study)
    })

    const canDownload = (isStudentScopePublished || !isStudent) && published && coeApproved && exams.length > 0 && profile?.roll_number
    const rollNumber = profile?.roll_number || ''
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent('ROLL:' + rollNumber)}`

    return (
        <div className="space-y-8 fade-in pb-20">
            <div className="flex justify-between items-end">
                <div className="space-y-1">
                    <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Exams Portal</p>
                    <h1 className="text-4xl font-black text-[#001b5e]">Hall Tickets</h1>
                </div>
                {canDownload && (
                    <button onClick={handleDownload} className="bg-[#001b5e] text-white px-8 py-3 rounded-2xl font-black shadow-xl flex items-center gap-2">
                        <Download className="w-4 h-4" /> Download / Print
                    </button>
                )}
            </div>

            {isAdmin && (
                <div className="lumina-card p-6 border-blue-100 bg-blue-50/30">
                    <h3 className="font-black text-[#001b5e] mb-2 flex items-center gap-2">
                        <Send className="w-5 h-5" /> Admin: Issue Hall Tickets by Scope
                    </h3>

                    <div className="space-y-4 mb-6">
                        <div className="flex flex-wrap gap-2 pt-2">
                            {['CSE', 'ECE', 'MECH', 'IT'].map(d => (
                                <button
                                    key={d}
                                    onClick={() => setPublishScope({ ...publishScope, department: d })}
                                    className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${publishScope.department === d ? 'bg-[#001b5e] text-white shadow-lg' : 'bg-white text-slate-400 border border-slate-100'}`}
                                >
                                    {d}
                                </button>
                            ))}
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {[1, 2, 3, 4].map(y => (
                                <button
                                    key={y}
                                    onClick={() => setPublishScope({ ...publishScope, year_of_study: y })}
                                    className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${publishScope.year_of_study === y ? 'bg-[#001b5e] text-white shadow-lg' : 'bg-white text-slate-400 border border-slate-100'}`}
                                >
                                    Year {y}
                                </button>
                            ))}
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                                <button
                                    key={s}
                                    onClick={() => setPublishScope({ ...publishScope, semester: s })}
                                    className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${publishScope.semester === s ? 'bg-[#001b5e] text-white shadow-lg' : 'bg-white text-slate-400 border border-slate-100'}`}
                                >
                                    Sem {s}
                                </button>
                            ))}
                        </div>
                        <button onClick={handlePublish} disabled={publishing} className="bg-[#001b5e] text-white px-8 py-3 rounded-2xl font-black shadow-xl w-full sm:w-auto mt-2">
                            {publishing ? 'Issuing...' : 'Issue Selected Scope'}
                        </button>
                    </div>

                    <div className="flex items-center justify-between mt-6">
                        <div className="space-y-2">
                            <h4 className="text-xs font-black text-slate-500 uppercase">Currently Issued Scopes:</h4>
                            {publications.length === 0 ? (
                                <p className="text-sm font-bold text-slate-400">None</p>
                            ) : (
                                <ul className="flex flex-wrap gap-2">
                                    {publications.map((p, i) => (
                                        <li key={i} className="bg-blue-100 text-blue-800 text-xs font-black px-3 py-1 rounded-full flex items-center gap-1">
                                            {p.department || 'ALL'}, Yr {p.year_of_study || 'ALL'}, Sem {p.semester || 'ALL'}
                                            {p.is_coe_approved ? ' ✅ (COE)' : ' ⏳ (Pending)'}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                        {published && (
                            <button onClick={handleUnpublish} disabled={publishing} className="text-rose-600 font-bold text-xs hover:bg-rose-50 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 border border-rose-100 disabled:opacity-50">
                                <Lock className="w-3 h-3" /> {publishing ? 'Processing...' : 'Revoke/Reset All'}
                            </button>
                        )}
                    </div>
                </div>
            )}

            {isCoe && (
                <div className="lumina-card p-6 border-emerald-100 bg-emerald-50/30">
                    <h3 className="font-black text-emerald-900 mb-2 flex items-center gap-2">
                        <Shield className="w-5 h-5" /> COE approval & Issuance
                    </h3>

                    <div className="space-y-4 mb-6">
                        <div className="flex flex-wrap gap-2 pt-2">
                            {['CSE', 'ECE', 'MECH', 'IT'].map(d => (
                                <button
                                    key={d}
                                    onClick={() => setPublishScope({ ...publishScope, department: d })}
                                    className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${publishScope.department === d ? 'bg-emerald-600 text-white shadow-lg' : 'bg-white text-slate-400 border border-emerald-100'}`}
                                >
                                    {d}
                                </button>
                            ))}
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {[1, 2, 3, 4].map(y => (
                                <button
                                    key={y}
                                    onClick={() => setPublishScope({ ...publishScope, year_of_study: y })}
                                    className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${publishScope.year_of_study === y ? 'bg-emerald-600 text-white shadow-lg' : 'bg-white text-slate-400 border border-emerald-100'}`}
                                >
                                    Year {y}
                                </button>
                            ))}
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                                <button
                                    key={s}
                                    onClick={() => setPublishScope({ ...publishScope, semester: s })}
                                    className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${publishScope.semester === s ? 'bg-emerald-600 text-white shadow-lg' : 'bg-white text-slate-400 border border-emerald-100'}`}
                                >
                                    Sem {s}
                                </button>
                            ))}
                        </div>
                        <button onClick={handlePublish} disabled={publishing} className="bg-emerald-600 shadow-lg shadow-emerald-200 text-white px-8 py-3 rounded-2xl font-black w-full sm:w-auto mt-2">
                            {publishing ? 'Issuing...' : 'Approve & Issue Scope'}
                        </button>
                    </div>

                    <div className="flex items-center justify-between mt-6">
                        <div className="space-y-2">
                            <h4 className="text-xs font-black text-slate-500 uppercase">Currently Issued Scopes:</h4>
                            {publications.length === 0 ? (
                                <p className="text-sm font-bold text-slate-400">None</p>
                            ) : (
                                <ul className="flex flex-col gap-2">
                                    {publications.map((p, i) => (
                                        <li key={i} className="bg-white border rounded-lg p-3 flex items-center justify-between group">
                                            <div>
                                                <p className="font-black text-[#001b5e] text-xs uppercase">
                                                    {p.department || 'ALL'}, Yr {p.year_of_study || 'ALL'}, Sem {p.semester || 'ALL'}
                                                </p>
                                                <p className="text-[10px] text-slate-400 font-bold">BY: {p.issued_by || p.published_by}</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {p.is_coe_approved ? (
                                                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2 py-1 rounded-full flex items-center gap-1">
                                                        <CheckCircle2 className="w-3 h-3" /> COE APPROVED
                                                    </span>
                                                ) : (
                                                    <button
                                                        onClick={async () => {
                                                            const res = await fetch(`${API_BASE}/api/hall_tickets/approve/${p.id}`, {
                                                                method: 'POST',
                                                                headers: getAuthHeaders()
                                                            })
                                                            if (res.ok) {
                                                                alert("Issued Successfully!");
                                                                window.location.reload();
                                                            }
                                                        }}
                                                        className="bg-emerald-600 text-white text-[10px] font-black px-3 py-1.5 rounded-lg hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-100"
                                                    >
                                                        Approve & Issue
                                                    </button>
                                                )}
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                        {published && (
                            <button onClick={handleUnpublish} disabled={publishing} className="text-rose-600 font-bold text-xs hover:bg-rose-50 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 border border-rose-100 disabled:opacity-50">
                                <Lock className="w-3 h-3" /> {publishing ? 'Processing...' : 'Revoke/Reset All'}
                            </button>
                        )}
                    </div>
                </div>
            )}

            {(isStudent && (!canDownload)) && (
                <div className="lumina-card p-16 text-center space-y-4">
                    <Lock className="w-16 h-16 text-slate-200 mx-auto" />
                    <h3 className="text-xl font-black text-[#001b5e]">Hall Tickets Not Available</h3>
                    <p className="text-slate-500 font-bold text-sm">Your department or year has not been published yet.</p>
                </div>
            )}

            {canDownload && (
                <div className="lumina-card overflow-hidden">
                    <div className="bg-[#001b5e] p-8 text-white">
                        <h2 className="text-2xl font-black">LUMINA</h2>
                        <p className="text-blue-300 text-xs font-bold uppercase tracking-widest">Hall Ticket 2025-26</p>
                    </div>
                    <div className="p-8 grid grid-cols-2 md:grid-cols-4 gap-6 bg-slate-50">
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase">Student Name</p>
                            <p className="text-lg font-black text-[#001b5e]">{profile?.full_name}</p>
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase">Roll Number</p>
                            <p className="text-lg font-black text-[#001b5e]">{profile?.roll_number}</p>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-slate-100">
                                    <th className="px-6 py-4 text-left font-black text-[#001b5e]">Code</th>
                                    <th className="px-6 py-4 text-left font-black text-[#001b5e]">Subject</th>
                                    <th className="px-6 py-4 text-left font-black text-[#001b5e]">Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {exams.map((exam: any, i: number) => {
                                    const isArrear = exam.semester < (profile?.year_of_study * 2 - 1) // Simple heuristic
                                    return (
                                        <tr key={i} className="border-b">
                                            <td className="px-6 py-4 font-black">
                                                {exam.course_code}
                                                {isArrear && <span className="ml-2 bg-amber-100 text-amber-700 text-[8px] px-1.5 py-0.5 rounded uppercase">Arrear</span>}
                                            </td>
                                            <td className="px-6 py-4">{exam.course_name}</td>
                                            <td className="px-6 py-4 font-bold">{exam.exam_date}</td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                    <div className="p-8 flex items-center justify-between">
                        <img src={qrUrl} alt="QR" width={100} height={100} />
                        <div className="text-right">
                            {coeApproved && <p className="text-emerald-600 font-black">✅ COE APPROVED</p>}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
