import React, { useState } from 'react'
import { GoPencil, GoSignOut, GoGear } from 'react-icons/go'
import { BsInstagram, BsPersonFill, BsTelegram } from 'react-icons/bs'
import { GiCurvyKnife } from 'react-icons/gi'

const { shell, app } = window.require('@electron/remote')

const NAV = [
  { id: 3, icon: GiCurvyKnife, label: 'Skin Changer' },
  { id: 2, icon: GoPencil,     label: 'Rank Editor'  },
  { id: 5, icon: BsPersonFill, label: 'Customize'    },
  { id: 4, icon: GoGear,       label: 'Authorize'    },
]

function NavBtn({ icon: Icon, label, active, onClick }) {
  const [hov, setHov] = useState(false)
  return (
    <button onClick={onClick} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      className='NoDrag'
      style={{
        display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 8,
        width: '100%', background: active ? 'rgba(255,70,85,0.1)' : hov ? 'rgba(255,255,255,0.04)' : 'transparent',
        borderLeft: `2px solid ${active ? '#ff4655' : 'transparent'}`,
        borderTop: 'none', borderRight: 'none', borderBottom: 'none',
        color: active ? '#ff4655' : hov ? '#c0c0d8' : '#50506a',
        transition: 'all 0.15s', cursor: 'pointer',
      }}>
      <Icon size={15} style={{ flexShrink: 0 }} />
      <span style={{ fontSize: 13, fontWeight: 500 }}>{label}</span>
    </button>
  )
}

function BottomBtn({ icon: Icon, label, onClick, danger }) {
  const [hov, setHov] = useState(false)
  return (
    <button onClick={onClick} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      className='NoDrag'
      style={{
        display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 8,
        width: '100%', background: hov ? (danger ? 'rgba(255,70,85,0.1)' : 'rgba(255,255,255,0.04)') : 'transparent',
        color: hov ? (danger ? '#ff4655' : '#c0c0d8') : '#38384e',
        transition: 'all 0.15s', cursor: 'pointer', border: 'none',
      }}>
      <Icon size={15} style={{ flexShrink: 0 }} />
      <span style={{ fontSize: 13, fontWeight: 500 }}>{label}</span>
    </button>
  )
}

const Sidebar = ({ page, setPage }) => (
  <div style={{ width: 200, flexShrink: 0, height: '100%', background: '#0d0d10', borderRight: '1px solid #1a1a22', display: 'flex', flexDirection: 'column' }}>
    <div style={{ flex: 1, padding: '12px 8px', display: 'flex', flexDirection: 'column', gap: 2 }}>
      {NAV.map(item => (
        <NavBtn key={item.id} {...item} active={page === item.id} onClick={() => setPage(item.id)} />
      ))}
    </div>
    <div style={{ height: 1, background: '#1a1a22', margin: '0 12px' }} />
    <div style={{ padding: '8px 8px 12px', display: 'flex', flexDirection: 'column', gap: 2 }}>
      <BottomBtn icon={BsInstagram} label='Instagram' onClick={() => shell.openExternal('https://instagram.com/eii3')} />
      <BottomBtn icon={BsTelegram} label='Telegram' onClick={() => shell.openExternal('https://t.me/Daiived')} />
      <BottomBtn icon={GoSignOut} label='Exit' onClick={() => app.quit()} danger />
    </div>
  </div>
)

export default Sidebar
