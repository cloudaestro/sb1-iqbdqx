import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { BookOpen, Users, FileText, Calendar, DollarSign, LogOut } from 'lucide-react'

interface LayoutProps {
  children: React.ReactNode
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation()

  const isActive = (path: string) => location.pathname === path

  const NavLink: React.FC<{ to: string; icon: React.ElementType; children: React.ReactNode }> = ({ to, icon: Icon, children }) => (
    <Link
      to={to}
      className={`flex items-center px-4 py-2 text-sm font-medium rounded-md ${
        isActive(to)
          ? 'bg-indigo-800 text-white'
          : 'text-indigo-100 hover:bg-indigo-600'
      }`}
    >
      <Icon className="mr-3 h-6 w-6" />
      {children}
    </Link>
  )

  return (
    <div className="flex h-screen bg-gray-100">
      <aside className="w-64 bg-indigo-700">
        <div className="flex items-center justify-center h-16 bg-indigo-800">
          <h1 className="text-2xl font-bold text-white">Tutor Dashboard</h1>
        </div>
        <nav className="mt-5 px-2 space-y-1">
          <NavLink to="/" icon={BookOpen}>Dashboard</NavLink>
          <NavLink to="/students" icon={Users}>Students</NavLink>
          <NavLink to="/resources" icon={FileText}>Resources</NavLink>
          <NavLink to="/invoices" icon={DollarSign}>Invoices</NavLink>
          <NavLink to="/schedule" icon={Calendar}>Schedule</NavLink>
        </nav>
        <div className="absolute bottom-0 w-64 bg-indigo-800">
          <a
            href="#"
            className="flex items-center px-4 py-3 text-sm font-medium text-indigo-100 hover:bg-indigo-600"
            onClick={(e) => {
              e.preventDefault()
              // Add logout logic here
              console.log('Logout clicked')
            }}
          >
            <LogOut className="mr-3 h-6 w-6" />
            Logout
          </a>
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto bg-gray-100">
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  )
}

export default Layout