import { useState } from "react";

const LOGO_URL = "https://logodownload.org/wp-content/uploads/2017/08/moura-logo.png";
const USER = "@dismal26";
const PASS = "dmt26";

export default function Login({ onLogin }: { onLogin: () => void }) {
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (user === USER && pass === PASS) {
      setError("");
      // Salva flag de login persistente
      localStorage.setItem("alreadyLoggedIn", "true");
      onLogin();
    } else {
      setError("Usuário ou senha incorretos.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-white to-yellow-50">
      <div className="bg-card p-8 md:p-10 rounded-2xl shadow-2xl flex flex-col items-center w-full max-w-md border border-border/60 animate-fade-in">
        <img src={LOGO_URL} alt="Logo Moura" className="h-20 mb-6 drop-shadow-md" />
        <h1 className="text-2xl font-bold mb-1 text-center font-display text-primary">Energia Premiada</h1>
        <h2 className="text-lg font-medium mb-4 text-center text-muted-foreground">Dismal Matriz</h2>
        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-5 mt-2">
          <input
            className="border border-border/60 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-background text-base transition placeholder:text-muted-foreground"
            placeholder="Usuário"
            value={user}
            onChange={e => setUser(e.target.value)}
            autoFocus
          />
          <input
            className="border border-border/60 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-background text-base transition placeholder:text-muted-foreground"
            placeholder="Senha"
            type="password"
            value={pass}
            onChange={e => setPass(e.target.value)}
          />
          {error && <div className="text-red-500 text-sm text-center font-medium animate-shake">{error}</div>}
          <button type="submit" className="bg-blue-600 text-white rounded-lg py-2 font-semibold shadow hover:bg-blue-700 transition text-base tracking-wide">Entrar</button>
        </form>
      </div>
    </div>
  );
}
