"use client"

import { LogOut, Bell } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function Header() {
    const pathname = usePathname()
    const [username, setUsername] = useState('')
    const [role, setRole] = useState('')

    useEffect(() => {
        setUsername(localStorage.getItem('username') || 'User')
        setRole(localStorage.getItem('userRole') || 'student')
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
                <button className="relative text-slate-300 hover:text-white transition-all">
                    <Bell className="w-5 h-5" />
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-rose-500 rounded-full"></div>
                </button>
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        {username.charAt(0).toUpperCase()}
                    </div>
                    <div className="hidden md:block">
                        <p className="text-sm font-bold text-white leading-tight">{username}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider capitalize">{role.replace('_', ' ')}</p>
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
