import { useState, useEffect } from 'react'
import { Save, Mail, Clock, Building, ShieldCheck, UserCheck } from 'lucide-react'
import { Button } from '../components/ui/Button'
import axios from 'axios'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

export function SettingsPage() {
  const queryClient = useQueryClient()
  const [formData, setFormData] = useState({
    org_name: '',
    late_threshold_minutes: 15,
    office_start_time: '09:00',
    office_end_time: '18:00',
    allow_remote_enroll: true,
    require_approval: true,
    smtp_host: '',
    smtp_port: 587,
    smtp_user: '',
    smtp_pass: '',
    sender_email: ''
  })

  const { data: settings, isLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      const res = await axios.get('/api/settings/')
      return res.data
    }
  })

  useEffect(() => {
    if (settings) {
      setFormData(settings)
    }
  }, [settings])

  const mutation = useMutation({
    mutationFn: (newSettings) => axios.patch('/api/settings/', newSettings),
    onSuccess: () => {
      queryClient.invalidateQueries(['settings'])
      alert('Settings updated successfully!')
    }
  })

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (type === 'number' ? parseInt(value) : value)
    }))
  }

  if (isLoading) return <div className="p-8 text-slate-400">Loading settings...</div>

  return (
    <div className="max-w-4xl space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Organization Details */}
        <section className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center space-x-3 text-blue-600">
            <Building size={24} />
            <h3 className="text-xl font-bold text-slate-800">Organization</h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-slate-500 mb-2">Company Name</label>
              <input 
                name="org_name"
                value={formData.org_name}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                placeholder="Enter company name"
              />
            </div>
          </div>
        </section>

        {/* Attendance Rules */}
        <section className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center space-x-3 text-amber-500">
            <Clock size={24} />
            <h3 className="text-xl font-bold text-slate-800">Work Hours</h3>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-500 mb-2">Start Time</label>
              <input 
                type="time"
                name="office_start_time"
                value={formData.office_start_time}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-500 mb-2">End Time</label>
              <input 
                type="time"
                name="office_end_time"
                value={formData.office_end_time}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-bold text-slate-500 mb-2">Late Threshold (Minutes)</label>
              <input 
                type="number"
                name="late_threshold_minutes"
                value={formData.late_threshold_minutes}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              />
            </div>
          </div>
        </section>

        {/* Enrollment Settings */}
        <section className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center space-x-3 text-emerald-500">
            <UserCheck size={24} />
            <h3 className="text-xl font-bold text-slate-800">Enrollment</h3>
          </div>
          
          <div className="space-y-4">
            <label className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl cursor-pointer hover:bg-slate-100 transition-colors">
              <span className="font-bold text-slate-700">Allow Remote Enrollment</span>
              <input 
                type="checkbox"
                name="allow_remote_enroll"
                checked={formData.allow_remote_enroll}
                onChange={handleChange}
                className="w-5 h-5 rounded accent-blue-600"
              />
            </label>
            <label className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl cursor-pointer hover:bg-slate-100 transition-colors">
              <span className="font-bold text-slate-700">Require Admin Approval</span>
              <input 
                type="checkbox"
                name="require_approval"
                checked={formData.require_approval}
                onChange={handleChange}
                className="w-5 h-5 rounded accent-blue-600"
              />
            </label>
          </div>
        </section>

        {/* SMTP Configuration */}
        <section className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center space-x-3 text-rose-500">
            <Mail size={24} />
            <h3 className="text-xl font-bold text-slate-800">Email Server (SMTP)</h3>
          </div>
          
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-bold text-slate-500 mb-2">SMTP Host</label>
                <input 
                  name="smtp_host"
                  value={formData.smtp_host || ''}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-rose-500 outline-none transition-all"
                  placeholder="smtp.gmail.com"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-500 mb-2">Port</label>
                <input 
                  type="number"
                  name="smtp_port"
                  value={formData.smtp_port || ''}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-rose-500 outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-500 mb-2">SMTP User</label>
              <input 
                name="smtp_user"
                value={formData.smtp_user || ''}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-rose-500 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-500 mb-2">SMTP Password</label>
              <input 
                type="password"
                name="smtp_pass"
                value={formData.smtp_pass || ''}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-rose-500 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-500 mb-2">Sender Email</label>
              <input 
                name="sender_email"
                value={formData.sender_email || ''}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-rose-500 outline-none transition-all"
                placeholder="noreply@company.com"
              />
            </div>
          </div>

          <Button 
            variant="outline" 
            className="w-full rounded-xl py-6 border-rose-100 hover:bg-rose-50 text-rose-600 font-bold" 
            onClick={async () => {
              try {
                const res = await axios.post('/api/settings/test-email')
                alert(res.data.message)
              } catch (err) {
                alert(err.response?.data?.detail || 'Failed to test email')
              }
            }}
          >
            Test SMTP Connection
          </Button>
        </section>
      </div>

      <div className="flex justify-end">
        <Button 
          onClick={() => mutation.mutate(formData)}
          className="px-12 py-4 rounded-2xl font-black shadow-xl shadow-blue-200 hover:scale-105 active:scale-95 transition-all"
        >
          <Save size={20} className="mr-2" /> Save All Changes
        </Button>
      </div>
    </div>
  )
}
