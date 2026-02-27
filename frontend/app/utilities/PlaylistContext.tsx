"use client";
import { createContext, useContext, useState, useEffect } from "react";

interface Video {
  id: number
  videoId: string;
  title: string;
  embedUrl: string;
}

interface PlaylistContextType {
  playlist: Video[];
  addVideo: (video: Video) => void;
  removeVideo: (id: number) => void;
  clearPlaylist: () => void;
}

const PlaylistContext = createContext<PlaylistContextType | null>(null);

export const PlaylistProvider = ({ children }: { children: React.ReactNode }) => {
  const [playlist, setPlaylist] = useState<Video[]>([]);

  // Load playlist when user logs in / page refresh
  useEffect(() => {
    fetch("http://localhost:4000/playlist", {
      credentials: "include",
    })
      .then(res => res.json())
      .then(data => setPlaylist(data.videos ?? []))
      .catch(() => {});
  }, []);

  const addVideo = async (video: Video) => {
    const res = await fetch("http://localhost:4000/playlist", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(video),
    });

    const saved = await res.json();

    setPlaylist(prev => {
      const exists = prev.some(v => v.videoId === saved.videoId);
      if (exists) return prev;
      return [...prev, saved];
    });
  };

  const clearPlaylist = async () => {
    await fetch("http://localhost:4000/playlist", {
      method: "DELETE",
      credentials: "include",
    });

    setPlaylist([]);
  };

  const removeVideo = async (id: number) => {
  await fetch(`http://localhost:4000/playlist/${id}`, {
    method: "DELETE",
    credentials: "include",
  });

  setPlaylist(prev => prev.filter(video => video.id !== id));
};

  return (
    <PlaylistContext.Provider value={{ playlist, addVideo, removeVideo, clearPlaylist }}>
      {children}
    </PlaylistContext.Provider>
  );
};

export const usePlaylist = () => {
  const context = useContext(PlaylistContext);
  if (!context) throw new Error("usePlaylist must be used inside PlaylistProvider");
  return context;
};