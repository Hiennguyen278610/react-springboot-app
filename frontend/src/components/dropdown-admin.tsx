import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ChevronsUpDown, LogOut } from "lucide-react"
import { Label } from "./ui/label"
import { useAuth } from "@/context/AuthContext"
import { useNavigate } from "react-router-dom"
import { useMemo } from "react"

export function DropdownAdmin() {
    const { currentUser, logout } = useAuth()
    const navigate = useNavigate()

    const avatarText = useMemo(() => {
        if (!currentUser?.username) return "??"
        return currentUser.username.slice(0, 2).toUpperCase()
    }, [currentUser?.username])

    const handleLogout = () => {
        logout()
        navigate("/login", { replace: true })
    }

    return (<div className="w-full">
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="flogin_deactivate" className="w-full flex justify-between rounded-2xl h-12">
                    <p className="p-2 bg-primary text-background rounded-2xl flex-1/10">{avatarText}</p>
                    <div className="flex flex-col gap-y-1 w-4/5">
                        <Label className="font-bold">{currentUser?.username ?? "Người dùng"}</Label>
                        <Label className="text-sm">{currentUser?.mail ?? "Không có email"}</Label>
                    </div>
                    <ChevronsUpDown size={30} strokeWidth={3} className="w-auto flex-1/10"/>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-66" align="start">
                <DropdownMenuItem onSelect={(event) => { event.preventDefault(); handleLogout() }} className="gap-x-2 text-destructive focus:text-destructive">
                    <LogOut size={16} />
                    Đăng xuất
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    </div>)
}
