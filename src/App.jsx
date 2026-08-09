import { useEffect, useMemo, useRef, useState } from 'react'
import QRCode from 'qrcode'
import defaultLandscapePortrait from './assets/reference-portrait.jpg'
import defaultRoundPortrait from './assets/reference-portrait-round.jpg'
import vrLogo from './assets/vr-logo.png'
import matkahuoltoLogo from './assets/matkahuolto-logo.png'

const STORAGE_KEY = 'one-s-one-c-study-profile-v3'
const LEGACY_STORAGE_KEY = 'one-s-one-c-study-profile-v2'
const DEFAULT_QR_URL = 'https://github.com/jerryleeinhz/ISIC'
const DEFAULT_PROFILE = {
  name: 'wanyi pan',
  school: 'aalto university',
  photo: '',
  markText: 'ISIC',
  nameWeight: 600,
  qrUrl: DEFAULT_QR_URL,
}
const PHONE_WIDTH = 430
const PHONE_HEIGHT = 932
const NAME_WEIGHTS = [300, 400, 500, 600, 700, 800, 900]

const SECURITY_MARKS = [
  { x: 27.5, y: 6, tone: 'rose' },
  { x: 84.5, y: 6, tone: 'mint' },
  { x: -1, y: 20.8, tone: 'mint' },
  { x: 56, y: 20.8, tone: 'rose' },
  { x: 27.5, y: 35.6, tone: 'rose' },
  { x: 84.5, y: 35.6, tone: 'mint' },
  { x: -1, y: 50.4, tone: 'rose' },
  { x: 56, y: 50.4, tone: 'mint' },
  { x: 27.5, y: 65.2, tone: 'mint' },
  { x: 84.5, y: 65.2, tone: 'rose' },
  { x: -1, y: 80, tone: 'mint' },
  { x: 56, y: 80, tone: 'mint' },
  { x: 27.5, y: 94.8, tone: 'mint' },
  { x: 84.5, y: 94.8, tone: 'rose' },
].map((mark) => ({
  ...mark,
  band: Math.round(((mark.x - mark.y) + 81) / 14.5),
})).map((mark) => ({
  ...mark,
  delay: -(((11 - mark.band) / 12) * 1.5),
}))

const BACK_RINGS = Array.from({ length: 78 }, (_, index) => 12 + index * 9.2)
const BACK_PARAGRAPH = `Learning becomes memorable when curiosity moves beyond the classroom and meets unfamiliar streets, languages, libraries, studios, landscapes, and people. A student journey can begin with a quiet question and continue through conversations that connect history with technology, music with mathematics, design with daily life, and local traditions with global ideas. Every visit offers a chance to notice details, compare perspectives, listen carefully, and return with a wider sense of possibility. Museums preserve stories, theatres turn reflection into performance, trains reveal the changing character of a region, and shared tables make room for generous exchanges. Books provide patient companions while architecture records the ambitions of earlier generations in stone, glass, timber, and light. New experiences do not replace what a learner already knows; they test it, refine it, and give it a richer context. Responsible travel also asks for attention to communities, public spaces, natural resources, and the small choices that shape a welcoming place. The value of an international student community lies in its many independent voices and in the respect that allows those voices to meet. Exploration can be practical as well as inspiring: finding a route, understanding a custom, learning a phrase, supporting a local artist, or discovering an unexpected connection between subjects. Knowledge grows through movement, observation, participation, and the willingness to remain open to revision. A card may be a simple object, yet it can represent access to culture, education, friendship, and the continuing work of becoming an attentive citizen of the world.`

function getPhoneScale() {
  if (new URLSearchParams(window.location.search).has('native') || window.location.hash === '#native') return 1
  return Math.min(1, window.innerWidth / PHONE_WIDTH, window.innerHeight / PHONE_HEIGHT)
}

function readProfile() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY) || localStorage.getItem(LEGACY_STORAGE_KEY)
    if (!saved) return DEFAULT_PROFILE
    const profile = { ...DEFAULT_PROFILE, ...JSON.parse(saved) }
    if (profile.markText.trim().toUpperCase() === '1S1C') profile.markText = 'ISIC'
    return profile
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

function monthYear(date) {
  return `${twoDigits(date.getMonth() + 1)}/${date.getFullYear()}`
}

function expiresAt(date) {
  const expires = new Date(date)
  expires.setFullYear(expires.getFullYear() + 1)
  return expires
}

function expiryMonth(date) {
  return monthYear(expiresAt(date))
}

function validityRange(date) {
  return `${monthYear(date)} - ${expiryMonth(date)}`
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

function BrandMark({ text, small = false, large = false }) {
  const safeText = text.trim() || 'ISIC'
  const baseSize = large ? 33 : (small ? 20 : 23)
  const baseScale = large ? .67 : .66
  const textScale = Math.min(baseScale, baseScale * (4 / Math.max(4, safeText.length)))
  return <span className={`brand-mark${small ? ' small' : ''}${large ? ' large' : ''}`} aria-label={`${safeText} brand mark`}>
    <b style={{ fontSize: baseSize, '--brand-text-scale': textScale }}>{safeText}</b>
  </span>
}

function StudyNetworkMark({ compact = false }) {
  return <span className={`study-network${compact ? ' compact' : ''}`} aria-label="STUDYNET">
    <svg viewBox="0 0 56 48" aria-hidden="true">
      <path className="temple-roof" d="M3 14 28 3l25 11M7 16h42" />
      <path d="M11 19v17m8-17v17m9-17v17m9-17v17m8-17v17M8 38h40M5 42h46M2 46h52" />
    </svg>
    <b>STUDYNET</b>
  </span>
}

function V7Mark({ landscape = false }) {
  return <img className={`v7-mark${landscape ? ' landscape' : ''}`} src={vrLogo} alt="VR" />
}

function RouteMark({ compact = false }) {
  return <img className={`route-mark${compact ? ' compact' : ''}`} src={matkahuoltoLogo} alt="Matkahuolto" />
}

function RealQrCode({ value }) {
  const qr = useMemo(() => {
    try {
      return QRCode.create(value.trim() || DEFAULT_QR_URL, { errorCorrectionLevel: 'M' })
    } catch {
      return QRCode.create(DEFAULT_QR_URL, { errorCorrectionLevel: 'M' })
    }
  }, [value])

  const path = useMemo(() => {
    const size = qr.modules.size
    let dataPath = ''
    for (let y = 0; y < size; y += 1) {
      for (let x = 0; x < size; x += 1) {
        if (qr.modules.data[y * size + x]) dataPath += `M${x} ${y}h1v1h-1z`
      }
    }
    return dataPath
  }, [qr])

  const viewSize = qr.modules.size
  return <svg className="real-qr" viewBox={`0 0 ${viewSize} ${viewSize}`} shapeRendering="crispEdges" role="img" aria-label={`QR code for ${value || DEFAULT_QR_URL}`}>
    <rect width={viewSize} height={viewSize} fill="#fff" />
    <path d={path} fill="#121417" />
  </svg>
}

function Portrait({ photo, variant }) {
  const source = photo || (variant === 'landscape' ? defaultLandscapePortrait : defaultRoundPortrait)
  return <img className="portrait-image" src={source} alt={`${variant === 'landscape' ? 'landscape ' : ''}profile preview`} />
}

function SecurityField({ text }) {
  const safeText = text.trim() || 'ISIC'
  return <>
    <div className="security-field" aria-hidden="true">
      {SECURITY_MARKS.map((mark, index) => <span
        className={`security-mark ${mark.tone}`}
        key={`${mark.x}-${mark.y}`}
        style={{
          '--mark-x': `${mark.x}%`,
          '--mark-y': `${mark.y}%`,
          '--mark-delay': `${mark.delay.toFixed(3)}s`,
          '--mark-font-scale': Math.max(.62, 1 - Math.max(0, safeText.length - 4) * .08),
        }}
      ><b><span>{safeText}</span></b></span>)}
    </div>
    <div className="wave-sweep" aria-hidden="true" />
  </>
}

function CardFront({ profile, openedAt, onEdit }) {
  const markText = profile.markText.trim() || 'ISIC'
  return <article className="student-card card-front" aria-label={`${markText} student card front`}>
    <div className="front-light-field" aria-hidden="true" />
    <div className="front-top-band" aria-hidden="true" />
    <div className="brand-panel">
      <BrandMark text={profile.markText} />
      <span className="brand-wordmark"><small>INTERNATIONAL</small><strong>STUDENT</strong><small>IDENTITY CARD</small></span>
    </div>
    <StudyNetworkMark />
    <div className="card-number"><span>{markText} card number</span><b>S 358 001 034 872 C</b></div>
    <V7Mark />
    <RouteMark />
    <div className="partner-k1lroy" aria-label="K1LROY">K1LROY</div>
    <button className="portrait-wrap" type="button" onClick={onEdit} aria-label="更换个人照片" title="点击更换头像"><Portrait photo={profile.photo} variant="round" /></button>
    <div className="holder-details"><h1>{profile.name}</h1><p>{profile.school}</p></div>
    <div className="card-bottom-row">
      <div><span>Validity | Validité</span><b>{expiryMonth(openedAt)}</b></div>
      <div><span>Born | Né(e) le</span><b>21/01/2003</b></div>
    </div>
    <div className="card-code"><RealQrCode value={profile.qrUrl} /></div>
    <SecurityField text={profile.markText} />
  </article>
}

function CardTilt({ profile, openedAt, onEdit }) {
  const markText = profile.markText.trim() || 'ISIC'
  return <article className="student-card card-tilt" aria-label={`${markText} student card rotated front`}>
    <div className="landscape-face">
      <div className="landscape-art" aria-hidden="true" />
      <div className="landscape-brand-panel">
        <BrandMark text={profile.markText} large />
        <span className="brand-wordmark"><small>INTERNATIONAL</small><strong>STUDENT</strong><small>IDENTITY CARD</small></span>
      </div>
      <StudyNetworkMark compact />
      <div className="landscape-number"><span>{markText} card number</span><b>S 358 001 034 872 C</b></div>
      <button className="landscape-portrait" type="button" onClick={onEdit} aria-label="更换个人照片" title="点击更换头像"><Portrait photo={profile.photo} variant="landscape" /></button>
      <div className="landscape-holder" style={{ '--holder-name-weight': profile.nameWeight }}>
        <span>Studies at | Étudiant à | Est. de Enseñanza</span><strong>{profile.school}</strong>
        <small>Name | Nom | Nombre</small><b className="landscape-holder-name">{profile.name}</b>
        <small>Born | Né(e) le | Nacido/a el</small><b className="landscape-holder-value">21/01/2003</b>
        <small>Validity | Validité | Validez</small><b className="landscape-holder-value">{validityRange(openedAt)}</b>
      </div>
      <V7Mark landscape />
      <RouteMark compact />
      <div className="landscape-k1lroy" aria-label="K1LROY">K1LROY</div>
    </div>
    <SecurityField text={profile.markText} />
  </article>
}

function CircularTypePattern() {
  return <svg className="back-pattern" viewBox="0 0 650 390" aria-hidden="true">
    <defs>
      {BACK_RINGS.map((radius, index) => <path
        id={`back-ring-${index}`}
        key={`path-${radius}`}
        d={`M ${533 - radius} -8 a ${radius} ${radius} 0 1 0 ${radius * 2} 0 a ${radius} ${radius} 0 1 0 ${-radius * 2} 0`}
      />)}
    </defs>
    {BACK_RINGS.map((radius, index) => {
      const circumference = Math.PI * 2 * radius
      const characterCount = Math.min(BACK_PARAGRAPH.length, Math.max(20, Math.ceil(circumference / 4.2)))
      const availableStart = Math.max(1, BACK_PARAGRAPH.length - characterCount)
      const start = (index * 173) % availableStart
      const ringText = BACK_PARAGRAPH.slice(start, start + characterCount)
      return <text key={radius}><textPath href={`#back-ring-${index}`} startOffset="0%" textLength={circumference.toFixed(1)} lengthAdjust="spacing">{ringText}</textPath></text>
    })}
  </svg>
}

function CardBack({ markText }) {
  const safeMarkText = markText.trim() || 'ISIC'
  return <article className="student-card card-back" aria-label={`${safeMarkText} student card reverse`}>
    <div className="landscape-back">
      <CircularTypePattern />
      <p className="back-rim">CARTE D'ÉTUDIANT INTERNATIONALE | CARNET INTERNACIONAL DE ESTUDIANTE</p>
      <div className="back-rule" />
      <p className="back-copy">THIS CARD IS ISSUED BY AND REMAINS<br />THE PROPERTY OF THE {safeMarkText} LEARNING ASSOCIATION.<br /><span>The holder of this card is a full-time student.<br />Le porteur de cette carte est étudiant à temps complet.<br />El titular de este carnet es estudiante a tiempo completo.</span></p>
      <div className="back-links"><b>{safeMarkText}DANMARK·DK</b><b>{safeMarkText}·FI</b><b>{safeMarkText}·IS</b><b>{safeMarkText}·NL</b><b>{safeMarkText}·NO</b><b>{safeMarkText}·SE</b></div>
      <p className="back-code">SA-358-031</p>
    </div>
    <SecurityField text={markText} />
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

  return <section className="editor" aria-label="编辑卡面资料">
    <div className="editor-head"><div><span>LOCAL PROFILE</span><h2>编辑卡面资料</h2></div><button type="button" onClick={onClose} aria-label="关闭编辑器">×</button></div>
    <div className="editor-fields">
      <label>姓名<input value={profile.name} maxLength="28" onChange={(event) => onChange({ ...profile, name: event.target.value })} /></label>
      <label>学校<input value={profile.school} maxLength="36" onChange={(event) => onChange({ ...profile, school: event.target.value })} /></label>
      <label>全部标识文字<input value={profile.markText} maxLength="8" onChange={(event) => onChange({ ...profile, markText: event.target.value })} /></label>
      <label>图2姓名粗度<select value={profile.nameWeight} onChange={(event) => onChange({ ...profile, nameWeight: Number(event.target.value) })}>{NAME_WEIGHTS.map((weight) => <option value={weight} key={weight}>{weight}</option>)}</select></label>
      <label>二维码目标网址<input type="url" value={profile.qrUrl} maxLength="512" onChange={(event) => onChange({ ...profile, qrUrl: event.target.value })} /></label>
    </div>
    <input ref={uploadRef} type="file" accept="image/*" hidden onChange={selectPhoto} />
    <button type="button" className="upload" onClick={() => uploadRef.current?.click()}>上传头像</button>
    {profile.photo ? <button type="button" className="clear-photo" onClick={() => onChange({ ...profile, photo: '' })}>恢复参考头像</button> : null}
    <p>标识文字、图2姓名粗度、二维码网址、姓名、学校和照片都可修改，并只保存在当前浏览器。二维码是真实可扫描的。</p>
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
    const markText = profile.markText.trim() || 'ISIC'
    document.title = `${markText} Student Card`
  }, [profile.markText])

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === 'ArrowLeft') setPage((current) => Math.max(0, current - 1))
      if (event.key === 'ArrowRight') setPage((current) => Math.min(2, current + 1))
      if (event.key.toLowerCase() === 'e') setEditorOpen(true)
      if (event.key === 'Escape') setEditorOpen(false)
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

  return <main className="app-shell">
    <div className="phone-stage" style={{ width: PHONE_WIDTH * phoneScale, height: PHONE_HEIGHT * phoneScale, '--phone-scale': phoneScale }}>
      <div className="phone" aria-label={`${profile.markText.trim() || 'ISIC'} student card learning app`}>
        <header className="status-bar"><time>{`${twoDigits(now.getHours())}:${twoDigits(now.getMinutes())}`}</time><SignalIcons /></header>
        <section className="validity-bar" aria-label="current validity">
          <button className="back-button" type="button" aria-label="previous page" onClick={() => setPage((current) => Math.max(0, current - 1))}><ChevronLeft /></button>
          <span className="status-dot" /><strong>VALID</strong><time>{formatStatusTime(now)}</time>
        </section>
        <div className="card-viewport" onPointerDown={onPointerDown} onPointerUp={onPointerUp} onPointerCancel={() => { gesture.current = null }}>
          <div className="card-track" style={{ transform: `translateX(-${page * 100}%)` }}>
            <CardFront profile={profile} openedAt={openedAt} onEdit={() => setEditorOpen(true)} />
            <CardTilt profile={profile} openedAt={openedAt} onEdit={() => setEditorOpen(true)} />
            <CardBack markText={profile.markText} />
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
