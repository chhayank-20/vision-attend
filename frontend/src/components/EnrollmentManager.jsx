import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { Check, X, User, Clock, Image as ImageIcon } from 'lucide-react'
import { Button } from './ui/Button'

export function EnrollmentManager() {
  const queryClient = useQueryClient()
  
  const { data: requests, isLoading } = useQuery({
    queryKey: ['enrollment-requests'],
    queryFn: async () => {
      const res = await axios.get('/api/enrollment/requests')
      return res.data
    }
  })

  const approveMutation = useMutation({
    mutationFn: (id) => axios.post(`/api/enrollment/requests/${id}/approve`),
    onSuccess: () => {
      queryClient.invalidateQueries(['enrollment-requests'])
      queryClient.invalidateQueries(['users'])
    }
  })

  const rejectMutation = useMutation({
    mutationFn: (id) => axios.post(`/api/enrollment/requests/${id}/reject`),
    onSuccess: () => {
      queryClient.invalidateQueries(['enrollment-requests'])
    }
  })

  if (isLoading) return <div className="p-4 text-slate-400">Loading requests...</div>
  if (!requests?.length) return (
    <div className="bg-slate-50 p-12 rounded-[2rem] border border-dashed border-slate-200 text-center space-y-2">
        <p className="text-slate-400 font-bold">No pending enrollment requests.</p>
        <p className="text-xs text-slate-300">Remote requests will appear here for your approval.</p>
    </div>
  )

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {requests.map((req) => (
        <div key={req.id} className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col group transition-all hover:shadow-md">
          <div className="aspect-[4/3] bg-slate-100 relative overflow-hidden">
            {/* Note: In a real app, you'd serve the image via an authenticated endpoint */}
            <img src={`/api/users/face-image?path=${req.image_path}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={req.name} />
            <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1.5 rounded-full shadow-sm flex items-center space-x-2">
                <Clock size={12} className="text-blue-500" />
                <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Pending Approval</span>
            </div>
          </div>
          
          <div className="p-6 space-y-4 flex-1 flex flex-col">
            <div className="flex-1">
                <h4 className="text-lg font-black text-slate-800">{req.name}</h4>
                <div className="flex items-center space-x-2 text-slate-400 mt-1">
                    <User size={14} />
                    <span className="text-xs font-bold font-mono">{req.employee_id}</span>
                    <span className="w-1 h-1 rounded-full bg-slate-200"></span>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">{req.department}</span>
                </div>
            </div>

            <div className="flex space-x-2 pt-2">
              <button 
                onClick={() => rejectMutation.mutate(req.id)}
                className="flex-1 bg-slate-50 text-slate-500 hover:bg-rose-50 hover:text-rose-600 p-3 rounded-xl transition-all flex items-center justify-center"
                title="Reject"
              >
                <X size={20} />
              </button>
              <button 
                onClick={() => approveMutation.mutate(req.id)}
                className="flex-[2] bg-blue-600 text-white hover:bg-blue-700 p-3 rounded-xl shadow-lg shadow-blue-200 transition-all flex items-center justify-center font-bold"
              >
                <Check size={20} className="mr-2" /> Approve
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
