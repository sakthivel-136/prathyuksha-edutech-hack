"use client"

import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'

/** Routes each role can access - must match Sidebar allowed roles */
const ROLE_ROUTES: Record<string, string[]> = {
  student: ['/dashboard', '/dashboard/courses', '/dashboard/exams', '/dashboard/halltickets', '/dashboard/performance', '/dashboard/mindmap', '/dashboard/recommender', '/dashboard/calendar', '/dashboard/events', '/dashboard/alerts'],
  admin: ['/dashboard', '/dashboard/courses', '/dashboard/exams', '/dashboard/halltickets', '/dashboard/performance', '/dashboard/alerts', '/dashboard/students', '/dashboard/mindmap', '/dashboard/seating', '/dashboard/fraud', '/dashboard/events', '/dashboard/recommender', '/dashboard/calendar', '/dashboard/inequality'],
  seating_manager: ['/dashboard', '/dashboard/exams', '/dashboard/alerts', '/dashboard/students', '/dashboard/mindmap', '/dashboard/seating', '/dashboard/events', '/dashboard/calendar'],
  club_coordinator: ['/dashboard', '/dashboard/mindmap', '/dashboard/events', '/dashboard/calendar'],
  coe: ['/dashboard', '/dashboard/courses', '/dashboard/exams', '/dashboard/halltickets', '/dashboard/alerts', '/dashboard/mindmap', '/dashboard/seating', '/dashboard/fraud', '/dashboard/calendar', '/dashboard/inequality'],
}

function isPathAllowed(path: string, role: string): boolean {
  if (path === '/dashboard') return true
  const allowed = ROLE_ROUTES[role] || ROLE_ROUTES.student
  return allowed.includes(path) || false
}

export default function RoleGuard({
  children,
  allowedRoles
}: {
  children: React.ReactNode
  allowedRoles?: string[]
}) {
  const pathname = usePathname()
  const router = useRouter()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const role = typeof window !== 'undefined' ? localStorage.getItem('userRole') || 'student' : 'student'
    if (!isPathAllowed(pathname || '', role)) {
      router.replace('/dashboard')
      return
    }
    setReady(true)
  }, [pathname, router])

  if (!ready) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-4 border-[#001b5e] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }
  return <>{children}</>
}
