"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Shield, Lock, Mail, ArrowRight, Eye, EyeOff } from 'lucide-react'
import { API_BASE } from '@/lib/api'

export default function LoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const router = useRouter()

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
            const res = await fetch(`${API_BASE}/api/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            })

            if (!res.ok) {
                const errData = await res.json().catch(() => null)
                throw new Error(errData?.detail || 'Invalid credentials')
            }

            const data = await res.json()
            localStorage.setItem('accessToken', data.access_token)
            localStorage.setItem('userRole', data.role)
            localStorage.setItem('username', data.full_name)

            // Set cookie so middleware can read it for route protection
            document.cookie = `access_token=${data.access_token}; path=/; max-age=3600`

            // Hard navigation to ensure middleware sees the new cookie
            window.location.href = '/dashboard'
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Login failed')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-[#001b5e] flex items-center justify-center p-6 relative overflow-hidden">
            {/* Decorative Elements */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-500/10 rounded-full blur-3xl"></div>

            <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
                <div className="hidden lg:block space-y-12">
                    <div className="flex items-center gap-4 group cursor-default">
                        <div className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20 shadow-2xl group-hover:scale-110 transition-all duration-500">
                            <Shield className="w-8 h-8 text-blue-400 fill-blue-400/20" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-3xl font-black text-white tracking-widest uppercase leading-none">VANTAGE-EDU</span>
                            <span className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em] mt-1 ml-0.5">Academic Excellence</span>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <h1 className="text-7xl font-black text-white leading-[1.1] tracking-tighter">
                            Advanced <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300">Intelligent</span> <br />
                            Management.
                        </h1>

                        <p className="text-slate-400 text-lg max-w-md font-medium leading-relaxed">
                            Experience the future of education with our AI-driven examination and academic orchestration suite. Precision-engineered for modern institutions.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div className="flex items-start gap-4 p-4 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all group">
                            <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
                                <Lock className="w-5 h-5" />
                            </div>
                            <div>
                                <h4 className="text-white font-bold text-sm">Secure Access</h4>
                                <p className="text-slate-500 text-[10px] leading-tight mt-1">Enterprise-grade guard for all data.</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4 p-4 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all group">
                            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
                                <ArrowRight className="w-5 h-5" />
                            </div>
                            <div>
                                <h4 className="text-white font-bold text-sm">Fast Sync</h4>
                                <p className="text-slate-500 text-[10px] leading-tight mt-1">Real-time updates across systems.</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-[2.5rem] p-10 shadow-2xl space-y-8 fade-in">
                    <div className="space-y-2">
                        <h2 className="text-3xl font-black text-[#001b5e]">Sign In</h2>
                        <p className="text-slate-500">Access your academic portal</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 ml-1">Email Address</label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-[#001b5e] transition-all" />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 py-4 pl-12 pr-4 rounded-2xl focus:ring-2 focus:ring-[#001b5e] focus:border-transparent outline-none transition-all"
                                    placeholder="name@college.edu"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center ml-1">
                                <label className="text-sm font-bold text-slate-700">Password</label>
                                <a href="#" className="text-xs font-bold text-[#001b5e] hover:underline">Forgot?</a>
                            </div>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-[#001b5e] transition-all" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 py-4 pl-12 pr-12 rounded-2xl focus:ring-2 focus:ring-[#001b5e] focus:border-transparent outline-none transition-all"
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#001b5e] transition-all"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        {error && (
                            <div className="bg-red-50 text-red-500 p-4 rounded-xl text-sm font-bold border border-red-100 italic">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-[#001b5e] text-white py-4 rounded-2xl font-black text-lg hover:bg-[#002b8e] transform active:scale-[0.98] transition-all shadow-xl shadow-blue-900/20 flex items-center justify-center gap-2"
                        >
                            {loading ? "Authenticating..." : (
                                <>
                                    Connect Now
                                    <ArrowRight className="w-5 h-5" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="pt-4 text-center">
                        <p className="text-slate-400 text-sm">
                            Protected by <span className="font-bold text-[#001b5e]">VANTAGE-EDU Guard AI</span>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
