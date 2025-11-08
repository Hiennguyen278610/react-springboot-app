import LoginIllustration from "@/components/LoginIllustration"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@radix-ui/react-label"

export default function Login() {
    return (
        <div className="flex flex-row h-full select-none">
            <LoginIllustration></LoginIllustration>
            <div className="w-1/2 h-full flex items-center justify-center">
                <Card className="w-2/3">
                    <CardHeader>
                        <CardTitle><p className="text-2xl">Đăng nhập</p></CardTitle>
                        <CardDescription>Đăng nhập bằng tài khoản quản trị để truy cập trang quản lý.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form className="flex flex-col gap-y-3">
                            <Label>Email</Label>
                            <Input id="email" type="email" placeholder="mail@example.com" required></Input>
                            <Label>Mật khẩu</Label>
                            <Input id="password" type="password" required ></Input>
                        </form>
                    </CardContent>
                    <CardFooter className="flex flex-col gap-y-4">
                        <Button type="submit" className="w-full">Đăng nhập</Button>
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
        </div>
    )
}