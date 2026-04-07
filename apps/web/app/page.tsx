"use client";

import { useEffect, useState } from "react"

export default function Home()
{
  const [user, setUser] = useState<any>(null);

  useEffect(() =>
  {
    const params = new URLSearchParams(window.location.search);
    let token = params.get("token");

    if (token)
    {
      localStorage.setItem("token", token);
      window.history.replaceState({}, document.title, "/");
    } else {
      token = localStorage.getItem("token");
    }

    if (!token) return;

    fetch("http://localhost:5000/auth/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(res => res.json())
      .then(data => {
        if (data.user) {
          setUser(data.user);
        } else {
          setUser(null);
        }
      })
      .catch(() => setUser(null));
  }, []);

  return (
    <div style={{ padding: "2rem" }}>
      <h1>OAuth Test</h1>

      {!user ? (
        <button
          onClick={() =>
          {
            globalThis.location.href = "http://localhost:5000/auth/google";
          }}
        >
          Login with Google
        </button>
      ) : (
        <div>
          <button
            onClick={() =>
            {
              localStorage.removeItem("token");
              setUser(null);
            }}
          >
            Logout
          </button>
          <button
            onClick={() =>
            {
              globalThis.location.href = "/test";
            }}
          >
            Join Testing room
          </button>
        </div>
      )}
    </div>
  );
}