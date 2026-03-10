"use client";

import { createContext, useContext, useEffect, useState } from "react";

type User = {
  id: number;
  email: string;
};

type UserContextType = {
  user: User | null;
  loading: boolean;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  refreshUser: () => Promise<void>;
};

const UserContext = createContext<UserContextType | null>(null);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    try {
      const res = await fetch("http://localhost:4000/auth/me", {
        credentials: "include",
      });

      if (!res.ok) {
        setUser(null);
      } else {
        const data = await res.json();

        setUser({
          id: data.userId,
          email: data.email,
        });
      }
    } catch {
      setUser(null);
    }

    setLoading(false);
  };

  useEffect(() => {
    const loadUser = async () => {
      await fetchUser()
      setLoading(false)
    }

    loadUser()
  }, []);

  return (
    <UserContext.Provider
      value={{
        user,
        loading,
        setUser,
        refreshUser: fetchUser,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);

  if (!context) {
    throw new Error("useUser must be used inside UserProvider");
  }

  return context;
}