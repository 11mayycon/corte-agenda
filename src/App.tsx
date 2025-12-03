import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/contexts/AuthContext";
import { AdminRoute, SalaoRoute, ClienteRoute } from "@/components/auth/ProtectedRoute";

// Pages
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

// Login Pages
import LoginUsuario from "./pages/login/LoginUsuario";
import LoginCabeleireiro from "./pages/login/LoginCabeleireiro";
import LoginAdministrador from "./pages/login/LoginAdministrador";

// Client Pages
import ClienteAgendar from "./pages/cliente/Agendar";
import ClienteReservas from "./pages/cliente/MinhasReservas";
import ClientePerfil from "./pages/cliente/Perfil";

// Loja Pages
import LojaAgenda from "./pages/loja/Agenda";
import LojaServicos from "./pages/loja/Servicos";
import LojaProfissionais from "./pages/loja/Profissionais";
import LojaHorarios from "./pages/loja/Horarios";
import LojaClientes from "./pages/loja/Clientes";
import LojaWhatsApp from "./pages/loja/WhatsApp";

// Admin Pages
import AdminVisaoGeral from "./pages/admin/VisaoGeral";
import AdminLojas from "./pages/admin/Lojas";
import AdminUsuarios from "./pages/admin/Usuarios";
import AdminAuditoria from "./pages/admin/Auditoria";
import AdminConfiguracoes from "./pages/admin/Configuracoes";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
        <TooltipProvider>
          <Toaster />
          <Sonner position="top-right" />
          <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LoginUsuario />} />
            
            {/* Login Routes */}
            <Route path="/login/usuario" element={<LoginUsuario />} />
            <Route path="/login/cabeleireiro" element={<LoginCabeleireiro />} />
            <Route path="/login/administrador" element={<LoginAdministrador />} />

            {/* Client Routes */}
            <Route path="/cliente/agendar" element={<ClienteRoute><ClienteAgendar /></ClienteRoute>} />
            <Route path="/cliente/minhas-reservas" element={<ClienteRoute><ClienteReservas /></ClienteRoute>} />
            <Route path="/cliente/perfil" element={<ClienteRoute><ClientePerfil /></ClienteRoute>} />

            {/* Loja Routes */}
            <Route path="/loja/agenda" element={<SalaoRoute><LojaAgenda /></SalaoRoute>} />
            <Route path="/loja/servicos" element={<SalaoRoute><LojaServicos /></SalaoRoute>} />
            <Route path="/loja/profissionais" element={<SalaoRoute><LojaProfissionais /></SalaoRoute>} />
            <Route path="/loja/horarios" element={<SalaoRoute><LojaHorarios /></SalaoRoute>} />
            <Route path="/loja/clientes" element={<SalaoRoute><LojaClientes /></SalaoRoute>} />
            <Route path="/loja/whatsapp" element={<SalaoRoute><LojaWhatsApp /></SalaoRoute>} />

            {/* Admin Routes */}
            <Route path="/admin/visao-geral" element={<AdminRoute><AdminVisaoGeral /></AdminRoute>} />
            <Route path="/admin/lojas" element={<AdminRoute><AdminLojas /></AdminRoute>} />
            <Route path="/admin/usuarios" element={<AdminRoute><AdminUsuarios /></AdminRoute>} />
            <Route path="/admin/auditoria" element={<AdminRoute><AdminAuditoria /></AdminRoute>} />
            <Route path="/admin/configuracoes" element={<AdminRoute><AdminConfiguracoes /></AdminRoute>} />

            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
