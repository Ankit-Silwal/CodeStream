"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function TeacherLoginPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/teacher");
  }, [router]);

  return null;
}
