"use client";
import Image from "next/image";
import { PrivyProvider } from "@privy-io/react-auth";
import LoginButton from "@/components/testpage";
export default function Home() {
  return (
    <PrivyProvider appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID || ""}>
      <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
        <LoginButton />
      </div>
    </PrivyProvider>
  );
}
