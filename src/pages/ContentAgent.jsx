import { useState } from 'react'
import { api } from '../services/api'
import PageHeader from '../components/PageHeader'
import Loader from '../components/Loader'
import toast from 'react-hot-toast'

export default function ContentAgent() {
  const [brief, setBrief] = useState('')
  const [eventName, setEventName] = useState('TechSummit 2026')
  const [audience, setAudience] = useState('Tech professionals and students')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)

  const handle = async () => {
    if (!brief.trim()) { toast.error('Enter a brief'); return }
    setLoading(true)
    try { const d = await api.generateContent({ brief, event_name: eventName, audience }); setResult(d); toast.success('Content generated') }
    catch { toast.error('Agent failed') }
    finally { setLoading(false) }
  }

  return (
    <div>
      <PageHeader index="02" eyebrow="Content Agent" title="CONTENT STRATEGIST" subtitle="Drop a raw promotional brief. Agent generates platform-specific posts at peak engagement windows." />

      <div style={{ display:'grid', gridTemplateColumns:'380px 1fr', gap:20 }}>
        <div style={S.panel}>
          <Label>Event name</Label>
          <Input value={eventName} onChange={e => setEventName(e.target.value)} placeholder="TechSummit 2026" />
          <Label>Target audience</Label>
          <Input value={audience} onChange={e => setAudience(e.target.value)} placeholder="Tech professionals..." />
          <Label>Promotional brief</Label>
          <textarea style={{ ...S.input, height:160, resize:'vertical' }} value={brief} onChange={e => setBrief(e.target.value)} placeholder="Key topics, speakers, USPs, tone of voice..." />
          <button style={{ ...S.btn, opacity: loading ? 0.5 : 1 }} onClick={handle} disabled={loading}>
            {loading ? 'Working...' : 'Generate Content →'}
          </button>
        </div>

        <div>
          {loading && <Loader label="Agent generating..." />}
          {!loading && result && (
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              {result.posts.map(p => (
                <div key={p.id} style={S.postCard}>
                  <div style={S.postTop}>
                    <span style={S.platform}>{p.platform}</span>
                    <div style={{ display:'flex', gap:8 }}>
                      <Chip label={`Best: ${p.best_time}`} />
                      <Chip label={`Score: ${p.engagement_score}`} accent />
                    </div>
                  </div>
                  <p style={S.postText}>{p.content}</p>
                  <button style={S.copyBtn} onClick={() => { navigator.clipboard.writeText(p.content); toast.success('Copied') }}>Copy</button>
                </div>
              ))}
            </div>
          )}
          {!loading && !result && (
            <div style={S.empty}>
              <span style={{ fontFamily:'var(--font-display)', fontSize:48, color:'var(--bg-3)', letterSpacing:'0.05em' }}>↗</span>
              <span style={{ fontFamily:'var(--font-mono)', fontSize:11, color:'var(--text-3)', letterSpacing:'0.12em', marginTop:12 }}>GENERATED POSTS APPEAR HERE</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

const Label = ({ children }) => <span style={{ fontFamily:'var(--font-mono)', fontSize:10, color:'var(--text-3)', letterSpacing:'0.12em', textTransform:'uppercase', display:'block', marginBottom:6 }}>{children}</span>
const Input = (props) => <input style={S.input} {...props} />
const Chip = ({ label, accent }) => <span style={{ fontFamily:'var(--font-mono)', fontSize:10, padding:'3px 10px', border:'1px solid', borderColor: accent ? 'var(--accent-border)' : 'var(--border-2)', color: accent ? 'var(--accent)' : 'var(--text-3)' }}>{label}</span>

const S = {
  panel: { display:'flex', flexDirection:'column', gap:10 },
  input: { background:'var(--bg)', border:'1px solid var(--border-2)', padding:'10px 12px', color:'var(--text-1)', fontSize:13, width:'100%', fontFamily:'var(--font-mono)', borderRadius:'var(--radius)', marginBottom:2 },
  btn: { background:'var(--accent)', color:'#000', padding:'12px', fontSize:13, fontWeight:600, letterSpacing:'0.03em', width:'100%', marginTop:8, borderRadius:'var(--radius)' },
  postCard: { background:'var(--bg-1)', border:'1px solid var(--border)', padding:'20px', display:'flex', flexDirection:'column', gap:12 },
  postTop: { display:'flex', justifyContent:'space-between', alignItems:'center' },
  platform: { fontFamily:'var(--font-mono)', fontSize:11, color:'var(--text-2)', letterSpacing:'0.08em' },
  postText: { fontSize:13, color:'var(--text-2)', lineHeight:1.7, fontWeight:300 },
  copyBtn: { background:'transparent', border:'1px solid var(--border-2)', color:'var(--text-3)', padding:'6px 16px', fontSize:11, fontFamily:'var(--font-mono)', letterSpacing:'0.08em', alignSelf:'flex-start', borderRadius:'var(--radius)', cursor:'pointer' },
  empty: { display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', height:280, border:'1px dashed var(--border)', borderRadius:'var(--radius)' },
}
