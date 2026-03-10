import { useState, useEffect } from 'react'
import { api } from '../services/api'
import PageHeader from '../components/PageHeader'
import Loader from '../components/Loader'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'

const STATUS_C = { active:'var(--green)', planning:'var(--amber)', completed:'var(--text-3)' }

export default function Events() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name:'', date:'', description:'' })
  const navigate = useNavigate()

  useEffect(() => { api.getEvents().then(d => setEvents(d.events)).finally(() => setLoading(false)) }, [])

  const create = async () => {
    if (!form.name || !form.date) { toast.error('Name and date required'); return }
    setCreating(true)
    try { const d = await api.createEvent(form); setEvents(e => [...e, d.event]); setShowForm(false); setForm({ name:'', date:'', description:'' }); toast.success('Event created') }
    catch { toast.error('Failed') }
    finally { setCreating(false) }
  }

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
        <PageHeader index="05" eyebrow="Events" title="EVENT REGISTRY" subtitle="All events in the system. Deploy the swarm to any event below." />
        <button style={S.newBtn} onClick={() => setShowForm(!showForm)}>{showForm ? 'Cancel' : '+ New Event'}</button>
      </div>

      {showForm && (
        <div style={{ ...S.formCard, marginBottom:20 }}>
          <span style={S.sectionLabel}>Create New Event</span>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
            <div><Label>Event name *</Label><Input placeholder="HackFest 2026" value={form.name} onChange={e => setForm(f=>({...f,name:e.target.value}))} /></div>
            <div><Label>Date *</Label><Input type="date" value={form.date} onChange={e => setForm(f=>({...f,date:e.target.value}))} /></div>
          </div>
          <Label>Description</Label>
          <textarea style={{ ...S.input, height:72 }} placeholder="Brief description..." value={form.description} onChange={e => setForm(f=>({...f,description:e.target.value}))} />
          <button style={{ ...S.newBtn, opacity: creating ? 0.5 : 1 }} onClick={create} disabled={creating}>{creating ? 'Creating...' : 'Create Event →'}</button>
        </div>
      )}

      {loading ? <Loader /> : (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(320px,1fr))', gap:12 }}>
          {events.map(ev => {
            const sc = STATUS_C[ev.status] || 'var(--text-3)'
            return (
              <div key={ev.id} style={S.card}>
                <div style={S.cardTop}>
                  <h3 style={S.cardName}>{ev.name}</h3>
                  <span style={{ ...S.badge, borderColor: sc + '44', color: sc }}>{ev.status}</span>
                </div>
                <span style={S.date}>{new Date(ev.date).toLocaleDateString('en-IN', { day:'numeric', month:'long', year:'numeric' })}</span>
                <div style={S.metric}>
                  <span style={{ fontFamily:'var(--font-display)', fontSize:36, letterSpacing:'0.03em', color:'var(--accent)', lineHeight:1 }}>{ev.participants?.toLocaleString() || 0}</span>
                  <span style={{ fontFamily:'var(--font-mono)', fontSize:10, color:'var(--text-3)', letterSpacing:'0.1em', marginTop:4 }}>PARTICIPANTS</span>
                </div>
                <div style={S.actions}>
                  {[['Content','content'],['Emails','email'],['Schedule','scheduler']].map(([l,r]) => (
                    <button key={r} style={S.actionBtn} onClick={() => navigate('/'+r)}>{l}</button>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

const Label = ({children}) => <span style={{ fontFamily:'var(--font-mono)', fontSize:10, color:'var(--text-3)', letterSpacing:'0.12em', textTransform:'uppercase', display:'block', marginBottom:5 }}>{children}</span>
const Input = (props) => <input style={S.input} {...props} />

const S = {
  newBtn: { background:'var(--accent)', color:'#000', padding:'9px 18px', fontSize:13, fontWeight:600, letterSpacing:'0.02em', borderRadius:'var(--radius)', flexShrink:0, marginTop:4 },
  formCard: { background:'var(--bg-1)', border:'1px solid var(--border)', padding:'20px', display:'flex', flexDirection:'column', gap:10 },
  sectionLabel: { fontFamily:'var(--font-mono)', fontSize:10, color:'var(--text-3)', letterSpacing:'0.15em', textTransform:'uppercase' },
  input: { background:'var(--bg)', border:'1px solid var(--border-2)', padding:'10px 12px', color:'var(--text-1)', fontSize:13, width:'100%', fontFamily:'var(--font-mono)', borderRadius:'var(--radius)' },
  card: { background:'var(--bg-1)', border:'1px solid var(--border)', padding:'24px', display:'flex', flexDirection:'column', gap:12, transition:'border-color 0.15s' },
  cardTop: { display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:12 },
  cardName: { fontSize:18, fontWeight:600, letterSpacing:'-0.02em' },
  badge: { fontFamily:'var(--font-mono)', fontSize:10, border:'1px solid', padding:'3px 10px', letterSpacing:'0.08em', textTransform:'uppercase', flexShrink:0 },
  date: { fontFamily:'var(--font-mono)', fontSize:11, color:'var(--text-3)' },
  metric: { display:'flex', flexDirection:'column' },
  actions: { display:'flex', gap:8, paddingTop:4, borderTop:'1px solid var(--border)' },
  actionBtn: { flex:1, background:'transparent', border:'1px solid var(--border-2)', color:'var(--text-2)', padding:'7px', fontSize:12, fontWeight:500, borderRadius:'var(--radius)', cursor:'pointer', transition:'all 0.15s' },
}
