import { useState } from 'react'
import { Upload, FileCheck, Loader2 } from 'lucide-react'
import axios from 'axios'
import { Button } from './ui/Button'

export function BulkUpload() {
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState(null)

  const handleUpload = async () => {
    if (!file) return
    setLoading(true)
    setMessage(null)
    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await axios.post('/api/users/bulk-upload', formData)
      setMessage({ type: 'success', text: res.data.message })
      setFile(null)
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.detail || 'Upload failed' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50 hover:bg-slate-50 transition-colors">
      <div className="flex flex-col items-center text-center">
        <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-6 shadow-sm">
          {file ? <FileCheck size={32} /> : <Upload size={32} />}
        </div>
        <h4 className="text-xl font-bold text-slate-800 mb-2">Bulk User Enrollment</h4>
        <p className="text-sm text-slate-500 max-w-sm mb-8">
          Quickly enroll hundreds of users by uploading an Excel or CSV file. 
          Make sure your columns match: <code className="bg-slate-200 px-1 rounded">Name</code>, 
          <code className="bg-slate-200 px-1 rounded">Employee ID</code>, <code className="bg-slate-200 px-1 rounded">Email</code>.
        </p>
        
        <input 
          type="file" 
          id="bulk-file" 
          className="hidden" 
          accept=".csv, .xlsx, .xls"
          onChange={(e) => setFile(e.target.files[0])}
        />
        
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={() => document.getElementById('bulk-file').click()} className="bg-white">
            {file ? 'Change File' : 'Select Document'}
          </Button>
          {file && (
            <Button onClick={handleUpload} disabled={loading} className="bg-blue-600 hover:bg-blue-700">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Enroll {file.name}
            </Button>
          )}
        </div>

        {message && (
          <div className={`mt-6 p-3 rounded-lg flex items-center space-x-2 text-sm font-medium ${
            message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-100'
          }`}>
            <span>{message.text}</span>
          </div>
        )}
      </div>
    </div>
  )
}
