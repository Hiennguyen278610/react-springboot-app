import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { UserResponse } from "@/schema/user.schema";
import { userService } from "@/services/user.service";
import { AlertTriangle } from "lucide-react";

interface AccountDeleteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: UserResponse | null;
  currentUser: UserResponse | null;
  onUserDeleted: () => void;
}

export function AccountDelete({ open, onOpenChange, user, currentUser, onUserDeleted }: AccountDeleteProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = async () => {
    if (!user) return;
    if (currentUser && currentUser.id === user.id) return;
    
    setIsLoading(true);
    try {
      await userService.delete(user.id);
      onUserDeleted();
      onOpenChange(false);
    } catch (error) {
      console.error("Xóa thất bại:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) return null;

  const isSelfDelete = currentUser && currentUser.id === user.id;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="text-red-600 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Xác nhận xóa
          </DialogTitle>
          <DialogDescription className="text-secondary">
            Hành động này không thể hoàn tác.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4 space-y-2">
          {isSelfDelete ? (
            <p className="text-red-600 font-semibold">
              Bạn không thể xóa tài khoản đang được đăng nhập.
            </p>
          ) : (
            <p className="text-primary">
              Bạn có chắc chắn muốn xóa tài khoản <span className="font-bold">"{user.username}"</span> không?
            </p>
          )}
        </div>
        
        <DialogFooter>
          <Button 
            type="button" 
            variant="flogin_delete" 
            onClick={() => onOpenChange(false)}
            className="text-secondary"
          >
            Hủy
          </Button>
          <Button 
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={isLoading || !!isSelfDelete}
          >
            {isSelfDelete ? "Không thể xóa" : isLoading ? "Đang xóa..." : "Xóa tài khoản"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
