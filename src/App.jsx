import { useState, useEffect } from 'react'
import Sidebar from './Components/Sidebar'
import Skins from './Components/Skins'
import Settings from './Components/Settings'
import Swal from 'sweetalert2'
import Profile from './Components/Profile'
import Customize from './Components/Customize'
import { VscChromeMinimize, VscChromeMaximize, VscChromeClose } from 'react-icons/vsc'
import { GiCurvyKnife } from 'react-icons/gi'

function WinBtn({ onClick, children, hoverBg, hoverColor }) {
  const [hov, setHov] = useState(false)
  return (
    <button onClick={onClick} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ width: 36, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', background: hov ? hoverBg : 'transparent', color: hov ? (hoverColor || '#f0f0f8') : '#505065', border: 'none', borderRadius: 4, cursor: 'pointer', transition: 'all 0.15s', flexShrink: 0 }}>
      {children}
    </button>
  )
}

function HomePage() {
  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 18 }}>
      <div style={{ position: 'relative', width: 90, height: 90, marginBottom: 4 }}>
        <div style={{ position: 'absolute', inset: 0, border: '2px solid #ff4655', borderRadius: 16, transform: 'rotate(45deg)', boxShadow: '0 0 24px rgba(255,70,85,0.35), inset 0 0 24px rgba(255,70,85,0.08)', background: 'rgba(255,70,85,0.05)' }} />
        <div style={{ position: 'absolute', inset: 8, border: '1px solid rgba(255,70,85,0.3)', borderRadius: 10, transform: 'rotate(45deg)' }} />
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <GiCurvyKnife size={36} style={{ color: '#ff4655', filter: 'drop-shadow(0 0 10px rgba(255,70,85,0.6))' }} />
        </div>
      </div>
      <h1 className='brand-font' style={{ fontSize: 50, color: '#ff4655', letterSpacing: 6, margin: 0, textShadow: '0 0 50px rgba(255,70,85,0.3)' }}>VALODAIV</h1>
      <p style={{ color: '#38385a', fontSize: 11, letterSpacing: 5, margin: 0 }}>MASTER OF IMPOSSIBLE</p>
      <div style={{ width: 36, height: 2, background: 'linear-gradient(90deg, transparent, #ff4655, transparent)' }} />
    </div>
  )
}

function App() {
  const [page, setPage] = useState(0)
  const [user, setUser] = useState()
  const { ipcRenderer } = window.require('electron')
  const { getCurrentWindow } = window.require('@electron/remote')
  const win = getCurrentWindow()

  useEffect(() => {
    const onUnauthorized = () => {
      Swal.fire({ icon: 'error', text: 'Account Not Authorized', toast: true, position: 'top-end', background: '#141418', color: '#f0f0f8', showConfirmButton: false, timer: 3000, iconColor: '#ff4655' })
    }
    ipcRenderer.on('unauthorized', onUnauthorized)
    return () => ipcRenderer.removeListener('unauthorized', onUnauthorized)
  }, [])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100vw', height: '100vh', background: '#0a0a0c', color: '#f0f0f8' }}>

      <div className='TitleBar' style={{ height: 40, flexShrink: 0, background: '#0d0d10', borderBottom: '1px solid #1a1a22', display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingLeft: 16, paddingRight: 4 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <GiCurvyKnife size={13} style={{ color: '#ff4655' }} />
          <span className='brand-font NoDrag' style={{ color: '#ff4655', fontSize: 13, letterSpacing: 2 }}>VALODAIV</span>
        </div>
        <div className='NoDrag' style={{ display: 'flex' }}>
          <WinBtn onClick={() => win.minimize()} hoverBg='#22222e'><VscChromeMinimize size={13} /></WinBtn>
          <WinBtn onClick={() => win.isMaximized() ? win.unmaximize() : win.maximize()} hoverBg='#22222e'><VscChromeMaximize size={12} /></WinBtn>
          <WinBtn onClick={() => win.close()} hoverBg='#ff4655' hoverColor='#fff'><VscChromeClose size={13} /></WinBtn>
        </div>
      </div>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <Sidebar page={page} setPage={setPage} />
        <main style={{ flex: 1, overflow: 'hidden' }}>
          {page === 0 && <HomePage />}
          {page === 2 && <Profile />}
          {page === 3 && <Skins />}
          {page === 4 && <Settings user={user} userSetter={setUser} />}
          {page === 5 && <Customize />}
        </main>
      </div>

    </div>
  )
}

export default App
