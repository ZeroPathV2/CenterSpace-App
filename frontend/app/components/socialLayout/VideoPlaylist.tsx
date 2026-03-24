import { usePlaylist } from '@/app/utilities/PlaylistContext';
import React, { useState } from 'react'

const VideoPlaylist = () => {
    const { playlist, removeVideo, clearPlaylist, updateVideo } = usePlaylist();
    const [indices, setIndices] = useState<Record<number, number>>({});
    // const [options, setOptions] = useState(false)
    const [grid, setGrid] = useState<number>(3)

    const btnSty = `bg-none text-stone-600 px-1 cursor-pointer rounded`;

    const favourite = async (fav: any) => {
      console.log("Fav:",fav);
      
      try {
        console.log("Favourite:",fav.channel, fav.platform);
        
        const res = await fetch(`http://localhost:4000/creators/favourite`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: fav.channel,
            platform: fav.platform,
            channel: fav.channel
          }),
        });

        if (!res.ok) throw new Error("Could not add favourite.");

        const data = await res.json();
        console.log("Added favourite:", data);
      } catch (error) {
        console.error("Favourite error:", error);
      }
    };

    const handleChange = async (id: number, channel: string, direction: number) => {
    try {
        const currentIndex = indices[id] ?? 0;
        const newIndex = Math.max(currentIndex + direction, 0);

        let url = "";
        const video = playlist.find(v => v.id === id);
        if (!video) return;

        if (video.platform === "twitch") {
        url = `http://localhost:4000/twitch/search?channel=${channel}&index=${newIndex}`;
        } else {
        url = `http://localhost:4000/youtube/search?channel=${channel}&playlistId=${video.playlistItemId}&index=${newIndex}`;
        }

        const res = await fetch(url, { credentials: "include" });
        const data = await res.json();
        if (!data.videos?.[0]) return;

        const newVideo = data.videos[0];

        updateVideo(id, newVideo.channel, newVideo.embedUrl, newVideo.playlistItemId, newVideo.platform);
        setIndices(prev => ({ ...prev, [id]: newIndex }));
    } catch (err) {
        console.error("Error fetching next/prev video:", err);
    }
    };

  return (
        <div className='bg-stone-950 flex flex-col gap-2 p-2 w-full h-full rounded-xl'>
          <div className='bg-stone-900 flex w-full justify-between items-center rounded-xl'>
            <span className="flex pl-2 text-2xl text-grey-500 font-medium shrink-0">Watch List</span>
            <div className={`bg-none flex w-fit h-fit gap-2 px-2 items-center rounded transition-all duration-300`}>

              <button onClick={clearPlaylist}className={`${btnSty}`}>Delete All</button>
              <button className={btnSty} onClick={() => setGrid(4)}>4x4</button>
              <button className={btnSty} onClick={() => setGrid(3)}>3x3</button>
              <button className={btnSty} onClick={() => setGrid(2)}>2x2</button>
              {/* <button className={`ml-auto ${btnSty} px-2`} onClick={() => setOptions(o => !o)}>{options? '>' : '<'}</button> */}

            </div>
          </div>

          <div className={`grid grid-cols-${grid} w-full h-full gap-2 rounded-xl`}>
            {playlist.map((item) => (
              <div
                key={`${item.platform}${item.playlistItemId}`}
                className="flex flex-col w-full rounded-xl"
              >
                <iframe
                  src={item.embedUrl}
                  loading="lazy"
                  allowFullScreen
                  className="w-full aspect-video rounded-t-xl"
                />

                {/* Video Title & Controlls Section */}
                <div className="bg-stone-900 flex items-center w-full p-2 rounded-b-xl">
                  <div className="flex-1"/>

                  {/* Controls (centered) */}
                  <div className=" flex gap-4 justify-center">
                    {item.platform === "twitch" && (<button type="button" className={btnSty} onClick={() => handleChange(item.id!, item.channel, -1)}>{"<"}</button>)}
                    <button type="button" onClick={() => removeVideo(item.id!)}className={btnSty}>Delete</button>
                    {item.platform === "twitch" && (<button type="button" className={btnSty}onClick={() => handleChange(item.id!, item.channel, 1)}>{">"}</button>)}
                  </div>
                  
                  {/* Favourite Button */}
                  <div className="flex-1 flex justify-end">
                    <button className={btnSty}onClick={() => favourite(item)}>Favourite</button>
                  </div>

                </div>
              </div>
            ))}
          </div>
        </div>
  )
}

export default VideoPlaylist
