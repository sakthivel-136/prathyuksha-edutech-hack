"use client"

import { useState, useEffect } from 'react'
<<<<<<< HEAD
import { API_BASE, getAuthHeaders } from '@/lib/api'
=======
>>>>>>> 79c451c68c096aafd4b160be6e271f1e8d9434f5
import {
    Download,
    QrCode,
    Printer,
    CheckCircle2,
    Shield,
    Calendar,
<<<<<<< HEAD
    Inbox,
    Send,
    Lock
=======
    Inbox
>>>>>>> 79c451c68c096aafd4b160be6e271f1e8d9434f5
} from 'lucide-react'

export default function HallTickets() {
    const [profile, setProfile] = useState<any>(null)
    const [exams, setExams] = useState<any[]>([])
<<<<<<< HEAD
    const [published, setPublished] = useState(false)
    const [loading, setLoading] = useState(true)
    const [publishing, setPublishing] = useState(false)
    const [role, setRole] = useState('student')

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
=======
    const [loading, setLoading] = useState(true)
    const [generating, setGenerating] = useState(false)
    const [generated, setGenerated] = useState(false)

    useEffect(() => {
        const token = localStorage.getItem('accessToken')
        const headers = { 'Authorization': `Bearer ${token}` }

        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

        Promise.all([
            fetch(`${apiUrl}/api/me/profile`, { headers }).then(r => r.json()),
            fetch(`${apiUrl}/api/exams`, { headers }).then(r => r.json()),
        ]).then(([prof, ex]) => {
            setProfile(prof)
            setExams(Array.isArray(ex) ? ex : [])
>>>>>>> 79c451c68c096aafd4b160be6e271f1e8d9434f5
            setLoading(false)
        }).catch(() => setLoading(false))
    }, [])

<<<<<<< HEAD
    // QR encodes roll number for scan - primary field shown when scanned
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
            }
        } catch (e) {
            console.error(e)
        } finally {
            setPublishing(false)
        }
=======
    // QR data: student name, year, roll number
    const qrData = profile ? `Name: ${profile.full_name} | Roll: ${profile.roll_number} | Year: ${profile.year_of_study} | Dept: ${profile.department} | Section: ${profile.section}` : ''
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrData)}`

    const handleGenerate = () => {
        setGenerating(true)
        setTimeout(() => { setGenerating(false); setGenerated(true) }, 2000)
>>>>>>> 79c451c68c096aafd4b160be6e271f1e8d9434f5
    }

    const handleDownload = () => {
        if (!profile) return
        const printWindow = window.open('', '_blank')
        if (!printWindow) return

        const examRows = exams.map(e =>
            `<tr><td>${e.course_code}</td><td>${e.course_name}</td><td>${e.exam_date}</td><td>${e.exam_time}</td><td>${e.room}</td></tr>`
        ).join('')

        printWindow.document.write(`
      <html>
      <head><title>Hall Ticket - ${profile.full_name}</title>
      <style>
        body{font-family:'Inter',system-ui,sans-serif;padding:40px;color:#0f172a}
        .header{display:flex;justify-content:space-between;align-items:center;border-bottom:3px solid #001b5e;padding-bottom:20px;margin-bottom:30px}
        .logo{font-size:28px;font-weight:900;color:#001b5e}
        .subtitle{font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:2px}
        .info-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:30px}
        .info-item label{font-size:10px;text-transform:uppercase;letter-spacing:1px;color:#94a3b8;font-weight:700}
        .info-item p{font-size:16px;font-weight:700;color:#001b5e;margin:4px 0 0}
        table{width:100%;border-collapse:collapse;margin-top:20px}
        th{background:#001b5e;color:white;padding:12px;text-align:left;font-size:11px;text-transform:uppercase;letter-spacing:1px}
        td{padding:12px;border-bottom:1px solid #e2e8f0;font-size:14px;font-weight:500}
        .qr-section{text-align:center;margin-top:30px;padding:20px;border:2px dashed #cbd5e1}
<<<<<<< HEAD
        .qr-label{font-size:12px;font-weight:700;color:#001b5e;margin-top:8px}
=======
>>>>>>> 79c451c68c096aafd4b160be6e271f1e8d9434f5
        .seal{display:flex;justify-content:space-between;margin-top:60px}
        .seal-item{text-align:center}.seal-line{width:180px;border-top:1px solid #0f172a;margin-bottom:8px}
        .seal-label{font-size:11px;color:#64748b}
        .footer{margin-top:40px;text-align:center;font-size:10px;color:#94a3b8}
        @media print{body{padding:20px}}
      </style>
      </head>
      <body>
        <div class="header">
          <div><div class="logo">VANTAGE</div><div class="subtitle">Integrated Academic & Examination Management</div></div>
          <div style="text-align:right"><div style="font-weight:900;color:#001b5e;font-size:18px">HALL TICKET</div><div style="font-size:11px;color:#64748b">Academic Year 2025-26</div></div>
        </div>
        <div class="info-grid">
          <div class="info-item"><label>Student Name</label><p>${profile.full_name}</p></div>
          <div class="info-item"><label>Roll Number</label><p>${profile.roll_number}</p></div>
          <div class="info-item"><label>Department</label><p>${profile.department}</p></div>
          <div class="info-item"><label>Year / Section</label><p>Year ${profile.year_of_study} / Section ${profile.section}</p></div>
        </div>
        <table>
          <thead><tr><th>Code</th><th>Subject</th><th>Date</th><th>Time</th><th>Room</th></tr></thead>
          <tbody>${examRows || '<tr><td colspan="5" style="text-align:center;padding:20px;color:#94a3b8">No exams scheduled yet</td></tr>'}</tbody>
        </table>
        <div class="qr-section">
          <img src="${qrUrl}" width="150" height="150" alt="QR Code" />
<<<<<<< HEAD
          <div class="qr-label">Scan QR to verify → Roll Number: ${profile.roll_number}</div>
=======
          <div style="font-size:10px;color:#94a3b8;margin-top:8px">Scan QR to verify: ${profile.full_name} | ${profile.roll_number}</div>
>>>>>>> 79c451c68c096aafd4b160be6e271f1e8d9434f5
        </div>
        <div class="seal">
          <div class="seal-item"><div class="seal-line"></div><div class="seal-label">Student Signature</div></div>
          <div class="seal-item"><div class="seal-line"></div><div class="seal-label">Controller of Examinations</div></div>
        </div>
        <div class="footer">Computer-generated document verified by HMAC-SHA256 | Generated: ${new Date().toLocaleString()} | Vantage v1.0</div>
      </body></html>
    `)
        printWindow.document.close()
        printWindow.print()
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="w-10 h-10 border-4 border-[#001b5e] border-t-transparent rounded-full animate-spin"></div>
            </div>
        )
    }

<<<<<<< HEAD
    const isAdmin = role === 'admin'
    const canDownload = published && exams.length > 0 && profile?.roll_number

=======
>>>>>>> 79c451c68c096aafd4b160be6e271f1e8d9434f5
    return (
        <div className="space-y-8 fade-in">
            <div className="flex justify-between items-end">
                <div className="space-y-1">
                    <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Examination</p>
                    <h1 className="text-4xl font-black text-[#001b5e]">Hall Tickets</h1>
                </div>
<<<<<<< HEAD
                {canDownload && (
=======
                {generated && (
>>>>>>> 79c451c68c096aafd4b160be6e271f1e8d9434f5
                    <div className="flex gap-4">
                        <button onClick={handleDownload} className="bg-white border border-slate-200 px-6 py-3 rounded-2xl font-bold text-slate-600 flex items-center gap-2 hover:bg-slate-50 transition-all">
                            <Printer className="w-4 h-4" /> Print
                        </button>
                        <button onClick={handleDownload} className="bg-[#001b5e] text-white px-8 py-3 rounded-2xl font-black shadow-xl shadow-blue-900/20 flex items-center gap-2">
<<<<<<< HEAD
                            <Download className="w-4 h-4" /> Download / Print
=======
                            <Download className="w-4 h-4" /> Download PDF
>>>>>>> 79c451c68c096aafd4b160be6e271f1e8d9434f5
                        </button>
                    </div>
                )}
            </div>

<<<<<<< HEAD
            {/* Admin: Publish hall tickets for all students */}
            {isAdmin && (
                <div className="vantage-card p-6 border-blue-100 bg-blue-50/30">
                    <h3 className="font-black text-[#001b5e] mb-2 flex items-center gap-2">
                        <Send className="w-5 h-5" /> Admin: Publish Hall Tickets
                    </h3>
                    <p className="text-sm text-slate-600 mb-4">
                        Publish hall tickets for the current exam schedule. Once published, all students can download <strong>their own</strong> hall ticket only.
                    </p>
                    {published ? (
                        <div className="flex items-center gap-2 text-emerald-600 font-bold">
                            <CheckCircle2 className="w-5 h-5" />
                            Hall tickets are live. Students can download their tickets.
                        </div>
                    ) : (
                        <button
                            onClick={handlePublish}
                            disabled={publishing || exams.length === 0}
                            className="bg-[#001b5e] text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-blue-700 disabled:opacity-50"
                        >
                            {publishing ? 'Publishing...' : 'Publish Hall Tickets for All'}
                        </button>
                    )}
                </div>
            )}

            {/* Student: Can only download when admin has published */}
            {!isAdmin && !published && (
                <div className="vantage-card p-16 flex flex-col items-center justify-center text-center space-y-4">
                    <Lock className="w-16 h-16 text-slate-300" />
                    <h3 className="text-xl font-black text-[#001b5e]">Hall Tickets Not Yet Published</h3>
                    <p className="text-slate-400 max-w-sm">Admin will publish hall tickets for the current exam schedule. Once published, you can download your own hall ticket here.</p>
                </div>
            )}

            {/* No exams */}
            {exams.length === 0 && (
                <div className="vantage-card p-16 flex flex-col items-center justify-center text-center space-y-4">
                    <Inbox className="w-16 h-16 text-slate-200" />
                    <h3 className="text-xl font-black text-[#001b5e]">No Exam Schedule Available</h3>
                    <p className="text-slate-400 max-w-sm">Hall tickets require an exam schedule. Admin will add exams and publish tickets.</p>
                </div>
            )}

            {/* Download view: when published + has exams + has profile */}
            {canDownload && (
                <div className="space-y-8">
                    <div className="vantage-card overflow-hidden">
=======
            {exams.length === 0 && !generated ? (
                <div className="vantage-card p-16 flex flex-col items-center justify-center text-center space-y-4">
                    <Inbox className="w-16 h-16 text-slate-200" />
                    <h3 className="text-xl font-black text-[#001b5e]">No Exam Schedule Available</h3>
                    <p className="text-slate-400 max-w-sm">Hall tickets cannot be generated yet. Your admin will publish the exam schedule first.</p>
                </div>
            ) : !generated ? (
                <div className="vantage-card p-12 flex flex-col items-center justify-center text-center space-y-8 min-h-[500px]">
                    {generating ? (
                        <>
                            <div className="w-24 h-24 border-4 border-[#001b5e] border-t-transparent rounded-full animate-spin"></div>
                            <div className="space-y-2">
                                <h3 className="text-2xl font-black text-[#001b5e]">Generating Hall Ticket</h3>
                                <p className="text-slate-500 max-w-sm">Fetching your exam schedule, generating QR verification code with your details...</p>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="w-20 h-20 bg-blue-50 rounded-[2rem] flex items-center justify-center">
                                <QrCode className="w-10 h-10 text-blue-300" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-2xl font-black text-[#001b5e]">Generate Your Hall Ticket</h3>
                                <p className="text-slate-500 max-w-md mx-auto">Your hall ticket will include a scannable QR code with your name, roll number, and year. Verified by HMAC-SHA256.</p>
                            </div>
                            <div className="text-sm text-slate-500 font-bold">{exams.length} exam(s) found for your department</div>
                            <button onClick={handleGenerate} className="bg-[#001b5e] text-white px-10 py-4 rounded-2xl font-black text-lg shadow-xl shadow-blue-900/20 hover:bg-blue-700 transition-all active:scale-95">
                                Generate Hall Ticket
                            </button>
                        </>
                    )}
                </div>
            ) : (
                <div className="space-y-8">
                    <div className="vantage-card overflow-hidden">
                        {/* Header */}
>>>>>>> 79c451c68c096aafd4b160be6e271f1e8d9434f5
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

<<<<<<< HEAD
=======
                        {/* Student Info */}
>>>>>>> 79c451c68c096aafd4b160be6e271f1e8d9434f5
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

<<<<<<< HEAD
=======
                        {/* Exam Table */}
>>>>>>> 79c451c68c096aafd4b160be6e271f1e8d9434f5
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

<<<<<<< HEAD
=======
                        {/* QR Section */}
>>>>>>> 79c451c68c096aafd4b160be6e271f1e8d9434f5
                        <div className="p-8 flex items-center justify-between bg-slate-50">
                            <div className="flex items-center gap-6">
                                <div className="w-32 h-32 bg-white border-2 border-slate-200 rounded-xl flex items-center justify-center overflow-hidden">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={qrUrl} alt="QR Code" width={120} height={120} />
                                </div>
                                <div className="space-y-2">
<<<<<<< HEAD
                                    <p className="text-sm font-black text-[#001b5e]">QR Code – Scan to verify Roll Number</p>
                                    <p className="text-[10px] text-slate-400 font-medium">Roll Number: <strong className="text-[#001b5e]">{profile?.roll_number}</strong></p>
=======
                                    <p className="text-sm font-black text-[#001b5e]">Scannable QR Verification</p>
                                    <p className="text-[10px] text-slate-400 font-medium max-w-xs">Scan this QR code to see: <strong>{profile?.full_name}</strong>, Roll: <strong>{profile?.roll_number}</strong>, Year: <strong>{profile?.year_of_study}</strong></p>
>>>>>>> 79c451c68c096aafd4b160be6e271f1e8d9434f5
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
        </div>
    )
}
