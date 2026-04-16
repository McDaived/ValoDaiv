import React, { useState, useEffect } from 'react'
import axios from 'axios'
import Swal from 'sweetalert2'

const TABS = ['Profile', 'Cards', 'Borders', 'Titles']

const S = {
  page:  { width: '100%', height: '100%', display: 'flex', flexDirection: 'column', padding: 20, gap: 14 },
  card:  { background: '#111116', border: '1px solid #1e1e28', borderRadius: 14, padding: '14px 16px' },
  label: { fontSize: 11, color: '#44445e', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 6, display: 'block' },
  input: { width: '100%', background: '#18181e', border: '1px solid #252530', borderRadius: 10, padding: '9px 13px', color: '#f0f0f8', fontSize: 14, outline: 'none' },
  search:{ width: '100%', background: '#111116', border: '1px solid #1e1e28', borderRadius: 24, padding: '9px 16px', color: '#f0f0f8', fontSize: 13, outline: 'none' },
}

function Tab({ label, active, onClick }) {
  const [hov, setHov] = useState(false)
  return (
    <button onClick={onClick} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      className='NoDrag'
      style={{ flex: 1, padding: '8px 4px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s', border: 'none', background: active ? '#ff4655' : hov ? '#1e1e28' : '#111116', color: active ? '#fff' : hov ? '#c0c0d8' : '#50506a' }}>
      {label}
    </button>
  )
}

const Customize = () => {
  const { ipcRenderer } = window.require('electron')
  const [tab, setTab] = useState(0)
  const [search, setSearch] = useState('')
  const [level, setLevel] = useState(500)
  const [isIdle, setIsIdle] = useState(false)
  const [cards, setCards] = useState([])
  const [selectedCard, setSelectedCard] = useState(null)
  const [borders, setBorders] = useState([])
  const [selectedBorder, setSelectedBorder] = useState(null)
  const [titles, setTitles] = useState([])
  const [selectedTitle, setSelectedTitle] = useState(null)
  const [saveHov, setSaveHov] = useState(false)

  useEffect(() => {
    axios.get('https://valorant-api.com/v1/playercards').then(res => setCards(res.data.data.filter(c => c.displayIcon)))
    axios.get('https://valorant-api.com/v1/levelborders').then(res => setBorders(res.data.data.filter(b => b.levelNumberAppearance)))
    axios.get('https://valorant-api.com/v1/playertitles').then(res => setTitles(res.data.data.filter(t => t.titleText)))
  }, [])

  const save = () => {
    ipcRenderer.send('profileUpdate', { accountLevel: parseInt(level) || 1, isIdle, playerCardId: selectedCard, preferredLevelBorderId: selectedBorder, playerTitleId: selectedTitle })
    Swal.fire({ icon: 'success', text: 'Changes saved!', toast: true, position: 'top-end', background: '#141418', color: '#f0f0f8', showConfirmButton: false, timer: 2500, iconColor: '#ff4655' })
  }

  return (
    <div style={S.page}>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '7px 16px', background: 'rgba(255,70,85,0.08)', border: '1px solid rgba(255,70,85,0.18)', borderRadius: 10, flexShrink: 0 }}>
        <span style={{ color: '#ff4655', fontSize: 11 }}>⚠</span>
        <span style={{ color: '#c0a0a4', fontSize: 11, letterSpacing: 0.5 }}>These changes require a game restart to take effect</span>
      </div>

      <div style={{ display: 'flex', gap: 6 }}>
        {TABS.map((t, i) => <Tab key={i} label={t} active={tab === i} onClick={() => { setTab(i); setSearch('') }} />)}
      </div>

      {tab === 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, overflow: 'hidden' }}>
          <div style={S.card}>
            <label style={S.label}>Account Level</label>
            <input type='number' min='1' max='2000' value={level} onChange={e => setLevel(e.target.value)} className='NoDrag' style={S.input} />
            <p style={{ fontSize: 11, color: '#32324a', marginTop: 6 }}>Shown in lobby and friends list</p>
          </div>
          <div style={{ ...S.card, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <label style={{ ...S.label, marginBottom: 2 }}>Idle Status</label>
              <p style={{ fontSize: 11, color: '#32324a', margin: 0 }}>Appear as away in friends list</p>
            </div>
            <ToggleBtn on={isIdle} onClick={() => setIsIdle(v => !v)} />
          </div>
        </div>
      )}

      {tab === 1 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flex: 1, overflow: 'hidden' }}>
          <input value={search} onChange={e => setSearch(e.target.value)} className='NoDrag' style={S.search} placeholder='Search cards...' />
          <div className='scroll-area' style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignContent: 'flex-start' }}>
            {cards.filter(c => c.displayName.toLowerCase().includes(search.toLowerCase())).map(card => (
              <GridItem key={card.uuid} selected={selectedCard === card.uuid} onClick={() => setSelectedCard(card.uuid)} style={{ width: 'calc(33.33% - 6px)' }}>
                <img src={card.displayIcon} style={{ width: '100%', borderRadius: 6, objectFit: 'cover' }} />
                <p style={{ fontSize: 10, color: '#70708a', textAlign: 'center', marginTop: 4, overflow: 'hidden', textOverflow: 'ellipsis' }}>{card.displayName}</p>
              </GridItem>
            ))}
          </div>
        </div>
      )}

      {tab === 2 && (
        <div className='scroll-area' style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignContent: 'flex-start', flex: 1 }}>
          {borders.map(b => (
            <GridItem key={b.uuid} selected={selectedBorder === b.uuid} onClick={() => setSelectedBorder(b.uuid)} style={{ width: 'calc(50% - 4px)' }}>
              <img src={b.levelNumberAppearance} style={{ width: '100%', height: 56, objectFit: 'contain' }} />
              <p style={{ fontSize: 10, color: '#70708a', textAlign: 'center', marginTop: 4 }}>From Level {b.startingLevel}</p>
            </GridItem>
          ))}
        </div>
      )}

      {tab === 3 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flex: 1, overflow: 'hidden' }}>
          <input value={search} onChange={e => setSearch(e.target.value)} className='NoDrag' style={S.search} placeholder='Search titles...' />
          <div className='scroll-area' style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <TitleRow selected={selectedTitle === ''} onClick={() => setSelectedTitle('')} title='No Title' sub='Remove title' italic />
            {titles.filter(t => t.titleText.toLowerCase().includes(search.toLowerCase())).map(t => (
              <TitleRow key={t.uuid} selected={selectedTitle === t.uuid} onClick={() => setSelectedTitle(t.uuid)} title={t.titleText} sub={t.displayName} />
            ))}
          </div>
        </div>
      )}

      <button onClick={save} onMouseEnter={() => setSaveHov(true)} onMouseLeave={() => setSaveHov(false)}
        className='NoDrag'
        style={{ padding: '11px', borderRadius: 12, background: saveHov ? '#ff6170' : '#ff4655', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 700, letterSpacing: 2, transition: 'background 0.15s', flexShrink: 0 }}>
        SAVE CHANGES
      </button>

    </div>
  )
}

function GridItem({ children, selected, onClick, style }) {
  const [hov, setHov] = useState(false)
  return (
    <div onClick={onClick} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      className='NoDrag'
      style={{ ...style, background: selected ? 'rgba(255,70,85,0.12)' : hov ? '#1a1a24' : '#111116', border: `1px solid ${selected ? '#ff4655' : '#1e1e28'}`, borderRadius: 10, padding: 8, cursor: 'pointer', transition: 'all 0.15s', boxShadow: selected ? '0 0 0 1px rgba(255,70,85,0.3)' : 'none' }}>
      {children}
    </div>
  )
}

function TitleRow({ selected, onClick, title, sub, italic }) {
  const [hov, setHov] = useState(false)
  return (
    <div onClick={onClick} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ padding: '10px 14px', borderRadius: 10, background: selected ? 'rgba(255,70,85,0.1)' : hov ? '#1a1a24' : '#111116', border: `1px solid ${selected ? '#ff4655' : '#1e1e28'}`, cursor: 'pointer', transition: 'all 0.15s', flexShrink: 0, WebkitAppRegion: 'no-drag' }}>
      <p style={{ margin: 0, fontSize: 13, color: italic ? '#505070' : '#d0d0e8', fontStyle: italic ? 'italic' : 'normal', whiteSpace: 'normal', overflow: 'visible' }}>{title}</p>
      <p style={{ margin: '2px 0 0', fontSize: 11, color: '#38384e', whiteSpace: 'normal' }}>{sub}</p>
    </div>
  )
}

function ToggleBtn({ on, onClick }) {
  const [hov, setHov] = useState(false)
  return (
    <button onClick={onClick} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      className='NoDrag'
      style={{ padding: '7px 18px', borderRadius: 8, background: on ? '#ff4655' : hov ? '#1e1e28' : '#18181e', color: on ? '#fff' : '#60607a', border: `1px solid ${on ? '#ff4655' : '#252530'}`, cursor: 'pointer', fontSize: 12, fontWeight: 600, transition: 'all 0.15s' }}>
      {on ? 'ON' : 'OFF'}
    </button>
  )
}

export default Customize
