import { authService } from "@/services/auth.service";
import type { UserResponse } from "@/schema/user.schema";
import {
    createContext,
    type ReactNode,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from "react";

interface AuthContextValue {
    currentUser: UserResponse | null;
    loading: boolean;
    error: string | null;
    refreshUser: () => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [currentUser, setCurrentUser] = useState<UserResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const refreshUser = useCallback(async () => {
        const token = localStorage.getItem("token");

        if (!token) {
            setCurrentUser(null);
            setError(null);
            setLoading(false);
            return;
        }

        setLoading(true);
        try {
            const user = await authService.getCurrentUser();
            setCurrentUser(user);
            setError(null);
        } catch (err) {
            setCurrentUser(null);
            setError(err instanceof Error ? err.message : "Phiên đăng nhập không hợp lệ");
            localStorage.removeItem("token");
        } finally {
            setLoading(false);
        }
    }, []);

    const logout = useCallback(() => {
        localStorage.removeItem("token");
        setCurrentUser(null);
        setError(null);
    }, []);

    useEffect(() => {
        void refreshUser();
    }, [refreshUser]);

    const value = useMemo<AuthContextValue>(() => ({
        currentUser,
        loading,
        error,
        refreshUser,
        logout,
    }), [currentUser, loading, error, refreshUser, logout]);

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth phải được dùng trong AuthProvider");
    }
    return context;
}
