import { useState } from 'react'
import axios from 'axios'
import { Search, Clock, MapPin, User, Building2, ChevronLeft } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { toast } from 'sonner'

export function EmployeePortal() {
  const [empId, setEmpId] = useState('')
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!empId.trim()) return

    setLoading(true)
    try {
      const res = await axios.get(`/api/users/public/history/${empId}`)
      setData(res.data)
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to fetch history')
      setData(null)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tight">Employee Portal</h1>
            <p className="text-slate-500">View your attendance history securely.</p>
          </div>
          <Button variant="outline" onClick={() => window.location.href = '/'} className="rounded-xl">
             <ChevronLeft size={16} className="mr-1" /> Back
          </Button>
        </header>

        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 md:p-8 mb-8">
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input
                type="text"
                placeholder="Enter Employee ID (e.g. EMP001)"
                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-lg font-medium"
                value={empId}
                onChange={(e) => setEmpId(e.target.value)}
              />
            </div>
            <Button type="submit" disabled={loading} className="py-4 px-8 rounded-2xl text-lg font-bold h-auto shadow-lg shadow-blue-500/20">
              {loading ? 'Searching...' : 'View History'}
            </Button>
          </form>
        </div>

        {data && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* User Info Card */}
            <div className="bg-blue-600 rounded-3xl p-8 text-white shadow-xl shadow-blue-600/20 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center space-x-6">
                <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-3xl font-black">
                  {data.name.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-3xl font-black tracking-tight">{data.name}</h2>
                  <div className="flex items-center space-x-4 mt-2 text-blue-100 font-medium">
                    <span className="flex items-center"><User size={16} className="mr-1.5" /> {empId}</span>
                    <span className="flex items-center"><Building2 size={16} className="mr-1.5" /> {data.department}</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-blue-100 text-sm font-bold uppercase tracking-widest mb-1">Status</p>
                <div className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-xl inline-block font-black text-xl">
                  {data.history[0]?.status === 'IN' ? 'Currently IN' : 'Currently OUT'}
                </div>
              </div>
            </div>

            {/* History Table */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-lg font-black text-slate-800 uppercase tracking-widest">Recent Activity</h3>
                <span className="text-xs font-bold text-slate-400 bg-slate-50 px-3 py-1 rounded-full uppercase tracking-wider">Last 50 Records</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50/50">
                    <tr>
                      <th className="px-8 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Event</th>
                      <th className="px-8 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Camera / Location</th>
                      <th className="px-8 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {data.history.map((log, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-8 py-6">
                          <div className="flex items-center space-x-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                              log.status === 'IN' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                            }`}>
                              <Clock size={20} />
                            </div>
                            <span className={`font-black text-lg ${
                              log.status === 'IN' ? 'text-emerald-600' : 'text-rose-600'
                            }`}>
                              {log.status}
                            </span>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex items-center text-slate-600 font-bold">
                            <MapPin size={18} className="mr-2 text-slate-400" />
                            {log.camera}
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <p className="text-slate-800 font-bold">{new Date(log.timestamp).toLocaleDateString()}</p>
                          <p className="text-slate-400 text-sm font-medium">{new Date(log.timestamp).toLocaleTimeString()}</p>
                        </td>
                      </tr>
                    ))}
                    {data.history.length === 0 && (
                      <tr>
                        <td colSpan="3" className="px-8 py-12 text-center text-slate-400 font-medium italic">
                          No attendance records found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {!data && !loading && (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
             <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                <Search size={32} />
             </div>
             <p className="text-slate-400 font-medium">Search for your ID to view records.</p>
          </div>
        )}
      </div>
    </div>
  )
}
