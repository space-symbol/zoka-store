import { User } from "@/types";
import React from "react";
import { createContext, useState } from "react";

interface AuthContextType {
    user: User | null;
    setUser: (user: User | null) => void;
  }
  

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>({
        id: 1,
        username: "admin",
        role: "admin",
        email: "stoleruvadim05@gmail.com",
    });
    return (
        <AuthContext.Provider value={{ user, setUser }}>
        {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => React.useContext(AuthContext)!;
  