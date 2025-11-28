import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import type { UserResponse } from "@/schema/user.schema"
import { Construction } from "lucide-react"

interface AccountEditProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	user: UserResponse | null
}

export function AccountEdit({ open, onOpenChange, user }: AccountEditProps) {
	if (!user) return null

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[450px]">
				<DialogHeader>
					<DialogTitle className="text-primary flex items-center gap-2">
						<Construction className="w-5 h-5 text-primary" />
						Chỉnh sửa tài khoản
					</DialogTitle>
					<DialogDescription className="text-secondary">
						Tính năng này đang được phát triển.
					</DialogDescription>
				</DialogHeader>

				<div className="py-6 space-y-2 text-primary">
					<p>Chúng tôi đang hoàn thiện chức năng chỉnh sửa tài khoản.</p>
					<p>Vui lòng quay lại sau hoặc liên hệ đội phát triển nếu bạn cần cập nhật cho người dùng
						<span className="font-semibold"> {user.username}</span>.</p>
				</div>

				<DialogFooter>
					<Button type="button" variant="flogin_delete" onClick={() => onOpenChange(false)}>
						Đóng
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}

