import { useState } from "react";
import { LojaLayout } from "@/components/layouts/LojaLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  User,
  Phone,
  Calendar,
  ChevronRight,
  HelpCircle,
  Filter,
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface Cliente {
  id: string;
  nome: string;
  telefone: string;
  ultimaVisita: string;
  totalVisitas: number;
  valorTotal: number;
}

const mockClientes: Cliente[] = [
  { id: "1", nome: "João Silva", telefone: "(11) 99999-1111", ultimaVisita: "2024-12-01", totalVisitas: 12, valorTotal: 54000 },
  { id: "2", nome: "Pedro Santos", telefone: "(11) 99999-2222", ultimaVisita: "2024-11-28", totalVisitas: 8, valorTotal: 36000 },
  { id: "3", nome: "Lucas Lima", telefone: "(11) 99999-3333", ultimaVisita: "2024-11-25", totalVisitas: 15, valorTotal: 67500 },
  { id: "4", nome: "Marcos Oliveira", telefone: "(11) 99999-4444", ultimaVisita: "2024-11-20", totalVisitas: 5, valorTotal: 22500 },
  { id: "5", nome: "Rafael Costa", telefone: "(11) 99999-5555", ultimaVisita: "2024-11-15", totalVisitas: 20, valorTotal: 90000 },
  { id: "6", nome: "Bruno Alves", telefone: "(11) 99999-6666", ultimaVisita: "2024-11-10", totalVisitas: 3, valorTotal: 13500 },
];

export default function LojaClientes() {
  const [search, setSearch] = useState("");
  const [clientes] = useState<Cliente[]>(mockClientes);

  const filteredClientes = clientes.filter(
    (cliente) =>
      cliente.nome.toLowerCase().includes(search.toLowerCase()) ||
      cliente.telefone.includes(search)
  );

  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(cents / 100);
  };

  const formatDate = (date: string) => {
    return new Date(date + "T12:00:00").toLocaleDateString("pt-BR");
  };

  return (
    <LojaLayout
      title="Clientes"
      description="Histórico e informações dos seus clientes."
    >
      <Card variant="elevated">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex items-center gap-2 flex-1">
            <CardTitle>Lista de Clientes</CardTitle>
            <Tooltip>
              <TooltipTrigger>
                <HelpCircle className="h-4 w-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Visualize o histórico de todos os clientes</p>
              </TooltipContent>
            </Tooltip>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar cliente..."
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
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                    Cliente
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                    Telefone
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                    Última Visita
                  </th>
                  <th className="text-center py-3 px-4 font-medium text-muted-foreground">
                    Visitas
                  </th>
                  <th className="text-right py-3 px-4 font-medium text-muted-foreground">
                    Total Gasto
                  </th>
                  <th className="py-3 px-4"></th>
                </tr>
              </thead>
              <tbody>
                {filteredClientes.map((cliente) => (
                  <tr
                    key={cliente.id}
                    className="border-b border-border/50 last:border-0 hover:bg-muted/50 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary-light flex items-center justify-center">
                          <span className="text-sm font-semibold text-primary">
                            {cliente.nome
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </span>
                        </div>
                        <span className="font-medium">{cliente.nome}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">
                      {cliente.telefone}
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">
                      {formatDate(cliente.ultimaVisita)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Badge variant="soft-primary">{cliente.totalVisitas}</Badge>
                    </td>
                    <td className="py-3 px-4 text-right font-medium">
                      {formatPrice(cliente.valorTotal)}
                    </td>
                    <td className="py-3 px-4">
                      <Button variant="ghost" size="icon-sm">
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-3">
            {filteredClientes.map((cliente) => (
              <Card key={cliente.id} variant="interactive">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="h-12 w-12 rounded-full bg-primary-light flex items-center justify-center">
                      <span className="text-lg font-semibold text-primary">
                        {cliente.nome
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold">{cliente.nome}</h3>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {cliente.telefone}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Última visita</p>
                      <p className="font-medium">{formatDate(cliente.ultimaVisita)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Visitas</p>
                      <p className="font-medium">{cliente.totalVisitas}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Total</p>
                      <p className="font-medium text-primary">
                        {formatPrice(cliente.valorTotal)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredClientes.length === 0 && (
            <div className="text-center py-12">
              <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Nenhum cliente encontrado.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </LojaLayout>
  );
}
