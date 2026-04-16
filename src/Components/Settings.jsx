import React, { useState } from 'react'
import Swal from 'sweetalert2'
import { GoGear } from 'react-icons/go'
import { BsPersonCircle } from 'react-icons/bs'

const Settings = ({ user, userSetter }) => {
  const fs = window.require('fs')
  const { ipcRenderer } = window.require('electron')
  const [loading, setLoading] = useState(false)
  const [btnHov, setBtnHov] = useState(false)

  const authAccount = () => {
    setLoading(true)
    ipcRenderer.send('localfolder')
    ipcRenderer.once('localfolder', (eve, folderPath) => {
      fs.readFile(folderPath + '\\Riot Games\\Riot Client\\Config\\lockfile', (err, data) => {
        if (err) {
          setLoading(false)
          return Swal.fire({ icon: 'error', text: 'Riot Client not found. Make sure Valorant is running.', toast: true, position: 'top-end', background: '#141418', color: '#f0f0f8', showConfirmButton: false, timer: 3500, iconColor: '#ff4655' })
        }
        Swal.fire({ icon: 'info', text: 'Authorizing...', toast: true, position: 'top-end', background: '#141418', color: '#f0f0f8', showConfirmButton: false, timer: 2000 })
        const parts = String(data).split(':')
        ipcRenderer.send('auth', parts[2], parts[3])
      })
    })
    ipcRenderer.once('userAuth', (eve, userAuth) => {
      setLoading(false)
      userSetter(userAuth)
      Swal.fire({ icon: 'success', text: 'Account authorized!', toast: true, position: 'top-end', background: '#141418', color: '#f0f0f8', showConfirmButton: false, timer: 2500, iconColor: '#ff4655' })
    })
  }

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, gap: 16 }}>

      <div style={{ width: '100%', maxWidth: 360, background: '#111116', border: '1px solid #1e1e28', borderRadius: 16, padding: 28, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
        <div style={{ width: 64, height: 64, borderRadius: '50%', background: user ? 'rgba(255,70,85,0.1)' : '#18181e', border: `2px solid ${user ? '#ff4655' : '#252530'}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <BsPersonCircle size={30} style={{ color: user ? '#ff4655' : '#38384e' }} />
        </div>

        {user ? (
          <>
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: 18, fontWeight: 700, color: '#f0f0f8', margin: '0 0 4px' }}>{user?.acct?.game_name}</p>
              <p style={{ fontSize: 11, color: '#50507a', margin: 0, letterSpacing: 1 }}>#{user?.acct?.tag_line}</p>
            </div>
            <div style={{ background: '#18181e', border: '1px solid #1e1e28', borderRadius: 8, padding: '6px 16px', width: '100%' }}>
              <p style={{ fontSize: 10, color: '#38384e', margin: '0 0 2px', letterSpacing: 1, textTransform: 'uppercase' }}>Player ID</p>
              <p style={{ fontSize: 11, color: '#60607a', margin: 0, fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.sub}</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#4ade80', boxShadow: '0 0 8px rgba(74,222,128,0.5)' }} />
              <span style={{ fontSize: 12, color: '#4ade80' }}>Authorized</span>
            </div>
          </>
        ) : (
          <>
            <p style={{ fontSize: 15, color: '#60607a', margin: 0, textAlign: 'center' }}>No account authorized</p>
            <p style={{ fontSize: 12, color: '#30304a', margin: 0, textAlign: 'center', lineHeight: 1.6 }}>Make sure Valorant is running<br />before authorizing</p>
          </>
        )}
      </div>

      <button onClick={authAccount} disabled={loading}
        onMouseEnter={() => setBtnHov(true)} onMouseLeave={() => setBtnHov(false)}
        className='NoDrag'
        style={{ width: '100%', maxWidth: 360, padding: 12, borderRadius: 12, background: loading ? '#1e1e28' : btnHov ? '#ff6170' : '#ff4655', color: loading ? '#44445e' : '#fff', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', fontSize: 13, fontWeight: 700, letterSpacing: 2, transition: 'all 0.15s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
        <GoGear size={14} />
        {loading ? 'AUTHORIZING...' : 'AUTHORIZE ACCOUNT'}
      </button>

    </div>
  )
}

export default Settings
