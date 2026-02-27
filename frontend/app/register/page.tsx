"use client"
import Router, { useRouter } from 'next/navigation'
import React, { useState } from 'react'

const Page = () => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const router = useRouter()
  // const [query, setQuery] = useState("")

  const handleSubmit: React.SubmitEventHandler<HTMLFormElement> = async (e) => {
  e.preventDefault();

  try {
    const res = await fetch("http://localhost:4000/auth/register", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) throw new Error("Invalid credentials")

    setEmail("")
    setPassword("")

    router.push("/login")

  } catch (error) {
    console.error(error);
  }
}

  return (
    <div className='bg-linear-to-b from-black via-stone-900 to-indigo-800 flex flex-col h-screen'>  
      <div className='flex h-50 justify-center items-center'>
        <h1>Banner</h1> 
      </div>
      <div className=" w-full flex flex-col justify-center items-center">

        <form onSubmit={handleSubmit} className="flex flex-col bg-indigo-500 p-6 rounded-lg gap-4 w-80">
          <h1 className="text-white text-xl text-center">Register</h1>
          <label className="flex flex-col text-white">
            Email:
            <input 
              type="text" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-indigo-600/80 mt-1 p-2 rounded text-white" />
          </label>

          <label className="flex flex-col text-white">
            Password:
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-indigo-600/80 mt-1 p-2 rounded text-white" />
          </label>

          <button type='submit' className="bg-white text-black py-2 rounded">
            Submit
          </button>
        </form>

      </div>

    </div>
 
  )
}

export default Page
