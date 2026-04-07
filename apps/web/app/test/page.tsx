"use client";

import { useState, useEffect, useRef } from "react";
import { socket } from "../../lib/socket";

type User = {
  id: string;
  name: string;
  email: string;
};

export default function Page()
{
  const [user, setUser] = useState<User | null>(null);
  const [roomId, setRoomId] = useState<string>("");
  const [joined, setJoined] = useState<boolean>(false);
  const [code, setCode] = useState<string>("");

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() =>
  {
    const token = localStorage.getItem("token");
    if (!token) return;

    fetch("http://localhost:5000/auth/me", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then(res => res.json())
      .then(data =>
      {
        if (data.user)
        {
          setUser(data.user);
        }
      });
  }, []);

  useEffect(() =>
  {
    if (!joined || !user) return;

    socket.connect();

    socket.off("connect");
    socket.off("init-code");
    socket.off("code-update");
    socket.off("cursor-update");

    socket.on("connect", () =>
    {
      console.log("connected", socket.id);

      socket.emit("join-room", {
        roomId,
        userId: user.id
      });
    });

    socket.on("init-code", (data) =>
    {
      setCode(data.code);
    });

    socket.on("code-update", (data) =>
    {
      const code=data.code as string;
      setCode(code);
    });

    socket.on("cursor-update", ({ socketId, line, column }) =>
    {
      if (socketId === socket.id) return;

      console.log("Other cursor:", socketId, line, column);
    });

    return () =>
    {
      socket.disconnect();
    };
  }, [joined, user, roomId]);

  useEffect(() =>
  {
    if (!joined) return;

    const textarea = textareaRef.current;
    if (!textarea) return;

    function getCursorPosition()
    {
      const current = textareaRef.current;
      if (!current)
      {
        return {
          line: 1,
          column: 0
        };
      }

      const pos = current.selectionStart;
      const text = current.value.substring(0, pos);

      const lines = text.split("\n");

      return {
        line: lines.length,
        column: lines.at(-1)?.length ?? 0
      };
    }

    function throttle<T extends unknown[]>(fn: (...args: T) => void, delay: number)
    {
      let last = 0;

      return (...args: T) =>
      {
        const now = Date.now();

        if (now - last > delay)
        {
          last = now;
          fn(...args);
        }
      };
    }

    const sendCursor = throttle((line: number, column: number) =>
    {
      socket.emit("cursor-update", {
        roomId,
        line,
        column
      });
    }, 80);

    function handleCursorMove()
    {
      const { line, column } = getCursorPosition();
      sendCursor(line, column);
    }

    textarea.addEventListener("keyup", handleCursorMove);
    textarea.addEventListener("click", handleCursorMove);

    return () =>
    {
      textarea.removeEventListener("keyup", handleCursorMove);
      textarea.removeEventListener("click", handleCursorMove);
    };
  }, [joined, roomId]);

  return (
    <div style={{ padding: "20px" }}>
      {!joined && (
        <div>
          <input
            type="text"
            placeholder="Enter Room ID"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            style={{ padding: "8px", marginRight: "10px" }}
          />
          <button
            onClick={() =>
            {
              if (!roomId) return;
              setJoined(true);
            }}
          >
            Join
          </button>
        </div>
      )}

      {joined && (
        <div>
          <h3>Room: {roomId}</h3>

          <textarea
            ref={textareaRef}
            value={code}
            onChange={(e) =>
            {
              const newCode = e.target.value;
              setCode(newCode);

              socket.emit("code-update", {
                roomId,
                code: newCode
              });
            }}
            style={{
              width: "100%",
              height: "400px",
              marginTop: "10px",
              padding: "10px",
              fontFamily: "monospace"
            }}
          />
        </div>
      )}
    </div>
  );
}