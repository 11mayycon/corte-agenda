import { useEffect, useState } from "react";
import { LojaLayout } from "@/components/layouts/LojaLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Search,
  User,
  Phone,
  Calendar,
  ChevronRight,
  Mail,
  DollarSign,
  Clock,
  TrendingUp,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthContext } from "@/contexts/AuthContext";

interface Cliente {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  total_agendamentos: number;
  ultimo_agendamento: string | null;
  valor_total_centavos: number;
  agendamentos?: AgendamentoCliente[];
}

interface AgendamentoCliente {
  id: string;
  data: string;
  hora: string;
  status: string;
  servico: {
    nome: string;
    preco_centavos: number | null;
  };
}

export default function LojaClientes() {
  const { user } = useAuthContext();
  const [loading, setLoading] = useState(true);
  const [lojaId, setLojaId] = useState<string | null>(null);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [search, setSearch] = useState("");

  // Dialog states
  const [detailsDialog, setDetailsDialog] = useState(false);
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null);
  const [loadingDetalhes, setLoadingDetalhes] = useState(false);

  useEffect(() => {
    loadLojaId();
  }, [user]);

  useEffect(() => {
    if (lojaId) {
      loadClientes();
    }
  }, [lojaId]);

  const loadLojaId = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('usuarios_lojas')
      .select('loja_id')
      .eq('user_id', user.id)
      .single();

    if (data) {
      setLojaId(data.loja_id);
    } else {
      // Fallback for demo
      const { data: lojas } = await supabase
        .from('lojas')
        .select('id')
        .limit(1)
        .single();
      
      if (lojas) {
        setLojaId(lojas.id);
      }
    }
  };

  const loadClientes = async () => {
    if (!lojaId) return;

    setLoading(true);

    // Buscar todos os agendamentos do salão
    const { data: agendamentos } = await supabase
      .from('agendamentos')
      .select(`
        user_id,
        data,
        hora,
        status,
        servico:servicos(preco_centavos)
      `)
      .eq('loja_id', lojaId);

    if (agendamentos) {
      // Agrupar por cliente (user_id)
      const clientesMap = new Map<string, Cliente>();

      agendamentos.forEach((ag: any) => {
        const userId = ag.user_id;

        if (!clientesMap.has(userId)) {
          clientesMap.set(userId, {
            id: userId,
            nome: `Cliente ${userId.substring(0, 8)}`,
            email: '',
            telefone: '',
            total_agendamentos: 0,
            ultimo_agendamento: null,
            valor_total_centavos: 0,
          });
        }

        const cliente = clientesMap.get(userId)!;

        // Contar agendamentos concluídos
        if (ag.status === 'concluido') {
          cliente.total_agendamentos++;
          cliente.valor_total_centavos += ag.servico?.preco_centavos || 0;
        }

        // Atualizar último agendamento
        const agDataHora = `${ag.data}T${ag.hora}`;
        if (!cliente.ultimo_agendamento || agDataHora > cliente.ultimo_agendamento) {
          cliente.ultimo_agendamento = agDataHora;
        }
      });

      // Converter para array e ordenar por total de agendamentos
      const clientesArray = Array.from(clientesMap.values())
        .filter(c => c.total_agendamentos > 0)
        .sort((a, b) => b.total_agendamentos - a.total_agendamentos);

      setClientes(clientesArray);
    }

    setLoading(false);
  };

  const loadClienteDetalhes = async (cliente: Cliente) => {
    if (!lojaId) return;

    setSelectedCliente(cliente);
    setDetailsDialog(true);
    setLoadingDetalhes(true);

    const { data: agendamentos } = await supabase
      .from('agendamentos')
      .select(`
        id,
        data,
        hora,
        status,
        servico:servicos(nome, preco_centavos)
      `)
      .eq('loja_id', lojaId)
      .eq('user_id', cliente.id)
      .order('data', { ascending: false })
      .limit(10);

    if (agendamentos) {
      setSelectedCliente({
        ...cliente,
        agendamentos: agendamentos as any,
      });
    }

    setLoadingDetalhes(false);
  };

  const filteredClientes = clientes.filter(
    (cliente) =>
      cliente.nome.toLowerCase().includes(search.toLowerCase()) ||
      cliente.telefone?.includes(search) ||
      cliente.email?.toLowerCase().includes(search.toLowerCase())
  );

  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(cents / 100);
  };

  const formatDate = (dateTime: string | null) => {
    if (!dateTime) return '-';
    return new Date(dateTime).toLocaleDateString("pt-BR");
  };

  const statusConfig: Record<string, { label: string; variant: any }> = {
    pendente: { label: "Pendente", variant: "warning" },
    confirmado: { label: "Confirmado", variant: "success" },
    cancelado: { label: "Cancelado", variant: "secondary" },
    concluido: { label: "Concluído", variant: "default" },
    nao_compareceu: { label: "Não Compareceu", variant: "destructive" },
  };

  // Estatísticas
  const stats = {
    total: filteredClientes.length,
    frequentes: filteredClientes.filter(c => c.total_agendamentos >= 5).length,
    valorMedio: filteredClientes.length > 0
      ? filteredClientes.reduce((sum, c) => sum + c.valor_total_centavos, 0) / filteredClientes.length
      : 0,
  };

  return (
    <LojaLayout
      title="Clientes"
      description="Histórico e informações dos seus clientes."
    >
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card variant="elevated">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary-light flex items-center justify-center">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total de Clientes</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card variant="elevated">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Clientes Frequentes</p>
                <p className="text-2xl font-bold">{stats.frequentes}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card variant="elevated">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Ticket Médio</p>
                <p className="text-2xl font-bold">{formatPrice(stats.valorMedio)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card variant="elevated">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center gap-4">
          <CardTitle className="flex-1">Lista de Clientes</CardTitle>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar cliente..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center gap-4 p-4 border border-border rounded-lg">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-1/3" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                  <Skeleton className="h-6 w-16" />
                </div>
              ))}
            </div>
          ) : filteredClientes.length === 0 ? (
            <div className="text-center py-12">
              <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                <User className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground mb-2">Nenhum cliente encontrado.</p>
              <p className="text-sm text-muted-foreground">
                {search ? "Tente alterar os termos de busca." : "Os clientes aparecerão aqui após seus primeiros agendamentos."}
              </p>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                        Cliente
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
                        className="border-b border-border/50 last:border-0 hover:bg-muted/50 transition-colors cursor-pointer"
                        onClick={() => loadClienteDetalhes(cliente)}
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-primary-light flex items-center justify-center">
                              <span className="text-sm font-semibold text-primary">
                                {cliente.nome
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")
                                  .substring(0, 2)
                                  .toUpperCase()}
                              </span>
                            </div>
                            <span className="font-medium">{cliente.nome}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-muted-foreground">
                          {formatDate(cliente.ultimo_agendamento)}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Badge variant="soft-primary">{cliente.total_agendamentos}</Badge>
                        </td>
                        <td className="py-3 px-4 text-right font-semibold text-primary">
                          {formatPrice(cliente.valor_total_centavos)}
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
                  <Card
                    key={cliente.id}
                    variant="interactive"
                    onClick={() => loadClienteDetalhes(cliente)}
                    className="cursor-pointer"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="h-12 w-12 rounded-full bg-primary-light flex items-center justify-center">
                          <span className="text-lg font-semibold text-primary">
                            {cliente.nome
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .substring(0, 2)
                              .toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold truncate">{cliente.nome}</h3>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground text-xs">Última visita</p>
                          <p className="font-medium">{formatDate(cliente.ultimo_agendamento)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-xs">Visitas</p>
                          <Badge variant="soft-primary">{cliente.total_agendamentos}</Badge>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-xs">Total</p>
                          <p className="font-semibold text-primary">
                            {formatPrice(cliente.valor_total_centavos)}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Dialog de Detalhes do Cliente */}
      <Dialog open={detailsDialog} onOpenChange={setDetailsDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalhes do Cliente</DialogTitle>
            <DialogDescription>
              Histórico completo de agendamentos
            </DialogDescription>
          </DialogHeader>

          {selectedCliente && (
            <div className="space-y-6 py-4">
              {/* Informações do Cliente */}
              <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                <div className="h-16 w-16 rounded-full bg-primary-light flex items-center justify-center">
                  <span className="text-xl font-bold text-primary">
                    {selectedCliente.nome
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .substring(0, 2)
                      .toUpperCase()}
                  </span>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold">{selectedCliente.nome}</h3>
                </div>
              </div>

              {/* Estatísticas */}
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <p className="text-2xl font-bold text-primary">
                    {selectedCliente.total_agendamentos}
                  </p>
                  <p className="text-xs text-muted-foreground">Visitas</p>
                </div>
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <p className="text-2xl font-bold text-primary">
                    {formatPrice(selectedCliente.valor_total_centavos)}
                  </p>
                  <p className="text-xs text-muted-foreground">Total Gasto</p>
                </div>
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <p className="text-2xl font-bold text-primary">
                    {selectedCliente.total_agendamentos > 0
                      ? formatPrice(selectedCliente.valor_total_centavos / selectedCliente.total_agendamentos)
                      : 'R$ 0'}
                  </p>
                  <p className="text-xs text-muted-foreground">Ticket Médio</p>
                </div>
              </div>

              {/* Histórico */}
              <div className="space-y-3">
                <h4 className="font-medium">Últimas Visitas</h4>
                {loadingDetalhes ? (
                  <div className="space-y-2">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-16 w-full rounded-lg" />
                    ))}
                  </div>
                ) : selectedCliente.agendamentos?.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Nenhum agendamento encontrado
                  </p>
                ) : (
                  <div className="space-y-2">
                    {selectedCliente.agendamentos?.map((ag) => (
                      <div
                        key={ag.id}
                        className="flex items-center justify-between p-3 border border-border rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div className="text-center">
                            <p className="text-sm font-medium">
                              {new Date(ag.data + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                            </p>
                            <p className="text-xs text-muted-foreground">{ag.hora}</p>
                          </div>
                          <div>
                            <p className="font-medium">{ag.servico?.nome || 'Serviço'}</p>
                            <p className="text-sm text-muted-foreground">
                              {formatPrice(ag.servico?.preco_centavos || 0)}
                            </p>
                          </div>
                        </div>
                        <Badge variant={statusConfig[ag.status]?.variant || 'secondary'}>
                          {statusConfig[ag.status]?.label || ag.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </LojaLayout>
  );
}
