import { useRef, useState, useEffect } from 'react'
import { Button } from './ui/Button'
import { Save, RefreshCw, Maximize2 } from 'lucide-react'
import axios from 'axios'

export function CameraROIEditor({ camera, onSave }) {
  const containerRef = useRef(null)
  const [startPos, setStartPos] = useState(null)
  const [currentROI, setCurrentROI] = useState(null)
  const [isDrawing, setIsDrawing] = useState(false)

  // Initialize ROI from camera data
  useEffect(() => {
    if (camera.roi_json) {
      try {
        setCurrentROI(JSON.parse(camera.roi_json))
      } catch (e) {
        setCurrentROI(null)
      }
    } else {
      setCurrentROI(null)
    }
  }, [camera])

  const handleMouseDown = (e) => {
    const rect = containerRef.current.getBoundingClientRect()
    setStartPos({ x: e.clientX - rect.left, y: e.clientY - rect.top })
    setIsDrawing(true)
  }

  const handleMouseMove = (e) => {
    if (!isDrawing) return
    const rect = containerRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    
    setCurrentROI({
      x: Math.round(Math.min(startPos.x, x)),
      y: Math.round(Math.min(startPos.y, y)),
      w: Math.round(Math.abs(x - startPos.x)),
      h: Math.round(Math.abs(y - startPos.y))
    })
  }

  const handleMouseUp = () => setIsDrawing(false)

  const saveROI = async () => {
    // Note: In production, we should calculate scale factor between display size and stream resolution.
    // For this demo, we assume the display container matches the expected coordinate system.
    try {
      await axios.patch(`/api/cameras/${camera.id}`, {
        roi_json: JSON.stringify(currentROI)
      })
      onSave?.()
    } catch (err) {
      alert("Failed to save ROI configuration")
    }
  }

  return (
    <div className="space-y-6">
      <div 
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        className="relative w-full aspect-video bg-slate-900 rounded-2xl overflow-hidden cursor-crosshair select-none border-4 border-slate-800 shadow-2xl"
      >
        <img 
          src={`/api/cameras/${camera.id}/stream`} 
          className="w-full h-full object-cover pointer-events-none" 
          alt="Camera Stream"
        />
        
        {currentROI && (
          <div 
            className="absolute border-2 border-blue-400 bg-blue-500/10 shadow-[0_0_0_9999px_rgba(0,0,0,0.6)] backdrop-blur-[1px]"
            style={{
              left: currentROI.x,
              top: currentROI.y,
              width: currentROI.w,
              height: currentROI.h
            }}
          >
            <div className="absolute -top-6 left-0 bg-blue-500 text-white text-[10px] font-black uppercase px-2 py-1 rounded-t-md tracking-widest">
              Active Recognition Zone
            </div>
          </div>
        )}

        {!currentROI && !isDrawing && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 pointer-events-none">
            <div className="text-center">
              <Maximize2 size={48} className="text-white/20 mx-auto mb-4" />
              <p className="text-white/60 font-bold uppercase tracking-widest text-sm">Click and Drag to Draw ROI</p>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
        <div className="text-sm">
          <p className="font-black text-slate-800 uppercase tracking-widest text-xs mb-1">Configuration Helper</p>
          <p className="text-slate-500">Faces detected outside the blue box will be ignored to save resources.</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" onClick={() => setCurrentROI(null)} className="h-10 px-4 rounded-lg font-bold border-slate-300">
            <RefreshCw className="mr-2" size={16} /> Reset
          </Button>
          <Button onClick={saveROI} className="bg-blue-600 hover:bg-blue-700 h-10 px-6 rounded-lg font-bold shadow-lg shadow-blue-100 transition-all hover:scale-105">
            <Save className="mr-2" size={16} /> Save ROI
          </Button>
        </div>
      </div>
    </div>
  )
}
