"use client"

import { useEffect, useState } from "react"
import { ShieldAlert, AlertCircle, Loader2, RefreshCw, UserPlus, X } from "lucide-react"
import { API_BASE, getAuthHeaders } from "@/lib/api"

interface RiskAlert {
    id: string
    name: string
    risk_probability: number
    reason: string
}

export default function StudentsPage() {
    const [alerts, setAlerts] = useState<RiskAlert[]>([])
    const [loading, setLoading] = useState(true)
    const [showAddModal, setShowAddModal] = useState(false)
    const [submitting, setSubmitting] = useState(false)

    const fetchAlerts = async () => {
        setLoading(true)
        try {
            const res = await fetch(`${API_BASE}/api/at_risk_students`, {
                headers: getAuthHeaders()
            })
            if (res.ok) {
                setAlerts(await res.json())
            }
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    const handleAddUser = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setSubmitting(true)
        const formData = new FormData(e.currentTarget)
        const payload = {
            full_name: formData.get('full_name') as string,
            email: formData.get('email') as string,
            role: formData.get('role') as string,
            department: formData.get('department') as string,
            password_hash: (formData.get('password') as string) || 'student123'
        }

        try {
            const res = await fetch(`${API_BASE}/api/admin/users`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
                body: JSON.stringify(payload)
            })
            if (res.ok) {
                alert("User created successfully!")
                setShowAddModal(false)
            } else {
                const err = await res.json()
                alert(`Error: ${err.detail || 'Failed to create user'}`)
            }
        } catch (error) {
            alert("Network error")
        } finally {
            setSubmitting(false)
        }
    }

    useEffect(() => {
        fetchAlerts()
    }, [])

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                        <ShieldAlert className="text-red-500 w-7 h-7" /> At-Risk Students & User Management
                    </h1>
                    <p className="text-slate-500 mt-1">Admin dashboard for student alerts and system user creation</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-[#001b5e] text-white rounded-lg hover:bg-blue-800 transition shadow-lg shadow-blue-900/10 font-bold"
                    >
                        <UserPlus className="w-4 h-4" />
                        Add New User
                    </button>
                    <button
                        onClick={fetchAlerts}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition shadow-sm"
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-blue-600" : ""}`} />
                        Refresh
                    </button>
                </div>
            </div>

            {/* Add User Modal */}
            {showAddModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm px-4 fade-in">
                    <div className="bg-white p-8 rounded-3xl w-full max-w-lg shadow-2xl relative border border-slate-100">
                        <button onClick={() => setShowAddModal(false)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-600"><X /></button>
                        <h2 className="text-2xl font-black text-[#001b5e] mb-2">Create New User</h2>
                        <p className="text-sm text-slate-500 mb-6">Add a new student, office staff, or administrator to the VANTAGE system.</p>

                        <form onSubmit={handleAddUser} className="grid grid-cols-2 gap-4">
                            <div className="col-span-2 space-y-1">
                                <label className="text-[10px] font-black uppercase text-slate-400">Full Name</label>
                                <input required name="full_name" type="text" className="w-full bg-slate-50 border p-3 rounded-xl font-bold" placeholder="e.g. Rahul Kumar" />
                            </div>
                            <div className="col-span-2 space-y-1">
                                <label className="text-[10px] font-black uppercase text-slate-400">Email Address</label>
                                <input required name="email" type="email" className="w-full bg-slate-50 border p-3 rounded-xl font-bold" placeholder="student@university.edu" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase text-slate-400">System Role</label>
                                <select required name="role" className="w-full bg-slate-50 border p-3 rounded-xl font-bold appearance-none">
                                    <option value="student">Student</option>
                                    <option value="admin">Admin</option>
                                    <option value="coe">COE</option>
                                    <option value="club_coordinator">Coordinator</option>
                                    <option value="seating_manager">Seating Manager</option>
                                </select>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase text-slate-400">Department</label>
                                <input required name="department" type="text" className="w-full bg-slate-50 border p-3 rounded-xl font-bold" placeholder="e.g. CSE" />
                            </div>
                            <div className="col-span-2 space-y-1">
                                <label className="text-[10px] font-black uppercase text-slate-400">Initial Password</label>
                                <input required name="password" type="text" className="w-full bg-slate-50 border p-3 rounded-xl font-bold" defaultValue="welcome123" />
                            </div>

                            <div className="col-span-2 flex gap-4 pt-4">
                                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 bg-slate-100 text-slate-600 py-3 rounded-xl font-bold hover:bg-slate-200 transition-all">Cancel</button>
                                <button type="submit" disabled={submitting} className="flex-1 bg-[#001b5e] text-white py-3 rounded-xl font-black shadow-xl hover:bg-blue-800 transition-all disabled:opacity-50">
                                    {submitting ? 'Creating...' : 'Create Profile'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                {loading ? (
                    <div className="h-64 flex flex-col items-center justify-center text-slate-500">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-4" />
                        <p>Running inferences through model...</p>
                    </div>
                ) : (
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-100">
                                <th className="py-4 px-6 font-semibold text-slate-600 text-sm tracking-wide">Student ID</th>
                                <th className="py-4 px-6 font-semibold text-slate-600 text-sm tracking-wide">Name</th>
                                <th className="py-4 px-6 font-semibold text-slate-600 text-sm tracking-wide">Risk Probability</th>
                                <th className="py-4 px-6 font-semibold text-slate-600 text-sm tracking-wide">Top Contributing Factors</th>
                                <th className="py-4 px-6 font-semibold text-slate-600 text-sm tracking-wide text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {alerts.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="py-12 text-center text-slate-500">
                                        <div className="flex flex-col items-center justify-center gap-2">
                                            <AlertCircle className="w-8 h-8 text-slate-300" />
                                            No students are currently flagged as high risk.
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                alerts.map((alert, i) => (
                                    <tr key={alert.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition">
                                        <td className="py-4 px-6 text-sm font-medium text-slate-900">{alert.id}</td>
                                        <td className="py-4 px-6 text-sm text-slate-600">{alert.name}</td>
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-full bg-slate-100 rounded-full h-2.5 max-w-[100px]">
                                                    <div
                                                        className={`h-2.5 rounded-full ${alert.risk_probability > 0.8 ? 'bg-red-500' : 'bg-orange-500'}`}
                                                        style={{ width: `${alert.risk_probability * 100}%` }}
                                                    ></div>
                                                </div>
                                                <span className="text-sm font-bold text-slate-700">{(alert.risk_probability * 100).toFixed(0)}%</span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6 text-sm text-slate-500 italic">
                                            {alert.reason}
                                        </td>
                                        <td className="py-4 px-6 text-right">
                                            <button className="text-blue-600 hover:text-blue-800 text-sm font-medium transition px-3 py-1.5 rounded bg-blue-50/50 hover:bg-blue-100">
                                                View SHAP details
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    )
}
