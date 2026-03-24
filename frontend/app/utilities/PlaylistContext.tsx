"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useUser } from "./UserContext";

interface Video {
  platform: string;
  channel: string;
  playlistItemId: string;
  embedUrl: string;
  id: number;
}

interface PlaylistContextType {
  playlist: Video[];
  addVideo: (video: Video) => void;
  removeVideo: (id: number) => void;
  clearPlaylist: () => void;
  reloadPlaylist: () => void;
  updateVideo: (id: number, channel: string, embedUrl: string, playlistItemId: string, platform: string) => void;
}

const PlaylistContext = createContext<PlaylistContextType | null>(null);

export const PlaylistProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useUser();
  const [playlist, setPlaylist] = useState<Video[]>([])

  const updateVideoInDb = async (id: number, playlistItemId: string, embedUrl: string, channel: string) => {
  try {
    const res = await fetch(`http://localhost:4000/playlist/${id}`, {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ playlistItemId, embedUrl, channel }),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Failed to update video: ${errText}`);
    }

    const updated = await res.json();
    setPlaylist(prev =>
      prev.map(v => (v.id === id ? { ...v, playlistItemId, embedUrl, channel } : v))
    );
  } catch (err) {
    console.error("Error updating video in DB:", err);
  }
};

  const updateVideo = (id: number, channel: string, embedUrl: string, playlistItemId: string, platform: string) => {
  setPlaylist(prev =>
    prev.map(v => (v.id === id ? { ...v, embedUrl, playlistItemId, channel, platform } : v))
  );

  updateVideoInDb(id, playlistItemId, embedUrl, channel);
};

  const reloadPlaylist = useCallback(async () => {
    if (!user) {
      setPlaylist([]);
      return;
    }
    try {
      const res = await fetch("http://localhost:4000/playlist", {
        credentials: "include",
        cache: "no-store",
      });
      if (!res.ok) throw new Error("Failed to fetch playlist");

      const data = await res.json();

      setPlaylist(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error loading playlist:", err);
      setPlaylist([]);
    }
  }, [user]);

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
      value={{ playlist, addVideo, removeVideo, clearPlaylist, reloadPlaylist, updateVideo }}
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