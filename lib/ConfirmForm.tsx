"use client";

import { ReactNode, FormHTMLAttributes } from "react";

export function ConfirmForm({
  message,
  children,
  ...props
}: { message: string; children: ReactNode } & FormHTMLAttributes<HTMLFormElement>) {
  return (
    <form
      {...props}
      onSubmit={(e) => {
        if (!confirm(message)) {
          e.preventDefault();
        }
      }}
    >
      {children}
    </form>
  );
}
