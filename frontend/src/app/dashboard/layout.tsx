import Header from "@/components/Header"
import Sidebar from "@/components/Sidebar"
<<<<<<< HEAD
import RoleGuard from "@/components/RoleGuard"
=======
>>>>>>> 79c451c68c096aafd4b160be6e271f1e8d9434f5

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
<<<<<<< HEAD
                        <RoleGuard>{children}</RoleGuard>
=======
                        {children}
>>>>>>> 79c451c68c096aafd4b160be6e271f1e8d9434f5
                    </div>
                </main>
            </div>
        </div>
    )
}
