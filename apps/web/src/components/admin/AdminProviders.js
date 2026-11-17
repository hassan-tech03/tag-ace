"use client";

import { SessionProvider } from "next-auth/react";
import { ToastProvider } from "./ui/Toast";

export default function AdminProviders({ children, session }) {
  return (
    <SessionProvider session={session}>
      <ToastProvider>{children}</ToastProvider>
    </SessionProvider>
  );
}
