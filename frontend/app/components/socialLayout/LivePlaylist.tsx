"use client"
import { useLive } from "@/app/utilities/LiveContext";
// import { usePlaylist } from "@/app/utilities/PlaylistContext";

const LivePlaylist = () => {
  const { liveVideos } = useLive();
  // const { playlist } = usePlaylist()

  return (
      <div className={`bg-stone-950 flex flex-col w-full h-full gap-2 p-2 rounded-xl`}>

        <div className="bg-stone-900 flex w-full justify-start items-center rounded-xl">
          <span className="pl-2 pr-4 text-2xl text-grey-500 font-medium">
            Live Now
          </span>
        </div>

        <div className={`bg-none flex gap-2 p-0 overflow-x-auto scroll-smooth overscroll-x-none items-center rounded-xl
          ${liveVideos.length <= 3 ? 'justify-center' : 'justify-start'}`}>

          {liveVideos.map((v) => v && (
            <div
              key={`${v.platform}-${v.channel}`}
              className="flex shrink-0 basis-[calc((1/3*100%)-0.25rem)] justify-center items-center"
            >
              <iframe
                src={v.embedUrl}
                loading="lazy"
                allowFullScreen
                className="w-full aspect-video rounded-xl"
              />
            </div>
          ))}
        </div>

      </div>
  );
};

export default LivePlaylist