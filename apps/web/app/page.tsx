"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function HomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    let token = searchParams.get("token");

    if (token) {
      localStorage.setItem("token", token);
      globalThis.history.replaceState({}, document.title, "/");
    }
        router.replace("/dashboard");
  }, [router, searchParams]);

  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <p>Redirecting to dashboard...</p>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div style={{ padding: "2rem", fontFamily: "sans-serif" }}><p>Loading...</p></div>}>
      <HomeContent />
    </Suspense>
  );
}