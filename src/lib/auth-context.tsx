import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useAuthTelegram, TelegramUser, setAuthTokenGetter } from '@/lib/api-client';

interface LocalUser extends TelegramUser {
  photoUrl?: string;
}

interface AuthContextValue {
  user: LocalUser | null;
  token: string | null;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<LocalUser | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('wallet_token'));
  const [isLoading, setIsLoading] = useState(true);

  const auth = useAuthTelegram();

  useEffect(() => {
    // Register the token getter for api-client-react
    setAuthTokenGetter(() => localStorage.getItem('wallet_token'));
    
    const WebApp = window.Telegram?.WebApp;
    let initData = "";
    let photoUrl = "";
    
    if (WebApp) {
      WebApp.ready();
      WebApp.expand();
      WebApp.setHeaderColor?.('#0a0b10'); // Matches our deep background
      WebApp.setBackgroundColor?.('#0a0b10');
      initData = WebApp.initData;
      photoUrl = WebApp.initDataUnsafe?.user?.photo_url || "";
    }

    if (initData) {
      auth.mutate({ data: { initData } }, {
        onSuccess: (data) => {
          setToken(data.token);
          setUser({ ...data.user, photoUrl });
          localStorage.setItem('wallet_token', data.token);
          setIsLoading(false);
        },
        onError: () => {
          setIsLoading(false);
        }
      });
    } else {
      // DEV MODE Fallback when opened in browser without Telegram SDK
      setTimeout(() => {
        const devToken = "dev_token_mock";
        setToken(devToken);
        setUser({
          telegramId: "12345678",
          firstName: "Satoshi",
          lastName: "Nakamoto",
          username: "satoshi",
          balance: 14500.50
        });
        localStorage.setItem('wallet_token', devToken);
        setIsLoading(false);
      }, 800);
    }
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-background">
        <div className="w-10 h-10 rounded-full border-[3px] border-secondary border-t-primary animate-spin" />
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, token, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}