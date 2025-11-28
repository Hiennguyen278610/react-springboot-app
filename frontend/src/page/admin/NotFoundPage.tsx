import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { FileQuestion, ArrowLeft } from "lucide-react"
import { useNavigate } from "react-router-dom"

export default function NotFoundPage() {
    const navigate = useNavigate()

    const handleGoBack = () => {
        const token = localStorage.getItem("token")
        if (token) navigate("/home")
        else navigate("/")
    }

    return (
        <div className="flex h-full select-none items-center justify-center">
            <Card className="w-120 gap-y-8 rounded-4xl">
                <CardHeader className="flex flex-col items-center gap-y-5">
                    <p className="p-4 bg-destructive shadow-lg shadow-destructive/30 rounded-3xl">
                        <FileQuestion className="text-background text-l" />
                    </p>
                    <div className="flex flex-col items-center gap-y-2">
                        <CardTitle>
                            <p className="text-6xl text-primary font-bold">404</p>
                        </CardTitle>
                        <CardDescription className="text-xl">
                            Không tìm thấy trang
                        </CardDescription>
                    </div>
                </CardHeader>

                <CardContent className="flex flex-col items-center">
                    <p className="text-center text-muted-foreground">
                        Trang bạn đang tìm kiếm không tồn tại.
                    </p>
                </CardContent>

                <CardFooter className="flex flex-col gap-y-4">
                    <Button
                        onClick={handleGoBack}
                        variant="flogin_activate"
                        className="w-full hover:font-bold p-5 rounded-xl"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Quay lại
                    </Button>
                </CardFooter>
            </Card>
        </div>
    )
}
