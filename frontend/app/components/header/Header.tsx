"use client"
import React from 'react'
import SearchBar from '../searchbar/SearchBar'
import { useRouter } from 'next/navigation'

const Header = () => {
  const router = useRouter()

  const logout = async () =>{
    await fetch("http://localhost:4000/auth/logout",{
      method: "POST",
      credentials: "include"
    })

    // await logout()
    // setUser(null);
    router.push("/login")


  }
  return (
    <div>
      Header
      <SearchBar />
      <button 
        onClick={logout}
        className='bg-white text-red-500'
        >
        Loggout
      </button>
    </div>
  )
}

export default Header
