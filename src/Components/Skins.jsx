import React, { useEffect, useState } from 'react'
import axios from 'axios'
import Swal from 'sweetalert2'
import { GiCurvyKnife } from 'react-icons/gi'

const Skins = () => {
  const [weapons, setWeapons] = useState([])
  const [selectedWeapon, setSelectedWeapon] = useState(null)
  const [search, setSearch] = useState('')
  const { ipcRenderer } = window.require('electron')

  useEffect(() => {
    axios.get('https://valorant-api.com/v1/weapons').then(res => {
      const data = res.data.data.map(w => ({
        uuid: w.uuid,
        name: w.displayName,
        icon: w.displayIcon,
        category: w.shopData?.category || 'Melee',
        skins: w.skins
          .filter(s => s.displayIcon && !s.displayName.includes('Random') && !s.displayName.includes('Standard'))
          .map(s => ({ uuid: s.uuid, name: s.displayName, icon: s.displayIcon }))
      })).filter(w => w.skins.length > 0)
      setWeapons(data)
      setSelectedWeapon(data[0]?.uuid || null)
    })
  }, [])

  const equip = (uuid, name) => {
    ipcRenderer.send('equip', uuid)
    Swal.fire({ icon: 'success', text: `Equipped: ${name}`, toast: true, position: 'top-end', background: '#141418', color: '#f0f0f8', showConfirmButton: false, timer: 2500, iconColor: '#ff4655' })
  }

  const currentWeapon = weapons.find(w => w.uuid === selectedWeapon)
  const filtered = currentWeapon?.skins.filter(s => s.name.toLowerCase().includes(search.toLowerCase())) || []

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', overflow: 'hidden' }}>

      <div className='scroll-area' style={{ width: 130, flexShrink: 0, borderRight: '1px solid #1a1a22', padding: '10px 6px', display: 'flex', flexDirection: 'column', gap: 3 }}>
        {weapons.map(w => (
          <WeaponBtn key={w.uuid} weapon={w} active={selectedWeapon === w.uuid}
            onClick={() => { setSelectedWeapon(w.uuid); setSearch('') }} />
        ))}
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '7px 16px', background: 'rgba(255,70,85,0.08)', borderBottom: '1px solid rgba(255,70,85,0.18)', flexShrink: 0 }}>
          <span style={{ color: '#ff4655', fontSize: 11 }}>⚠</span>
          <span style={{ color: '#c0a0a4', fontSize: 11, letterSpacing: 0.5 }}>These changes require a game restart to take effect</span>
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: 16, gap: 12, overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div>
            <p className='brand-font' style={{ margin: 0, fontSize: 16, color: '#f0f0f8', letterSpacing: 2 }}>{currentWeapon?.name}</p>
            <p style={{ margin: 0, fontSize: 11, color: '#38384e' }}>{filtered.length} skins</p>
          </div>
          {currentWeapon?.icon && (
            <img src={currentWeapon.icon} style={{ height: 30, objectFit: 'contain', opacity: 0.4 }} />
          )}
        </div>

        <input value={search} onChange={e => setSearch(e.target.value)}
          className='NoDrag'
          style={{ width: '100%', background: '#111116', border: '1px solid #1e1e28', borderRadius: 24, padding: '8px 16px', color: '#f0f0f8', fontSize: 13, outline: 'none', flexShrink: 0 }}
          placeholder={`Search ${currentWeapon?.name} skins...`} />

        <div className='scroll-area' style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignContent: 'flex-start' }}>
          {filtered.map(skin => <SkinCard key={skin.uuid} skin={skin} onEquip={equip} />)}
        </div>
        </div>
      </div>

    </div>
  )
}

function WeaponBtn({ weapon, active, onClick }) {
  const [hov, setHov] = useState(false)
  return (
    <button onClick={onClick} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      className='NoDrag'
      style={{ padding: '7px 10px', borderRadius: 8, background: active ? 'rgba(255,70,85,0.12)' : hov ? '#18181e' : 'transparent', borderLeft: `2px solid ${active ? '#ff4655' : 'transparent'}`, borderTop: 'none', borderRight: 'none', borderBottom: 'none', color: active ? '#ff4655' : hov ? '#c0c0d8' : '#44445e', transition: 'all 0.15s', cursor: 'pointer', textAlign: 'left', fontSize: 12, fontWeight: active ? 600 : 400 }}>
      {weapon.name}
    </button>
  )
}

function SkinCard({ skin, onEquip }) {
  const [hov, setHov] = useState(false)
  return (
    <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ width: 'calc(33.33% - 6px)', background: hov ? '#161620' : '#111116', border: `1px solid ${hov ? '#2a2a38' : '#1a1a22'}`, borderRadius: 12, padding: 10, display: 'flex', flexDirection: 'column', gap: 8, transition: 'all 0.15s' }}>
      <div style={{ background: '#0d0d12', borderRadius: 8, padding: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', height: 64 }}>
        <img src={skin.icon} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
      </div>
      <p style={{ fontSize: 11, color: '#606078', margin: 0, textAlign: 'center', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{skin.name}</p>
      <EquipBtn onClick={() => onEquip(skin.uuid, skin.name)} />
    </div>
  )
}

function EquipBtn({ onClick }) {
  const [hov, setHov] = useState(false)
  return (
    <button onClick={onClick} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      className='NoDrag'
      style={{ width: '100%', padding: '6px', borderRadius: 8, background: hov ? '#ff4655' : '#18181e', border: `1px solid ${hov ? '#ff4655' : '#252530'}`, color: hov ? '#fff' : '#50506a', fontSize: 11, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
      <GiCurvyKnife size={11} />
      EQUIP
    </button>
  )
}

export default Skins
