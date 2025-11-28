import { Routes, Route, Navigate } from "react-router-dom"
import LoginPage from "./page/admin/LoginPage"
import NotFoundPage from "./page/admin/NotFoundPage"
import AdminLayout from "./layout/AdminLayout"
import AccountPage from "./page/admin/AccountPage"
import ProductPage from "./page/admin/ProductPage"
import { ProtectedRoute } from "./components/ProtectedRoute"

export default function App() {
  return (
    <div className="w-screen h-screen">
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />
        
        <Route element={<ProtectedRoute />}>
          <Route path="/home" element={<AdminLayout />}>
            <Route index element={<Navigate to="/home/users" replace />} />
            <Route path="users" element={<AccountPage />} />
            <Route path="products" element={<ProductPage />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </div>
  )
}
