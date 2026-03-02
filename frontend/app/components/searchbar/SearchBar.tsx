"use client"
import { usePlaylist } from "@/app/utilities/PlaylistContext"
import React, { useState } from "react"

const SearchBar = () => {
  const {addVideo} = usePlaylist()
  const [query, setQuery] = useState("")
  const [platform, setPlatform] = useState<"twitch" | "youtube">("twitch")

  const searchQuery = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const res = await fetch(`http://localhost:4000/${platform}/search?channel=${query}`, {
        method: "GET",
        credentials: "include",
      });

      console.log(`Request: http://localhost:4000/${platform}/search?channel=${query}`);
      

      if (!res.ok) {
        const errText = await res.text()
        throw new Error(`Search Faild: ${errText}` || "Search failed")
      }

      const data = await res.json();
      console.log("Data:",data);
      
      if (!data.videos?.length) throw new Error("No videos found");

      addVideo(data.videos[0]);
      setQuery("");
    } 
    catch (error) {
      alert(error.message || `Please sign in to ${platform}.`);
      console.error(error);
    }
  }

  return (
    <div className="bg-black flex p-2 gap-2 justify-center items-center rounded-full">

      <button
        className="bg-white text-red-500 rounded"
        onClick={() =>setPlatform(prev => prev === "twitch" ? "youtube" : "twitch")}> {platform}
      </button>

      <form onSubmit={searchQuery}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search"
          className="w-96"
        />
      </form>
    </div>
  )
}

export default SearchBar