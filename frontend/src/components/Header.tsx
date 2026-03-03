"use client"

import { LogOut, Bell, BellRing } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { API_BASE, getAuthHeaders } from '@/lib/api'

export default function Header() {
    const pathname = usePathname()
    const [username, setUsername] = useState('')
    const [role, setRole] = useState('')
    const [showNotifications, setShowNotifications] = useState(false)
    const [notifications, setNotifications] = useState<any[]>([])

    useEffect(() => {
        const uName = localStorage.getItem('username') || 'User'
        const uRole = localStorage.getItem('userRole') || 'student'
        setUsername(uName)
        setRole(uRole)

        // Fetch notifications
        fetch(`${API_BASE}/api/notifications?role=${uRole}&user_id=${encodeURIComponent(uName)}`, {
            headers: getAuthHeaders()
        })
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) setNotifications(data)
            })
            .catch(console.error)
    }, [])

    const navItems = [
        { name: 'Dashboard', path: '/dashboard' },
        { name: 'Courses', path: '/dashboard/courses' },
        { name: 'Exams', path: '/dashboard/exams' },
        { name: 'Hall Tickets', path: '/dashboard/halltickets' },
    ]

    const handleLogout = () => {
        localStorage.removeItem("accessToken")
        localStorage.removeItem("userRole")
        localStorage.removeItem("username")
        document.cookie = "access_token=; path=/; max-age=0"
        window.location.href = "/login"
    }

    return (
        <header className="h-20 bg-[#001b5e] sticky top-0 z-40 px-8 flex items-center justify-between shadow-lg">
            <div className="flex gap-2 bg-[#000d2e]/40 p-1.5 rounded-full border border-white/5">
                {navItems.map((item) => (
                    <Link
                        key={item.path}
                        href={item.path}
                        className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${pathname === item.path
                            ? 'bg-white text-[#001b5e] shadow-md'
                            : 'text-slate-300 hover:text-white'
                            }`}
                    >
                        {item.name}
                    </Link>
                ))}
            </div>

            <div className="flex items-center gap-6">
                <div className="relative">
                    <button
                        onClick={() => setShowNotifications(!showNotifications)}
                        className="relative p-2 text-slate-300 hover:text-white transition-all rounded-full hover:bg-white/10"
                    >
                        {notifications.length > 0 ? <BellRing className="w-5 h-5 text-white" /> : <Bell className="w-5 h-5" />}
                        {notifications.length > 0 && (
                            <div className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-[#001b5e] animate-pulse"></div>
                        )}
                    </button>

                    {showNotifications && (
                        <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden fade-in text-left divide-y divide-slate-50">
                            <div className="p-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                                <h4 className="font-black text-[#001b5e] text-sm">Notifications</h4>
                                {notifications.length > 0 && (
                                    <span className="bg-[#001b5e] text-white text-[10px] font-black px-2 py-0.5 rounded-full">{notifications.length} New</span>
                                )}
                            </div>

                            {notifications.length === 0 ? (
                                <div className="p-6 text-center text-slate-500 text-xs font-bold">No new notifications</div>
                            ) : (
                                notifications.map((notif, idx) => (
                                    <div key={idx} className="p-4 hover:bg-slate-50 transition-colors cursor-pointer border-l-2 border-transparent hover:border-blue-500">
                                        <p className="text-xs font-bold text-slate-800 mb-1">{notif.title}</p>
                                        <p className="text-[10px] text-slate-500 leading-snug">{notif.message}</p>
                                        <p className="text-[9px] font-bold text-slate-400 mt-2">{notif.time_ago}</p>
                                    </div>
                                ))
                            )}

                            {notifications.length > 0 && (
                                <button
                                    onClick={() => {
                                        setNotifications([])
                                        setShowNotifications(false)
                                    }}
                                    className="w-full p-3 text-xs font-bold text-blue-600 hover:text-blue-800 hover:bg-slate-50 transition-all text-center"
                                >
                                    Mark all as read
                                </button>
                            )}
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-3 border-l border-white/10 pl-6 w-48 shrink-0">
                    <div className="w-9 h-9 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-inner shrink-0 leading-none">
                        {username.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0 pr-2 overflow-hidden flex-1">
                        <p className="text-[13px] font-bold text-white leading-tight truncate">{username}</p>
                        <p className="text-[10px] font-bold text-blue-300 uppercase tracking-wider capitalize truncate">{role.replace('_', ' ')}</p>
                    </div>
                </div>
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 text-slate-300 hover:text-white font-bold text-sm transition-all"
                >
                    <LogOut className="w-4 h-4" />
                </button>
            </div>
        </header>
    )
}
