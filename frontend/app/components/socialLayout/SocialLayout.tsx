"use client"
import { usePlaylist } from '@/app/utilities/PlaylistContext';
import IconBar from '../navigation/IconBar';

const SocialLayout = () => {
  const {playlist, removeVideo, clearPlaylist} =  usePlaylist()

  // console.log("playlist:",playlist.[0]);
  // const twitchConnect = async () => {
  //   fetch('http://localhost:4000/twitch/connect', {
  //     method: 'GET',
  //     credentials: 'include', // <-- send cookies
  //   })
  //   .then(res => res.json())
  //   .catch(console.error)
  // }
  

  return (
    <div className='bg-linear-to-b from-purple-200 via-black to-purple-900 flex flex-col p-2 gap-2 w-full h-1/2 overflow-x-auto overscroll-x-none rounded '>
      <div className='bg-red-500'>
        <IconBar />
      </div>
      <div className='bg-stone-900 flex justify-center items-center'>                                 {/* CHANGE MAKE URL .env var */}
        {/* <a href="http://localhost:4000/twitch/connect"> */}
          <button 
            className='bg-white text-red-600 p-1 rounded'
            onClick={() => window.location.href = "http://localhost:4000/twitch/connect"}
          >
            Connect to Twitch
          </button>
        {/* </a> */}
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