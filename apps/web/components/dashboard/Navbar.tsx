interface NavbarProps {
  isLoggedIn: boolean;
  user: { name?: string } | null;
  onLogin: () => void;
  onLogout: () => void;
  onJoinOpen: () => void;
  onOpenCreate: () => void;
}

export function Navbar({
    isLoggedIn,
    user,
    onLogin,
    onLogout,
    onJoinOpen,
    onOpenCreate
}: NavbarProps) {
  return(
    <nav style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 24px", height: "49px", backgroundColor: "var(--nav-bg)", borderBottom: "1px solid #30363d", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div style={{ width: "28px", height: "28px", background: "#1f6feb", borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="white" strokeWidth="2">
                <polyline points="4,6 1,8 4,10" /><polyline points="12,6 15,8 12,10" /><line x1="9" y1="3" x2="7" y2="13" />
              </svg>
            </div>
            <span style={{ fontSize: "15px", fontWeight: "600", color: "white" }}>CodeStream</span>
          </div>
          {["Dashboard"].map((link) => (
            <button key={link}
              style={{ background: "none", border: "none", color: "#e6edf3", fontSize: "14px", cursor: "pointer", padding: "4px 8px", borderRadius: "6px", fontWeight: link === "Dashboard" ? "600" : "400" }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.1)")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
            >{link}</button>
          ))}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "rgba(255,255,255,0.07)", border: "1px solid #444c56", borderRadius: "6px", padding: "5px 12px", width: "220px" }}>
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="#8b949e" strokeWidth="1.5"><circle cx="6.5" cy="6.5" r="4.5" /><line x1="9.5" y1="9.5" x2="13" y2="13" /></svg>
            <input placeholder="Search rooms..." style={{ background: "none", border: "none", outline: "none", fontSize: "13px", color: "#e6edf3", width: "100%" }} />
          </div>

          {isLoggedIn ? (
            <>
              <button onClick={() => onJoinOpen()}
                style={{ fontSize: "13px", padding: "5px 14px", borderRadius: "6px", cursor: "pointer", fontWeight: "500", border: "1px solid #444c56", background: "rgba(255,255,255,0.07)", color: "#e6edf3" }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.15)")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.07)")}
              >Join room</button>
              <button onClick={() => onOpenCreate()}
                style={{ fontSize: "13px", padding: "5px 14px", borderRadius: "6px", cursor: "pointer", fontWeight: "500", border: "1px solid #1f6feb", background: "#1f6feb", color: "white" }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#1a5ed4")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#1f6feb")}
              >+ New room</button>
              <div
                style={{ width: "28px", height: "28px", borderRadius: "50%", background: "#1f6feb", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: "600", color: "white", cursor: "pointer" }}
                title={user?.name}
              >
                {user?.name ? user.name.slice(0, 2).toUpperCase() : "ME"}
              </div>
              <button onClick={onLogout}
                style={{ background: "none", border: "none", color: "#8b949e", fontSize: "13px", cursor: "pointer", padding: "4px 8px", borderRadius: "6px" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#e6edf3")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#8b949e")}
              >Log out</button>
            </>
          ) : (
            <button onClick={onLogin}
              style={{ fontSize: "13px", padding: "5px 16px", borderRadius: "6px", cursor: "pointer", fontWeight: "600", border: "1px solid #1f6feb", background: "#1f6feb", color: "white" }}
            >Log in / Sign up</button>
          )}
        </div>
      </nav>
  )
}