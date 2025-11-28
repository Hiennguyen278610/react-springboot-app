import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import type { UserResponse } from "@/schema/user.schema";

interface AccountViewProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: UserResponse | null;
}

export function AccountView({ open, onOpenChange, user }: AccountViewProps) {
  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle className="text-primary">Chi tiết tài khoản</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-6 items-center gap-4">
            <Label className="text-right text-secondary col-span-2">
              ID
            </Label>
            <p className="col-span-4 text-primary font-medium">
              {user.id}
            </p>
          </div>

          <div className="grid grid-cols-6 items-center gap-4">
            <Label className="text-right text-secondary col-span-2">
              TÊN ĐĂNG NHẬP
            </Label>
            <p className="col-span-4 text-primary font-medium">
              {user.username}
            </p>
          </div>
          
          <div className="grid grid-cols-6 items-center gap-4">
            <Label className="text-right text-secondary col-span-2">
              EMAIL
            </Label>
            <p className="col-span-4 text-primary font-medium">
              {user.mail}
            </p>
          </div>
        </div>
        
        <DialogFooter>
          <Button 
            type="button" 
            variant="flogin_delete" 
            onClick={() => onOpenChange(false)}
            className="text-secondary"
          >
            Đóng
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
