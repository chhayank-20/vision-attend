import { useState, useRef } from 'react'
import { Camera, CheckCircle2, User, Mail, Briefcase, Hash, Send } from 'lucide-react'
import { Button } from '../components/ui/Button'
import axios from 'axios'
import { FaceCapture } from '../components/FaceCapture'
import { toast } from 'sonner'
import { base64ToBlob } from '../utils/file_utils'

export function RemoteEnroll() {
  const [step, setStep] = useState(1) // 1: Info, 2: Capture, 3: Success
  const [formData, setFormData] = useState({
    employee_id: '',
    name: '',
    email: '',
    department: ''
  })
  const [capturedImage, setCapturedImage] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleCapture = (image) => {
    setCapturedImage(image)
    setStep(2)
  }

  const handleSubmit = async () => {
    setLoading(true)
    setError('')
    try {
      const data = new FormData()
      data.append('employee_id', formData.employee_id)
      data.append('name', formData.name)
      data.append('email', formData.email)
      data.append('department', formData.department)
      
      // Convert base64 to blob using robust utility
      const blob = base64ToBlob(capturedImage)
      if (!blob) throw new Error("Failed to process image capture")
      data.append('file', blob, 'enrollment.jpg')

      await axios.post('/api/enrollment/submit', data)
      toast.success("Enrollment request submitted!")
      setStep(3)
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to submit enrollment. Please check your ID.')
    } finally {
      setLoading(false)
    }
  }

  if (step === 3) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="bg-white p-12 rounded-3xl shadow-xl shadow-slate-200 text-center space-y-6 max-w-md animate-in zoom-in duration-500">
          <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 size={48} />
          </div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">Request Submitted!</h2>
          <p className="text-slate-500 font-medium leading-relaxed">
            Thank you, {formData.name.split(' ')[0]}. Your face data has been sent for approval. You will be notified once you can start clocking in.
          </p>
          <Button onClick={() => window.location.reload()} className="w-full rounded-2xl py-4 font-bold">Done</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 md:p-12">
      <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl shadow-blue-100 overflow-hidden flex flex-col md:flex-row">
        
        {/* Left Branding Panel */}
        <div className="bg-blue-600 p-12 text-white md:w-1/3 flex flex-col justify-between overflow-hidden relative">
            <div className="relative z-10">
                <h1 className="text-3xl font-black mb-2">VisionAttend</h1>
                <p className="text-blue-100 text-sm font-medium opacity-80 uppercase tracking-widest">Enrollment Portal</p>
            </div>
            
            <div className="mt-8 space-y-8 relative z-10">
                <div className={`transition-all duration-500 ${step === 1 ? 'scale-110 opacity-100' : 'opacity-40 scale-100'}`}>
                    <div className="flex items-center space-x-3 mb-2">
                        <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-black">1</div>
                        <span className="font-bold">Information</span>
                    </div>
                </div>
                <div className={`transition-all duration-500 ${step === 2 ? 'scale-110 opacity-100' : 'opacity-40 scale-100'}`}>
                    <div className="flex items-center space-x-3 mb-2">
                        <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-black">2</div>
                        <span className="font-bold">Face Capture</span>
                    </div>
                </div>
            </div>

            <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-blue-500 rounded-full blur-3xl opacity-50"></div>
        </div>

        {/* Main Form Area */}
        <div className="p-8 md:p-12 flex-1 relative bg-white">
          {error && (
            <div className="absolute top-8 left-8 right-8 p-4 bg-rose-50 border border-rose-100 text-rose-600 rounded-2xl text-sm font-bold animate-in slide-in-from-top duration-300">
              {error}
            </div>
          )}

          {step === 1 ? (
            <div className="space-y-8 animate-in fade-in slide-in-from-right duration-500">
              <div className="space-y-2">
                <h2 className="text-3xl font-black text-slate-800">Your Details</h2>
                <p className="text-slate-400 font-medium">Please enter your official employee information.</p>
              </div>

              <div className="space-y-4">
                <div className="relative group">
                  <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={18} />
                  <input 
                    name="employee_id"
                    placeholder="Employee ID"
                    onChange={handleChange}
                    className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-blue-500/20 outline-none transition-all font-bold placeholder:text-slate-300"
                  />
                </div>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={18} />
                  <input 
                    name="name"
                    placeholder="Full Name"
                    onChange={handleChange}
                    className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-blue-500/20 outline-none transition-all font-bold placeholder:text-slate-300"
                  />
                </div>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={18} />
                  <input 
                    name="email"
                    type="email"
                    placeholder="Work Email"
                    onChange={handleChange}
                    className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-blue-500/20 outline-none transition-all font-bold placeholder:text-slate-300"
                  />
                </div>
                <div className="relative group">
                  <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={18} />
                  <input 
                    name="department"
                    placeholder="Department"
                    onChange={handleChange}
                    className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-blue-500/20 outline-none transition-all font-bold placeholder:text-slate-300"
                  />
                </div>
              </div>

              <Button 
                onClick={() => setStep(2)} 
                disabled={!formData.employee_id || !formData.name}
                className="w-full py-4 rounded-2xl font-black shadow-lg shadow-blue-200"
              >
                Proceed to Capture <Camera size={18} className="ml-2" />
              </Button>
            </div>
          ) : (
            <div className="space-y-8 animate-in fade-in slide-in-from-left duration-500">
               <div className="space-y-2 text-center md:text-left">
                <h2 className="text-3xl font-black text-slate-800">Face Capture</h2>
                <p className="text-slate-400 font-medium">Position yourself in a well-lit area.</p>
              </div>

              <div className="rounded-[2rem] overflow-hidden border-4 border-slate-50 shadow-inner bg-slate-900 aspect-square relative">
                {!capturedImage ? (
                  <FaceCapture onCapture={setCapturedImage} />
                ) : (
                  <img src={capturedImage} className="w-full h-full object-cover" />
                )}
              </div>

              <div className="flex flex-col md:flex-row gap-4">
                {capturedImage && (
                  <Button variant="outline" className="flex-1 rounded-2xl py-4 font-bold border-slate-200" onClick={() => setCapturedImage(null)}>
                    Retake Photo
                  </Button>
                )}
                <Button 
                  onClick={handleSubmit} 
                  loading={loading}
                  disabled={!capturedImage}
                  className="flex-1 py-4 rounded-2xl font-black shadow-lg shadow-blue-200"
                >
                  {loading ? 'Submitting...' : 'Submit Enrollment'} <Send size={18} className="ml-2" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
