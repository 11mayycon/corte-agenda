import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ClienteLayout } from "@/components/layouts/ClienteLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Calendar,
  Clock,
  MapPin,
  X,
  RefreshCw,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Inbox,
  Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { clienteAPI, type Agendamento } from "@/services/clienteAPI";
import { useAuthContext } from "@/contexts/AuthContext";

type StatusType = "pendente" | "confirmado" | "cancelado" | "concluido" | "nao_compareceu";

const statusConfig: Record<StatusType, { label: string; icon: any; variant: any; color: string }> = {
  pendente: { label: "Pendente", icon: AlertCircle, variant: "warning", color: "text-orange-600" },
  confirmado: { label: "Confirmado", icon: CheckCircle2, variant: "success", color: "text-green-600" },
  cancelado: { label: "Cancelado", icon: XCircle, variant: "secondary", color: "text-gray-600" },
  concluido: { label: "Concluído", icon: CheckCircle2, variant: "default", color: "text-blue-600" },
  nao_compareceu: { label: "Não Compareceu", icon: XCircle, variant: "destructive", color: "text-red-600" },
};

export default function ClienteMinhasReservas() {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const [loading, setLoading] = useState(true);
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [remarcarDialog, setRemarcarDialog] = useState(false);
  const [selectedAgendamento, setSelectedAgendamento] = useState<Agendamento | null>(null);
  const [novaData, setNovaData] = useState("");
  const [novaHora, setNovaHora] = useState("");

  useEffect(() => {
    if (user) {
      loadAgendamentos();
    }
  }, [user]);

  const loadAgendamentos = async () => {
    if (!user) return;
    
    setLoading(true);
    const { data, error } = await clienteAPI.getMeusAgendamentos(user.id);
    if (!error && data) {
      setAgendamentos(data);
    }
    setLoading(false);
  };

  const handleCancelar = async (agendamento: Agendamento) => {
    if (!confirm(`Tem certeza que deseja cancelar o agendamento de ${agendamento.servico?.nome}?`)) {
      return;
    }

    const { error } = await clienteAPI.cancelarAgendamento(agendamento.id);
    if (!error) {
      await loadAgendamentos();
    }
  };

  const handleRemarcar = (agendamento: Agendamento) => {
    setSelectedAgendamento(agendamento);
    setNovaData(agendamento.data);
    setNovaHora(agendamento.hora);
    setRemarcarDialog(true);
  };

  const handleConfirmRemarcar = async () => {
    if (!selectedAgendamento) return;

    if (!novaData || !novaHora) {
      toast.error('Preencha a nova data e hora');
      return;
    }

    // For now, cancel the old one and notify user to create new
    // In future, implement a proper reschedule endpoint
    const { error } = await clienteAPI.cancelarAgendamento(selectedAgendamento.id);
    
    if (!error) {
      toast.info('Agendamento cancelado. Por favor, crie um novo agendamento com a nova data.');
      setRemarcarDialog(false);
      await loadAgendamentos();
      navigate('/cliente/agendar');
    }
  };

  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(cents / 100);
  };

  const proximas = agendamentos.filter(
    (r) => r.status === "pendente" || r.status === "confirmado"
  );
  const historico = agendamentos.filter(
    (r) => r.status === "concluido" || r.status === "cancelado" || r.status === "nao_compareceu"
  );

  function ReservaCard({ agendamento }: { agendamento: Agendamento }) {
    const status = statusConfig[agendamento.status];
    const StatusIcon = status.icon;
    const isUpcoming = agendamento.status === "pendente" || agendamento.status === "confirmado";

    return (
      <Card variant="elevated" className="overflow-hidden">
        <CardContent className="p-0">
          <div className="p-4 sm:p-5">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-lg text-foreground truncate">
                  {agendamento.servico?.nome || 'Serviço'}
                </h3>
                <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-1">
                  <MapPin className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{agendamento.loja?.nome || 'Salão'}</span>
                </p>
              </div>
              <Badge variant={status.variant} className="flex items-center gap-1 shrink-0">
                <StatusIcon className="h-3 w-3" />
                {status.label}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>{new Date(agendamento.data + "T12:00:00").toLocaleDateString("pt-BR")}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>{agendamento.hora}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground col-span-2">
                <span className="text-xs">{agendamento.loja?.endereco}</span>
              </div>
              <div className="font-semibold text-foreground text-base">
                {formatPrice(agendamento.servico?.preco_centavos || 0)}
              </div>
              <div className="text-xs text-muted-foreground text-right">
                {agendamento.servico?.duracao_minutos} minutos
              </div>
            </div>
          </div>

          {isUpcoming && (
            <div className="flex border-t border-border">
              <Button
                variant="ghost"
                className="flex-1 rounded-none h-12 text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={() => handleCancelar(agendamento)}
              >
                <X className="h-4 w-4 mr-2" />
                Cancelar
              </Button>
              <div className="w-px bg-border" />
              <Button
                variant="ghost"
                className="flex-1 rounded-none h-12"
                onClick={() => handleRemarcar(agendamento)}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Remarcar
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  function EmptyState({ message, showButton = false }: { message: string; showButton?: boolean }) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <Inbox className="h-8 w-8 text-muted-foreground" />
        </div>
        <p className="text-muted-foreground mb-4">{message}</p>
        {showButton && (
          <Button onClick={() => navigate('/cliente/agendar')} className="gap-2">
            <Plus className="h-4 w-4" />
            Novo Agendamento
          </Button>
        )}
      </div>
    );
  }

  return (
    <ClienteLayout
      title="Minhas Reservas"
      description="Acompanhe seus agendamentos."
    >
      <Tabs defaultValue="proximas" className="w-full">
        <TabsList className="w-full max-w-md mb-6">
          <TabsTrigger value="proximas" className="flex-1">
            Próximas ({proximas.length})
          </TabsTrigger>
          <TabsTrigger value="historico" className="flex-1">
            Histórico ({historico.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="proximas" className="mt-0">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} variant="elevated">
                  <CardContent className="p-5">
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <Skeleton className="h-6 w-1/3" />
                        <Skeleton className="h-6 w-24" />
                      </div>
                      <Skeleton className="h-4 w-1/2" />
                      <div className="grid grid-cols-2 gap-4">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : proximas.length === 0 ? (
            <EmptyState message="Nenhum agendamento próximo" showButton={true} />
          ) : (
            <div className="space-y-4">
              {proximas.map((agendamento) => (
                <ReservaCard key={agendamento.id} agendamento={agendamento} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="historico" className="mt-0">
          {loading ? (
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <Card key={i} variant="elevated">
                  <CardContent className="p-5">
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <Skeleton className="h-6 w-1/3" />
                        <Skeleton className="h-6 w-24" />
                      </div>
                      <Skeleton className="h-4 w-1/2" />
                      <div className="grid grid-cols-2 gap-4">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : historico.length === 0 ? (
            <EmptyState message="Nenhum agendamento no histórico." />
          ) : (
            <div className="space-y-4">
              {historico.map((agendamento) => (
                <ReservaCard key={agendamento.id} agendamento={agendamento} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Dialog de Remarcar */}
      <Dialog open={remarcarDialog} onOpenChange={setRemarcarDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remarcar Agendamento</DialogTitle>
            <DialogDescription>
              Escolha uma nova data e horário para seu agendamento.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {selectedAgendamento && (
              <div className="p-4 rounded-lg bg-muted/50 space-y-2">
                <p className="font-semibold">{selectedAgendamento.servico?.nome}</p>
                <p className="text-sm text-muted-foreground">{selectedAgendamento.loja?.nome}</p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="nova-data">Nova Data</Label>
              <Input
                id="nova-data"
                type="date"
                value={novaData}
                onChange={(e) => setNovaData(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="nova-hora">Novo Horário</Label>
              <Input
                id="nova-hora"
                type="time"
                value={novaHora}
                onChange={(e) => setNovaHora(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setRemarcarDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleConfirmRemarcar}>
              Confirmar Remarcação
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ClienteLayout>
  );
}
