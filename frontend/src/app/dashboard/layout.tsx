import Header from "@/components/Header"
import Sidebar from "@/components/Sidebar"
import RoleGuard from "@/components/RoleGuard"
import React from "react"

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <RoleGuard allowedRoles={['student', 'admin', 'seating_manager', 'club_coordinator']}>
            <div className="min-h-screen bg-slate-50 flex">
                <Sidebar />
                <div className="flex-1 ml-64 flex flex-col">
                    <Header />
                    <main className="flex-1 overflow-y-auto p-8 pt-24 pb-20 fade-in">
                        <div className="max-w-7xl mx-auto">
                            {children}
                        </div>
                    </main>
                </div>
            </div>
        </RoleGuard>
    )
}
