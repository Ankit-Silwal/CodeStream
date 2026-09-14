"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "../lib/api";
import { getSessionUser, saveSession } from "../lib/auth";
import StudentLoginPage from "./student/login/page";

function HomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get("token");

    if (token) {
      localStorage.setItem("token", token);
      globalThis.history.replaceState({}, document.title, "/");
      api
        .get("/auth/me")
        .then((res) => {
          const user = res.data.user;
          saveSession(token, user);
          router.replace(user?.role === "teacher" ? "/teacher" : "/dashboard");
        })
        .catch(() => router.replace("/student/login"));
      return;
    }

    const user = getSessionUser();
    if (user?.role === "teacher") {
      router.replace("/teacher");
    } else if (user?.role === "admin") {
      router.replace("/admin");
    } else if (user?.role === "student") {
      router.replace("/dashboard");
    }
  }, [router, searchParams]);

  return <StudentLoginPage />;
}

export default function Home() {
  return (
    <Suspense fallback={<StudentLoginPage />}>
      <HomeContent />
    </Suspense>
  );
}
