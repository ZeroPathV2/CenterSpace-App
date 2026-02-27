"use client"
import { usePlaylist } from "@/app/utilities/PlaylistContext"
import React, { useState } from "react"

const SearchBar = () => {
  const {addVideo} = usePlaylist()
  const [query, setQuery] = useState("")
  const [platform, setPlatform] = useState<"twitch" | "youtube">("twitch")

  const searchQuery = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault()

    try {
      const res = await fetch(
        `http://localhost:4000/${platform}/search?channel=${query}`,{
          method: "GET",
          credentials: "include",
        })

      if (!res.ok) throw new Error("Search Failed")

      const data = await res.json()
      addVideo(data.videos[0])
      setQuery("")

    } catch (error) {
      console.error(error)
    }
  }

  return (
    <div>
      <button
        onClick={() =>setPlatform(prev => prev === "twitch" ? "youtube" : "twitch")}> {platform}
      </button>

      <form onSubmit={searchQuery}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search"
        />
      </form>
    </div>
  )
}

export default SearchBar