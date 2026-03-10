import { useState, useRef } from 'react'
import { api } from '../services/api'
import PageHeader from '../components/PageHeader'
import Loader from '../components/Loader'
import toast from 'react-hot-toast'
import Papa from 'papaparse'

export default function EmailAgent() {
  const [template, setTemplate] = useState(`Dear {{name}},\n\nYou're registered for {{event_name}} on {{date}} at {{venue}}.\n\nTrack: {{track}} — Seat: {{seat}}\n\nSee you there.\n\n— The SWARM Team`)
  const [csvData, setCsvData] = useState(null)
  const [preview, setPreview] = useState([])
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const ref = useRef()

  const handleCSV = e => {
    const f = e.target.files[0]; if (!f) return
    Papa.parse(f, { header:true, complete: ({ data }) => { setCsvData(data); setPreview(data.slice(0,3)); toast.success(`${data.length} participants loaded`) }, error: () => toast.error('Parse failed') })
  }

  const handle = async () => {
    if (!csvData) { toast.error('Upload a CSV first'); return }
    setLoading(true)
    try { const d = await api.sendEmails({ event_id:'1', template, csv_data: csvData }); setResult(d); toast.success(`${d.sent} emails dispatched`) }
    catch { toast.error('Agent failed') }
    finally { setLoading(false) }
  }

  const VARS = ['{{name}}','{{event_name}}','{{date}}','{{venue}}','{{track}}','{{seat}}']

  return (
    <div>
      <PageHeader index="03" eyebrow="Email Agent" title="COMMUNICATIONS" subtitle="Upload your registration CSV, edit the template, and dispatch personalized emails in one click." />

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20 }}>
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          <Section title="1. Upload CSV">
            <div style={S.drop} onClick={() => ref.current.click()}>
              <span style={{ fontSize:24, color:'var(--accent)' }}>⊠</span>
              <span style={{ fontSize:13, color: csvData ? 'var(--green)' : 'var(--text-3)', marginTop:8 }}>
                {csvData ? `✓ ${csvData.length} participants loaded` : 'Click to upload CSV'}
              </span>
              <span style={{ fontFamily:'var(--font-mono)', fontSize:10, color:'var(--text-3)', marginTop:4 }}>name · email · track · seat</span>
            </div>
            <input ref={ref} type="file" accept=".csv" style={{ display:'none' }} onChange={handleCSV} />
            {preview.length > 0 && (
              <table style={S.table}>
                <thead><tr>{Object.keys(preview[0]).slice(0,4).map(k => <th key={k} style={S.th}>{k}</th>)}</tr></thead>
                <tbody>{preview.map((row,i) => <tr key={i}>{Object.values(row).slice(0,4).map((v,j) => <td key={j} style={S.td}>{v}</td>)}</tr>)}</tbody>
              </table>
            )}
          </Section>

          <Section title="Variables">
            <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
              {VARS.map(v => (
                <button key={v} style={S.varBtn} onClick={() => { setTemplate(t => t + v); toast.success(`${v} inserted`) }}>{v}</button>
              ))}
            </div>
          </Section>
        </div>

        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          <Section title="2. Email Template">
            <textarea style={{ ...S.textarea, height:220 }} value={template} onChange={e => setTemplate(e.target.value)} />
            <button style={{ ...S.btn, opacity: loading ? 0.5 : 1 }} onClick={handle} disabled={loading}>
              {loading ? 'Dispatching...' : 'Send Personalized Emails →'}
            </button>
          </Section>

          {loading && <Loader label="Personalizing & dispatching..." />}

          {result && !loading && (
            <Section title="Dispatch Report">
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                <div style={{ ...S.resultBox, borderColor:'rgba(74,222,128,0.2)' }}>
                  <span style={{ fontFamily:'var(--font-display)', fontSize:48, color:'var(--green)', letterSpacing:'0.03em', lineHeight:1 }}>{result.sent}</span>
                  <span style={{ fontFamily:'var(--font-mono)', fontSize:10, color:'var(--green)', letterSpacing:'0.1em', marginTop:4 }}>SENT</span>
                </div>
                <div style={{ ...S.resultBox, borderColor:'rgba(248,113,113,0.2)' }}>
                  <span style={{ fontFamily:'var(--font-display)', fontSize:48, color:'var(--red)', letterSpacing:'0.03em', lineHeight:1 }}>{result.failed}</span>
                  <span style={{ fontFamily:'var(--font-mono)', fontSize:10, color:'var(--red)', letterSpacing:'0.1em', marginTop:4 }}>FAILED</span>
                </div>
              </div>
            </Section>
          )}
        </div>
      </div>
    </div>
  )
}

const Section = ({ title, children }) => (
  <div style={{ background:'var(--bg-1)', border:'1px solid var(--border)', padding:'20px', display:'flex', flexDirection:'column', gap:12 }}>
    <span style={{ fontFamily:'var(--font-mono)', fontSize:10, color:'var(--text-3)', letterSpacing:'0.15em', textTransform:'uppercase' }}>{title}</span>
    {children}
  </div>
)

const S = {
  drop: { border:'1px dashed var(--border-2)', padding:'28px', display:'flex', flexDirection:'column', alignItems:'center', cursor:'pointer', borderRadius:'var(--radius)', transition:'border-color 0.15s' },
  table: { width:'100%', borderCollapse:'collapse', fontSize:12 },
  th: { textAlign:'left', padding:'5px 8px', fontFamily:'var(--font-mono)', fontSize:9, color:'var(--text-3)', letterSpacing:'0.12em', textTransform:'uppercase', borderBottom:'1px solid var(--border)' },
  td: { padding:'5px 8px', color:'var(--text-2)', borderBottom:'1px solid var(--border)', fontSize:12 },
  varBtn: { background:'var(--bg)', border:'1px solid var(--border-2)', color:'var(--accent)', padding:'4px 10px', fontFamily:'var(--font-mono)', fontSize:10, cursor:'pointer', borderRadius:'var(--radius)', transition:'border-color 0.15s' },
  textarea: { background:'var(--bg)', border:'1px solid var(--border-2)', padding:'12px', color:'var(--text-1)', fontSize:12, width:'100%', fontFamily:'var(--font-mono)', lineHeight:1.7, resize:'vertical', borderRadius:'var(--radius)' },
  btn: { background:'var(--accent)', color:'#000', padding:'12px', fontSize:13, fontWeight:600, letterSpacing:'0.03em', width:'100%', borderRadius:'var(--radius)' },
  resultBox: { border:'1px solid', padding:'20px', display:'flex', flexDirection:'column', alignItems:'center', borderRadius:'var(--radius)' },
}
