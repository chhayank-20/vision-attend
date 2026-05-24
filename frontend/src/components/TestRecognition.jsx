import { useState, useRef } from 'react'
import { Upload, Image as ImageIcon, Loader2, CheckCircle2, XCircle, AlertCircle } from 'lucide-react'
import axios from 'axios'
import { useAuthStore } from '../store/useAuthStore'
import { Button } from './ui/Button'

export function TestRecognition() {
  const [selectedFile, setSelectedFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState(null)
  const fileInputRef = useRef(null)
  const { token } = useAuthStore()

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setSelectedFile(file)
      setPreviewUrl(URL.createObjectURL(file))
      setResult(null)
    }
  }

  const handleTest = async () => {
    if (!selectedFile) return

    setIsLoading(true)
    setResult(null)

    const formData = new FormData()
    formData.append('file', selectedFile)

    try {
      const response = await axios.post('/api/cameras/test-recognition', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        }
      })
      setResult(response.data)
    } catch (error) {
      console.error("Test recognition error:", error)
      setResult({
        error: true,
        message: error.response?.data?.detail || "An error occurred during recognition."
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleReset = () => {
    setSelectedFile(null)
    setPreviewUrl(null)
    setResult(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
          <Upload size={20} />
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-800">Test Model Offline</h3>
          <p className="text-sm text-slate-500">Upload a single image to test the recognition engine directly.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            ref={fileInputRef}
            onChange={handleFileChange}
          />
          
          {!previewUrl ? (
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-200 rounded-2xl h-64 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 hover:border-blue-300 transition-all group"
            >
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-blue-100 group-hover:text-blue-500 mb-4 transition-colors">
                <ImageIcon size={32} />
              </div>
              <p className="font-bold text-slate-700">Click to upload image</p>
              <p className="text-sm text-slate-400 mt-1">JPEG, PNG</p>
            </div>
          ) : (
            <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 h-64">
              <img src={previewUrl} alt="Preview" className="w-full h-full object-contain" />
              <div className="absolute top-4 right-4 space-x-2">
                <Button variant="outline" size="sm" onClick={handleReset} className="bg-white/90 shadow-sm">
                  Change
                </Button>
              </div>
            </div>
          )}

          <div className="mt-6">
            <Button 
              className="w-full h-12 rounded-xl font-bold text-base"
              disabled={!selectedFile || isLoading}
              onClick={handleTest}
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin mr-2" size={20} />
                  Processing Image...
                </>
              ) : (
                'Run Recognition Test'
              )}
            </Button>
          </div>
        </div>

        <div className="flex flex-col justify-center">
          <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4">Results</h4>
          
          {!result && !isLoading && (
            <div className="bg-slate-50 rounded-2xl p-8 text-center border border-slate-100 h-full flex flex-col items-center justify-center">
              <p className="text-slate-400">Upload an image and run the test to see results here.</p>
            </div>
          )}

          {isLoading && (
            <div className="bg-blue-50/50 rounded-2xl p-8 border border-blue-100 h-full flex flex-col items-center justify-center">
              <Loader2 className="animate-spin text-blue-500 mb-4" size={32} />
              <p className="text-blue-600 font-medium">Extracting facial embeddings...</p>
            </div>
          )}

          {result && (
            <div className={`rounded-2xl p-6 border h-full flex flex-col justify-center ${
              result.error ? 'bg-rose-50 border-rose-100' :
              result.recognized ? 'bg-emerald-50 border-emerald-100' : 'bg-amber-50 border-amber-100'
            }`}>
              
              {result.error ? (
                <div className="flex flex-col items-center text-center">
                  <XCircle className="text-rose-500 mb-4" size={48} />
                  <h4 className="text-xl font-bold text-rose-700 mb-2">Test Failed</h4>
                  <p className="text-rose-600">{result.message}</p>
                </div>
              ) : result.recognized ? (
                <div className="flex flex-col items-center text-center">
                  <CheckCircle2 className="text-emerald-500 mb-4" size={48} />
                  <h4 className="text-xl font-bold text-emerald-700 mb-2">Match Found!</h4>
                  <div className="w-full bg-white rounded-xl p-4 mt-4 text-left border border-emerald-100 shadow-sm">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-slate-500 text-sm">Recognized User:</span>
                      <span className="font-bold text-slate-800">{result.name}</span>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-slate-500 text-sm">User ID:</span>
                      <span className="font-mono text-slate-600">{result.user_id}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 text-sm">Distance Score:</span>
                      <span className="text-emerald-600 font-bold">{result.distance.toFixed(4)}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center text-center">
                  <AlertCircle className="text-amber-500 mb-4" size={48} />
                  <h4 className="text-xl font-bold text-amber-700 mb-2">No Match</h4>
                  <p className="text-amber-600">{result.message}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
