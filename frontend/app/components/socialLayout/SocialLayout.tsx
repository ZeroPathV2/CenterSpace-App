"use client"
import { usePlaylist } from '@/app/utilities/PlaylistContext';
import React, { useState } from 'react'

interface Video{
  videoId: string;
  title: string;
  embedUrl: string;
}

const SocialLayout = () => {
  const {playlist, addVideo, removeVideo, clearPlaylist} =  usePlaylist()

  const connectTwitch = async () => {
    const res = await fetch("http://localhost:4000/twitch/connect", {
      credentials: "include",
    });

    const data = await res.json();

    if (!res.ok) {
      console.error("Request failed");
      return;
    }

    if (!data.url) {
      console.error("No URL returned from backend");
      return;
    }

    window.location.href = data.url;
}
  return (
    <div>
      <div className='bg-purple-500 felx'>

        <button className='bg-white text-red-600 p-1' onClick={connectTwitch}>
          Connect to Twitch
        </button>
        
      </div>
        <div className='bg-stone-800 flex w-full gap-1 p-2 overflow-x-auto snap-x snap-mandatory scroll-smooth'>
          {playlist.map((item,index) => (
            <div key={item.videoId + index} className='snap-center shrink-0 w-full md:w-125'>
              <iframe
                src={item.embedUrl}
                // width={300}
                // height={400}
                allowFullScreen
                className="w-full h-64 rounded-lg"
              />
            </div>
          ))}
        </div>

        <div className='bg-stone-800'>
            Spotiy Playlist
        </div>
    </div>
  )
}

export default SocialLayout
