import React, { useMemo, useState } from 'react'

const initialData = {
  theme: 'dubai',
  anonymize: false,
  resumes: [
    { id: 1, name: 'Aisha Khan', email:'aisha.khan@example.com', client:'Al Noor Holdings', jd:'Senior Angular Developer', score: 87, duplicate:false },
    { id: 2, name: 'Rohan Mehta', email:'rohan.mehta@example.com', client:'Speridian Internal', jd:'FastAPI Engineer', score: 78, duplicate:true },
    { id: 3, name: 'Fatima Al Suwaidi', email:'fatima.s@example.com', client:'Desert Tech LLC', jd:'Vector DB Specialist', score: 91, duplicate:false },
    { id: 4, name: 'Neha Sharma', email:'neha.sharma@example.com', client:'Emerald Systems', jd:'Azure ML Engineer', score: 73, duplicate:false }
  ],
  jds: ['Senior Angular Developer','FastAPI Engineer','Vector DB Specialist','Azure ML Engineer'],
  clients: ['Speridian Internal','Al Noor Holdings','Desert Tech LLC','Emerald Systems']
}

export default function App(){
  const [theme, setTheme] = useState(initialData.theme)
  const [anonymize, setAnonymize] = useState(initialData.anonymize)
  const [resumes, setResumes] = useState(initialData.resumes)
  const [jds, setJds] = useState(initialData.jds)
  const [clients, setClients] = useState(initialData.clients)
  const [query, setQuery] = useState('')
  const [filterClient, setFilterClient] = useState('')
  const [filterJD, setFilterJD] = useState('')
  const [filterAnon, setFilterAnon] = useState(false)
  const [uploads, setUploads] = useState(0)
  const [weights, setWeights] = useState({ skills:40, exp:30, edu:15, cert:15 })

  React.useEffect(()=>{
    document.body.classList.toggle('theme-dubai', theme==='dubai')
    document.body.classList.toggle('theme-india', theme==='india')
  },[theme])

  const rows = useMemo(()=>{
    const q = query.toLowerCase()
    return resumes
      .filter(r => (!q || r.name.toLowerCase().includes(q) || r.jd.toLowerCase().includes(q) || r.client.toLowerCase().includes(q)) &&
        (!filterClient || r.client===filterClient) &&
        (!filterJD || r.jd===filterJD) &&
        (!filterAnon || anonymize))
      .sort((a,b)=>b.score-a.score)
  }, [resumes, query, filterClient, filterJD, filterAnon, anonymize])

  const avgScore = useMemo(()=>{
    if(resumes.length===0) return 0
    return Math.round(resumes.reduce((s,r)=>s+r.score,0)/resumes.length)
  },[resumes])

  const anyDup = useMemo(()=>resumes.some(r=>r.duplicate),[resumes])

  const fmtName = (name)=> anonymize ? name.split(' ')[0] + ' •••' : name

  function applyWeights(){
    const sum = Math.max(1, weights.skills + weights.exp + weights.edu + weights.cert)
    const next = resumes.map(r=>{
      const factor = (weights.skills/sum*0.6 + weights.exp/sum*0.25 + weights.edu/sum*0.1 + weights.cert/sum*0.05 + 0.4)
      const score = Math.min(99, Math.max(40, Math.round(r.score * factor)))
      return { ...r, score }
    })
    setResumes(next)
  }

  function addJD(){
    const title = prompt('New JD title')
    if(!title) return
    setJds(prev=>[...prev, title])
  }

  function addClient(){
    const name = prompt('New client name')
    if(!name) return
    setClients(prev=>[...prev, name])
  }

  function onSingleUpload(file){
    if(!file) return
    setUploads(u=>u+1)
    const newRow = {
      id: Date.now(),
      name: file.name.replace(/\..+$/, '') + ' Candidate',
      email: 'upload@demo.com',
      client: clients[Math.floor(Math.random()*clients.length)] || 'Speridian Internal',
      jd: jds[Math.floor(Math.random()*jds.length)] || 'General',
      score: 60+Math.round(Math.random()*35),
      duplicate: Math.random()<0.25
    }
    setResumes(prev=>[...prev, newRow])
  }

  function onBulkUpload(fileList){
    const files = Array.from(fileList||[])
    if(!files.length) return
    setUploads(u=>u+files.length)
    const extra = files.map((_,i)=>({
      id: Date.now()+i,
      name: 'Bulk '+(i+1)+' Candidate',
      email: 'bulk'+(i+1)+'@demo.com',
      client: clients[Math.floor(Math.random()*clients.length)] || 'Speridian Internal',
      jd: jds[Math.floor(Math.random()*jds.length)] || 'General',
      score: 55+Math.round(Math.random()*40),
      duplicate: Math.random()<0.2
    }))
    setResumes(prev=>[...prev, ...extra])
  }

  return (
    <div className="text-white min-h-screen bg-gradient-to-b from-[var(--bg-grad-1)] via-[var(--bg-grad-2)] to-[var(--bg-grad-3)]">
      <header className="sticky top-0 z-40 bg-skyline/60 backdrop-blur border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-white/90 grid place-content-center shadow">
              <span className="text-[var(--brand)] font-black">S</span>
            </div>
            <div>
              <div className="text-sm opacity-80">Speridian Technologies</div>
              <div className="text-lg font-extrabold logo-word tracking-wide">Resume Parsing & Scoring</div>
            </div>
            <span className={`badge ml-3 ${anyDup ? '' : 'hidden'}`}><i className='bx bx-duplicate mr-1'></i>Potential Duplicates</span>
          </div>
          <div className="flex items-center gap-2">
            <button className="btn btn-ghost focus-ring" onClick={()=>setTheme(t=>t==='dubai'?'india':'dubai')}>
              <i className='bx bx-transfer-alt text-xl'></i>
              <span className="hidden sm:inline">Theme: <b>{theme==='dubai'?'Dubai':'India'}</b></span>
            </button>
            <button className={`btn ${anonymize?'btn-solid':'btn-ghost'} focus-ring`} onClick={()=>setAnonymize(a=>!a)}>
              <i className='bx bx-user-x text-xl'></i>
              <span className="hidden sm:inline">Anonymize</span>
            </button>
            <button className="btn btn-solid focus-ring" onClick={()=>alert('Synced shortlisted profiles to HRMS. (Demo)')}>
              <i className='bx bx-cloud-upload text-xl'></i>
              <span className="hidden sm:inline">HRMS Sync</span>
            </button>
          </div>
        </div>
      </header>

      <section className="bg-skyline">
        <div className="max-w-7xl mx-auto px-4 py-10 grid md:grid-cols-2 gap-8 items-center">
          <div>
            <h1 className="text-3xl md:text-4xl font-black leading-tight">AI‑assisted Resume Parsing, Scoring & Shortlisting</h1>
            <p className="mt-3 text-white/80">Upload resumes (single or bulk), score against global job descriptions, and generate company‑format resumes. Built for recruitment teams.</p>
            <div className="mt-5 flex flex-wrap gap-2">
              <span className="pill pill-1">Angular</span>
              <span className="pill pill-2">FastAPI</span>
              <span className="pill pill-3">Vector DB</span>
              <span className="pill pill-4">Azure</span>
              <span className="pill pill-1">Guardrails</span>
              <span className="pill pill-2">Anonymize</span>
              <span className="pill pill-3">Duplicate Detection</span>
            </div>
          </div>
          <div className="glass rounded-2xl p-5 border border-white/10 shadow-xl">
            <div className="text-sm mb-2 opacity-80">Quick Actions</div>
            <div className="flex flex-wrap gap-2">
              <label className="btn btn-ghost cursor-pointer">
                <i className='bx bx-upload'></i> Single Upload
                <input type="file" className="hidden" accept=".pdf,.doc,.docx" onChange={(e)=>onSingleUpload(e.target.files?.[0])} />
              </label>
              <label className="btn btn-ghost cursor-pointer">
                <i className='bx bx-folder-open'></i> Bulk Upload
                <input type="file" className="hidden" multiple accept=".pdf,.doc,.docx" onChange={(e)=>onBulkUpload(e.target.files)} />
              </label>
              <button className="btn btn-solid" onClick={()=>alert('Shortlisted '+Math.min(10, rows.length)+' candidates to Top 10. (Demo)')}>
                <i className='bx bx-list-check'></i> Top 10 Shortlist
              </button>
              <button className="btn btn-ghost" onClick={()=>alert('Generated company-format resume. (Demo)')}>
                <i className='bx bx-file'></i> Generate Company Format
              </button>
            </div>
          </div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 py-10 grid xl:grid-cols-3 gap-6">
        <section className="xl:col-span-1 space-y-6">
          <div className="card">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Global Job Descriptions</h2>
              <button className="btn btn-ghost" onClick={addJD}><i className='bx bx-plus'></i>Add JD</button>
            </div>
            <div className="mt-3 space-y-3 text-sm">
              {jds.map((j,idx)=>(
                <div key={idx} className="glass rounded-xl p-3 flex items-center justify-between">
                  <span>{j}</span>
                  <button className="text-xs opacity-80 hover:opacity-100">Edit</button>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Clients</h2>
              <button className="btn btn-ghost" onClick={addClient}><i className='bx bx-plus'></i>Add Client</button>
            </div>
            <div className="mt-3 space-y-3 text-sm">
              {clients.map((c,idx)=>(
                <div key={idx} className="glass rounded-xl p-3 flex items-center justify-between">
                  <span>{c}</span>
                  <button className="text-xs opacity-80 hover:opacity-100">Edit</button>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="xl:col-span-2 space-y-6">
          <div className="card">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div className="flex items-center gap-2">
                <i className='bx bx-search text-xl'></i>
                <input
                  value={query}
                  onChange={(e)=>setQuery(e.target.value)}
                  className="w-64 max-w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 focus-ring"
                  placeholder="Search resumes (semantic)…" />
              </div>
              <div className="flex items-center gap-2 text-sm">
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="accent-[var(--brand)]" checked={filterAnon} onChange={(e)=>setFilterAnon(e.target.checked)} />
                  Anonymized
                </label>
                <select value={filterClient} onChange={(e)=>setFilterClient(e.target.value)} className="bg-white/5 border border-white/10 rounded-xl px-2 py-2 focus-ring">
                  <option value="">All Clients</option>
                  {clients.map(c=>(<option key={c} value={c}>{c}</option>))}
                </select>
                <select value={filterJD} onChange={(e)=>setFilterJD(e.target.value)} className="bg-white/5 border border-white/10 rounded-xl px-2 py-2 focus-ring">
                  <option value="">All JDs</option>
                  {jds.map(j=>(<option key={j} value={j}>{j}</option>))}
                </select>
              </div>
            </div>
            <div className="mt-4 overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="text-white/80">
                  <tr>
                    <th className="py-2 pr-4">Candidate</th>
                    <th className="py-2 pr-4">Client</th>
                    <th className="py-2 pr-4">JD</th>
                    <th className="py-2 pr-4">Score</th>
                    <th className="py-2 pr-4">Badges</th>
                    <th className="py-2 pr-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {rows.map(r=> (
                    <tr key={r.id}>
                      <td className="py-3 pr-4">
                        <div className="font-semibold">{fmtName(r.name)}</div>
                        <div className="text-xs opacity-70">{anonymize?'hidden@company.com':r.email}</div>
                      </td>
                      <td className="py-3 pr-4">{r.client}</td>
                      <td className="py-3 pr-4">{r.jd}</td>
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-2">
                          <div className="w-16 progressbar"><span style={{width: r.score + '%'}} /></div>
                          <span className="font-bold">{r.score}</span>
                        </div>
                      </td>
                      <td className="py-3 pr-4">
                        {r.duplicate && (<span className="badge"><i className='bx bx-duplicate mr-1'></i>Duplicate</span>)}
                      </td>
                      <td className="py-3 pr-4">
                        <button className="btn btn-ghost text-xs" onClick={()=>alert('Open parsed view for '+r.name)}><i className='bx bx-show'></i> View</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="card">
              <h3 className="text-lg font-bold mb-2">Analytics</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="glass rounded-xl p-4">
                  <div className="opacity-80">Avg Score</div>
                  <div className="text-3xl font-black">{avgScore || '—'}</div>
                  <div className="progressbar mt-2"><span style={{width: (avgScore||0)+'%'}} /></div>
                </div>
                <div className="glass rounded-xl p-4">
                  <div className="opacity-80">Uploads</div>
                  <div className="text-3xl font-black">{uploads}</div>
                  <div className="text-xs opacity-70">This session</div>
                </div>
              </div>
            </div>
            <div className="card">
              <h3 className="text-lg font-bold mb-2">Scoring Weights</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <label>Skills Match</label>
                  <input type="range" min="0" max="100" value={weights.skills} onChange={e=>setWeights(w=>({...w, skills:+e.target.value}))} className="w-40" />
                </div>
                <div className="flex items-center justify-between">
                  <label>Experience Match</label>
                  <input type="range" min="0" max="100" value={weights.exp} onChange={e=>setWeights(w=>({...w, exp:+e.target.value}))} className="w-40" />
                </div>
                <div className="flex items-center justify-between">
                  <label>Education Match</label>
                  <input type="range" min="0" max="100" value={weights.edu} onChange={e=>setWeights(w=>({...w, edu:+e.target.value}))} className="w-40" />
                </div>
                <div className="flex items-center justify-between">
                  <label>Certifications</label>
                  <input type="range" min="0" max="100" value={weights.cert} onChange={e=>setWeights(w=>({...w, cert:+e.target.value}))} className="w-40" />
                </div>
                <button className="btn btn-ghost mt-2 w-full" onClick={applyWeights}><i className='bx bx-slider-alt'></i> Apply Weights</button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="max-w-7xl mx-auto px-4 pb-10 text-xs text-white/60">
        <div>Prototype v2 (React) • Theme switcher (Dubai ↔ India), anonymize toggle, duplicate detection badge, Top 10 shortlist, HRMS sync (stub), branding polish. Replace placeholder logo with official SVG/PNG when ready.</div>
      </footer>
    </div>
  )
}
