import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { fetchAgents, fetchStats, fetchActivity, fetchSchedule } from '../services/mockApi'

const SwarmContext = createContext(null)

export function SwarmProvider({ children }) {
  const [agents, setAgents] = useState([])
  const [stats, setStats] = useState(null)
  const [activity, setActivity] = useState([])
  const [schedule, setSchedule] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeEvent, setActiveEvent] = useState({ name: 'TechSummit 2026', date: 'Apr 12–13, 2026', venue: 'Delhi Tech Park' })

  const loadAll = useCallback(async () => {
    setLoading(true)
    const [a, s, ac, sc] = await Promise.all([fetchAgents(), fetchStats(), fetchActivity(), fetchSchedule()])
    setAgents(a)
    setStats(s)
    setActivity(ac)
    setSchedule(sc)
    setLoading(false)
  }, [])

  useEffect(() => { loadAll() }, [loadAll])

  // Simulate live agent progress updates
  useEffect(() => {
    const interval = setInterval(() => {
      setAgents(prev => prev.map(a => {
        if (a.status === 'running') return { ...a, progress: Math.min(100, a.progress + Math.random() * 2) }
        if (a.status === 'resolving') return { ...a, progress: Math.min(95, a.progress + Math.random() * 3) }
        return a
      }))
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  // Simulate live activity feed
  useEffect(() => {
    const msgs = [
      { color: '#c8ff00', text: 'Content Agent: New post variant generated' },
      { color: '#3cffd0', text: 'Scheduler: Timeline updated, 0 conflicts remaining' },
      { color: '#ff3cac', text: 'Email Agent: Batch 3 queued for dispatch' },
      { color: '#ffaa00', text: 'Orchestrator: State synced across all agents' },
    ]
    let idx = 0
    const interval = setInterval(() => {
      const msg = msgs[idx % msgs.length]
      setActivity(prev => [{ id: Date.now(), time: 'now', ...msg }, ...prev.slice(0, 9)])
      idx++
    }, 8000)
    return () => clearInterval(interval)
  }, [])

  const resolveConflict = (sessionId) => {
    setSchedule(prev => prev.map(s => s.id === sessionId ? { ...s, conflict: false } : s))
    setActivity(prev => [{ id: Date.now(), time: 'now', color: '#3cffd0', text: 'Scheduler resolved conflict for session ID ' + sessionId }, ...prev])
  }

  return (
    <SwarmContext.Provider value={{ agents, stats, activity, schedule, loading, activeEvent, setActiveEvent, resolveConflict, reload: loadAll }}>
      {children}
    </SwarmContext.Provider>
  )
}

export const useSwarm = () => useContext(SwarmContext)
