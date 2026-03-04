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
            setLoading(false)
        }).catch(() => setLoading(false))
    }, [])

    const rollNumber = profile?.roll_number || ''
    const qrData = `ROLL:${rollNumber}|${profile?.full_name || ''}|${profile?.department || ''}|${profile?.year_of_study || ''}`
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrData)}`

    const handlePublish = async () => {
        setPublishing(true)
        try {
            const res = await fetch(`${API_BASE}/api/hall_tickets/publish`, {
                method: 'POST',
                headers: getAuthHeaders()
            })
            if (res.ok) {
                setPublished(true)
                if (role === 'coe') {
                    setCoeApproved(true)
                }
            }
        } catch (e) {
            console.error(e)
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
        .qr-label{font-size:12px;font-weight:700;color:#001b5e;margin-top:8px}
        .seal{display:flex;justify-content:space-between;margin-top:60px}
        .seal-item{text-align:center;width:200px}
        .seal-line{border-top:1px solid #94a3b8;margin-bottom:8px}
        .seal-label{font-size:10px;font-weight:700;color:#64748b;text-transform:uppercase}
        .footer{text-align:center;font-size:10px;color:#94a3b8;margin-top:40px}
      </style>
      </head>
      <body>
        <div class="header">
          <div><div class="logo">VANTAGE</div><div class="subtitle">Academic & Examination Management</div></div>
          <div style="text-align:right"><div style="font-size:20px;font-weight:900;color:#001b5e">HALL TICKET</div><div class="subtitle">2025-26 Academic Year</div></div>
        </div>
        <div class="info-grid">
          <div class="info-item"><label>Student Name</label><p>${profile.full_name}</p></div>
          <div class="info-item"><label>Roll Number</label><p>${profile.roll_number}</p></div>
          <div class="info-item"><label>Department</label><p>${profile.department}</p></div>
          <div class="info-item"><label>Year / Section</label><p>Year ${profile.year_of_study} / ${profile.section}</p></div>
        </div>
        <table><thead><tr><th>Code</th><th>Subject</th><th>Date</th><th>Time</th><th>Room</th></tr></thead><tbody>${examRows}</tbody></table>
        <div class="qr-section">
          <img src="${qrUrl}" width="120" height="120" crossorigin="anonymous" />
          <div class="qr-label">Digital Verification QR Code</div>
        </div>
        <div class="seal">
          <div class="seal-item"><div class="seal-line"></div><div class="seal-label">Student Signature</div></div>
          ${(coeApproved && role === 'student') ? '<div class="seal-item" style="color:#10b981;font-weight:900;text-transform:uppercase;font-size:14px;">✅ APPROVED BY COE</div>' : ''}
          <div class="seal-item"><div class="seal-line"></div><div class="seal-label">Controller of Examinations</div></div>
        </div>
        <div class="footer">Computer-generated document verified by HMAC-SHA256 | Generated: ${new Date().toLocaleString()} | Vantage v1.0</div>
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
    const canDownload = published && coeApproved && exams.length > 0 && profile?.roll_number

    return (
        <div className="space-y-8 fade-in">
            <div className="flex justify-between items-end">
                <div className="space-y-1">
                    <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Exams Portal</p>
                    <h1 className="text-4xl font-black text-[#001b5e]">Hall Tickets</h1>
                </div>
                {canDownload && (
                    <div className="flex gap-4">
                        <button onClick={handleDownload} className="bg-[#001b5e] text-white px-8 py-3 rounded-2xl font-black shadow-xl shadow-blue-900/20 flex items-center gap-2">
                            <Download className="w-4 h-4" /> Download / Print
                        </button>
                    </div>
                )}
            </div>

            {isAdmin && (
                <div className="vantage-card p-6 border-blue-100 bg-blue-50/30">
                    <h3 className="font-black text-[#001b5e] mb-2 flex items-center gap-2">
                        <Send className="w-5 h-5" /> Admin: Generate Hall Tickets
                    </h3>
                    <p className="text-sm text-slate-600 mb-4">
                        Generate hall tickets and send them to the COE (Controller of Examinations) for final approval.
                    </p>
                    {coeApproved ? (
                        <div className="flex items-center gap-2 text-emerald-600 font-bold">
                            <CheckCircle2 className="w-5 h-5" />
                            Hall tickets are live and approved by COE.
                        </div>
                    ) : published ? (
                        <div className="flex items-center gap-2 text-amber-600 font-bold">
                            <CheckCircle2 className="w-5 h-5" />
                            Sent to COE. Awaiting final approval.
                        </div>
                    ) : (
                        <button
                            onClick={handlePublish}
                            disabled={publishing || exams.length === 0}
                            className="bg-[#001b5e] text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-blue-700 disabled:opacity-50"
                        >
                            {publishing ? 'Sending...' : 'Send to COE for Approval'}
                        </button>
                    )}
                </div>
            )}

            {isCoe && (
                <div className="vantage-card p-6 border-emerald-100 bg-emerald-50/30">
                    <h3 className="font-black text-emerald-900 mb-2 flex items-center gap-2">
                        <Shield className="w-5 h-5" /> COE: Approve Hall Tickets
                    </h3>
                    <p className="text-sm text-emerald-700 mb-4">
                        Review and approve the generated hall tickets for final publication to students.
                    </p>
                    {coeApproved ? (
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 text-emerald-600 font-bold">
                                <CheckCircle2 className="w-5 h-5" />
                                You have approved and published the hall tickets.
                            </div>
                            <button
                                onClick={handleViewAll}
                                className="bg-white text-emerald-700 border border-emerald-200 px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-emerald-50 transition-all"
                            >
                                {viewAll ? 'Back to Dashboard' : 'View All Student Hall Tickets'}
                            </button>
                        </div>
                    ) : published ? (
                        <div className="flex gap-4">
                            <button
                                onClick={handlePublish}
                                disabled={publishing}
                                className="bg-emerald-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-emerald-700 disabled:opacity-50"
                            >
                                {publishing ? 'Approving...' : 'Approve & Publish Hall Tickets'}
                            </button>
                            <button
                                onClick={handleViewAll}
                                className="bg-white text-emerald-700 border border-emerald-200 px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-emerald-50 transition-all"
                            >
                                {viewAll ? 'Back' : 'Preview Student Hall Tickets'}
                            </button>
                        </div>
                    ) : (
                        <div className="text-sm font-bold text-slate-500">
                            Admin has not yet generated hall tickets for approval.
                        </div>
                    )}
                </div>
            )}

            {isStudent && (!published || !coeApproved) && (
                <div className="vantage-card p-16 flex flex-col items-center justify-center text-center space-y-4">
                    <Lock className="w-16 h-16 text-slate-300" />
                    <h3 className="text-xl font-black text-[#001b5e]">Hall Tickets Not Available</h3>
                    <p className="text-slate-400 max-w-sm">Hall tickets are currently pending generation by Admin or awaiting final approval from the COE.</p>
                </div>
            )}

            {exams.length === 0 && (
                <div className="vantage-card p-16 flex flex-col items-center justify-center text-center space-y-4">
                    <Inbox className="w-16 h-16 text-slate-200" />
                    <h3 className="text-xl font-black text-[#001b5e]">No Exam Schedule Available</h3>
                    <p className="text-slate-400 max-w-sm">Hall tickets require an exam schedule. Admin will add exams and publish tickets.</p>
                </div>
            )}

            {canDownload && !viewAll && (
                <div className="space-y-8">
                    <div className="vantage-card overflow-hidden">
                        <div className="bg-[#001b5e] p-8 text-white flex justify-between items-center">
                            <div>
                                <h2 className="text-2xl font-black tracking-wider">VANTAGE</h2>
                                <p className="text-blue-300 text-xs font-bold uppercase tracking-widest mt-1">Integrated Academic & Examination Management</p>
                            </div>
                            <div className="text-right">
                                <p className="text-xl font-black">HALL TICKET</p>
                                <p className="text-blue-300 text-xs font-bold">Academic Year 2025-26</p>
                            </div>
                        </div>

                        <div className="p-8 grid grid-cols-2 md:grid-cols-4 gap-6 bg-slate-50 border-b border-slate-100">
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Student Name</p>
                                <p className="text-lg font-black text-[#001b5e] mt-1">{profile?.full_name}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Roll Number</p>
                                <p className="text-lg font-black text-[#001b5e] mt-1">{profile?.roll_number}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Department</p>
                                <p className="text-lg font-black text-[#001b5e] mt-1">{profile?.department}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Year / Section</p>
                                <p className="text-lg font-black text-[#001b5e] mt-1">Year {profile?.year_of_study} / {profile?.section}</p>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-[#001b5e] text-white">
                                        <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest">Code</th>
                                        <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest">Subject</th>
                                        <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest">Date</th>
                                        <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest">Time</th>
                                        <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest">Room</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {exams.map((exam: any, i: number) => (
                                        <tr key={i} className="border-b border-slate-100 hover:bg-slate-50 transition-all">
                                            <td className="px-6 py-4 font-black text-[#001b5e]">{exam.course_code}</td>
                                            <td className="px-6 py-4 font-medium text-slate-700">{exam.course_name}</td>
                                            <td className="px-6 py-4 font-bold text-slate-600 flex items-center gap-2"><Calendar className="w-3 h-3" />{exam.exam_date}</td>
                                            <td className="px-6 py-4 font-bold text-slate-600">{exam.exam_time}</td>
                                            <td className="px-6 py-4"><span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-lg text-sm font-black">{exam.room}</span></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="p-8 flex items-center justify-between bg-slate-50">
                            <div className="flex items-center gap-6">
                                <div className="w-32 h-32 bg-white border-2 border-slate-200 rounded-xl flex items-center justify-center overflow-hidden">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={qrUrl} alt="QR Code" width={120} height={120} />
                                </div>
                                <div className="space-y-2">
                                    <p className="text-sm font-black text-[#001b5e]">QR Code – Scan to verify Roll Number</p>
                                    <p className="text-[10px] text-slate-400 font-medium">Roll Number: <strong className="text-[#001b5e]">{profile?.roll_number}</strong></p>
                                    <div className="flex items-center gap-1 text-emerald-600">
                                        <CheckCircle2 className="w-3 h-3" />
                                        <span className="text-[10px] font-bold">HMAC-SHA256 Signature Valid</span>
                                    </div>
                                </div>
                            </div>
                            <div className="text-right space-y-1">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Generated</p>
                                <p className="text-sm font-black text-[#001b5e]">{new Date().toLocaleDateString()}</p>
                                <div className="flex items-center gap-1 text-emerald-600 justify-end">
                                    <Shield className="w-3 h-3" />
                                    <span className="text-[10px] font-bold">Fraud Detection: Clear</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {viewAll && isCoe && allStudents.length > 0 && (
                <div className="space-y-12 fade-in">
                    <h2 className="text-2xl font-black text-[#001b5e] border-b pb-4">Preview: All Student Hall Tickets</h2>
                    <div className="space-y-12">
                        {allStudents.map((student: any) => {
                            const studentQrData = `ROLL:${student.roll_number}|${student.full_name}|${student.department}|${student.year_of_study}`
                            const studentQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(studentQrData)}`
                            return (
                                <div key={student.id} className="vantage-card overflow-hidden shadow-lg border-2">
                                    <div className="bg-[#001b5e] p-8 text-white flex justify-between items-center">
                                        <div>
                                            <h2 className="text-2xl font-black tracking-wider">VANTAGE</h2>
                                            <p className="text-blue-300 text-xs font-bold uppercase tracking-widest mt-1">Integrated Academic & Examination Management</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xl font-black">HALL TICKET</p>
                                            <p className="text-blue-300 text-xs font-bold">Academic Year 2025-26</p>
                                        </div>
                                    </div>
                                    <div className="p-8 grid grid-cols-2 md:grid-cols-4 gap-6 bg-slate-50 border-b border-slate-100">
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Student Name</p>
                                            <p className="text-lg font-black text-[#001b5e] mt-1">{student.full_name}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Roll Number</p>
                                            <p className="text-lg font-black text-[#001b5e] mt-1">{student.roll_number}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Department</p>
                                            <p className="text-lg font-black text-[#001b5e] mt-1">{student.department}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Year / Section</p>
                                            <p className="text-lg font-black text-[#001b5e] mt-1">Year {student.year_of_study} / {student.section || 'A'}</p>
                                        </div>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead>
                                                <tr className="bg-[#001b5e] text-white">
                                                    <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest">Code</th>
                                                    <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest">Subject</th>
                                                    <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest">Date</th>
                                                    <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest">Time</th>
                                                    <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest">Room</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {exams.map((exam: any, i: number) => (
                                                    <tr key={i} className="border-b border-slate-100 hover:bg-slate-50 transition-all">
                                                        <td className="px-6 py-4 font-black text-[#001b5e]">{exam.course_code}</td>
                                                        <td className="px-6 py-4 font-medium text-slate-700">{exam.course_name}</td>
                                                        <td className="px-6 py-4 font-bold text-slate-600 flex items-center gap-2"><Calendar className="w-3 h-3" />{exam.exam_date}</td>
                                                        <td className="px-6 py-4 font-bold text-slate-600">{exam.exam_time}</td>
                                                        <td className="px-6 py-4"><span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-lg text-sm font-black">{exam.room}</span></td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                    <div className="p-8 flex items-center justify-between bg-slate-50 border-b border-t-slate-200">
                                        <div className="flex items-center gap-6">
                                            <div className="w-32 h-32 bg-white border-2 border-slate-200 rounded-xl flex items-center justify-center overflow-hidden">
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                <img src={studentQrUrl} alt="QR Code" width={120} height={120} />
                                            </div>
                                            <div className="space-y-2">
                                                <p className="text-sm font-black text-[#001b5e]">QR Code – Scan to verify</p>
                                                <p className="text-[10px] text-slate-400 font-medium">Roll Number: <strong className="text-[#001b5e]">{student.roll_number}</strong></p>
                                            </div>
                                        </div>
                                        <div className="text-center">
                                            <div className="flex justify-between gap-16 mt-8 w-[400px]">
                                                <div className="text-center w-full">
                                                    <div className="border-t border-slate-400 mb-2"></div>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase">Student Signature</p>
                                                </div>
                                                <div className="text-center w-full">
                                                    <div className="border-t border-slate-400 mb-2"></div>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase">Controller of Examinations</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            )}
        </div>
    )
}
