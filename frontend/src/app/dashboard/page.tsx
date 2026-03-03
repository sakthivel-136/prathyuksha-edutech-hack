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
  ShieldCheck
} from 'lucide-react'
import Link from 'next/link'

export default function Dashboard() {
  const [username, setUsername] = useState('Student')
  const [role, setRole] = useState('student')

  useEffect(() => {
    setUsername(localStorage.getItem('username') || 'Student')
    setRole(localStorage.getItem('userRole') || 'student')
  }, [])

  const studentStats = [
    { label: 'AVG. PERFORMANCE', value: '16.4', sub: '+1.2% this month', icon: TrendingUp, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'PREDICTED GRADE', value: '17.2', sub: '+0.4 this month', icon: GraduationCap, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'RISK ANALYTICS', value: 'Low', sub: 'Stable this month', icon: AlertCircle, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'UPCOMING EXAMS', value: '3', sub: 'Next: 03/18', icon: CalendarDays, color: 'text-violet-600', bg: 'bg-violet-50' },
  ]

  const adminStats = [
    { label: 'TOTAL STUDENTS', value: '1,240', sub: '+45 this semester', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'AT-RISK STUDENTS', value: '23', sub: '1.8% of total', icon: AlertCircle, color: 'text-rose-600', bg: 'bg-rose-50' },
    { label: 'SEATING PLANS', value: '12', sub: '100% automated', icon: BarChart2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'FRAUD ALERTS', value: '0', sub: 'All clear', icon: ShieldCheck, color: 'text-violet-600', bg: 'bg-violet-50' },
  ]

  const stats = ['admin', 'seating_manager'].includes(role) ? adminStats : studentStats

  const quickLinks = ['admin', 'seating_manager'].includes(role) ? [
    { name: 'Generate Seating Plan', desc: 'AI-powered automatic allocation', path: '/dashboard/seating', icon: BarChart2 },
    { name: 'At-Risk Alerts', desc: 'View flagged students', path: '/dashboard/alerts', icon: AlertCircle },
    { name: 'Fraud Detection', desc: 'Monitor hall ticket integrity', path: '/dashboard/fraud', icon: ShieldCheck },
    { name: 'Event Conflicts', desc: 'Schedule optimization', path: '/dashboard/events', icon: CalendarDays },
  ] : role === 'club_coordinator' ? [
    { name: 'Event Submissions', desc: 'Submit and approve events', path: '/dashboard/events', icon: CalendarDays },
    { name: 'Mind Map NLP', desc: 'Syllabus analysis', path: '/dashboard/mindmap', icon: Brain },
    { name: 'Academic Calendar', desc: 'View calendar events', path: '/dashboard/calendar', icon: CalendarDays },
  ] : [
    { name: 'My Courses', desc: 'View enrolled subjects', path: '/dashboard/courses', icon: BookOpen },
    { name: 'Hall Tickets', desc: 'Generate & download', path: '/dashboard/halltickets', icon: GraduationCap },
    { name: 'Performance Predictor', desc: 'AI grade forecast', path: '/dashboard/performance', icon: TrendingUp },
    { name: 'Mind Map Generator', desc: 'NLP syllabus analysis', path: '/dashboard/mindmap', icon: Brain },
  ]

  return (
    <div className="space-y-8 fade-in">
      <div className="flex justify-between items-end">
        <div className="space-y-1">
          <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Overview</p>
          <h1 className="text-4xl font-black text-[#001b5e]">Welcome back, {username}</h1>
        </div>
        <p className="text-sm font-bold text-slate-400 capitalize">
          Role: <span className="text-[#001b5e]">{role.replace('_', ' ')}</span>
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="vantage-card p-6 space-y-4 hover:shadow-xl transition-all">
            <div className={`w-12 h-12 ${stat.bg} rounded-2xl flex items-center justify-center`}>
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
              <p className="text-3xl font-black text-[#001b5e] mt-1">{stat.value}</p>
              <p className="text-xs font-bold text-emerald-600 mt-1">{stat.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Access */}
      <div className="space-y-4">
        <h2 className="text-xl font-black text-[#001b5e]">Quick Access</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {quickLinks.map((link, i) => (
            <Link key={i} href={link.path} className="vantage-card p-6 flex items-center justify-between group hover:shadow-xl transition-all cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center border border-blue-100 group-hover:bg-[#001b5e] group-hover:border-[#001b5e] transition-all">
                  <link.icon className="w-5 h-5 text-[#001b5e] group-hover:text-white transition-all" />
                </div>
                <div>
                  <h3 className="font-black text-[#001b5e]">{link.name}</h3>
                  <p className="text-xs font-bold text-slate-400">{link.desc}</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-[#001b5e] transition-all" />
            </Link>
          ))}
        </div>
      </div>

      {/* AI Models Status */}
      <div className="vantage-card p-8">
        <h2 className="text-xl font-black text-[#001b5e] mb-6">AI Models Status</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { name: 'XGBoost Predictor', acc: '92%', status: 'active' },
            { name: 'Early Warning RF', acc: '91.9% F1', status: 'active' },
            { name: 'Isolation Forest', acc: '95%', status: 'active' },
            { name: 'SVM Classifier', acc: '91%', status: 'active' },
          ].map((model, i) => (
            <div key={i} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Online</span>
              </div>
              <p className="font-black text-[#001b5e] text-sm">{model.name}</p>
              <p className="text-xs font-bold text-slate-400">Accuracy: <span className="text-blue-600">{model.acc}</span></p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
