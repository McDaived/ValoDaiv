//          / __ \____ _(_)   _____  ____/ /
//         / / / / __ `/ / | / / _ \/ __  / 
//        / /_/ / /_/ / /| |/ /  __/ /_/ /  
//       /_____/\__,_/_/ |___/\___/\__,_/   
import React, { useEffect, useState } from 'react'
import axios from 'axios'
import Swal from 'sweetalert2';

const Skins = () => {
    const [skins, setSkins] = useState([]);
    const [skinName, setSkinName] = useState('');
    const { ipcRenderer } = window.require('electron');
    useEffect(() => {
        axios.get('https://valorant-api.com/v1/weapons/skins').then(res => {
            let newArr = res.data.data.filter(skin => skin.displayIcon && !(skin.displayName.includes('Random')) && !(skin.displayName.includes('Standard')));
            let newArray = [];
            newArr.forEach(item => {
                newArray.push({ displayName: item.displayName, displayIcon: item.displayIcon, uuid: item.uuid })
            })
            setSkins(newArray);
            newArr = [];
        })
    }, [])
    const equipSkin = (skinUid, skinName) => {
        ipcRenderer.send('equip', skinUid);
        Swal.fire({
            icon: 'Skin Has Been Set',
            text: 'Equipped ' + skinName,
            toast: true,
            position: 'top-end',
            background: '#682525',
            color: '#000000',
            showConfirmButton: false,
            timer: 3000
        })
    }
    return (
        <div className='w-[70%] h-[100%] flex flex-col gap-3 items-center text-red p-3'>
            <input value={skinName} onChange={(e) => { setSkinName(e.target.value) }} className='outline-none border-none bg-red-700 p-3 rounded-lg w-[100%]' placeholder='Search Skins' />
            <div className='w-[100%] h-[100%] gap-3 rounded-lg relative justify-center flex flex-wrap overflow-y-scroll'>
                {skins?.filter(skin => (skin?.displayName.toLowerCase().includes(skinName.toLowerCase()))).map(skin => {
                    return <div className='bg-red-800 w-[100%] rounded-lg p-3 gap-3 relative flex flex-col items-center justify-center flex-grow'>
                        <img src={skin?.displayIcon} className='w-[100%]' />
                        <p className='NoDrag mt-auto'>{skin?.displayName}</p>
                        <button className='bg-red-700 rounded-lg p-3 hover:bg-black-600 transition-all duration-100 ease-linear w-[100%] NoDrag' onClick={() => { equipSkin(skin?.uuid, skin?.displayName) }}>Equip</button>
                    </div>
                })}
            </div>
        </div>
    )
}

export default Skins
