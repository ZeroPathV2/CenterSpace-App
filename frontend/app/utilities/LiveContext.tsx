"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useUser } from "./UserContext";

export interface LiveVideo {
  platform: string;
  channel: string;
  creatorName: string;
  embedUrl: string;
  id: string; // Twitch channel id or unique identifier
}

interface LiveContextType {
  liveVideos: LiveVideo[];
  reloadLive: () => void;
}

const LiveContext = createContext<LiveContextType | null>(null);

export const LiveProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useUser();
  const [liveVideos, setLiveVideos] = useState<LiveVideo[]>([]);

  const fetchFavourites = useCallback(async () => {
    if (!user) {
      setLiveVideos([]);
      return;
    }

    try {
      // 1️⃣ Fetch user favourites
      const res = await fetch("http://localhost:4000/creators/favourites", {
        credentials: "include",
        cache: "no-store",
      });

      if (!res.ok) throw new Error("Failed to fetch favourites");

      const data = await res.json();

      // 2️⃣ Map platform accounts
      const accounts: { platform: string; channel: string; creatorName: string; platformId?: string }[] = data.flatMap(
        (fav: any) =>
          fav.creator.platformAccounts.map((acc: any) => ({
            platform: acc.platform,
            channel: acc.channel,
            creatorName: fav.creator.name,
            platformId: acc.platformId,
          }))
      );

      // 3️⃣ Filter only live Twitch channels
      const liveAccounts: LiveVideo[] = [];

      for (const acc of accounts) {
        try {
          if (acc.platform === "twitch") {
            const liveRes = await fetch(`http://localhost:4000/twitch/live?channel=${acc.channel}`, {
              credentials: "include",
            });

            if (!liveRes.ok) continue;

            const liveData = await liveRes.json();

            if (liveData.isLive && liveData.embedUrl) {
              liveAccounts.push({
                platform: "twitch",
                channel: acc.channel,
                creatorName: acc.creatorName,
                embedUrl: liveData.embedUrl,
                id: acc.platformId || acc.channel,
              });
            }
          } else {
            // Add other platforms if needed, e.g., YouTube, Spotify
          }

          // Slight delay to avoid rate limiting
          await new Promise((r) => setTimeout(r, 100));
        } catch (err) {
          console.error("Failed to fetch live status for", acc.channel, err);
        }
      }

      setLiveVideos(liveAccounts);
    } catch (err) {
      console.error("Error loading favourites:", err);
      setLiveVideos([]);
    }
  }, [user]);

  useEffect(() => {
    fetchFavourites();
  }, [user, fetchFavourites]);

  return (
    <LiveContext.Provider value={{ liveVideos, reloadLive: fetchFavourites }}>
      {children}
    </LiveContext.Provider>
  );
};

export const useLive = () => {
  const context = useContext(LiveContext);
  if (!context) throw new Error("useLive must be used inside LiveProvider");
  return context;
};