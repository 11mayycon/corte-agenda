import { useState } from "react";
import { AdminLayout } from "@/components/layouts/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  FileText,
  User,
  Store,
  Settings,
  Calendar,
  Filter,
} from "lucide-react";

interface LogEntry {
  id: string;
  tipo: "usuario" | "loja" | "sistema" | "agendamento";
  acao: string;
  descricao: string;
  usuario: string;
  ip: string;
  timestamp: string;
}

const mockLogs: LogEntry[] = [
  { id: "1", tipo: "usuario", acao: "LOGIN", descricao: "Login realizado com sucesso", usuario: "admin@agendecorte.com", ip: "192.168.1.1", timestamp: "2024-12-02T10:30:00" },
  { id: "2", tipo: "loja", acao: "CRIAR", descricao: "Nova loja cadastrada: Barbearia Premium", usuario: "joao@email.com", ip: "192.168.1.2", timestamp: "2024-12-02T10:25:00" },
  { id: "3", tipo: "agendamento", acao: "CANCELAR", descricao: "Agendamento #1234 cancelado", usuario: "maria@email.com", ip: "192.168.1.3", timestamp: "2024-12-02T10:20:00" },
  { id: "4", tipo: "sistema", acao: "CONFIG", descricao: "Configurações do sistema atualizadas", usuario: "admin@agendecorte.com", ip: "192.168.1.1", timestamp: "2024-12-02T10:15:00" },
  { id: "5", tipo: "usuario", acao: "CRIAR", descricao: "Novo usuário cadastrado: pedro@email.com", usuario: "admin@agendecorte.com", ip: "192.168.1.1", timestamp: "2024-12-02T10:10:00" },
  { id: "6", tipo: "loja", acao: "ATUALIZAR", descricao: "Horários atualizados: Studio Hair", usuario: "carlos@email.com", ip: "192.168.1.4", timestamp: "2024-12-02T10:05:00" },
  { id: "7", tipo: "agendamento", acao: "CRIAR", descricao: "Novo agendamento #1235 criado", usuario: "ana@email.com", ip: "192.168.1.5", timestamp: "2024-12-02T10:00:00" },
  { id: "8", tipo: "usuario", acao: "LOGOUT", descricao: "Logout realizado", usuario: "pedro@email.com", ip: "192.168.1.6", timestamp: "2024-12-02T09:55:00" },
];

const tipoConfig = {
  usuario: { label: "Usuário", icon: User, color: "primary" },
  loja: { label: "Loja", icon: Store, color: "secondary" },
  sistema: { label: "Sistema", icon: Settings, color: "warning" },
  agendamento: { label: "Agendamento", icon: Calendar, color: "success" },
};

export default function AdminAuditoria() {
  const [search, setSearch] = useState("");
  const [logs] = useState<LogEntry[]>(mockLogs);

  const filteredLogs = logs.filter(
    (log) =>
      log.acao.toLowerCase().includes(search.toLowerCase()) ||
      log.descricao.toLowerCase().includes(search.toLowerCase()) ||
      log.usuario.toLowerCase().includes(search.toLowerCase())
  );

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <AdminLayout
      title="Auditoria"
      description="Logs de atividades e eventos do sistema."
    >
      <Card variant="elevated">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center gap-4">
          <CardTitle className="flex-1 flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Logs de Auditoria
          </CardTitle>
          <div className="flex items-center gap-2">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar logs..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredLogs.map((log) => {
              const tipo = tipoConfig[log.tipo];
              const TipoIcon = tipo.icon;

              return (
                <div
                  key={log.id}
                  className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-lg border border-border bg-card hover:bg-muted/50 transition-colors"
                >
                  <div
                    className={`h-10 w-10 rounded-lg flex items-center justify-center shrink-0 ${
                      tipo.color === "primary"
                        ? "bg-primary-light text-primary"
                        : tipo.color === "secondary"
                        ? "bg-secondary-light text-secondary"
                        : tipo.color === "warning"
                        ? "bg-warning-light text-warning"
                        : "bg-success-light text-success"
                    }`}
                  >
                    <TipoIcon className="h-5 w-5" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <Badge variant="outline">{log.acao}</Badge>
                      <span className="font-medium truncate">{log.descricao}</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {log.usuario}
                      </span>
                      <span>IP: {log.ip}</span>
                    </div>
                  </div>

                  <div className="text-sm text-muted-foreground whitespace-nowrap">
                    {formatTimestamp(log.timestamp)}
                  </div>
                </div>
              );
            })}
          </div>

          {filteredLogs.length === 0 && (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Nenhum log encontrado.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </AdminLayout>
  );
}
