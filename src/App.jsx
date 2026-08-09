import { useEffect, useRef, useState } from 'react'

const STORAGE_KEY = 'one-s-one-c-study-profile-v2'
const DEFAULT_PROFILE = { name: 'wanyi pan', school: 'aalto university', photo: '' }
const PHONE_WIDTH = 430
const PHONE_HEIGHT = 932

const SECURITY_MARKS = [
  { x: 27.5, y: 6, size: 90, tone: 'rose' },
  { x: 84.5, y: 6, size: 88, tone: 'mint' },
  { x: -1, y: 20.8, size: 90, tone: 'mint' },
  { x: 56, y: 20.8, size: 91, tone: 'rose' },
  { x: 27.5, y: 35.6, size: 89, tone: 'rose' },
  { x: 84.5, y: 35.6, size: 91, tone: 'mint' },
  { x: -1, y: 50.4, size: 91, tone: 'rose' },
  { x: 56, y: 50.4, size: 88, tone: 'mint' },
  { x: 27.5, y: 65.2, size: 91, tone: 'mint' },
  { x: 84.5, y: 65.2, size: 89, tone: 'rose' },
  { x: -1, y: 80, size: 90, tone: 'mint' },
  { x: 56, y: 80, size: 92, tone: 'mint' },
  { x: 27.5, y: 94.8, size: 89, tone: 'mint' },
  { x: 84.5, y: 94.8, size: 91, tone: 'rose' },
].map((mark) => ({
  ...mark,
  delay: -((((mark.x / 100) - (mark.y / 100) + 1) / 2) * 1.5),
}))

const CODE_ROWS = [
  '11010110001101011', '00111001110110100', '10100110101001101', '01101001011110010',
  '10011100100011101', '01000111010100110', '11101000101101001', '00110111010010111',
  '11001001101110000', '01011110010001101', '10100011101011010', '01110100110100101',
  '10001111001011100', '00110010111000011', '11101100010110110', '01010011101101001',
  '10111001010010110',
]

const BACK_PATTERN_ROWS = Array.from({ length: 28 }, (_, index) =>
  `${index % 2 ? 'TRAVEL CULTURE STUDENT ACCESS' : '1S1C INTERNATIONAL STUDENT'} · STUDY NETWORK · CAMPUS LIFE · `,
)

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

function twoDigits(value) {
  return String(value).padStart(2, '0')
}

function formatStatusTime(date) {
  return `${twoDigits(date.getDate())}-${twoDigits(date.getMonth() + 1)}-${date.getFullYear()} ${twoDigits(date.getHours())}:${twoDigits(date.getMinutes())}:${twoDigits(date.getSeconds())}`
}

function expiryMonth(date) {
  const expires = new Date(date)
  expires.setFullYear(expires.getFullYear() + 1)
  return `${twoDigits(expires.getMonth() + 1)}/${expires.getFullYear()}`
}

function ChevronLeft() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m15.2 3.2-8.5 8.8 8.5 8.8" /></svg>
}

function SignalIcons() {
  return <div className="phone-icons" aria-label="signal, wifi, battery full">
    <span className="signal" aria-hidden="true"><i /><i /><i /><i /></span>
    <svg className="wifi" viewBox="0 0 24 24" aria-hidden="true"><path d="M2.7 8.5a14 14 0 0 1 18.6 0M5.8 12a9.4 9.4 0 0 1 12.4 0M9.2 15.5a4.3 4.3 0 0 1 5.6 0M12 19h.01" /></svg>
    <span className="battery" aria-hidden="true">100</span>
  </div>
}

function BrandMark({ small = false }) {
  return <span className={`brand-mark${small ? ' small' : ''}`} aria-hidden="true">1S1C</span>
}

function StudyNetworkMark({ compact = false }) {
  return <span className={`study-network${compact ? ' compact' : ''}`} aria-hidden="true">
    <svg viewBox="0 0 64 54"><path d="M6 17 32 5l26 12M10 20h44M14 22v21m9-21v21m9-21v21m9-21v21m9-21v21M8 46h48M4 51h56" /></svg>
    <b>STUDYNET</b>
  </span>
}

function RouteMark({ compact = false }) {
  return <span className={`route-mark${compact ? ' compact' : ''}`} aria-hidden="true"><i /><b>Routeo</b></span>
}

function FauxCode() {
  return <div className="faux-code" aria-label="decorative, non-scannable pattern">
    {CODE_ROWS.flatMap((row, y) => row.split('').map((cell, x) => <i key={`${x}-${y}`} className={cell === '1' ? 'filled' : ''} />))}
  </div>
}

function Portrait({ photo }) {
  if (photo) return <img className="portrait-image" src={photo} alt="profile preview" />
  return <svg className="portrait-placeholder" viewBox="0 0 180 180" role="img" aria-label="portrait placeholder">
    <rect width="180" height="180" fill="#243fb1" />
    <ellipse cx="91" cy="184" rx="69" ry="58" fill="#f5f2ef" />
    <path d="M54 88c-8-48 17-72 43-72 34 0 50 28 43 73l-18 30H69Z" fill="#171923" />
    <path d="M73 102h38v35H73z" fill="#e8b99d" />
    <ellipse cx="92" cy="76" rx="34" ry="43" fill="#f2c8ad" />
    <path d="M58 70c-2-30 13-50 36-50 27 0 43 17 45 47-15-3-27-13-35-27-9 18-25 27-46 30Z" fill="#171923" />
    <path d="M62 75c1 35 4 47 14 58-21-8-28-27-25-50Zm60-35c14 15 18 55 2 88 10-10 17-28 16-48-1-17-5-31-18-40Z" fill="#171923" />
    <ellipse cx="79" cy="80" rx="3" ry="2.2" fill="#29222a" /><ellipse cx="105" cy="80" rx="3" ry="2.2" fill="#29222a" />
    <path d="M84 99c5 3 11 3 16 0" fill="none" stroke="#b85a64" strokeWidth="2.2" strokeLinecap="round" />
    <path d="M46 180c3-31 18-50 42-54l4 17 5-17c26 5 40 24 43 54Z" fill="#f7f6f5" />
    <path d="m86 127 6 16 7-16M92 143v37" fill="none" stroke="#c8d0d8" strokeWidth="2" />
  </svg>
}

function SecurityField() {
  return <>
    <div className="security-field" aria-hidden="true">
      {SECURITY_MARKS.map((mark, index) => <span
        className={`security-mark ${mark.tone}`}
        key={`${mark.x}-${mark.y}`}
        style={{
          '--mark-x': `${mark.x}%`,
          '--mark-y': `${mark.y}%`,
          '--mark-size': `${mark.size}px`,
          '--mark-delay': `${mark.delay.toFixed(3)}s`,
          '--mark-index': index,
        }}
      ><b>1S1C</b></span>)}
    </div>
    <div className="wave-sweep" aria-hidden="true" />
  </>
}

function CardFront({ profile, openedAt, onEdit }) {
  return <article className="student-card card-front" aria-label="1S1C student card front">
    <div className="front-art" aria-hidden="true" />
    <div className="brand-panel">
      <BrandMark />
      <span><small>INTERNATIONAL</small><strong>STUDENT</strong><small>IDENTITY CARD</small></span>
    </div>
    <StudyNetworkMark />
    <div className="card-number"><span>1S1C card number</span><b>S 358 001 034 872 C</b></div>
    <div className="partner-v7" aria-hidden="true">V7</div>
    <RouteMark />
    <div className="partner-k1lroy" aria-hidden="true">K1LROY</div>
    <button className="portrait-wrap" type="button" onClick={onEdit} aria-label="change profile photo" title="点击更换头像"><Portrait photo={profile.photo} /></button>
    <div className="holder-details">
      <h1>{profile.name}</h1>
      <p>{profile.school}</p>
    </div>
    <div className="card-bottom-row">
      <div><span>Validity | Validité</span><b>{expiryMonth(openedAt)}</b></div>
      <div><span>Born | Né(e) le</span><b>21/01/2003</b></div>
    </div>
    <div className="card-code"><FauxCode /></div>
    <SecurityField />
  </article>
}

function CardTilt({ profile, openedAt, onEdit }) {
  return <article className="student-card card-tilt" aria-label="1S1C student card rotated front">
    <div className="landscape-face">
      <div className="landscape-brand-panel">
        <BrandMark />
        <span><small>INTERNATIONAL</small><strong>STUDENT</strong><small>IDENTITY CARD</small></span>
      </div>
      <StudyNetworkMark compact />
      <div className="landscape-number"><span>1S1C card number</span><b>S 358 001 034 872 C</b></div>
      <button className="landscape-portrait" type="button" onClick={onEdit} aria-label="change profile photo" title="点击更换头像"><Portrait photo={profile.photo} /></button>
      <div className="landscape-holder"><span>Student | Étudiant·e | Est. de Enseñanza</span><strong>{profile.school}</strong><small>Name | Nom | Nombre</small><b>{profile.name}</b><small>Born | Né(e) le | Nacido/a el</small><b>21/01/2003</b><small>Validity | Validité | Validez</small><b>{expiryMonth(openedAt)}</b></div>
      <div className="landscape-v7">V7</div>
      <RouteMark compact />
      <div className="landscape-k1lroy">K1LROY</div>
    </div>
    <SecurityField />
  </article>
}

function CardBack() {
  return <article className="student-card card-back" aria-label="1S1C student card reverse">
    <div className="landscape-back">
      <div className="back-pattern" aria-hidden="true">{BACK_PATTERN_ROWS.map((row, index) => <span key={index}>{row.repeat(3)}</span>)}</div>
      <p className="back-rim">INTERNATIONAL STUDENT IDENTITY CARD · CARTE D'ÉTUDIANT INTERNATIONALE</p>
      <div className="back-rule" />
      <p className="back-copy">THIS CARD IS ISSUED BY AND REMAINS THE PROPERTY OF THE 1S1C LEARNING ASSOCIATION. The holder of this card is a full-time student. Le porteur de cette carte est étudiant·e à temps complet.</p>
      <div className="back-links"><b>1S1C.FI</b><b>1S1C.NL</b><b>1S1C.SE</b></div>
      <p className="back-code">S-358-001<br /><strong>1S1C.SE</strong></p>
      <p className="back-owner">1S1C® IS A FICTIONAL INTERFACE MARK FOR THIS LEARNING PROJECT</p>
    </div>
    <SecurityField />
  </article>
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

  return <section className="editor" aria-label="edit profile">
    <div className="editor-head"><div><span>LOCAL PROFILE</span><h2>编辑卡面资料</h2></div><button type="button" onClick={onClose} aria-label="关闭编辑器">×</button></div>
    <label>姓名<input value={profile.name} maxLength="28" onChange={(event) => onChange({ ...profile, name: event.target.value })} /></label>
    <label>学校<input value={profile.school} maxLength="36" onChange={(event) => onChange({ ...profile, school: event.target.value })} /></label>
    <input ref={uploadRef} type="file" accept="image/*" hidden onChange={selectPhoto} />
    <button type="button" className="upload" onClick={() => uploadRef.current?.click()}>上传头像</button>
    {profile.photo ? <button type="button" className="clear-photo" onClick={() => onChange({ ...profile, photo: '' })}>移除头像</button> : null}
    <p>点击卡面头像也可以打开这里。姓名、学校和图片只保存在当前浏览器。</p>
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

  const topTime = `${twoDigits(now.getHours())}:${twoDigits(now.getMinutes())}`
  const openEditor = () => setEditorOpen(true)

  return <main className="app-shell">
    <div className="phone-stage" style={{ width: PHONE_WIDTH * phoneScale, height: PHONE_HEIGHT * phoneScale, '--phone-scale': phoneScale }}>
      <div className="phone" aria-label="1S1C student card learning app">
        <header className="status-bar"><time>{topTime}</time><SignalIcons /></header>
        <section className="validity-bar" aria-label="current validity">
          <button className="back-button" type="button" aria-label="previous page" onClick={() => setPage((current) => Math.max(0, current - 1))}><ChevronLeft /></button>
          <span className="status-dot" /><strong>VALID</strong><time>{formatStatusTime(now)}</time>
        </section>
        <div className="card-viewport" onPointerDown={onPointerDown} onPointerUp={onPointerUp} onPointerCancel={() => { gesture.current = null }}>
          <div className="card-track" style={{ transform: `translateX(-${page * 100}%)` }}>
            <CardFront profile={profile} openedAt={openedAt} onEdit={openEditor} />
            <CardTilt profile={profile} openedAt={openedAt} onEdit={openEditor} />
            <CardBack />
          </div>
        </div>
        <nav className="pagination" aria-label="card pages">
          {[0, 1, 2].map((index) => <button type="button" key={index} className={page === index ? 'active' : ''} onClick={() => setPage(index)} aria-label={`show page ${index + 1}`} />)}
        </nav>
        <p className="swipe-label">Swipe through pages</p>
        {editorOpen ? <Editor profile={profile} onChange={setProfile} onClose={() => setEditorOpen(false)} /> : null}
      </div>
    </div>
  </main>
}

export default App
