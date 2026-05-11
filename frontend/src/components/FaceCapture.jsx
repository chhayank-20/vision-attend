import { useRef, useState, useCallback } from 'react'
import Webcam from 'react-webcam'
import { Button } from './ui/Button'
import { Camera, RefreshCw, CheckCircle } from 'lucide-react'

export function FaceCapture({ onCapture }) {
  const webcamRef = useRef(null)
  const [imgSrc, setImgSrc] = useState(null)

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current.getScreenshot()
    setImgSrc(imageSrc)
    onCapture(imageSrc)
  }, [webcamRef, onCapture])

  const retake = () => {
    setImgSrc(null)
    onCapture(null)
  }

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-slate-900 shadow-2xl border-4 border-white">
        {!imgSrc ? (
          <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            className="w-full h-full object-cover"
            videoConstraints={{ facingMode: 'user' }}
          />
        ) : (
          <img src={imgSrc} className="w-full h-full object-cover" />
        )}

        <div className="absolute inset-0 border-[40px] border-black/10 pointer-events-none flex items-center justify-center">
          <div className="w-64 h-80 border-2 border-dashed border-white/80 rounded-[100px] flex items-center justify-center">
            {!imgSrc && (
              <div className="text-white/50 text-xs font-bold uppercase tracking-widest text-center px-4">
                Position face within the frame
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex space-x-3">
        {!imgSrc ? (
          <Button
            onClick={capture}
            className="bg-blue-600 hover:bg-blue-700 h-12 px-8 rounded-xl font-bold transition-all hover:scale-105 active:scale-95"
          >
            <Camera className="mr-2" size={20} /> Capture Face
          </Button>
        ) : (
          <>
            <Button
              variant="outline"
              onClick={retake}
              className="h-12 px-6 rounded-xl font-bold"
            >
              <RefreshCw className="mr-2" size={20} /> Retake
            </Button>
            <div className="flex items-center px-4 bg-emerald-50 text-emerald-600 rounded-xl font-bold border border-emerald-100">
              <CheckCircle size={20} className="mr-2" /> Face Ready
            </div>
          </>
        )}
      </div>
    </div>
  )
}
