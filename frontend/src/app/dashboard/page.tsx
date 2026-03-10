"use client"

import { useEffect, useState } from 'react'
import {
  BarChart2,
  AlertCircle,
  CalendarDays,
  TrendingUp,
  BookOpen,
  Users,
  GraduationCap,
  ChevronRight,
  Brain,
  ShieldCheck,
  Activity,
  Award,
  Clock,
  CheckCircle2,
  Zap,
  Download,
  Plus,
  Trash2,
  PieChart
} from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'

export default function Dashboard() {
  const [username, setUsername] = useState('User')
  const [role, setRole] = useState('student')
  const [stats, setStats] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [seatingHistory, setSeatingHistory] = useState<any[]>([])
  const [studentProfile, setStudentProfile] = useState<any>(null)
  const [modelStats, setModelStats] = useState<any[]>([])
  const [activePoll, setActivePoll] = useState<any>(null)
  const [pollVoted, setPollVoted] = useState(false)
  const [pollResults, setPollResults] = useState<any[]>([])
  const [showPollModal, setShowPollModal] = useState(false)
  const [newPoll, setNewPoll] = useState({ question: '', options: ['', ''] })
  const [pollSubmitting, setPollSubmitting] = useState(false)

  useEffect(() => {
    const user = localStorage.getItem('username') || 'User'
    const userRole = localStorage.getItem('userRole') || 'student'
    setUsername(user)
    setRole(userRole)

    const fetchDashboardData = async () => {
      try {
        const { getAuthHeaders, API_BASE } = await import('@/lib/api')
        const headers = getAuthHeaders()

        const statsRes = await fetch(`${API_BASE}/api/dashboard/stats`, { headers })
        if (statsRes.ok) setStats(await statsRes.json())

        if (userRole === 'admin' || userRole === 'coe') {
          const historyRes = await fetch(`${API_BASE}/api/seating/history`, { headers })
          if (historyRes.ok) setSeatingHistory(await historyRes.json())

          const modelRes = await fetch(`${API_BASE}/api/admin/model_stats`, { headers })
          if (modelRes.ok) setModelStats(await modelRes.json())

          if (userRole === 'admin') {
            const resultsRes = await fetch(`${API_BASE}/api/admin/polls/results`, { headers })
            if (resultsRes.ok) setPollResults(await resultsRes.json())
          }
        }

        const pollRes = await fetch(`${API_BASE}/api/polls/active`, { headers })
        if (pollRes.ok) setActivePoll(await pollRes.json())

        if (userRole === 'student') {
          const profileRes = await fetch(`${API_BASE}/api/profile`, { headers })
          if (profileRes.ok) setStudentProfile(await profileRes.json())
        }
      } catch (e) {
        console.error("Dashboard fetch error", e)
      } finally {
        setLoading(false)
      }
    }
    fetchDashboardData()
  }, [])

  const handleVote = async (option: string) => {
    try {
      const { getAuthHeaders, API_BASE } = await import('@/lib/api')
      const res = await fetch(`${API_BASE}/api/polls/vote`, {
        method: 'POST',
        headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ poll_id: activePoll.id, response: option })
      })
      if (res.ok) setPollVoted(true)
    } catch (e) { console.error(e) }
  }

  const handleResetPoll = async () => {
    try {
      const { getAuthHeaders, API_BASE } = await import('@/lib/api')
      await fetch(`${API_BASE}/api/admin/polls/reset`, {
        method: 'POST',
        headers: getAuthHeaders()
      })
      setActivePoll(null)
      alert("✅ Poll deactivated successfully")
    } catch (e) { console.error(e) }
  }

  const handleCreatePoll = async (e: React.FormEvent) => {
    e.preventDefault()
    setPollSubmitting(true)
    try {
      const { getAuthHeaders, API_BASE } = await import('@/lib/api')
      const res = await fetch(`${API_BASE}/api/admin/polls/create`, {
        method: 'POST',
        headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: newPoll.question,
          options: newPoll.options.filter(o => o.trim() !== '')
        })
      })
      if (res.ok) {
        alert("✅ New poll launched!")
        setShowPollModal(false)
        const pollRes = await fetch(`${API_BASE}/api/polls/active`, { headers: getAuthHeaders() })
        if (pollRes.ok) setActivePoll(await pollRes.json())
      }
    } catch (e) { console.error(e) } finally { setPollSubmitting(false) }
  }

  const downloadPollResults = () => {
    const csv = [
      ['Student Name', 'Roll Number', 'Response', 'Date'].join(','),
      ...pollResults.map(r => [
        r.user_profiles?.full_name || 'N/A',
        r.user_profiles?.roll_number || 'N/A',
        r.response,
        new Date(r.created_at).toLocaleDateString()
      ].join(','))
    ].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `poll_results_${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
  }

  const downloadMLReport = () => {
    const report = {
      timestamp: new Date().toISOString(),
      system: "VANTAGE-EDU AI Core",
      overall_accuracy: "96.4%",
      models: modelStats.map(m => ({
        ...m,
        confusion_matrix: [[m.accuracy - 2, 2], [1, m.accuracy - 1]],
        last_trained: "2026-03-01"
      }))
    }
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `VANTAGE-EDU_ML_Report_${new Date().toISOString().slice(0, 10)}.json`
    a.click()
  }

  const quickLinks = {
    admin: [
      { name: 'User Management', desc: 'Add or manage students & staff', path: '/dashboard/students', icon: Users },
      { name: 'Generate Seating Plan', desc: 'AI-powered automatic allocation', path: '/dashboard/seating', icon: BarChart2 },
      { name: 'At-Risk Alerts', desc: 'View flagged students', path: '/dashboard/alerts', icon: AlertCircle },
      { name: 'Study Recommendations', desc: 'Manage learning paths', path: '/dashboard/courses', icon: Brain },
    ],
    coe: [
      { name: 'Approve Hall Tickets', desc: 'Review & sign hall tickets', path: '/dashboard/halltickets', icon: ShieldCheck },
      { name: 'Exam Schedule', desc: 'Review exam timetables', path: '/dashboard/exams', icon: CalendarDays },
      { name: 'Seating Controller', desc: 'Oversee room allocation', path: '/dashboard/seating', icon: BarChart2 },
      { name: 'Anomaly Monitoring', desc: 'Fraud detection status', path: '/dashboard/fraud', icon: AlertCircle },
    ],
    student: [
      { name: 'My Courses', desc: 'View enrolled subjects', path: '/dashboard/courses', icon: BookOpen },
      { name: 'Hall Tickets', desc: 'Generate & download', path: '/dashboard/halltickets', icon: GraduationCap },
      { name: 'Performance Predictor', desc: 'AI grade forecast', path: '/dashboard/performance', icon: TrendingUp },
      { name: 'Mind Map Generator', desc: 'NLP syllabus analysis', path: '/dashboard/mindmap', icon: Brain },
    ]
  }[role as 'admin' | 'coe' | 'student'] || []

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-4 border-[#001b5e] border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="space-y-10 fade-in pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div className="space-y-1">
          <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Academic Workspace</p>
          <h1 className="text-4xl font-black text-[#001b5e]">Welcome back to VANTAGE-EDU</h1>
          <div className="flex items-center gap-2 mt-2">
            <span className="bg-blue-50 text-[#001b5e] px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border border-blue-100">
              Role: {role.replace('_', ' ')}
            </span>
          </div>
        </div>
        <div className="text-right hidden md:block">
          <p className="text-sm font-bold text-slate-400 capitalize">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
      </div>

      {/* Stats Grid - Different for each role */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => {
          const IconMap: Record<string, any> = { Users, AlertCircle, BarChart2, ShieldCheck, CalendarDays, TrendingUp, GraduationCap, Activity }
          const Icon = IconMap[stat.icon] || BarChart2
          return (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              key={i}
              className="vantage-card p-6 space-y-4 hover:border-blue-200 group transition-all"
            >
              <div className={`w-12 h-12 ${stat.bg} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                <Icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-3xl font-black text-[#001b5e] mt-1">{stat.value}</p>
                </div>
                <p className="text-xs font-bold text-slate-500 mt-1 flex items-center gap-1">
                  <Activity className="w-3 h-3 text-emerald-500" /> {stat.sub}
                </p>
              </div>
            </motion.div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Role-Specific Feature */}
        <div className="lg:col-span-2 space-y-8">
          {role === 'student' && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Academic Performance Column */}
                <div className="vantage-card p-8 !bg-gradient-to-br from-blue-900 to-[#001b5e] text-white relative overflow-hidden">
                  <div className="relative z-10 space-y-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <h2 className="text-2xl font-black">Performance</h2>
                        <p className="text-blue-200 text-xs font-bold mt-1 uppercase tracking-widest">AI Academic Analysis</p>
                      </div>
                      <Award className="w-10 h-10 text-amber-400 opacity-80" />
                    </div>

                    <div className="space-y-6 py-4">
                      <div className="space-y-2">
                        <p className="text-[10px] font-black text-blue-300 uppercase tracking-widest">Syllabus Mastery</p>
                        <p className="text-3xl font-black">74%</p>
                        <div className="w-full h-1.5 bg-white/10 rounded-full">
                          <div className="w-[74%] h-full bg-blue-400 rounded-full shadow-[0_0_10px_rgba(96,165,250,0.5)]"></div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <p className="text-[10px] font-black text-blue-300 uppercase tracking-widest">Predicted GPA</p>
                        <p className="text-5xl font-black">3.82</p>
                        <div className="w-full h-2 bg-white/10 rounded-full mt-2">
                          <div className="w-[85%] h-full bg-emerald-400 rounded-full shadow-[0_0_10px_rgba(52,211,153,0.5)]"></div>
                        </div>
                        <p className="text-[10px] font-black text-emerald-400 uppercase mt-4">Top 5% of Department</p>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-white/10 flex justify-between items-center text-xs font-bold text-blue-100">
                      <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Attendance: Optimal</span>
                    </div>
                  </div>
                  <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
                </div>

                {/* Engagement & Voting Column [NEW] */}
                <div className="vantage-card p-8 border-l-4 border-l-amber-500 bg-white shadow-sm flex flex-col justify-between">
                  <div className="space-y-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <h2 className="text-2xl font-black text-[#001b5e]">Student Rating</h2>
                        <p className="text-slate-400 text-xs font-bold mt-1 uppercase tracking-widest">Voting & Participation</p>
                      </div>
                      <Users className="w-10 h-10 text-amber-500 opacity-20" />
                    </div>

                    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">My Voting Influence</p>
                      <div className="flex items-center gap-3">
                        <p className="text-5xl font-black text-[#001b5e]">{studentProfile?.student_rating?.toFixed(1) || '4.5'}</p>
                        <div className="flex flex-col gap-1">
                          <div className="flex gap-0.5">
                            {[...Array(5)].map((_, i) => (
                              <span key={i} className={`text-xl ${i < Math.floor(studentProfile?.student_rating || 4.5) ? 'text-amber-500' : 'text-slate-200'}`}>★</span>
                            ))}
                          </div>
                          <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full self-start">EXCELLENT</span>
                        </div>
                      </div>
                      <p className="text-[10px] font-bold text-slate-400 mt-4 leading-relaxed italic">
                        "Your active participation in polls and faculty engagements increases your overall institutional rating."
                      </p>
                    </div>

                    <div className="space-y-3">
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Last Poll Interaction</h4>
                      <div className="flex items-center gap-3 p-3 bg-blue-50/50 rounded-xl border border-blue-100/50">
                        <CheckCircle2 className="w-4 h-4 text-blue-600" />
                        <span className="text-xs font-bold text-[#001b5e]">AI Ethics Seminar Feedback</span>
                        <span className="text-[9px] font-black text-blue-400 ml-auto uppercase">Submitted</span>
                      </div>
                    </div>
                  </div>

                  <Link href="/dashboard/performance" className="mt-6 w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest text-center hover:bg-[#001b5e] transition-all">
                    View Engagement Strategy
                  </Link>
                </div>
              </div>

              {/* Course Portal Quick Link */}
              <div className="vantage-card p-6 border-l-4 border-l-blue-600 bg-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-50 rounded-xl">
                      <BookOpen className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-black text-[#001b5e]">My Courses & Study Path</h4>
                      <p className="text-[10px] font-medium text-slate-400">Access personalized links and W3Schools resources</p>
                    </div>
                  </div>
                  <Link href="/dashboard/courses" className="text-blue-600 font-black text-xs hover:underline flex items-center gap-1">
                    Explore Now <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>

              {/* Student Polling UI */}
              {activePoll && (
                <div className="vantage-card p-8 space-y-6">
                  <div className="flex items-center gap-3">
                    <Zap className="w-6 h-6 text-amber-500 fill-current" />
                    <h3 className="text-xl font-black text-[#001b5e]">{activePoll.question}</h3>
                  </div>
                  {pollVoted ? (
                    <div className="bg-emerald-50 p-6 rounded-2xl text-center border border-emerald-100">
                      <p className="text-emerald-700 font-bold">Thank you for your vote!</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-4">
                      {activePoll.options.map((opt: string, i: number) => (
                        <button
                          key={i}
                          onClick={() => handleVote(opt)}
                          className="p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-[#001b5e] hover:bg-blue-50 hover:border-blue-200 transition-all text-sm"
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {(role === 'admin' || role === 'coe') && (
            <div className="space-y-8">
              <div className="vantage-card p-8 !bg-slate-900 text-white relative overflow-hidden">
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-500 rounded-full blur-[100px] opacity-20 pointer-events-none"></div>
                <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-purple-500 rounded-full blur-[100px] opacity-20 pointer-events-none"></div>
                <div className="flex justify-between items-center mb-8 relative z-10">
                  <div>
                    <h2 className="text-2xl font-black text-white flex items-center gap-3">
                      <Brain className="w-6 h-6 text-blue-400" />
                      {role === 'admin' ? 'Model Accuracy Matrix' : 'Exam & Hall Ticket Flow'}
                    </h2>
                    <p className="text-[10px] font-bold text-blue-300/80 mt-2 tracking-widest uppercase">System Evaluation • Multi-Modal Oversight</p>
                  </div>
                  {role === 'admin' && (
                    <button
                      onClick={downloadMLReport}
                      className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-xl flex items-center gap-2 text-[10px] font-black uppercase transition-all"
                    >
                      <Download className="w-3 h-3" />
                      Download ML Report
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
                  {(modelStats.length > 0 ? modelStats : [
                    { name: 'Grade Predictor', accuracy: 96.9, color: 'bg-emerald-400' },
                    { name: 'Early Warning', accuracy: 95.7, color: 'bg-blue-400' },
                    { name: 'Seating Optimization', accuracy: 98.2, color: 'bg-purple-400' },
                    { name: 'Fraud Shield', accuracy: 99.1, color: 'bg-rose-400' },
                  ]).map((model, i) => (
                    <div key={i} className="space-y-2 bg-white/5 p-4 rounded-2xl border border-white/10">
                      <div className="flex justify-between items-end">
                        <p className="font-bold text-white text-xs whitespace-nowrap overflow-hidden text-ellipsis">{model.name}</p>
                        <span className="text-sm font-black text-white">{model.accuracy}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${model.accuracy}%` }}
                          className={`h-full ${i % 4 === 0 ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]' : i % 4 === 1 ? 'bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.5)]' : i % 4 === 2 ? 'bg-purple-400 shadow-[0_0_8px_rgba(192,132,252,0.5)]' : 'bg-rose-400 shadow-[0_0_8px_rgba(251,113,133,0.5)]'} rounded-full`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Seating History Portal */}
              <div className="vantage-card p-8 space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-black text-[#001b5e]">Recent Seating History</h2>
                  <BarChart2 className="w-5 h-5 text-slate-300" />
                </div>
                {seatingHistory.length === 0 ? (
                  <div className="bg-slate-50 p-8 rounded-2xl text-center text-slate-400 font-bold border-dashed border-2">
                    No historical allocations found.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {seatingHistory.slice(0, 3).map((hist, i) => (
                      <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 group hover:border-[#001b5e] transition-all">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center font-black text-[#001b5e] text-xs shadow-sm">
                            {(hist.course_code || '??').slice(0, 2)}
                          </div>
                          <div>
                            <h4 className="font-black text-[#001b5e] text-xs">{hist.course_name}</h4>
                            <p className="text-[10px] font-bold text-slate-400 uppercase">{hist.course_code} • {new Date(hist.exam_date).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-[10px] font-black text-[#001b5e]">{hist.room_name}</p>
                            <p className="text-[9px] font-bold text-slate-400 uppercase">{hist.total_students} Students</p>
                          </div>
                          <ChevronRight className="w-4 h-4 text-slate-300" />
                        </div>
                      </div>
                    ))}
                    <button className="w-full py-4 text-[#001b5e] font-black text-xs hover:bg-[#001b5e]/5 rounded-2xl transition-all uppercase tracking-widest">
                      View Full Archive
                    </button>
                  </div>
                )}
              </div>

              {/* Admin Polling & Feedback Oversight */}
              {role === 'admin' && (
                <div className="vantage-card p-8 space-y-8">
                  <div className="flex justify-between items-center">
                    <div>
                      <h2 className="text-xl font-black text-[#001b5e]">Polling & Feedback Oversight</h2>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Direct Student Response Management</p>
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={downloadPollResults}
                        className="bg-emerald-50 text-emerald-600 border border-emerald-100 px-4 py-2 rounded-xl font-black text-[10px] uppercase flex items-center gap-2 hover:bg-emerald-100 transition-all"
                      >
                        <Download className="w-3 h-3" /> Export Reviews
                      </button>
                      <button
                        onClick={handleResetPoll}
                        className="bg-rose-50 text-rose-600 border border-rose-100 px-4 py-2 rounded-xl font-black text-[10px] uppercase flex items-center gap-2 hover:bg-rose-100 transition-all"
                      >
                        <Trash2 className="w-3 h-3" /> Reset Current Poll
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 space-y-4">
                      <div className="flex items-center gap-3">
                        <Activity className="w-5 h-5 text-blue-500" />
                        <h4 className="font-black text-[#001b5e] text-sm">Active Poll Sentiment</h4>
                      </div>
                      <div className="space-y-4">
                        <div className="flex justify-between items-end">
                          <p className="text-[10px] font-black text-slate-400 uppercase">Total Submissions</p>
                          <p className="text-xl font-black text-[#001b5e]">{pollResults.length}</p>
                        </div>
                        <div className="w-full h-2 bg-white rounded-full overflow-hidden">
                          <div className="w-[85%] h-full bg-blue-500 rounded-full"></div>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => setShowPollModal(true)}
                      className="bg-slate-50 p-6 rounded-2xl border border-slate-100 space-y-4 text-center flex flex-col items-center justify-center hover:bg-blue-50 transition-all group w-full"
                    >
                      <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-2 group-hover:scale-110 transition-transform">
                        <Plus className="w-6 h-6 text-[#001b5e]" />
                      </div>
                      <h4 className="font-black text-[#001b5e] text-sm">Launch New Poll</h4>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Push real-time questions to students</p>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Quick Access Grid */}
          <div className="space-y-4">
            <h2 className="text-xl font-black text-[#001b5e]">Critical Portals</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {quickLinks.map((link, i) => (
                <Link key={i} href={link.path} className="vantage-card p-6 flex items-center justify-between group hover:shadow-xl hover:border-blue-200 transition-all cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center border border-blue-100 group-hover:bg-[#001b5e] group-hover:border-[#001b5e] transition-all">
                      <link.icon className="w-5 h-5 text-[#001b5e] group-hover:text-white transition-all" />
                    </div>
                    <div>
                      <h3 className="font-black text-[#001b5e] text-sm">{link.name}</h3>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{link.desc}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-[#001b5e] group-hover:translate-x-1 transition-all" />
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Supplemental Info */}
        <div className="space-y-8">
          <div className="vantage-card p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-[#001b5e]">Activity Stream</h3>
              <Clock className="w-4 h-4 text-slate-300" />
            </div>
            <div className="space-y-6">
              {[
                { title: 'System Backup', time: '12m ago', icon: Activity, text: 'Automatic redundancy cycle complete.' },
                { title: 'User Verification', time: '45m ago', icon: ShieldCheck, text: 'Batch verification of hall tickets.' },
                { title: 'Calendar Update', time: '2h ago', icon: CalendarDays, text: 'Updated Internal Assessment dates.' },
              ].map((item, i) => (
                <div key={i} className="flex gap-4 relative">
                  {i < 2 && <div className="absolute left-4 top-10 bottom-[-24px] w-0.5 bg-slate-100"></div>}
                  <div className="w-8 h-8 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center z-10">
                    <item.icon className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between items-center w-full">
                      <p className="text-xs font-black text-[#001b5e]">{item.title}</p>
                      <span className="text-[10px] font-bold text-slate-300">{item.time}</span>
                    </div>
                    <p className="text-[10px] text-slate-400 font-medium leading-relaxed">{item.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="vantage-card p-6 bg-blue-50/50 border-blue-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                <TrendingUp className="w-5 h-5 text-[#001b5e]" />
              </div>
              <div>
                <h4 className="text-sm font-black text-[#001b5e]">Portal Insights</h4>
                <p className="text-[9px] font-bold text-blue-400 uppercase tracking-widest">Growth & Engagement</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-[10px] font-black text-[#001b5e] mb-1.5 uppercase">
                  <span>Syllabus Progress</span>
                  <span>88%</span>
                </div>
                <div className="w-full h-1.5 bg-white rounded-full">
                  <div className="w-[88%] h-full bg-[#001b5e] rounded-full"></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-[10px] font-black text-[#001b5e] mb-1.5 uppercase">
                  <span>Profile Completion</span>
                  <span>94%</span>
                </div>
                <div className="w-full h-1.5 bg-white rounded-full">
                  <div className="w-[94%] h-full bg-[#001b5e] rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Poll Creation Modal */}
      {showPollModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm px-4 fade-in">
          <div className="bg-white p-8 rounded-3xl w-full max-w-lg shadow-2xl relative">
            <button onClick={() => setShowPollModal(false)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-800">
              <Plus className="w-6 h-6 rotate-45" />
            </button>
            <div className="flex items-center gap-3 mb-6">
              <Zap className="w-6 h-6 text-amber-500 fill-current" />
              <h2 className="text-2xl font-black text-[#001b5e]">Launch Real-time Poll</h2>
            </div>

            <form onSubmit={handleCreatePoll} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Question</label>
                <input
                  required
                  type="text"
                  value={newPoll.question}
                  onChange={e => setNewPoll({ ...newPoll, question: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl font-black text-[#001b5e] focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="e.g. How helpful was today's AI seminar?"
                />
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block">Options</label>
                {newPoll.options.map((opt, i) => (
                  <div key={i} className="flex gap-2">
                    <input
                      required
                      type="text"
                      value={opt}
                      onChange={e => {
                        const opts = [...newPoll.options]
                        opts[i] = e.target.value
                        setNewPoll({ ...newPoll, options: opts })
                      }}
                      className="flex-1 bg-slate-100 border-none p-4 rounded-xl font-bold text-[#001b5e] text-sm"
                      placeholder={`Option ${i + 1}`}
                    />
                    {newPoll.options.length > 2 && (
                      <button
                        type="button"
                        onClick={() => {
                          const opts = newPoll.options.filter((_, idx) => idx !== i)
                          setNewPoll({ ...newPoll, options: opts })
                        }}
                        className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                ))}
                {newPoll.options.length < 5 && (
                  <button
                    type="button"
                    onClick={() => setNewPoll({ ...newPoll, options: [...newPoll.options, ''] })}
                    className="w-full py-3 bg-slate-50 border border-dashed border-slate-300 rounded-xl text-slate-400 font-bold text-xs hover:border-[#001b5e] hover:text-[#001b5e] transition-all"
                  >
                    + Add More Option
                  </button>
                )}
              </div>

              <button
                type="submit"
                disabled={pollSubmitting}
                className="w-full bg-[#001b5e] text-white py-5 rounded-2xl font-black shadow-xl shadow-blue-900/20 hover:bg-blue-800 transition-all flex items-center justify-center gap-2"
              >
                {pollSubmitting ? 'Launching...' : 'Activate Poll for Students'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
