import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'

export function AttendanceTrendChart() {
  const { data: trends, isLoading } = useQuery({
    queryKey: ['attendance-trends'],
    queryFn: async () => {
      const res = await axios.get('/api/analytics/trends')
      return res.data
    },
    refetchInterval: 30000 // Refresh every 30 seconds
  })

  if (isLoading) return <div className="h-64 flex items-center justify-center text-slate-300 italic">Loading trends...</div>

  return (
    <div className="h-64 w-full animate-in fade-in duration-700">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={trends} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorPresent" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis 
            dataKey="date" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 600 }}
            tickFormatter={(str) => {
                const date = new Date(str);
                return date.toLocaleDateString('en-US', { weekday: 'short' });
            }}
            dy={10}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 600 }} 
          />
          <Tooltip 
            contentStyle={{ 
                borderRadius: '16px', 
                border: 'none', 
                boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                padding: '12px'
            }}
            itemStyle={{ fontWeight: 'bold', fontSize: '12px' }}
            labelStyle={{ fontWeight: 'black', marginBottom: '4px', color: '#1e293b' }}
          />
          <Area 
            type="monotone" 
            dataKey="present" 
            stroke="#3b82f6" 
            strokeWidth={3}
            fillOpacity={1} 
            fill="url(#colorPresent)" 
            animationDuration={1500}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
