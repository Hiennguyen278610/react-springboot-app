import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@radix-ui/react-label"
import { Code, LockKeyholeIcon, Loader2, User } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { loginRequest, type LoginRequest } from "@/schema/auth.schema"
import { authService } from "@/services/auth.service"
import { useEffect, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"

export default function LoginPage() {
    const navigate = useNavigate()
    const location = useLocation()
    const routeState = (location.state as { error?: string } | undefined) ?? undefined
    const { refreshUser, currentUser } = useAuth()
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const { register, handleSubmit, formState: { errors } } = useForm<LoginRequest>({
        resolver: zodResolver(loginRequest), defaultValues: {
            username: "",
            password: "",
        },
    })

    const onSubmit = async (data: LoginRequest) => {
        setIsLoading(true)
        setError(null)
        try {
            const response = await authService.login(data)
            localStorage.setItem("token", response.token)
            await refreshUser()
            navigate("/home")
        } catch (err) { setError(err instanceof Error ? err.message : "Đăng nhập thất bại") }
        finally { setIsLoading(false) }
    }

    useEffect(() => {
        if (currentUser) {
            navigate("/home", { replace: true })
        }
    }, [currentUser, navigate])

    useEffect(() => {
        if (routeState?.error) {
            setError(routeState.error)
        }
    }, [routeState])

    return (
        <div className="flex h-full select-none items-center justify-center">
            <Card className="w-120 gap-y-8 rounded-4xl">
                <CardHeader className="flex flex-col items-center gap-y-5">
                    <p className="p-4 bg-primary shadow-lg shadow-primary/30 rounded-3xl"><Code className="text-background text-l" /></p>
                    <div className="flex flex-col items-center gap-y-2">
                        <CardTitle><p className="text-2xl text-primary font-bold">Chào mừng đến với Flogin</p></CardTitle>
                        <CardDescription>Đăng nhập bằng tài khoản quản trị để truy cập Flogin.</CardDescription>
                    </div>
                </CardHeader>

                <CardContent>
                    <form id="login-form" onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-y-2">
                        <Label className="text-primary font-bold">Tên đăng nhập</Label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <Input type="text" placeholder="admin123" className="pl-11 pr-4 py-5 rounded-xl"
                                data-testid="username-input"
                                {...register("username")}
                                disabled={isLoading} />
                        </div>
                        {errors.username && (<p className="text-sm text-red-500" data-testid="username-error">{errors.username.message}</p>)}

                        <Label className="text-primary font-bold">Mật khẩu</Label>
                        <div className="relative">
                            <LockKeyholeIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <Input type="password" className="pl-11 pr-4 py-5 rounded-xl"
                                data-testid="password-input"
                                {...register("password")}
                                disabled={isLoading} />
                        </div>
                        {errors.password && (<p className="text-sm text-red-500" data-testid="password-error">{errors.password.message}</p>)}

                        {error && (<p className="text-sm text-red-500 text-center mt-2" data-testid="login-message">{error}</p>)}
                    </form>
                </CardContent>

                <CardFooter className="flex flex-col gap-y-4">
                    <Button type="submit" form="login-form" variant="flogin_activate"
                        className="w-full hover:font-bold p-5 rounded-xl"
                        data-testid="login-button"
                        disabled={isLoading}>
                        {isLoading ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />Đang đăng nhập...</>) : ("Đăng nhập")}
                    </Button>

                    <CardDescription>
                        <p>Bằng cách đăng nhập, bạn đồng ý với{" "}
                            <a href="/terms" target="_blank" rel="noopener noreferrer" className="text-primary! underline">
                                Điều khoản Dịch vụ</a>{" "}và{" "}
                            <a href="/privacy" target="_blank" rel="noopener noreferrer" className="text-primary! underline">
                                Chính sách Quyền riêng tư</a>{" "}của chúng tôi.</p>
                    </CardDescription>
                </CardFooter>
            </Card>
        </div>
    )
}