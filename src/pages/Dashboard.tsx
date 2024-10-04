import React, { useState, useEffect } from 'react'
import { Calendar, Clock, Users, FileText, DollarSign } from 'lucide-react'
import axios from 'axios'

interface Session {
  id: string
  studentName: string
  date: string
  time: string
}

interface Activity {
  id: string
  type: string
  description: string
  date: string
}

interface Stats {
  totalStudents: number
  totalSessions: number
  totalEarnings: number | null
}

const Dashboard: React.FC = () => {
  const [upcomingSessions, setUpcomingSessions] = useState<Session[]>([])
  const [recentActivity, setRecentActivity] = useState<Activity[]>([])
  const [stats, setStats] = useState<Stats>({
    totalStudents: 0,
    totalSessions: 0,
    totalEarnings: null,
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    setIsLoading(true)
    try {
      const [sessionsRes, activityRes, statsRes] = await Promise.all([
        axios.get('/api/sessions/upcoming'),
        axios.get('/api/activity/recent'),
        axios.get('/api/stats'),
      ])
      setUpcomingSessions(sessionsRes.data)
      setRecentActivity(activityRes.data)
      setStats(statsRes.data)
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return <div className="flex justify-center items-center h-full">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Welcome, Tutor!</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard icon={Users} title="Total Students" value={stats.totalStudents} />
        <StatCard icon={Calendar} title="Total Sessions" value={stats.totalSessions} />
        <StatCard 
          icon={DollarSign} 
          title="Total Earnings" 
          value={stats.totalEarnings != null ? `$${stats.totalEarnings.toFixed(2)}` : 'N/A'} 
        />
      </div>

      {/* Rest of the component remains unchanged */}
    </div>
  )
}

const StatCard: React.FC<{ icon: React.ElementType; title: string; value: string | number }> = ({ icon: Icon, title, value }) => (
  <div className="bg-white p-6 rounded-lg shadow-md flex items-center">
    <Icon size={24} className="text-indigo-600 mr-4" />
    <div>
      <p className="text-sm font-medium text-gray-500">{title}</p>
      <p className="text-2xl font-semibold text-gray-900">{value}</p>
    </div>
  </div>
)

// ActivityIcon and QuickActionButton components remain unchanged

export default Dashboard