"use client";

import React, { useState } from "react";
import { usePlaylist } from "@/app/utilities/PlaylistContext";
import Image from "next/image";
import youtube from '@/public/static/icons/youtube.png'
import twitch from '@/public/static/icons/twitch.png'
import search from '@/public/static/icons/search.png'

const SearchBar = () => {
  const { addVideo } = usePlaylist();
  const [query, setQuery] = useState("");
  const [platform, setPlatform] = useState<"twitch" | "youtube">("twitch");

  const searchQuery = async () => {
    if (!query.trim()) return;
    try {
      const res = await fetch(
        `http://localhost:4000/${platform}/search?channel=${query}`,
        { method: "GET", credentials: "include" }
      );

      console.log(`Request: http://localhost:4000/${platform}/search?channel=${query}`);

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || "Search failed");
      }

      const data = await res.json();
      console.log("Data:", data);

      if (!data.videos?.length) throw new Error("No videos found");

      addVideo(data.videos[0]); // add the first video
      setQuery(""); // clear input
    } catch (error: any) {
      alert(error.message || `Please sign in to ${platform}.`);
      console.error(error);
    }
  };

  return (
    <div className=" flex gap-0 justify-center items-center ">
      {/* Platform toggle */}

      {/* Search form */}
      <form
        className="flex gap-y-1 w-full h-full justify-center items-center border border-stone-500 rounded"
        onSubmit={(e) => {
          e.preventDefault();
          searchQuery();
        }}
      >
          <button
            className="bg-white text-red-500 h-full rounded-l"
            type="button"
            onClick={() => setPlatform((prev) => (prev === "twitch" ? "youtube" : "twitch"))}
          >
            <Image
              src={platform === "twitch" ? twitch : youtube}
              className="w-8 h-8 rounded-l"
              alt={platform}
            />

      </button>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search"
          className="bg-stone-900 w-70 h-8 px-1"
        />

        <button
          type="submit"
          className=" text-red-500 h-full  rounded-r"
        >
          <Image
          src={search}
          className="w-8 h-8 rounded-r"
          alt="Search"
        />
        </button>
      </form>
    </div>
  );
};

export default SearchBar;