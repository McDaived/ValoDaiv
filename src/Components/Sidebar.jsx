//          / __ \____ _(_)   _____  ____/ /
//         / / / / __ `/ / | / / _ \/ __  / 
//        / /_/ / /_/ / /| |/ /  __/ /_/ /  
//       /_____/\__,_/_/ |___/\___/\__,_/   
import React from 'react'
import { GoLock, GoPencil, GoSignOut, GoGear } from 'react-icons/go'
import { BsDiscord } from 'react-icons/bs'
import { GiCurvyKnife } from 'react-icons/gi'

const { app, shell } = window.require('@electron/remote');

const Sidebar = ({ pageSetter }) => {
    const exitApp = () => {
        app.quit();
    }
    return (
        <div className='Sidebar bg-red-800 h-[100%] w-[30%] relative flex flex-col p-3 gap-3 text-white'>
            <button className='NoDrag w-[100%] bg-black hover:bg-red-500 p-3 rounded-lg cursor-pointer transition-all duration-100 ease-linear relative flex justify-center items-center' onClick={() => { pageSetter(1) }}><GoLock className='absolute left-3' />Insta Locker</button>
            <button className='NoDrag w-[100%] bg-black hover:bg-red-500 p-3 rounded-lg cursor-pointer transition-all duration-100 ease-linear relative flex justify-center items-center' onClick={() => { pageSetter(3) }}><GiCurvyKnife className='absolute left-3' />Skin Changer</button>
            <button className='NoDrag w-[100%] bg-black hover:bg-red-500 p-3 rounded-lg cursor-pointer transition-all duration-100 ease-linear relative flex justify-center items-center' onClick={() => { pageSetter(2) }}><GoPencil className='absolute left-3' />Rank Editor</button>
            <button className='NoDrag w-[100%] bg-black hover:bg-red-500 p-3 rounded-lg cursor-pointer transition-all duration-100 ease-linear relative flex justify-center items-center' onClick={() => { pageSetter(4) }}><GoGear className='absolute left-3' />Authorize Account</button>
            <button className='NoDrag w-[100%] bg-black hover:bg-red-500 p-3 rounded-lg cursor-pointer transition-all duration-100 ease-linear relative flex justify-center items-center mt-auto' onClick={() => { shell.openExternal('https://discordapp.com/users/314721544901361664') }}><BsDiscord className='absolute left-3' />Discord</button>
            <button className='NoDrag w-[100%] bg-black hover:bg-red-500 p-3 rounded-lg cursor-pointer transition-all duration-100 ease-linear relative flex justify-center items-center' onClick={exitApp}><GoSignOut className='absolute left-3' />Exit</button>
        </div>
    )
}

export default Sidebar
