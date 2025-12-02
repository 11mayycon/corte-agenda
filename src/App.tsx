import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

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
    <TooltipProvider>
      <Toaster />
      <Sonner position="top-right" />
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Index />} />
          
          {/* Login Routes */}
          <Route path="/login/usuario" element={<LoginUsuario />} />
          <Route path="/login/cabeleireiro" element={<LoginCabeleireiro />} />
          <Route path="/login/administrador" element={<LoginAdministrador />} />

          {/* Client Routes */}
          <Route path="/cliente/agendar" element={<ClienteAgendar />} />
          <Route path="/cliente/minhas-reservas" element={<ClienteReservas />} />
          <Route path="/cliente/perfil" element={<ClientePerfil />} />

          {/* Loja Routes */}
          <Route path="/loja/agenda" element={<LojaAgenda />} />
          <Route path="/loja/servicos" element={<LojaServicos />} />
          <Route path="/loja/profissionais" element={<LojaProfissionais />} />
          <Route path="/loja/horarios" element={<LojaHorarios />} />
          <Route path="/loja/clientes" element={<LojaClientes />} />
          <Route path="/loja/whatsapp" element={<LojaWhatsApp />} />

          {/* Admin Routes */}
          <Route path="/admin/visao-geral" element={<AdminVisaoGeral />} />
          <Route path="/admin/lojas" element={<AdminLojas />} />
          <Route path="/admin/usuarios" element={<AdminUsuarios />} />
          <Route path="/admin/auditoria" element={<AdminAuditoria />} />
          <Route path="/admin/configuracoes" element={<AdminConfiguracoes />} />

          {/* Catch-all */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
