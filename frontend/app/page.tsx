// "use client"
import NavBar from "./components/navigation/NavBar";
import SideBar from "./components/navigation/SideBar";
import SocialLayout from "./components/socialLayout/SocialLayout";

import "./globals.css"

export default function Home() {
  return (
    <div className="bg-stone-900 flex flex-col w-full max-h-screen gap-2">
      <div className="fixed top-0 left-0 w-full h-[5vh] z-50">
        <NavBar />
      </div>

      <div className="bg-none flex flex-[0.875] w-full h-full p-0 ">

        <div className=" fixed top-[5vh] left-0 h-[85vh] w-[15vw] z-40">
          <SideBar />
        </div>

        <div className="ml-[15vw] mt-[5vh] mb-[5vh] w-full h-[90vh] overflow-y-auto overscroll-none">
          <SocialLayout />
        </div>

      </div>

      <div className='fixed bottom-0 left-0 w-full h-[10vh] px-2 pb-2 bg-stone-900'>
        <div className=" stone-panel flex w-full h-full justify-center items-center rounded">
          Spotiy Playlist

        </div>
      </div>

    </div>
  );
}
