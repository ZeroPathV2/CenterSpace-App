import React from 'react'

const IconBar = () => {
  return (
    <div className='flex p-1 gap-2 items-center'>
        <a href="https://www.youtube.com/" target="_blank" rel="noopener noreferrer">
            <button>
                YouTube
            </button>
        </a>
        <a href="https://www.twitch.tv/" target="_blank" rel="noopener noreferrer">
            <button>
                Twitch
            </button>
        </a>
      
    </div>
  )
}

export default IconBar
