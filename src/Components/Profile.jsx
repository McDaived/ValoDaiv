import React, { useState, useEffect } from 'react'
import axios from 'axios'
import Swal from 'sweetalert2'

const S = {
  page:    { width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, padding: 24 },
  card:    { background: '#111116', border: '1px solid #1e1e28', borderRadius: 16, padding: 24, width: '100%', maxWidth: 340 },
  label:   { fontSize: 11, color: '#44445e', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8, display: 'block' },
  input:   { width: '100%', background: '#18181e', border: '1px solid #252530', borderRadius: 10, padding: '10px 14px', color: '#f0f0f8', fontSize: 14, outline: 'none' },
  saveBtn: { width: '100%', maxWidth: 340, padding: '12px', borderRadius: 12, background: '#ff4655', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 700, letterSpacing: 2, transition: 'background 0.15s' },
}

const Profile = () => {
  const [Ranks, setRanks] = useState([])
  const [Rank, setRank] = useState(0)
  const [leaderboard, setLeaderboard] = useState(0)
  const [btnHov, setBtnHov] = useState(false)
  const { ipcRenderer } = window.require('electron')

  useEffect(() => {
    axios.get('https://valorant-api.com/v1/competitivetiers').then(res => {
      const latest = res.data.data[res.data.data.length - 1]
      const arr = latest.tiers
        .map(t => ({ displayName: t.tierName, displayIcon: t.largeIcon, tier: t.tier }))
        .filter(r => !r.displayName.includes('Unused'))
      setRanks(arr)
    })
  }, [])

  const next = () => setRank(p => p === Ranks.length - 1 ? 0 : p + 1)
  const prev = () => setRank(p => p === 0 ? Ranks.length - 1 : p - 1)

  const save = () => {
    ipcRenderer.send('rankUpdate', Ranks[Rank]?.tier, parseInt(leaderboard) || 0)
    Swal.fire({ icon: 'success', text: 'Rank updated!', toast: true, position: 'top-end', background: '#141418', color: '#f0f0f8', showConfirmButton: false, timer: 2500, iconColor: '#ff4655' })
  }

  return (
    <div style={S.page}>

      <div style={S.card}>
        <p className='brand-font' style={{ textAlign: 'center', fontSize: 20, letterSpacing: 3, color: '#f0f0f8', margin: '0 0 16px', textTransform: 'uppercase' }}>
          {Ranks[Rank]?.displayName || '—'}
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 150, marginBottom: 20 }}>
          {Ranks[Rank]?.displayIcon && (
            <img src={Ranks[Rank].displayIcon} style={{ height: '100%', objectFit: 'contain', filter: 'drop-shadow(0 4px 20px rgba(255,70,85,0.2))' }} />
          )}
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 4, marginBottom: 16 }}>
          {Ranks.slice(0, 8).map((_, i) => (
            <div key={i} style={{ width: Math.floor(Rank / (Ranks.length / 8)) === i ? 16 : 4, height: 3, borderRadius: 2, background: Math.floor(Rank / (Ranks.length / 8)) === i ? '#ff4655' : '#252530', transition: 'all 0.3s' }} />
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <ArrowBtn onClick={prev} label='◀  Prev' />
          <ArrowBtn onClick={next} label='Next  ▶' />
        </div>
      </div>

      <div style={S.card}>
        <label style={S.label}>Leaderboard Position</label>
        <p style={{ fontSize: 11, color: '#32324a', marginBottom: 10 }}>Set to 0 to hide — Radiant only</p>
        <input type='number' min='0' max='500' value={leaderboard}
          onChange={e => setLeaderboard(e.target.value)}
          className='NoDrag' style={S.input} />
      </div>

      <button onClick={save} onMouseEnter={() => setBtnHov(true)} onMouseLeave={() => setBtnHov(false)}
        className='NoDrag' style={{ ...S.saveBtn, background: btnHov ? '#ff6170' : '#ff4655' }}>
        SAVE CHANGES
      </button>

    </div>
  )
}

function ArrowBtn({ onClick, label }) {
  const [hov, setHov] = useState(false)
  return (
    <button onClick={onClick} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      className='NoDrag'
      style={{ flex: 1, padding: '9px', borderRadius: 10, background: hov ? '#222230' : '#18181e', border: '1px solid #252530', color: hov ? '#f0f0f8' : '#60607a', fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s' }}>
      {label}
    </button>
  )
}

export default Profile
