"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    let token = searchParams.get("token");

    if (token) {
      localStorage.setItem("token", token);
      globalThis.history.replaceState({}, document.title, "/");
    }

    router.push("/dashboard");
  }, [router, searchParams]);

  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <p>Redirecting to dashboard...</p>
    </div>
  );
}