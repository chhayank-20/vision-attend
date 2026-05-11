import { useState } from 'react'
import { useAuthStore } from '../store/useAuthStore'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Loader2, ShieldCheck } from 'lucide-react'
import axios from 'axios'

export function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const setAuth = useAuthStore((state) => state.setAuth)

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const formData = new FormData()
      formData.append('username', username)
      formData.append('password', password)

      const res = await axios.post('/api/auth/login', formData)
      setAuth(res.data.user, res.data.access_token)
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-100 p-8">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-blue-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-6 rotate-3 shadow-lg">
            <ShieldCheck size={32} />
          </div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">
            VisionAttend
          </h1>
          <p className="text-slate-400 mt-2 font-medium">
            Enterprise Facial Recognition
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 ml-1">
              Employee ID
            </label>
            <Input
              placeholder="e.g. admin"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="rounded-xl h-12"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 ml-1">
              Password
            </label>
            <Input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded-xl h-12"
              required
            />
          </div>

          {error && (
            <div className="bg-rose-50 text-rose-600 p-3 rounded-xl text-sm font-bold text-center border border-rose-100">
              {error}
            </div>
          )}

          <Button
            type="submit"
            className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-lg font-bold"
            disabled={loading}
          >
            {loading ? <Loader2 className="animate-spin mr-2" /> : 'Sign In'}
          </Button>
        </form>

        <p className="text-center text-slate-400 text-sm mt-8">
          Secure, AI-powered attendance management.
        </p>
      </div>
    </div>
  )
}
