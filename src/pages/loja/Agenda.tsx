import React, { useEffect, useState } from "react";
import { LojaLayout } from "@/components/layouts/LojaLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  Users,
  CheckCircle,
  AlertCircle,
  XCircle,
  Phone,
  Mail,
  Scissors,
  Timer,
  DollarSign,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuthContext } from "@/contexts/AuthContext";

interface Agendamento {
  id: string;
  loja_id: string;
  user_id: string;
  servico_id: string;
  data: string;
  hora: string;
  status: "pendente" | "confirmado" | "cancelado" | "concluido" | "nao_compareceu";
  observacoes: string | null;
  created_at: string;
  servico?: {
    nome: string;
    preco_centavos: number | null;
    duracao_minutos: number;
  };
}

const statusConfig = {
  pendente: { label: "Pendente", icon: AlertCircle, variant: "warning" as const, color: "text-orange-600" },
  confirmado: { label: "Confirmado", icon: CheckCircle, variant: "success" as const, color: "text-green-600" },
  cancelado: { label: "Cancelado", icon: XCircle, variant: "secondary" as const, color: "text-gray-600" },
  concluido: { label: "Concluído", icon: CheckCircle, variant: "default" as const, color: "text-blue-600" },
  nao_compareceu: { label: "Não Compareceu", icon: XCircle, variant: "destructive" as const, color: "text-red-600" },
};

export default function LojaAgenda() {
  const { user } = useAuthContext();
  const [loading, setLoading] = useState(true);
  const [lojaId, setLojaId] = useState<string | null>(null);
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [statusFilter, setStatusFilter] = useState<string>("todos");

  // Dialog states
  const [detailsDialog, setDetailsDialog] = useState(false);
  const [selectedAgendamento, setSelectedAgendamento] = useState<Agendamento | null>(null);

  useEffect(() => {
    loadLojaId();
  }, [user]);

  useEffect(() => {
    if (lojaId) {
      loadAgendamentos();
    }
  }, [lojaId, selectedDate, statusFilter]);

  const loadLojaId = async () => {
    if (!user) return;

    // Try to get loja from usuarios_lojas
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

  const loadAgendamentos = async () => {
    if (!lojaId) return;

    setLoading(true);
    const dataStr = selectedDate.toISOString().split('T')[0];

    let query = supabase
      .from('agendamentos')
      .select(`
        *,
        servico:servicos(nome, preco_centavos, duracao_minutos)
      `)
      .eq('loja_id', lojaId)
      .eq('data', dataStr)
      .order('hora', { ascending: true });

    if (statusFilter !== "todos") {
      query = query.eq('status', statusFilter);
    }

    const { data, error } = await query;

    if (!error && data) {
      setAgendamentos(data as Agendamento[]);
    }
    setLoading(false);
  };

  const handleUpdateStatus = async (agendamentoId: string, novoStatus: string) => {
    if (!lojaId) return;

    const { error } = await supabase
      .from('agendamentos')
      .update({ status: novoStatus })
      .eq('id', agendamentoId);

    if (!error) {
      toast.success('Status atualizado com sucesso!');
      await loadAgendamentos();
      setDetailsDialog(false);
    } else {
      toast.error('Erro ao atualizar status');
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("pt-BR", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const changeDate = (days: number) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + days);
    setSelectedDate(newDate);
  };

  const formatPrice = (cents: number | null) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format((cents || 0) / 100);
  };

  const goToToday = () => {
    setSelectedDate(new Date());
  };

  // Calcular estatísticas
  const stats = {
    total: agendamentos.length,
    confirmados: agendamentos.filter(a => a.status === "confirmado").length,
    pendentes: agendamentos.filter(a => a.status === "pendente").length,
    concluidos: agendamentos.filter(a => a.status === "concluido").length,
  };

  const kpis = [
    { label: "Total do Dia", value: stats.total.toString(), icon: Calendar, color: "primary" },
    { label: "Confirmados", value: stats.confirmados.toString(), icon: CheckCircle, color: "success" },
    { label: "Pendentes", value: stats.pendentes.toString(), icon: AlertCircle, color: "warning" },
    { label: "Concluídos", value: stats.concluidos.toString(), icon: Users, color: "secondary" },
  ];

  const handleShowDetails = (agendamento: Agendamento) => {
    setSelectedAgendamento(agendamento);
    setDetailsDialog(true);
  };

  return (
    <LojaLayout
      title="Agenda"
      description="Visualize e gerencie os agendamentos do dia."
    >
      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {kpis.map((kpi) => (
          <Card key={kpi.label} variant="elevated">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{kpi.label}</p>
                  <p className="text-2xl font-bold mt-1">{kpi.value}</p>
                </div>
                <div
                  className={cn(
                    "h-10 w-10 rounded-xl flex items-center justify-center",
                    kpi.color === "primary" && "bg-primary-light text-primary",
                    kpi.color === "success" && "bg-green-100 text-green-600",
                    kpi.color === "warning" && "bg-orange-100 text-orange-600",
                    kpi.color === "secondary" && "bg-blue-100 text-blue-600"
                  )}
                >
                  <kpi.icon className="h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Date Navigation */}
      <Card variant="elevated" className="mb-6">
        <CardContent className="p-4">
          <div className="flex items-center justify-between gap-4">
            <Button variant="outline" size="icon" onClick={() => changeDate(-1)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="text-center flex-1">
              <p className="font-semibold text-lg capitalize">{formatDate(selectedDate)}</p>
              <p className="text-sm text-muted-foreground">
                {agendamentos.length} {agendamentos.length === 1 ? 'agendamento' : 'agendamentos'}
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={goToToday} className="hidden sm:flex">
              Hoje
            </Button>
            <Button variant="outline" size="icon" onClick={() => changeDate(1)}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Filtros */}
      <div className="flex gap-3 mb-6">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos</SelectItem>
            <SelectItem value="pendente">Pendente</SelectItem>
            <SelectItem value="confirmado">Confirmado</SelectItem>
            <SelectItem value="concluido">Concluído</SelectItem>
            <SelectItem value="cancelado">Cancelado</SelectItem>
            <SelectItem value="nao_compareceu">Não Compareceu</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Lista de Agendamentos */}
      <Card variant="elevated">
        <CardHeader>
          <CardTitle>Agendamentos do Dia</CardTitle>
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
                  <Skeleton className="h-6 w-24" />
                </div>
              ))}
            </div>
          ) : agendamentos.length === 0 ? (
            <div className="text-center py-12">
              <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                <Calendar className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground mb-2">Nenhum agendamento para este dia.</p>
              <p className="text-sm text-muted-foreground">
                {statusFilter !== "todos"
                  ? "Tente alterar o filtro de status."
                  : "Os agendamentos aparecerão aqui quando forem criados."}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {agendamentos.map((agendamento) => {
                const status = statusConfig[agendamento.status];
                const StatusIcon = status.icon;

                return (
                  <div
                    key={agendamento.id}
                    onClick={() => handleShowDetails(agendamento)}
                    className="p-4 rounded-lg border border-border hover:border-primary/50 hover:bg-muted/30 transition-all cursor-pointer"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4 flex-1">
                        {/* Horário */}
                        <div className="flex flex-col items-center justify-center bg-primary-light rounded-lg p-3 min-w-[70px]">
                          <Clock className="h-4 w-4 text-primary mb-1" />
                          <span className="text-lg font-bold text-primary">{agendamento.hora}</span>
                        </div>

                        {/* Informações */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div>
                              <h4 className="font-semibold text-base truncate">
                                Cliente #{agendamento.user_id.substring(0, 8)}
                              </h4>
                              <p className="text-sm text-muted-foreground flex items-center gap-1">
                                <Scissors className="h-3.5 w-3.5" />
                                {agendamento.servico?.nome || 'Serviço'}
                              </p>
                            </div>
                            <Badge variant={status.variant} className="shrink-0 gap-1">
                              <StatusIcon className="h-3 w-3" />
                              {status.label}
                            </Badge>
                          </div>

                          <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Timer className="h-3.5 w-3.5" />
                              {agendamento.servico?.duracao_minutos || 0} min
                            </span>
                            <span className="flex items-center gap-1">
                              <DollarSign className="h-3.5 w-3.5" />
                              {formatPrice(agendamento.servico?.preco_centavos || 0)}
                            </span>
                          </div>

                          {agendamento.observacoes && (
                            <div className="mt-2 p-2 bg-muted/50 rounded text-sm text-muted-foreground">
                              <strong>Obs:</strong> {agendamento.observacoes}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog de Detalhes */}
      <Dialog open={detailsDialog} onOpenChange={setDetailsDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Detalhes do Agendamento</DialogTitle>
            <DialogDescription>
              Visualize e gerencie o status do agendamento
            </DialogDescription>
          </DialogHeader>

          {selectedAgendamento && (
            <div className="space-y-4 py-4">
              {/* Serviço */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-muted-foreground">Serviço</h4>
                <div className="p-3 bg-muted/50 rounded-lg space-y-2">
                  <p className="font-medium">{selectedAgendamento.servico?.nome || 'Serviço'}</p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Timer className="h-3.5 w-3.5" />
                      {selectedAgendamento.servico?.duracao_minutos || 0} minutos
                    </span>
                    <span className="flex items-center gap-1">
                      <DollarSign className="h-3.5 w-3.5" />
                      {formatPrice(selectedAgendamento.servico?.preco_centavos || 0)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Horário */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-muted-foreground">Data e Horário</h4>
                <div className="p-3 bg-muted/50 rounded-lg flex items-center gap-4">
                  <span className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {new Date(selectedAgendamento.data + 'T12:00:00').toLocaleDateString('pt-BR')}
                  </span>
                  <span className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    {selectedAgendamento.hora}
                  </span>
                </div>
              </div>

              {/* Observações */}
              {selectedAgendamento.observacoes && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-muted-foreground">Observações</h4>
                  <div className="p-3 bg-muted/50 rounded-lg text-sm">
                    {selectedAgendamento.observacoes}
                  </div>
                </div>
              )}

              {/* Status Atual */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-muted-foreground">Status Atual</h4>
                <Badge variant={statusConfig[selectedAgendamento.status].variant} className="gap-1">
                  {React.createElement(statusConfig[selectedAgendamento.status].icon, { className: "h-3 w-3" })}
                  {statusConfig[selectedAgendamento.status].label}
                </Badge>
              </div>

              {/* Ações */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-muted-foreground">Alterar Status</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedAgendamento.status === "pendente" && (
                    <>
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => handleUpdateStatus(selectedAgendamento.id, "confirmado")}
                        className="gap-1"
                      >
                        <CheckCircle className="h-3.5 w-3.5" />
                        Confirmar
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleUpdateStatus(selectedAgendamento.id, "cancelado")}
                        className="gap-1 text-destructive"
                      >
                        <XCircle className="h-3.5 w-3.5" />
                        Cancelar
                      </Button>
                    </>
                  )}
                  {selectedAgendamento.status === "confirmado" && (
                    <>
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => handleUpdateStatus(selectedAgendamento.id, "concluido")}
                        className="gap-1"
                      >
                        <CheckCircle className="h-3.5 w-3.5" />
                        Concluir
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleUpdateStatus(selectedAgendamento.id, "nao_compareceu")}
                        className="gap-1"
                      >
                        <XCircle className="h-3.5 w-3.5" />
                        Não Compareceu
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleUpdateStatus(selectedAgendamento.id, "cancelado")}
                        className="gap-1 text-destructive"
                      >
                        <XCircle className="h-3.5 w-3.5" />
                        Cancelar
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailsDialog(false)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </LojaLayout>
  );
}
