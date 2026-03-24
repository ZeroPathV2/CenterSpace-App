"use client";
import { useLive } from "@/app/utilities/LiveContext";
import LivePlaylist from "./LivePlaylist";
import VideoPlaylist from "./VideoPlaylist";
import { usePlaylist } from "@/app/utilities/PlaylistContext";

const SocialLayout = () => {
  const {liveVideos} = useLive()
  const {playlist} = usePlaylist()

  console.log("Live Videos:",liveVideos);
  
  
  return (
    <div className="bg-stone-900 flex flex-col p-2 gap-2 w-full h-full">
      
      {/* Icon Bar - Fixed */}
        <div className="bg-stone-950 flex flex-[0.05] shrink-0 gap-2 p-2 w-full overflow-x-scroll scroll-smooth rounded-xl">
              
          <div className=" bg-stone-100 flex px-3 h-full justify-center items-center rounded-xl">
            <p className="text-black">{'All'}</p>
          </div>
          <div className=" bg-stone-900 flex px-3 h-full justify-center items-center rounded-xl">
            <p className="text-white">{'Make'}</p>
          </div>
          <div className=" bg-stone-900 flex px-3 h-full justify-center items-center rounded-xl">
            <p className="text-white">{'Something'}</p>
          </div>
          <div className=" bg-stone-900 flex px-3 h-full justify-center items-center rounded-xl">
            <p className="text-white">{'BJJ'}</p>
          </div>
          <div className=" bg-stone-900 flex px-3 h-full justify-center items-center rounded-xl">
            <p className="text-white">{'Calm'}</p>
          </div>

        </div>

      {/* Scrollable Section */}
      <div className="bg-none flex flex-col flex-1 overflow-y-auto gap-2 rounded-xl">

        {/* 40% Section */}
        {(liveVideos.length >= 1) ? (
        <div className={`bg-none w-full shrink-0 rounded-xl`}>
          <LivePlaylist />
        </div>): null}

        {/* 50% Section */}
        {playlist.length >= 1 ? (<div className="bg-none w-full shrink-0 rounded-xl">
          <VideoPlaylist />
        </div>): null}

        {/* Discover */}
        <div className="bg-stone-950 flex gap-4 px-4 h-[40vh] w-full rounded-xl shrink-0 justify-center items-center">
          <div className="bg-stone-600 w-full h-px"/>
            Discover
          <div className="bg-stone-600 w-full h-px"/>
        </div>

        {/* Discover */}
        <div className="bg-stone-950 flex gap-4 px-4 h-[40vh] w-full rounded-xl shrink-0 justify-center items-center">
          <div className="bg-stone-600 w-full h-px"/>
            Catagory
          <div className="bg-stone-600 w-full h-px"/>
        </div>

      </div>

    </div>
  );
};

export default SocialLayout;