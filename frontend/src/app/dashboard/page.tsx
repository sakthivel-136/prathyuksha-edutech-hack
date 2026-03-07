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
  CheckCircle2
} from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'

export default function Dashboard() {
  const [username, setUsername] = useState('User')
  const [role, setRole] = useState('student')
  const [stats, setStats] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const user = localStorage.getItem('username') || 'User'
    const userRole = localStorage.getItem('userRole') || 'student'
    setUsername(user)
    setRole(userRole)

    const fetchStats = async () => {
      try {
        const { getAuthHeaders, API_BASE } = await import('@/lib/api')
        const res = await fetch(`${API_BASE}/api/dashboard/stats`, {
          headers: getAuthHeaders()
        })
        if (res.ok) {
          setStats(await res.json())
        }
      } catch (e) {
        console.error("Failed to fetch stats", e)
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

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
          <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Portal Overview</p>
          <h1 className="text-4xl font-black text-[#001b5e]">Welcome back, {username}</h1>
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
              className="lumina-card p-6 space-y-4 hover:border-blue-200 group transition-all"
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
            <div className="lumina-card p-8 !bg-gradient-to-br from-blue-900 to-[#001b5e] text-white relative overflow-hidden">
              <div className="relative z-10 space-y-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-black">Performance Outlook</h2>
                    <p className="text-blue-200 text-xs font-bold mt-1 uppercase tracking-widest">AI-Driven Academic Analysis</p>
                  </div>
                  <Award className="w-10 h-10 text-amber-400 opacity-80" />
                </div>

                <div className="grid grid-cols-2 gap-8 py-4">
                  <div className="space-y-2">
                    <p className="text-[10px] font-black text-blue-300 uppercase tracking-widest">Predicted GPA</p>
                    <p className="text-4xl font-black">3.82</p>
                    <div className="w-full h-1.5 bg-white/10 rounded-full">
                      <div className="w-[85%] h-full bg-emerald-400 rounded-full shadow-[0_0_10px_rgba(52,211,153,0.5)]"></div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-[10px] font-black text-blue-300 uppercase tracking-widest">Syllabus Mastery</p>
                    <p className="text-4xl font-black">74%</p>
                    <div className="w-full h-1.5 bg-white/10 rounded-full">
                      <div className="w-[74%] h-full bg-blue-400 rounded-full shadow-[0_0_10px_rgba(96,165,250,0.5)]"></div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/10 flex justify-between items-center text-xs font-bold text-blue-100">
                  <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Attendance: Optimal</span>
                  <Link href="/dashboard/performance" className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl transition-all">View Insights</Link>
                </div>
              </div>
              <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
            </div>
          )}

          {(role === 'admin' || role === 'coe') && (
            <div className="lumina-card p-8 !bg-slate-900 text-white relative overflow-hidden">
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
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                {[
                  { name: role === 'admin' ? 'Grade Predictor' : 'Schedule Integrity', pct: 96.9, color: 'bg-emerald-400' },
                  { name: role === 'admin' ? 'Early Warning NLP' : 'Hall Ticket Security', pct: 95.7, color: 'bg-blue-400' },
                  { name: role === 'admin' ? 'Seating Optimization' : 'Room Capacity AI', pct: 98.2, color: 'bg-purple-400' },
                  { name: role === 'admin' ? 'Anomalous Patterns' : 'Anti-Fraud Recall', pct: 99.1, color: 'bg-rose-400' },
                ].map((model, i) => (
                  <div key={i} className="space-y-3">
                    <div className="flex justify-between items-end">
                      <p className="font-black text-white text-sm">{model.name}</p>
                      <span className="text-lg font-black text-white">{model.pct}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${model.pct}%` }}
                        className={`h-full ${model.color} rounded-full`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick Access Grid */}
          <div className="space-y-4">
            <h2 className="text-xl font-black text-[#001b5e]">Critical Portals</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {quickLinks.map((link, i) => (
                <Link key={i} href={link.path} className="lumina-card p-6 flex items-center justify-between group hover:shadow-xl hover:border-blue-200 transition-all cursor-pointer">
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
          <div className="lumina-card p-6 space-y-6">
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

          <div className="lumina-card p-6 bg-blue-50/50 border-blue-100">
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
    </div>
  )
}
