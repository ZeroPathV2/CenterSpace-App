"use client"
import React from 'react'
import SearchBar from '../searchbar/SearchBar'
import { useRouter } from 'next/navigation'
import { useUser } from '@/app/utilities/UserContext'
import { usePlaylist } from '@/app/utilities/PlaylistContext'

const Header = () => {
  const router = useRouter()
  const {setUser} = useUser()
  const {reloadPlaylist} = usePlaylist()

  const logout = async () => {
  try {
    await fetch("http://localhost:4000/auth/logout", {
      method: "POST",
      credentials: "include",
      cache: "no-cache",
    });

    setUser(null);
    await reloadPlaylist();
    router.push("/login");
  } catch (err) {
    console.error("Logout failed:", err);
  }
};
  return (
    <div className='bg-stone-950 flex w-full h-full justify-between items-center'>
      {/* Logo / Home Controlls*/}
      <div className=''>
        Header
      </div>

      {/* Search / Navigation */}
      <div className=' flex h-full justify-evenly items-center'>
        <SearchBar />
      </div>

      {/* User Account Controlls */}
      <div className=''>
        <button onClick={logout} className='bg-white text-red-500'>Loggout</button>
      </div>
    </div>
  )
}

export default Header
