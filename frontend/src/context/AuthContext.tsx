// src/context/AuthContext.tsx
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as auth from '../utils/authUtils';

interface Props { children: ReactNode }
interface Context {
  user: auth.User|null; isLoading: boolean; isAuthenticated: boolean;
  signin: (e:string,p:string)=>Promise<void>; signout: ()=>Promise<void>;
}

const AuthContext = createContext<Context|undefined>(undefined);
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be within AuthProvider');
  return ctx;
}

export const AuthProvider = ({ children }: Props) => {
  const [user, setUser] = useState<auth.User|null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async()=>{
      const token = await auth.getValidToken();
      setUser(token ? auth.getUser() : null);
      setIsLoading(false);
    })();
  }, []);

  const signin = async (e:string,p:string) => {
    setIsLoading(true);
    const u = await auth.signin(e,p);
    setUser(u);
    setIsLoading(false);
  };
  const signout = async () => {
    setIsLoading(true);
    await auth.signout();
    setUser(null);
    setIsLoading(false);
  };

  return (
    <AuthContext.Provider value={{
      user, isLoading, isAuthenticated:!!user, signin, signout
    }}>
      {children}
    </AuthContext.Provider>
  );
};
