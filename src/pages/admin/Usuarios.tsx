import { useState } from "react";
import { AdminLayout } from "@/components/layouts/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  User,
  Mail,
  MoreHorizontal,
  Shield,
  Scissors,
  UserCircle,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

interface Usuario {
  id: string;
  nome: string;
  email: string;
  tipo: "cliente" | "profissional" | "admin";
  status: "ativo" | "inativo";
  criadoEm: string;
}

const mockUsuarios: Usuario[] = [
  { id: "1", nome: "João Silva", email: "joao@email.com", tipo: "cliente", status: "ativo", criadoEm: "2024-01-15" },
  { id: "2", nome: "Maria Santos", email: "maria@email.com", tipo: "profissional", status: "ativo", criadoEm: "2024-02-20" },
  { id: "3", nome: "Carlos Lima", email: "carlos@email.com", tipo: "admin", status: "ativo", criadoEm: "2024-03-10" },
  { id: "4", nome: "Ana Oliveira", email: "ana@email.com", tipo: "cliente", status: "ativo", criadoEm: "2024-04-05" },
  { id: "5", nome: "Pedro Costa", email: "pedro@email.com", tipo: "profissional", status: "inativo", criadoEm: "2024-05-12" },
  { id: "6", nome: "Laura Souza", email: "laura@email.com", tipo: "cliente", status: "ativo", criadoEm: "2024-06-18" },
];

const tipoConfig = {
  cliente: { label: "Cliente", icon: UserCircle, variant: "soft-secondary" as const },
  profissional: { label: "Profissional", icon: Scissors, variant: "soft-primary" as const },
  admin: { label: "Admin", icon: Shield, variant: "default" as const },
};

export default function AdminUsuarios() {
  const [search, setSearch] = useState("");
  const [usuarios] = useState<Usuario[]>(mockUsuarios);

  const filteredUsuarios = usuarios.filter(
    (usuario) =>
      usuario.nome.toLowerCase().includes(search.toLowerCase()) ||
      usuario.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleAction = (action: string, userId: string) => {
    toast.success(`Ação "${action}" executada!`);
  };

  return (
    <AdminLayout
      title="Usuários"
      description="Gerencie todos os usuários da plataforma."
    >
      <Card variant="elevated">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center gap-4">
          <CardTitle className="flex-1">Lista de Usuários</CardTitle>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar usuário..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 w-full sm:w-64"
            />
          </div>
        </CardHeader>
        <CardContent>
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Usuário</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">E-mail</th>
                  <th className="text-center py-3 px-4 font-medium text-muted-foreground">Tipo</th>
                  <th className="text-center py-3 px-4 font-medium text-muted-foreground">Status</th>
                  <th className="py-3 px-4"></th>
                </tr>
              </thead>
              <tbody>
                {filteredUsuarios.map((usuario) => {
                  const tipo = tipoConfig[usuario.tipo];
                  const TipoIcon = tipo.icon;

                  return (
                    <tr
                      key={usuario.id}
                      className="border-b border-border/50 last:border-0 hover:bg-muted/50 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-primary-light flex items-center justify-center">
                            <span className="text-sm font-semibold text-primary">
                              {usuario.nome
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </span>
                          </div>
                          <span className="font-medium">{usuario.nome}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Mail className="h-3.5 w-3.5" />
                          {usuario.email}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Badge variant={tipo.variant} className="gap-1">
                          <TipoIcon className="h-3 w-3" />
                          {tipo.label}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Badge
                          variant={usuario.status === "ativo" ? "success" : "secondary"}
                        >
                          {usuario.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon-sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleAction("editar", usuario.id)}>
                              Editar usuário
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleAction("resetar", usuario.id)}>
                              Resetar senha
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => handleAction("desativar", usuario.id)}
                            >
                              {usuario.status === "ativo" ? "Desativar" : "Ativar"}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-3">
            {filteredUsuarios.map((usuario) => {
              const tipo = tipoConfig[usuario.tipo];
              const TipoIcon = tipo.icon;

              return (
                <Card key={usuario.id} variant="interactive">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-full bg-primary-light flex items-center justify-center">
                          <span className="text-lg font-semibold text-primary">
                            {usuario.nome
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-semibold">{usuario.nome}</h3>
                          <p className="text-sm text-muted-foreground">{usuario.email}</p>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon-sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleAction("editar", usuario.id)}>
                            Editar usuário
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleAction("resetar", usuario.id)}>
                            Resetar senha
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">
                            {usuario.status === "ativo" ? "Desativar" : "Ativar"}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={tipo.variant} className="gap-1">
                        <TipoIcon className="h-3 w-3" />
                        {tipo.label}
                      </Badge>
                      <Badge
                        variant={usuario.status === "ativo" ? "success" : "secondary"}
                      >
                        {usuario.status}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {filteredUsuarios.length === 0 && (
            <div className="text-center py-12">
              <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Nenhum usuário encontrado.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </AdminLayout>
  );
}
