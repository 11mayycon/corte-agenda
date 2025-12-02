import { useState } from "react";
import { AdminLayout } from "@/components/layouts/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Filter,
  Store,
  MapPin,
  Calendar,
  MoreHorizontal,
  RefreshCw,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

interface Loja {
  id: string;
  nome: string;
  cidade: string;
  uf: string;
  status: "ativa" | "pendente" | "inativa";
  plano: string;
  agendamentos: number;
  criadaEm: string;
}

const mockLojas: Loja[] = [
  { id: "1", nome: "Barbearia Premium", cidade: "São Paulo", uf: "SP", status: "ativa", plano: "Pro", agendamentos: 156, criadaEm: "2024-01-15" },
  { id: "2", nome: "Studio Hair", cidade: "Rio de Janeiro", uf: "RJ", status: "ativa", plano: "Business", agendamentos: 89, criadaEm: "2024-02-20" },
  { id: "3", nome: "Corte & Estilo", cidade: "Belo Horizonte", uf: "MG", status: "pendente", plano: "Free", agendamentos: 0, criadaEm: "2024-11-28" },
  { id: "4", nome: "Barber Shop", cidade: "Curitiba", uf: "PR", status: "ativa", plano: "Pro", agendamentos: 67, criadaEm: "2024-03-10" },
  { id: "5", nome: "Hair Design", cidade: "Porto Alegre", uf: "RS", status: "inativa", plano: "Free", agendamentos: 12, criadaEm: "2024-04-05" },
  { id: "6", nome: "Barbearia Clássica", cidade: "Brasília", uf: "DF", status: "ativa", plano: "Pro", agendamentos: 45, criadaEm: "2024-05-12" },
];

const statusFilters = [
  { value: "all", label: "Todas" },
  { value: "ativa", label: "Ativas" },
  { value: "pendente", label: "Pendentes" },
  { value: "inativa", label: "Inativas" },
];

export default function AdminLojas() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [lojas] = useState<Loja[]>(mockLojas);

  const filteredLojas = lojas.filter((loja) => {
    const matchesSearch =
      loja.nome.toLowerCase().includes(search.toLowerCase()) ||
      loja.cidade.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || loja.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleResetAccess = (lojaId: string) => {
    toast.success("Acesso resetado com sucesso!");
  };

  return (
    <AdminLayout
      title="Lojas"
      description="Gerencie todas as lojas cadastradas na plataforma."
    >
      <Card variant="elevated">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center gap-4">
          <CardTitle className="flex-1">Lista de Lojas</CardTitle>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar loja..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 w-full sm:w-64"
              />
            </div>
            <div className="flex gap-2">
              {statusFilters.map((filter) => (
                <Button
                  key={filter.value}
                  variant={statusFilter === filter.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setStatusFilter(filter.value)}
                >
                  {filter.label}
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Desktop Table */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Loja</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Local</th>
                  <th className="text-center py-3 px-4 font-medium text-muted-foreground">Status</th>
                  <th className="text-center py-3 px-4 font-medium text-muted-foreground">Plano</th>
                  <th className="text-center py-3 px-4 font-medium text-muted-foreground">Agendamentos</th>
                  <th className="py-3 px-4"></th>
                </tr>
              </thead>
              <tbody>
                {filteredLojas.map((loja) => (
                  <tr
                    key={loja.id}
                    className="border-b border-border/50 last:border-0 hover:bg-muted/50 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-primary-light flex items-center justify-center">
                          <Store className="h-5 w-5 text-primary" />
                        </div>
                        <span className="font-medium">{loja.nome}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" />
                        {loja.cidade}, {loja.uf}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Badge
                        variant={
                          loja.status === "ativa"
                            ? "success"
                            : loja.status === "pendente"
                            ? "warning"
                            : "secondary"
                        }
                      >
                        {loja.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Badge variant="soft-primary">{loja.plano}</Badge>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                        {loja.agendamentos}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon-sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>Ver detalhes</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleResetAccess(loja.id)}>
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Resetar acesso
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">
                            Desativar loja
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="lg:hidden space-y-3">
            {filteredLojas.map((loja) => (
              <Card key={loja.id} variant="interactive">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-lg bg-primary-light flex items-center justify-center">
                        <Store className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{loja.nome}</h3>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {loja.cidade}, {loja.uf}
                        </p>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon-sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>Ver detalhes</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleResetAccess(loja.id)}>
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Resetar acesso
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          Desativar loja
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={
                        loja.status === "ativa"
                          ? "success"
                          : loja.status === "pendente"
                          ? "warning"
                          : "secondary"
                      }
                    >
                      {loja.status}
                    </Badge>
                    <Badge variant="soft-primary">{loja.plano}</Badge>
                    <span className="text-sm text-muted-foreground ml-auto">
                      {loja.agendamentos} agendamentos
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredLojas.length === 0 && (
            <div className="text-center py-12">
              <Store className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Nenhuma loja encontrada.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </AdminLayout>
  );
}
