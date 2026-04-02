"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

function LoginRedirectButton() {
  const router = useRouter();
  return (
    <Button
      onClick={() => router.push("/login")}
      className="fixed top-5 right-5 sm:right-10 cursor-pointer z-20"
    >
      Login
    </Button>
  );
}

export default LoginRedirectButton;
