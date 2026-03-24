import React from 'react'

const IconBar = () => {
    const btnStyle = "bg-stone-800 text-stone-100 rounded p-1"
  return (
    <div className='flex flex-col p-1 gap-2 justify-start'>
        <a href="https://www.youtube.com/" target="_blank" rel="noopener noreferrer">
            <button className={btnStyle}>
                YouTube
            </button>
        </a>
        <a href="https://www.twitch.tv/" target="_blank" rel="noopener noreferrer">
            <button className={btnStyle}>
                Twitch
            </button>
        </a>
      
    </div>
  )
}

export default IconBar
