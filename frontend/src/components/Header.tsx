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
    const [hasReadNotifications, setHasReadNotifications] = useState(false)

    useEffect(() => {
        const uName = localStorage.getItem('username') || 'User'
        const uRole = localStorage.getItem('userRole') || 'student'
        setUsername(uName)
        setRole(uRole)

        // Fetch notifications using the improved API
        const fetchNotifications = async () => {
            try {
                const res = await fetch(`${API_BASE}/api/notifications`, {
                    headers: getAuthHeaders()
                })
                if (res.ok) {
                    const data = await res.json()
                    setNotifications(data)
                }
            } catch (e) { console.error(e) }
        }
        fetchNotifications()
    }, [])

    const markRead = async (id: string) => {
        try {
            await fetch(`${API_BASE}/api/notifications/read/${id}`, {
                method: 'POST',
                headers: getAuthHeaders()
            })
            setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: true } : n))
        } catch (e) { console.error(e) }
    }

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

    const unreadCount = notifications.filter(n => !n.is_read).length

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
                        {unreadCount > 0 ? <BellRing className="w-5 h-5 text-white" /> : <Bell className="w-5 h-5" />}
                        {unreadCount > 0 && (
                            <div className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-[#001b5e] animate-pulse"></div>
                        )}
                    </button>

                    {showNotifications && (
                        <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden fade-in text-left divide-y divide-slate-50">
                            <div className="p-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                                <h4 className="font-black text-[#001b5e] text-sm">Notifications</h4>
                                {unreadCount > 0 && (
                                    <span className="bg-[#001b5e] text-white text-[10px] font-black px-2 py-0.5 rounded-full">{unreadCount} New</span>
                                )}
                            </div>

                            <div className="max-h-96 overflow-y-auto divide-y divide-slate-50">
                                {notifications.length === 0 ? (
                                    <div className="p-6 text-center text-slate-500 text-xs font-bold">No notifications</div>
                                ) : (
                                    notifications.map((notif, idx) => (
                                        <div
                                            key={idx}
                                            onClick={() => !notif.is_read && markRead(notif.id)}
                                            className={`p-4 hover:bg-slate-50 transition-colors cursor-pointer border-l-2 ${notif.is_read ? 'border-transparent' : 'border-blue-500 bg-blue-50/30'}`}
                                        >
                                            <p className="text-xs font-bold text-slate-800 mb-1">{notif.title}</p>
                                            <p className="text-[10px] text-slate-500 leading-snug">{notif.message}</p>
                                            <p className="text-[9px] font-bold text-slate-400 mt-2">{new Date(notif.created_at).toLocaleDateString()}</p>
                                        </div>
                                    ))
                                )}
                            </div>

                            {unreadCount > 0 && (
                                <button
                                    onClick={async () => {
                                        for (const n of notifications.filter(notif => !notif.is_read)) {
                                            await markRead(n.id)
                                        }
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
