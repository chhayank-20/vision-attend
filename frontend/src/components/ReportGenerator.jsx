import { useState } from 'react'
import { Button } from './ui/Button'
import { Input } from './ui/Input'
import { FileText, Download, Calendar, Loader2, FileSpreadsheet, FileJson } from 'lucide-react'

export function ReportGenerator() {
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0])
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0])
  const [loading, setLoading] = useState(null)

  const downloadReport = (format) => {
    setLoading(format)
    const url = `/api/analytics/export?start_date=${startDate}&end_date=${endDate}&format=${format}`
    // Using a hidden anchor to trigger download without opening new tabs for CSV/Excel
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `VisionAttend_Report_${startDate}_${format}`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setTimeout(() => setLoading(null), 2000)
  }

  return (
    <div className="space-y-8">
      <div className="bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-100/50">
        <div className="flex items-center space-x-4 mb-10">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                <FileText size={24} />
            </div>
            <div>
                <h3 className="text-2xl font-black text-slate-800 tracking-tight">Export Intelligence</h3>
                <p className="text-slate-400 font-medium">Select a period and format to generate your attendance report.</p>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
            <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Period Start</label>
                <div className="relative">
                    <Calendar className="absolute left-4 top-3.5 text-slate-400" size={18} />
                    <Input 
                      type="date" 
                      value={startDate} 
                      onChange={e => setStartDate(e.target.value)} 
                      className="pl-12 h-12 rounded-2xl border-slate-200 focus:border-blue-500 transition-all font-bold text-slate-700" 
                    />
                </div>
            </div>
            <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Period End</label>
                <div className="relative">
                    <Calendar className="absolute left-4 top-3.5 text-slate-400" size={18} />
                    <Input 
                      type="date" 
                      value={endDate} 
                      onChange={e => setEndDate(e.target.value)} 
                      className="pl-12 h-12 rounded-2xl border-slate-200 focus:border-blue-500 transition-all font-bold text-slate-700" 
                    />
                </div>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FormatCard 
                icon={<FileText className="text-rose-500" />}
                label="Professional PDF"
                description="Best for official archival and physical prints."
                onClick={() => downloadReport('pdf')}
                isLoading={loading === 'pdf'}
                color="hover:border-rose-200 hover:bg-rose-50/30"
            />
            <FormatCard 
                icon={<FileSpreadsheet className="text-emerald-500" />}
                label="Excel Spreadsheet"
                description="Best for payroll processing and data analysis."
                onClick={() => downloadReport('xlsx')}
                isLoading={loading === 'xlsx'}
                color="hover:border-emerald-200 hover:bg-emerald-50/30"
            />
            <FormatCard 
                icon={<FileJson className="text-blue-500" />}
                label="CSV Raw Data"
                description="Best for importing into 3rd party HR software."
                onClick={() => downloadReport('csv')}
                isLoading={loading === 'csv'}
                color="hover:border-blue-200 hover:bg-blue-50/30"
            />
        </div>
      </div>
      
      <div className="p-8 bg-blue-600 rounded-[2.5rem] text-white flex items-center justify-between shadow-2xl shadow-blue-200">
          <div>
              <h4 className="text-lg font-bold">Need custom automation?</h4>
              <p className="text-blue-100 text-sm">Schedule weekly reports to be sent directly to your email.</p>
          </div>
          <Button className="bg-white text-blue-600 hover:bg-blue-50 font-bold rounded-2xl px-8 h-12">
              Configure Alerts
          </Button>
      </div>
    </div>
  )
}

function FormatCard({ icon, label, description, onClick, isLoading, color }) {
    return (
        <button 
            onClick={onClick}
            disabled={isLoading}
            className={`flex flex-col items-start p-6 rounded-[2rem] border border-slate-100 text-left transition-all duration-300 group ${color}`}
        >
            <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                {isLoading ? <Loader2 className="animate-spin text-slate-400" size={20} /> : icon}
            </div>
            <h4 className="font-black text-slate-800 text-sm mb-1 uppercase tracking-tight">{label}</h4>
            <p className="text-xs text-slate-400 font-medium leading-relaxed">{description}</p>
            <div className="mt-4 flex items-center text-blue-600 font-bold text-xs group-hover:translate-x-1 transition-transform">
                Generate Report <Download size={14} className="ml-2" />
            </div>
        </button>
    )
}
