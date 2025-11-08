import { Routes, Route, Link } from "react-router-dom"
import Login from "./page/admin/Login"

export default function App() {
  return (
    <div className="w-screen h-screen">
      <Link to="/login"></Link>
      <Routes>
        <Route path="/login" element={<Login />}/>
      </Routes>
    </div>
  )
}
