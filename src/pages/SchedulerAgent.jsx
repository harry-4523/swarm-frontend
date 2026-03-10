import { useState } from 'react'
import { api } from '../services/api'
import PageHeader from '../components/PageHeader'
import Loader from '../components/Loader'
import toast from 'react-hot-toast'

const TRACK_C = { Keynote:'var(--accent)', 'AI/ML':'var(--blue)', DevOps:'var(--amber)', Workshop:'var(--green)' }

export default function SchedulerAgent() {
  const [constraints, setConstraints] = useState('Main Hall: 09:00–17:00\nHall A,B,C: 10:00–16:00\nLunch: 12:30–13:00\nNo parallel keynotes')
  const [sessions, setSessions] = useState('Opening Keynote - Dr. Arjun Mehta - 60min - Keynote\nAI in Production - Priya Sharma - 60min - AI/ML\nMulti-Agent Systems - Rohan Das - 60min - AI/ML\nDevOps at Scale - Sneha Patel - 60min - DevOps\nLangChain Workshop - Aditya Kumar - 120min - Workshop\nClosing Panel - All Speakers - 60min - Keynote')
  const [newC, setNewC] = useState('')
  const [schedule, setSchedule] = useState(null)
  const [changes, setChanges] = useState([])
  const [loading, setLoading] = useState(false)
  const [resolving, setResolving] = useState(false)

  const build = async () => { setLoading(true); try { const d = await api.buildSchedule({ event_id:'1', constraints, sessions }); setSchedule(d.schedule); setChanges([]); toast.success('Schedule built') } catch { toast.error('Failed') } finally { setLoading(false) } }
  const resolve = async () => { if (!newC.trim()) { toast.error('Enter constraint'); return } setResolving(true); try { const d = await api.resolveConflicts({ event_id:'1', new_constraint:newC }); setSchedule(d.schedule); setChanges(d.changes); toast.success('Conflicts resolved — participants notified'); setNewC('') } catch { toast.error('Failed') } finally { setResolving(false) } }

  return (
    <div>
      <PageHeader index="04" eyebrow="Scheduler Agent" title="DYNAMIC SCHEDULER" subtitle="Input constraints and sessions. Agent builds the timeline, detects clashes, and auto-notifies participants." />

      <div style={{ display:'grid', gridTemplateColumns:'340px 1fr', gap:20 }}>
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          <Section title="Constraints">
            <textarea style={S.ta} value={constraints} onChange={e => setConstraints(e.target.value)} />
          </Section>
          <Section title="Sessions  (Title - Speaker - Duration - Track)">
            <textarea style={{ ...S.ta, height:180 }} value={sessions} onChange={e => setSessions(e.target.value)} />
            <button style={{ ...S.btn, opacity: loading ? 0.5 : 1 }} onClick={build} disabled={loading}>{loading ? 'Building...' : 'Build Schedule →'}</button>
          </Section>

          {schedule && (
            <Section title="Mid-event Constraint">
              <p style={{ fontSize:12, color:'var(--text-3)', lineHeight:1.6 }}>Adds a new constraint — agent recalculates and notifies participants.</p>
              <input style={S.input} value={newC} onChange={e => setNewC(e.target.value)} placeholder="e.g. Hall B unavailable 10:00–12:00" />
              <button style={{ ...S.btn, background:'var(--amber)', opacity: resolving ? 0.5 : 1 }} onClick={resolve} disabled={resolving}>{resolving ? 'Resolving...' : 'Resolve Conflicts →'}</button>
            </Section>
          )}
        </div>

        <div>
          {(loading || resolving) && <Loader label={resolving ? 'Resolving conflicts...' : 'Building schedule...'} />}

          {changes.length > 0 && (
            <div style={{ ...S.alertBox, borderColor:'rgba(251,191,36,0.3)', marginBottom:12 }}>
              <span style={{ fontFamily:'var(--font-mono)', fontSize:10, color:'var(--amber)', letterSpacing:'0.12em' }}>CHANGES APPLIED</span>
              {changes.map((c,i) => <div key={i} style={{ fontSize:12, color:'var(--text-2)', marginTop:6 }}>→ {c}</div>)}
            </div>
          )}

          {schedule && !loading && !resolving && (
            <div style={S.scheduleWrap}>
              <div style={S.scheduleHead}>
                <span style={S.colH}>Time</span>
                <span style={{ ...S.colH, flex:1 }}>Session</span>
                <span style={S.colH}>Room</span>
                <span style={S.colH}>Track</span>
              </div>
              {schedule.map(s => {
                const tc = TRACK_C[s.track] || 'var(--text-2)'
                return (
                  <div key={s.id} style={{ ...S.scheduleRow, background: s.conflict ? 'rgba(248,113,113,0.03)' : 'transparent', borderColor: s.conflict ? 'rgba(248,113,113,0.15)' : 'var(--border)' }}>
                    <span style={{ ...S.timeCol, color: tc }}>{s.start}<br /><span style={{ opacity:0.4, fontSize:11 }}>{s.end}</span></span>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:13, fontWeight:500, letterSpacing:'-0.01em' }}>{s.title} {s.conflict && '⚠'}</div>
                      <div style={{ fontSize:11, color:'var(--text-3)', fontFamily:'var(--font-mono)', marginTop:2 }}>{s.speaker}</div>
                    </div>
                    <span style={{ fontSize:12, color:'var(--text-3)', width:80 }}>{s.room}</span>
                    <span style={{ fontFamily:'var(--font-mono)', fontSize:10, color: tc, border:'1px solid', borderColor: tc + '44', padding:'2px 8px', alignSelf:'center' }}>{s.track}</span>
                  </div>
                )
              })}
            </div>
          )}

          {!schedule && !loading && (
            <div style={S.empty}>
              <span style={{ fontFamily:'var(--font-display)', fontSize:48, color:'var(--bg-3)', letterSpacing:'0.05em' }}>◐</span>
              <span style={{ fontFamily:'var(--font-mono)', fontSize:11, color:'var(--text-3)', letterSpacing:'0.12em', marginTop:12 }}>SCHEDULE APPEARS AFTER BUILD</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

const Section = ({ title, children }) => (
  <div style={{ background:'var(--bg-1)', border:'1px solid var(--border)', padding:'18px', display:'flex', flexDirection:'column', gap:10 }}>
    <span style={{ fontFamily:'var(--font-mono)', fontSize:10, color:'var(--text-3)', letterSpacing:'0.15em', textTransform:'uppercase' }}>{title}</span>
    {children}
  </div>
)

const S = {
  ta: { background:'var(--bg)', border:'1px solid var(--border-2)', padding:'10px 12px', color:'var(--text-1)', fontSize:12, width:'100%', fontFamily:'var(--font-mono)', lineHeight:1.7, resize:'vertical', height:120, borderRadius:'var(--radius)' },
  input: { background:'var(--bg)', border:'1px solid var(--border-2)', padding:'10px 12px', color:'var(--text-1)', fontSize:12, width:'100%', fontFamily:'var(--font-mono)', borderRadius:'var(--radius)' },
  btn: { background:'var(--accent)', color:'#000', padding:'11px', fontSize:13, fontWeight:600, letterSpacing:'0.03em', width:'100%', borderRadius:'var(--radius)' },
  alertBox: { background:'var(--bg-1)', border:'1px solid', padding:'16px 20px', borderRadius:'var(--radius)' },
  scheduleWrap: { background:'var(--bg-1)', border:'1px solid var(--border)' },
  scheduleHead: { display:'flex', gap:16, padding:'10px 16px', borderBottom:'1px solid var(--border)', background:'var(--bg-2)' },
  colH: { fontFamily:'var(--font-mono)', fontSize:9, color:'var(--text-3)', letterSpacing:'0.15em', textTransform:'uppercase', width:80 },
  scheduleRow: { display:'flex', gap:16, padding:'14px 16px', borderBottom:'1px solid var(--border)', alignItems:'flex-start', transition:'background 0.15s' },
  timeCol: { fontFamily:'var(--font-display)', fontSize:15, letterSpacing:'0.02em', width:80, flexShrink:0, lineHeight:1.2 },
  empty: { display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', height:280, border:'1px dashed var(--border)', borderRadius:'var(--radius)' },
}
