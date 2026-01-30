
import { useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./components/Login";


const queryClient = new QueryClient();

const App = () => {
  const [authenticated, setAuthenticated] = useState(() => {
    // Mantém login na sessão enquanto o navegador estiver aberto
    // ou login persistente se já autenticou uma vez
    return sessionStorage.getItem("auth") === "true" || localStorage.getItem("alreadyLoggedIn") === "true";
  });

  const handleLogin = () => {
    setAuthenticated(true);
    sessionStorage.setItem("auth", "true");
    // Garante persistência para próximos acessos
    localStorage.setItem("alreadyLoggedIn", "true");
  };

  if (!authenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
