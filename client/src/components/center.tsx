import { ReactNode } from "react";

export function Center({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-center justify-center min-h-screen">
      {children}
    </div>
  );
}
