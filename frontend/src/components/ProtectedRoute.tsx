import { Loader2 } from "lucide-react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export function ProtectedRoute() {
    const { currentUser, loading, error } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div className="flex h-screen w-screen flex-col items-center justify-center gap-y-4 bg-sidebar text-primary">
                <Loader2 className="h-8 w-8 animate-spin" />
                <p>Đang xác thực phiên làm việc...</p>
            </div>
        );
    }

    if (!currentUser) {
        return <Navigate to="/login" replace state={{ from: location.pathname}} />;
    }

    return <Outlet />;
}
