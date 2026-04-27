import { formatDistanceToNow } from 'date-fns'
import { Activity, Clock, MapPin, User } from 'lucide-react'

export function LiveActivity({ logs }) {
  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full max-h-[500px]">
      <div className="p-6 border-b border-slate-100 flex items-center justify-between shrink-0 bg-slate-50/50">
        <div className="flex items-center space-x-2">
            <Activity size={16} className="text-blue-600" />
            <h3 className="font-black text-slate-800 uppercase tracking-widest text-[10px]">Live Activity Feed</h3>
        </div>
        <span className="flex items-center text-[9px] font-black text-emerald-500 bg-white border border-emerald-100 px-2 py-0.5 rounded-full shadow-sm">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-2 animate-pulse"></span> STREAMING
        </span>
      </div>
      
      <div className="overflow-y-auto flex-1 divide-y divide-slate-50 custom-scrollbar">
        {(!logs || logs.length === 0) ? (
            <div className="p-12 text-center">
                <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                    <Clock size={24} />
                </div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No activity yet</p>
                <p className="text-[10px] text-slate-300 mt-1">Wait for a recognition event...</p>
            </div>
        ) : (
            logs.map(log => (
                <div key={log.id} className="p-5 hover:bg-slate-50 transition-colors group">
                    <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 group-hover:scale-110 transition-transform">
                                <User size={16} />
                            </div>
                            <div>
                                <p className="text-sm font-black text-slate-800 leading-none mb-1">{log.user_name}</p>
                                <div className="flex items-center text-[10px] text-slate-400 font-bold uppercase tracking-tight">
                                    <MapPin size={10} className="mr-1" /> {log.camera_name}
                                </div>
                            </div>
                        </div>
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-md ${
                            log.status === 'IN' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                        }`}>
                            {log.status}
                        </span>
                    </div>
                    <p className="text-[10px] text-slate-400 text-right font-medium">
                        {formatDistanceToNow(new Date(log.timestamp), { addSuffix: true })}
                    </p>
                </div>
            ))
        )}
      </div>
      
      <div className="p-4 bg-slate-50 border-t border-slate-100 shrink-0">
          <button className="w-full py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-bold text-slate-500 hover:bg-slate-100 transition-colors uppercase tracking-widest shadow-sm">
              View All History
          </button>
      </div>
    </div>
  )
}
