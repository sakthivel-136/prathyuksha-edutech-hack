import Header from "@/components/Header"
import Sidebar from "@/components/Sidebar"
import RoleGuard from "@/components/RoleGuard"

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="min-h-screen bg-slate-50 flex">
            <Sidebar />
            <div className="flex-1 ml-64 flex flex-col min-h-screen">
                <Header />
                <main className="p-8 pb-16">
                    <div className="max-w-7xl mx-auto fade-in">
                        <RoleGuard>{children}</RoleGuard>
                    </div>
                </main>
            </div>
        </div>
    )
}
