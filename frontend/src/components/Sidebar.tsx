"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
    BarChart2,
    Users,
    BookOpen,
    LogOut,
    Brain,
    Grid,
    ShieldCheck,
    CalendarDays,
    AlertCircle,
    Sparkles,
    GraduationCap,
    FileText,
    LayoutDashboard,
    Ticket
} from 'lucide-react'

export default function Sidebar() {
    const pathname = usePathname()
    const role = typeof window !== 'undefined' ? localStorage.getItem('userRole') || 'student' : 'student'

    // Core menu - visible based on role
    const coreMenu = [
        { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard', allowed: ['student', 'admin', 'seating_manager', 'club_coordinator'] },
        { name: 'My Courses', icon: BookOpen, path: '/dashboard/courses', allowed: ['student', 'admin'] },
        { name: 'Exam Schedule', icon: CalendarDays, path: '/dashboard/exams', allowed: ['student', 'admin', 'seating_manager'] },
        { name: 'Hall Tickets', icon: Ticket, path: '/dashboard/halltickets', allowed: ['student', 'admin'] },
    ]

    // Academic AI modules
    const academics = [
        { name: 'Performance Predictor', icon: BarChart2, path: '/dashboard/performance', allowed: ['student', 'admin'] },
        { name: 'Early Warning', icon: AlertCircle, path: '/dashboard/alerts', allowed: ['admin', 'seating_manager'] },
        { name: 'Mind Map NLP', icon: Brain, path: '/dashboard/mindmap', allowed: ['student', 'admin', 'seating_manager', 'club_coordinator'] },
        { name: 'Seating Allocator', icon: Grid, path: '/dashboard/seating', allowed: ['admin', 'seating_manager'] },
        { name: 'Fraud Detection', icon: ShieldCheck, path: '/dashboard/fraud', allowed: ['admin'] },
        { name: 'Event Conflict', icon: CalendarDays, path: '/dashboard/events', allowed: ['admin', 'club_coordinator'] },
        { name: 'Study Recommender', icon: Sparkles, path: '/dashboard/recommender', allowed: ['student', 'admin'] },
    ]

    const filteredCore = coreMenu.filter(item => item.allowed.includes(role))
    const filteredAcademics = academics.filter(item => item.allowed.includes(role))

    const handleLogout = () => {
        localStorage.removeItem("accessToken")
        localStorage.removeItem("userRole")
        localStorage.removeItem("username")
        document.cookie = "access_token=; path=/; max-age=0"
        window.location.href = "/login"
    }

    return (
        <div className="w-64 bg-[#001b5e] text-slate-300 min-h-screen fixed left-0 top-0 flex flex-col p-4 shadow-2xl z-50">
            <div className="flex items-center gap-3 px-2 mb-10 pt-4">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center font-black text-[#001b5e] text-xl">
                    V
                </div>
                <span className="text-xl font-black text-white tracking-widest uppercase">Vantage</span>
            </div>

            <div className="space-y-1">
                <p className="px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 opacity-50">Academics</p>
                {filteredCore.map((item) => (
                    <Link
                        key={item.path}
                        href={item.path}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${pathname === item.path
                                ? 'bg-white/10 text-white shadow-inner'
                                : 'hover:bg-white/5'
                            }`}
                    >
                        <item.icon className="w-5 h-5" />
                        <span>{item.name}</span>
                    </Link>
                ))}
            </div>

            <div className="mt-10 space-y-1">
                <p className="px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 opacity-50">AI Modules</p>
                {filteredAcademics.map((item) => (
                    <Link
                        key={item.path}
                        href={item.path}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${pathname === item.path
                                ? 'bg-white/10 text-white'
                                : 'hover:bg-white/5 text-slate-400'
                            }`}
                    >
                        <item.icon className="w-5 h-5" />
                        <span>{item.name}</span>
                    </Link>
                ))}
            </div>

            <div className="mt-auto pb-4 pt-6 border-t border-white/5">
                <div className="px-4 mb-4">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Role</p>
                    <p className="text-sm font-bold text-blue-400 capitalize">{role.replace('_', ' ')}</p>
                </div>
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 transition-all font-medium"
                >
                    <LogOut className="w-5 h-5" />
                    <span>Sign Out</span>
                </button>
            </div>
        </div>
    )
}
