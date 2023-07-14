//          / __ \____ _(_)   _____  ____/ /
//         / / / / __ `/ / | / / _ \/ __  / 
//        / /_/ / /_/ / /| |/ /  __/ /_/ /  
//       /_____/\__,_/_/ |___/\___/\__,_/   
import React, { useState, useEffect } from 'react'
import axios from 'axios'
import Swal from 'sweetalert2'

const Profile = () => {
    const [Ranks, setRanks] = useState([]);
    const [Rank, setRank] = useState(0);
    const { ipcRenderer } = window.require('electron');
    useEffect(() => {
        axios.get('https://valorant-api.com/v1/competitivetiers').then(res => {
            let newArr = res.data.data[4];
            let newArray = [];
            newArr.tiers.forEach(item => {
                newArray.push({ displayName: item.tierName, displayIcon: item.largeIcon, tier: item.tier })
            })
            newArray = newArray.filter(rank => !rank.displayName.includes('Unused'));
            setRanks(newArray);
            newArr = [];
        })
    }, [])
    const nextRank = () => {
        if (Rank == Ranks.length - 1) {
            return setRank(0)
        }
        setRank(PrevRank => PrevRank + 1)
    }
    const previousRank = () => {
        if (Rank == 0) {
            return setRank(Ranks.length - 1)
        }
        setRank(PrevRank => PrevRank - 1)
    }
    const saveRank = () => {
        ipcRenderer.send('rankUpdate', Ranks[Rank]?.tier);
        Swal.fire({
            icon: 'success',
            text: 'Rank has been set',
            toast: true,
            position: 'top-end',
            background: '#000000',
            color: '#F9F6F0',
            showConfirmButton: false,
            timer: 3000
        })
    }
    return (
        <div className='w-[70%] h-[100%] flex flex-col gap-3 justify-center items-center text-white p-3'>
            <div className='bg-red-900 w-[100%] h-[100%] gap-3 p-3 rounded-lg relative flex flex-col justify-center items-center NoDrag'>
                <h1 className='text-5xl bold p-3'>{Ranks[Rank]?.displayName}</h1>
                <img src={Ranks[Rank]?.displayIcon} className='w-[50%] rounded-lg mt-auto' />
                <div className='flex gap-3 mt-auto relative w-[100%]'>
                    <button className='NoDrag bg-black w-[50%] p-3 rounded-lg hover:bg-red-500 transition-all duration-100 ease-linear' onClick={previousRank}>Previous</button>
                    <button className='NoDrag bg-black w-[50%] p-3 rounded-lg hover:bg-red-500 transition-all duration-100 ease-linear' onClick={nextRank}>Next</button>
                </div>
            </div>
            <button className='NoDrag w-[100%] bg-black hover:bg-red-500 p-3 rounded-lg cursor-pointer transition-all duration-100 ease-linear relative flex justify-center items-center' onClick={saveRank}>Save Changes</button>
        </div>
    )
}

export default Profile
