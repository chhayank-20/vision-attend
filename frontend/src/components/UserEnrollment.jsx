import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog'
import { Button } from './ui/Button'
import { Input } from './ui/Input'
import { FaceCapture } from './FaceCapture'
import { UserPlus, Loader2, ArrowRight, UserCircle2 } from 'lucide-react'
import axios from 'axios'

export function UserEnrollment({ onComplete }) {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    name: '',
    employee_id: '',
    email: '',
    department: '',
  })
  const [capturedImage, setCapturedImage] = useState(null)
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)

  const handleEnroll = async () => {
    setLoading(true)
    try {
      // 1. Create User
      const userRes = await axios.post('/api/users/', formData)
      const userId = userRes.data.id

      // 2. Upload Embedding Image
      const blob = await fetch(capturedImage).then((r) => r.blob())
      const imgData = new FormData()
      imgData.append('file', blob, 'face.jpg')

      await axios.post(`/api/users/${userId}/enroll`, imgData)

      setOpen(false)
      onComplete?.()
      reset()
    } catch (err) {
      alert(err.response?.data?.detail || 'Enrollment failed')
    } finally {
      setLoading(false)
    }
  }

  const reset = () => {
    setStep(1)
    setFormData({ name: '', employee_id: '', email: '', department: '' })
    setCapturedImage(null)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) reset()
        setOpen(v)
      }}
    >
      <DialogTrigger asChild>
        <Button className="bg-blue-600 hover:bg-blue-700 font-bold rounded-xl shadow-lg shadow-blue-100 h-11 px-6">
          <UserPlus className="mr-2" size={18} /> New Enrollment
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl rounded-[2rem] p-10 border-none shadow-2xl">
        <DialogHeader className="mb-8">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-4">
            <UserCircle2 size={28} />
          </div>
          <DialogTitle className="text-3xl font-black text-slate-800 tracking-tight">
            {step === 1 ? 'User Details' : 'Face Capture'}
          </DialogTitle>
          <p className="text-slate-400 font-medium">
            {step === 1
              ? 'Enter the personal information for the new enrollment.'
              : 'Take a clear photo of the user for AI recognition.'}
          </p>
        </DialogHeader>

        {step === 1 ? (
          <div className="space-y-8 mt-2">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">
                  Full Name
                </label>
                <Input
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="rounded-2xl h-12 border-slate-200 focus:border-blue-500 transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">
                  Employee ID
                </label>
                <Input
                  placeholder="EMP001"
                  value={formData.employee_id}
                  onChange={(e) =>
                    setFormData({ ...formData, employee_id: e.target.value })
                  }
                  className="rounded-2xl h-12 border-slate-200 focus:border-blue-500 transition-all"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">
                  Email
                </label>
                <Input
                  type="email"
                  placeholder="john@company.com"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="rounded-2xl h-12 border-slate-200 focus:border-blue-500 transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">
                  Department
                </label>
                <Input
                  placeholder="Engineering"
                  value={formData.department}
                  onChange={(e) =>
                    setFormData({ ...formData, department: e.target.value })
                  }
                  className="rounded-2xl h-12 border-slate-200 focus:border-blue-500 transition-all"
                />
              </div>
            </div>
            <Button
              onClick={() => setStep(2)}
              className="w-full h-14 rounded-2xl bg-slate-900 hover:bg-black text-lg font-bold shadow-xl shadow-slate-200 transition-all hover:scale-[1.02] active:scale-95"
            >
              Next Step: Face Capture <ArrowRight className="ml-2" size={20} />
            </Button>
          </div>
        ) : (
          <div className="space-y-8 mt-2">
            <FaceCapture onCapture={setCapturedImage} />
            <div className="flex space-x-4">
              <Button
                variant="outline"
                onClick={() => setStep(1)}
                className="flex-1 h-14 rounded-2xl font-bold border-slate-200 hover:bg-slate-50"
              >
                Back
              </Button>
              <Button
                onClick={handleEnroll}
                disabled={!capturedImage || loading}
                className="flex-[2] h-14 rounded-2xl bg-blue-600 hover:bg-blue-700 text-lg font-bold shadow-xl shadow-blue-100 transition-all hover:scale-[1.02] active:scale-95"
              >
                {loading ? (
                  <Loader2 className="animate-spin mr-2" />
                ) : (
                  'Finalize & Enroll'
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
