import { useEffect, useRef, useState } from 'react'

const STORAGE_KEY = 'isic-study-demo-profile-v1'
const DEFAULT_PROFILE = { name: 'Demo Student', school: 'Example University', photo: '' }
const PHONE_WIDTH = 430
const PHONE_HEIGHT = 932

function getPhoneScale() {
  return Math.min(1, window.innerWidth / PHONE_WIDTH, window.innerHeight / PHONE_HEIGHT)
}

function readProfile() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved ? { ...DEFAULT_PROFILE, ...JSON.parse(saved) } : DEFAULT_PROFILE
  } catch {
    return DEFAULT_PROFILE
  }
}

function formatStatusTime(date) {
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
  }).format(date).replace(',', '')
}

function expiryMonth(date) {
  const expires = new Date(date)
  expires.setFullYear(expires.getFullYear() + 1)
  return `${String(expires.getMonth() + 1).padStart(2, '0')}/${expires.getFullYear()}`
}

function ChevronLeft() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m14.5 3.5-8.2 8.5 8.2 8.5" /></svg>
}

function SignalIcons() {
  return <div className="phone-icons" aria-label="signal, wifi, battery full">
    <span className="signal" aria-hidden="true"><i /><i /><i /><i /></span>
    <svg className="wifi" viewBox="0 0 24 24" aria-hidden="true"><path d="M2.7 8.5a14 14 0 0 1 18.6 0M5.8 12a9.4 9.4 0 0 1 12.4 0M9.2 15.5a4.3 4.3 0 0 1 5.6 0M12 19h.01" /></svg>
    <span className="battery" aria-hidden="true">100</span>
  </div>
}

function DemoSeal({ size = 'medium' }) {
  return <div className={`demo-seal ${size}`} aria-hidden="true"><b>ISIC</b><em>DEMO</em></div>
}

function FauxQr() {
  const cells = [
    '1111100111111', '1000100100001', '1010100111011', '1010100101011', '1000100111011',
    '1111100000000', '0000001011010', '1010110110101', '0101010010110', '1111101101011',
    '1000100101110', '1010101110101', '1010100011010', '1000101010011', '1111101111011',
  ]
  return <div className="faux-qr" aria-label="decorative demo code">
    {cells.flatMap((row, y) => row.split('').map((cell, x) => <i key={`${x}-${y}`} className={cell === '1' ? 'filled' : ''} />))}
  </div>
}

function Portrait({ photo }) {
  if (photo) return <img className="portrait-image" src={photo} alt="profile preview" />
  return <div className="portrait-placeholder" aria-label="profile photo placeholder"><span /></div>
}

function CardFront({ profile, openedAt }) {
  return <article className="demo-card card-front" aria-label="student pass demo front">
    <div className="brand-lockup"><DemoSeal size="small" /><span>INTERNATIONAL<br /><b>STUDENT</b><br />DEMO PASS</span></div>
    <div className="card-number"><span>demo pass number</span><b>DEMO S 358 001 034 872</b></div>
    <div className="partner-mark">VR</div>
    <div className="school-mark"><i /> Example Transit</div>
    <div className="portrait-wrap"><Portrait photo={profile.photo} /></div>
    <div className="holder-details">
      <h1>{profile.name}</h1>
      <p>{profile.school}</p>
    </div>
    <div className="card-bottom-row">
      <div><span>Validity</span><b>{expiryMonth(openedAt)}</b></div>
      <div><span>Born</span><b>01/01/2000</b></div>
    </div>
    <div className="card-qr"><FauxQr /></div>
    <div className="demo-watermark" aria-hidden="true">DEMO · NOT VALID</div>
    <div className="not-valid">DEMO · NOT VALID</div>
    <CardWave />
  </article>
}

function CardTilt({ profile }) {
  return <article className="demo-card card-tilt" aria-label="student pass demo alternate view">
    <div className="tilt-card-content">
      <div className="tilt-side-title">DEMO PASS · NOT VALID</div>
      <div className="tilt-hero">
        <Portrait photo={profile.photo} />
        <strong>{profile.name}</strong>
      </div>
      <div className="tilt-left"><DemoSeal size="small" /><span>INTERNATIONAL<br /><b>STUDENT</b><br />DEMO PASS</span></div>
      <div className="tilt-number">DEMO S 358 001 034 872</div>
      <div className="tilt-school">{profile.school}</div>
      <div className="demo-watermark" aria-hidden="true">DEMO · NOT VALID</div>
      <div className="not-valid">DEMO · NOT VALID</div>
    </div>
    <CardWave />
  </article>
}

function CardBack() {
  return <article className="demo-card card-back" aria-label="student pass demo reverse">
    <p className="back-title">INTERNATIONAL STUDENT<br />DEMO PASS · NOT VALID</p>
    <div className="back-divider" />
    <p className="back-copy">THIS CARD IS A STUDY DEMONSTRATION ONLY. IT DOES NOT PROVIDE IDENTIFICATION, STUDENT STATUS, TRANSPORT, DISCOUNT, OR ACCESS RIGHTS.</p>
    <div className="back-logos"><span>ISIC<br />DEMO</span><span>Example<br />Transit</span><span>Study<br />Pass</span></div>
    <p className="back-mark">ISIC-STYLE UI LEARNING PROJECT</p>
    <div className="demo-watermark" aria-hidden="true">DEMO · NOT VALID</div>
    <CardWave />
  </article>
}

function CardWave() {
  const bubbles = [
    ['one', 'large'], ['two', 'medium'], ['three', 'small'], ['four', 'medium'], ['five', 'small'], ['six', 'large'], ['seven', 'medium'],
  ]
  return <>
    <div className="logo-field" aria-hidden="true">{bubbles.map(([name, size]) => <DemoSeal key={name} size={`orb ${name} ${size}`} />)}</div>
    <div className="wave-sweep" aria-hidden="true" />
  </>
}

function Editor({ profile, onChange, onClose }) {
  const uploadRef = useRef(null)
  const selectPhoto = (event) => {
    const [file] = event.target.files
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => onChange({ ...profile, photo: String(reader.result) })
    reader.readAsDataURL(file)
  }
  return <section className="editor" aria-label="edit demo profile">
    <div className="editor-head"><div><span>LOCAL DEMO DATA</span><h2>编辑演示资料</h2></div><button onClick={onClose} aria-label="close editor">×</button></div>
    <label>姓名<input value={profile.name} maxLength="28" onChange={(event) => onChange({ ...profile, name: event.target.value })} /></label>
    <label>学校<input value={profile.school} maxLength="36" onChange={(event) => onChange({ ...profile, school: event.target.value })} /></label>
    <input ref={uploadRef} type="file" accept="image/*" hidden onChange={selectPhoto} />
    <button className="upload" onClick={() => uploadRef.current?.click()}>上传头像</button>
    {profile.photo ? <button className="clear-photo" onClick={() => onChange({ ...profile, photo: '' })}>移除头像</button> : null}
    <p>资料仅保存在本机浏览器；页面始终标记为 DEMO · NOT VALID。</p>
  </section>
}

function App() {
  const [profile, setProfile] = useState(readProfile)
  const [now, setNow] = useState(() => new Date())
  const [openedAt] = useState(() => new Date())
  const [page, setPage] = useState(0)
  const [editorOpen, setEditorOpen] = useState(false)
  const [phoneScale, setPhoneScale] = useState(getPhoneScale)
  const gesture = useRef(null)

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000)
    return () => window.clearInterval(timer)
  }, [])

  useEffect(() => {
    const updatePhoneScale = () => setPhoneScale(getPhoneScale())
    window.addEventListener('resize', updatePhoneScale)
    return () => window.removeEventListener('resize', updatePhoneScale)
  }, [])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile))
  }, [profile])

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === 'ArrowLeft') setPage((current) => Math.max(0, current - 1))
      if (event.key === 'ArrowRight') setPage((current) => Math.min(2, current + 1))
      if (event.key.toLowerCase() === 'e') setEditorOpen(true)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  const onPointerDown = (event) => { gesture.current = event.clientX }
  const onPointerUp = (event) => {
    if (gesture.current === null) return
    const difference = event.clientX - gesture.current
    if (Math.abs(difference) > 40) setPage((current) => Math.max(0, Math.min(2, current + (difference < 0 ? 1 : -1))))
    gesture.current = null
  }

  const topTime = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false }).format(now)
  return <main className="app-shell">
    <div className="phone-stage" style={{ width: PHONE_WIDTH * phoneScale, height: PHONE_HEIGHT * phoneScale, '--phone-scale': phoneScale }}>
      <div className="phone" aria-label="student pass demo app">
      <header className="status-bar"><time>{topTime}</time><SignalIcons /></header>
      <section className="validity-bar" aria-label="current demo validity">
        <button className="back-button" aria-label="previous demo page" onClick={() => setPage((current) => Math.max(0, current - 1))}><ChevronLeft /></button>
        <span className="status-dot" /><strong>VALID</strong><time>{formatStatusTime(now)}</time>
      </section>
      <div className="card-viewport" onPointerDown={onPointerDown} onPointerUp={onPointerUp} onPointerCancel={() => { gesture.current = null }}>
        <div className="card-track" style={{ transform: `translateX(-${page * 100}%)` }}>
          <CardFront profile={profile} openedAt={openedAt} />
          <CardTilt profile={profile} />
          <CardBack />
        </div>
      </div>
      <nav className="pagination" aria-label="demo pass pages">
        {[0, 1, 2].map((index) => <button key={index} className={page === index ? 'active' : ''} onClick={() => setPage(index)} aria-label={`show page ${index + 1}`} />)}
      </nav>
      <p className="swipe-label">Swipe through pages</p>
      <button className="edit-trigger" onClick={() => setEditorOpen(true)}>编辑演示资料</button>
        {editorOpen ? <Editor profile={profile} onChange={setProfile} onClose={() => setEditorOpen(false)} /> : null}
      </div>
    </div>
  </main>
}

export default App
