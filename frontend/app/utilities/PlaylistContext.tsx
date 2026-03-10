"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useUser } from "./UserContext";

interface Video {
  platform: string;
  playlistItemId: string;
  title: string;
  embedUrl: string;
  id: number;
}

interface PlaylistContextType {
  playlist: Video[];
  addVideo: (video: Video) => void;
  removeVideo: (id: number) => void;
  clearPlaylist: () => void;
  reloadPlaylist: () => void;
}

const PlaylistContext = createContext<PlaylistContextType | null>(null);

export const PlaylistProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useUser();
  const [playlist, setPlaylist] = useState<Video[]>([])

  const reloadPlaylist = useCallback(async () => {
    if (!user) {
      setPlaylist([]); // clear on logout
      return;
    }
    try {
      const res = await fetch("http://localhost:4000/playlist", {
        credentials: "include",
        cache: "no-store",
      });
      if (!res.ok) throw new Error("Failed to fetch playlist");

      const data = await res.json();

      // Ensure it’s an array for this user
      setPlaylist(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error loading playlist:", err);
      setPlaylist([]);
    }
  }, [user]);

  // Reload playlist whenever the user changes
  useEffect(() => {
    reloadPlaylist()
  },[user, reloadPlaylist]);

  const addVideo = async (video: Video) => {
    if (!user) return;
    try {
      const res = await fetch("http://localhost:4000/playlist", {
        method: "POST",
        credentials: "include",
        cache: "no-store",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(video),
      });

      // setUser(null)
      if (!res.ok) throw new Error(await res.text());

      const saved = await res.json();
      setPlaylist(prev => {
        const exists = prev.some(v => v.playlistItemId === saved.playlistItemId && v.platform === saved.platform);
        if (exists) return prev;
        return [...prev, saved];
      });
    } catch (err) {
      console.error("Error adding video:", err);
    }
  };

  const clearPlaylist = async () => {
    if (!user) return;
    try {
      await fetch("http://localhost:4000/playlist", {
        method: "DELETE",
        credentials: "include",
      });
      setPlaylist([]);
    } catch (err) {
      console.error("Error clearing playlist:", err);
    }
  };

  const removeVideo = async (id: number) => {
    if (!user) return;
    try {
      await fetch(`http://localhost:4000/playlist/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      setPlaylist(prev => prev.filter(video => video.id !== id));
    } catch (err) {
      console.error("Error removing video:", err);
    }
  };

  return (
    <PlaylistContext.Provider
      value={{ playlist, addVideo, removeVideo, clearPlaylist, reloadPlaylist }}
    >
      {children}
    </PlaylistContext.Provider>
  );
};

export const usePlaylist = () => {
  const context = useContext(PlaylistContext);
  if (!context) throw new Error("usePlaylist must be used inside PlaylistProvider");
  return context;
};