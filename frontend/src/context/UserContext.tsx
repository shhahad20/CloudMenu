// src/contexts/UserContext.tsx
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
  useCallback,
} from 'react';
import { apiFetch } from '../hooks/useApiCall';

export interface UserProfile {
  id: string;
  username: string;
  role: string;
  email: string;
  plan: 'Free' | 'Pro' | 'Enterprise';
  updatedAt: string;
}

interface UserContextValue {
  userProfile: UserProfile | null;
  isLoading: boolean;
  refreshUser: () => Promise<void>;
}

const UserContext = createContext<UserContextValue | undefined>(undefined);

export const useUser = () => {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error('useUser must be used within a UserProvider');
  return ctx;
};

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchUser = useCallback(async (force = false) => {
    if (isLoading && !force) return;
    setIsLoading(true);
    try {
      const res = await apiFetch('/profiles/me');
      if (res.status === 401) {
        setUserProfile(null);
      } else if (!res.ok) {
        throw new Error('Failed to fetch profile');
      } else {
        setUserProfile(await res.json());
      }
    } catch (err) {
      console.error('User fetch error:', err);
      setUserProfile(null);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading]);

  // load on mount
  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  return (
    <UserContext.Provider
      value={{
        userProfile,
        isLoading,
        refreshUser: () => fetchUser(true),
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
