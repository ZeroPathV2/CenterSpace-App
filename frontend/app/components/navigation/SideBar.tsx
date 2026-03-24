"use client"
import React from 'react'
import IconBar from './IconBar'

const SideBar = () => {
  return (
    <div className='bg-stone-900 flex flex-col w-full h-full py-2 ps-2 '>
      <div className='bg-stone-950 w-full h-full gap-2 p-2 rounded-xl'>
        SideBar

        <IconBar />

        <button className="bg-stone-800 text-stone-100 rounded-xl p-1"
          onClick={() => (window.location.href = "http://localhost:4000/twitch/connect")}
        > Connect to Twitch
        </button>

      </div>
    </div>
  )
}

export default SideBar
