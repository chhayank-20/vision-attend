import { useState, useEffect } from 'react'
import { LayoutDashboard, Users as UsersIcon, Video, FileText, Settings as SettingsIcon, LogOut, CheckCircle2, XCircle, MoreVertical, Settings2 } from 'lucide-react'
import { BulkUpload } from './components/BulkUpload'
import { UserEnrollment } from './components/UserEnrollment'
import { CameraROIEditor } from './components/CameraROIEditor'
import { LiveActivity } from './components/LiveActivity'
import { ReportGenerator } from './components/ReportGenerator'
import { Login } from './pages/Login'
import { useAuthStore } from './store/useAuthStore'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { Button } from './components/ui/Button'

import { SettingsPage } from './pages/SettingsPage'
import { RemoteEnroll } from './pages/RemoteEnroll'
import { EnrollmentManager } from './components/EnrollmentManager'
import { AttendanceTrendChart } from './components/AttendanceTrendChart'
import { Toaster } from 'sonner'

function App() {
  // Simple routing for the public enrollment portal
  if (window.location.pathname === '/enroll') {
    return (
      <>
        <Toaster position="top-center" richColors />
        <RemoteEnroll />
      </>
    )
  }

  const [activeTab, setActiveTab] = useState('dashboard')
  const [selectedCamera, setSelectedCamera] = useState(null)
  const { user, token, logout } = useAuthStore()

  const { data: users, refetch: refetchUsers } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const res = await axios.get('/api/users/')
      return res.data
    },
    enabled: !!token
  })

  const { data: cameras, refetch: refetchCameras } = useQuery({
    queryKey: ['cameras'],
    queryFn: async () => {
      const res = await axios.get('/api/cameras/')
      return res.data
    },
    enabled: !!token
  })

  const { data: summary } = useQuery({
    queryKey: ['analytics-summary'],
    queryFn: async () => {
      const res = await axios.get('/api/analytics/summary')
      return res.data
    },
    enabled: !!token && activeTab === 'dashboard',
    refetchInterval: 5000
  })

  const { data: recentLogs } = useQuery({
    queryKey: ['recent-logs'],
    queryFn: async () => {
      const res = await axios.get('/api/analytics/recent-logs')
      return res.data
    },
    enabled: !!token && activeTab === 'dashboard',
    refetchInterval: 5000
  })

  if (!token) {
    return <Login />
  }

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'users', label: 'Users', icon: UsersIcon },
    { id: 'cameras', label: 'Cameras', icon: Video },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'settings', label: 'Settings', icon: SettingsIcon },
  ]

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900">
      <Toaster position="top-right" richColors />
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-blue-600 tracking-tight">VisionAttend</h1>
          <p className="text-xs text-slate-400 mt-1 uppercase tracking-widest font-semibold">Admin Panel</p>
        </div>
        
        <nav className="flex-1 px-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <button
                key={item.id}
                onClick={() => { setActiveTab(item.id); setSelectedCamera(null); }}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  activeTab === item.id 
                    ? 'bg-blue-50 text-blue-600 shadow-sm' 
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                }`}
              >
                <Icon size={20} />
                <span className="font-medium">{item.label}</span>
              </button>
            )
          })}
        </nav>
        
        <div className="p-6 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                {user?.name?.substring(0, 2).toUpperCase() || 'AD'}
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800 truncate max-w-[100px]">{user?.name || 'Admin User'}</p>
                <p className="text-xs text-slate-400 capitalize">{user?.role || 'Administrator'}</p>
              </div>
            </div>
            <button 
              onClick={logout}
              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
              title="Logout"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto p-8">
        <header className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-slate-800">
              {selectedCamera ? `Configuring: ${selectedCamera.name}` : navItems.find(i => i.id === activeTab)?.label}
            </h2>
            <p className="text-slate-500">
              {selectedCamera ? 'Draw a box to define the recognition area.' : `Welcome back, ${user?.name.split(' ')[0]}! Here's what's happening today.`}
            </p>
          </div>
          <div className="flex items-center space-x-3">
            {selectedCamera && (
              <Button variant="outline" onClick={() => setSelectedCamera(null)} className="rounded-xl font-bold">
                Back to List
              </Button>
            )}
            {activeTab === 'users' && <UserEnrollment onComplete={refetchUsers} />}
          </div>
        </header>

        <div className="space-y-8">
          {activeTab === 'dashboard' && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Total Present" value={summary?.present_today || '0'} change="+12%" />
                <StatCard title="Active Cameras" value={summary?.active_cameras || '0'} status="Online" />
                <StatCard title="Late Arrivals" value={summary?.late_today || '0'} change="-2" color="text-amber-500" />
                <StatCard title="Total Users" value={summary?.total_users || '...'} />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                  <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 min-h-[400px]">
                    <h3 className="text-lg font-black text-slate-800 uppercase tracking-widest mb-6">Attendance Trends</h3>
                    <AttendanceTrendChart />
                  </div>
                </div>
                
                <div>
                  <LiveActivity logs={recentLogs} />
                </div>
              </div>
            </>
          )}
          
          {activeTab === 'users' && (
            <div className="space-y-8">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">User</th>
                      <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">ID</th>
                      <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Department</th>
                      <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest text-center">Face Enrolled</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {users?.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500">
                              {u.name.substring(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-800">{u.name}</p>
                              <p className="text-xs text-slate-400">{u.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-slate-600 font-mono">{u.employee_id}</td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded-md text-xs font-bold">{u.department}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex justify-center">
                            {u.embeddings?.length > 0 ? (
                              <CheckCircle2 size={20} className="text-emerald-500" />
                            ) : (
                              <XCircle size={20} className="text-slate-200" />
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="pt-4">
                <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4 ml-1">Advanced Tools</h4>
                <BulkUpload onComplete={refetchUsers} />
              </div>
            </div>
          )}

          {activeTab === 'cameras' && (
            <div className="space-y-6">
              {selectedCamera ? (
                <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                  <CameraROIEditor camera={selectedCamera} onSave={() => { refetchCameras(); setSelectedCamera(null); }} />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {cameras?.map((cam) => (
                    <div key={cam.id} className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden group">
                      <div className="aspect-video bg-slate-100 relative">
                        <img src={`/api/cameras/${cam.id}/stream`} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" alt={cam.name} />
                        <div className="absolute top-4 left-4 bg-emerald-500 text-white text-[10px] font-black uppercase px-2 py-1 rounded-md shadow-lg flex items-center space-x-1">
                          <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
                          <span>Live</span>
                        </div>
                      </div>
                      <div className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="font-bold text-slate-800">{cam.name}</h4>
                          <button className="text-slate-400 hover:text-slate-600"><MoreVertical size={18} /></button>
                        </div>
                        <div className="flex space-x-2">
                          <Button 
                            variant="outline" 
                            className="flex-1 rounded-xl font-bold border-slate-200 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-100 transition-all"
                            onClick={() => setSelectedCamera(cam)}
                          >
                            <Settings2 size={16} className="mr-2" /> ROI Config
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'reports' && (
            <div className="max-w-4xl mx-auto">
              <ReportGenerator />
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-8">
              <SettingsPage />
              
              <div className="pt-8">
                <h3 className="text-xl font-black text-slate-800 uppercase tracking-widest mb-6 ml-1">Enrollment Requests</h3>
                <EnrollmentManager />
              </div>
            </div>
          )}

          {(activeTab !== 'dashboard' && activeTab !== 'users' && activeTab !== 'cameras' && activeTab !== 'reports' && activeTab !== 'settings') && (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 shadow-sm flex items-center justify-center text-slate-300">
              <div className="text-center">
                <p className="text-xl font-medium">Coming Soon</p>
                <p className="text-sm">The {activeTab} view is under construction.</p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

function StatCard({ title, value, change, status, color = "text-slate-800" }) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm transition-hover hover:shadow-md">
      <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2">{title}</p>
      <div className="flex items-end justify-between">
        <h3 className={`text-4xl font-black ${color}`}>{value}</h3>
        {change && (
          <span className={`text-sm font-bold px-2 py-1 rounded-full ${change.startsWith('+') ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
            {change}
          </span>
        )}
        {status && (
          <span className="text-sm font-bold px-2 py-1 rounded-full bg-blue-50 text-blue-600 flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
            <span>{status}</span>
          </span>
        )}
      </div>
    </div>
  )
}

export default App
