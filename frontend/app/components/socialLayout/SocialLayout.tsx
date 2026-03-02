"use client"
import { usePlaylist } from '@/app/utilities/PlaylistContext';

const SocialLayout = () => {
  const {playlist, removeVideo, clearPlaylist} =  usePlaylist()

  return (
    <div className='bg-linear-to-b from-purple-200 via-black to-purple-900 flex flex-col p-2 gap-2 w-full h-1/2 overflow-x-auto overscroll-x-none rounded '>
      <div className='bg-stone-900 flex justify-center items-center'>                                 {/* CHANGE MAKE URL .env var */}
        <button className='bg-white text-red-600 p-1 rounded' onClick={() => window.location.href = "http://localhost:4000/twitch/connect"}>
          Connect to Twitch
        </button>
      </div>

        {/* Video Playlist Section */}
        <div className='bg-stone-950 flex flex-2 w-full gap-3 p-2 overflow-x-auto overscroll-x-none scroll-smooth rounded'>
          <button 
            onClick={() => clearPlaylist()}
            className='bg-white text-red-500 rounded'> Delete All</button>
          {playlist.map(item => (
            <div key={`${item.platform}${item.playlistItemId}`} className='snap-center shrink-0 w-full md:w-125'>
              <iframe
                src={item.embedUrl}
                // width={300}
                // height={400}
                loading="lazy"
                allow="accelerometer; controls; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full rounded-lg"
              />
              <button 
                onClick={() => removeVideo(item.id!)}
                className='bg-white text-red-500 rounded'> Delete Video</button>
            </div>
          ))}
        </div>
    </div>
  )
}

export default SocialLayout