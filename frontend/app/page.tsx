// "use state"
import Header from "./components/navigation/NavBar";
import SocialLayout from "./components/socialLayout/SocialLayout";

// "use client"
export default function Home() {
  return (
    <div className="bg-linear-to-b from-black via-black to-purple-950 flex flex-col w-full h-screen">
      <div className="flex flex-1">
        <Header />

      </div>

      <div className="bg-none flex flex-15 px-2 w-full min-h-0 ">
        <SocialLayout />
      </div>

      <div className='bg-stone-700 flex flex-1'>
          Spotiy Playlist
      </div>

    </div>
  );
}
