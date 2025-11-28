import type { ReactNode } from "react";

interface CrudLayoutProps {
  title: string;
  children?: ReactNode;
}

export default function CrudLayout({ title, children }: CrudLayoutProps) {
  return (
    <div className="h-full flex flex-col bg-sidebar ml-10">
      <div className="shrink-0 flex p-2">
        <p className="text-primary text-2xl font-bold">{title}</p>
      </div>
      <div className="flex-1 min-h-0">
        {children}
      </div>
    </div>
  );
}