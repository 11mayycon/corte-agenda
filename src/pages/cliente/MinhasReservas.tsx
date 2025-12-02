import { useState } from "react";
import { ClienteLayout } from "@/components/layouts/ClienteLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Calendar,
  Clock,
  MapPin,
  User,
  X,
  RefreshCw,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Inbox,
} from "lucide-react";
import { cn } from "@/lib/utils";

type StatusType = "pendente" | "confirmado" | "cancelado" | "concluido";

interface Reserva {
  id: string;
  loja: string;
  servico: string;
  profissional: string;
  data: string;
  hora: string;
  status: StatusType;
  preco: number;
}

const mockReservas: Reserva[] = [
  {
    id: "1",
    loja: "Barbearia Premium",
    servico: "Corte + Barba",
    profissional: "Carlos Silva",
    data: "2024-12-10",
    hora: "10:00",
    status: "confirmado",
    preco: 6000,
  },
  {
    id: "2",
    loja: "Studio Hair",
    servico: "Corte Masculino",
    profissional: "João Santos",
    data: "2024-12-15",
    hora: "14:30",
    status: "pendente",
    preco: 4500,
  },
  {
    id: "3",
    loja: "Barbearia Premium",
    servico: "Barba",
    profissional: "Pedro Lima",
    data: "2024-11-28",
    hora: "09:00",
    status: "concluido",
    preco: 2500,
  },
  {
    id: "4",
    loja: "Corte & Estilo",
    servico: "Corte Masculino",
    profissional: "Carlos Silva",
    data: "2024-11-20",
    hora: "11:00",
    status: "cancelado",
    preco: 4500,
  },
];

const statusConfig: Record<StatusType, { label: string; icon: React.ElementType; variant: StatusType }> = {
  pendente: { label: "Pendente", icon: AlertCircle, variant: "pendente" },
  confirmado: { label: "Confirmado", icon: CheckCircle2, variant: "confirmado" },
  cancelado: { label: "Cancelado", icon: XCircle, variant: "cancelado" },
  concluido: { label: "Concluído", icon: CheckCircle2, variant: "concluido" },
};

function ReservaCard({ reserva }: { reserva: Reserva }) {
  const status = statusConfig[reserva.status];
  const StatusIcon = status.icon;
  const isUpcoming = reserva.status === "pendente" || reserva.status === "confirmado";

  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(cents / 100);
  };

  return (
    <Card variant="elevated" className="overflow-hidden">
      <CardContent className="p-0">
        <div className="p-4 sm:p-5">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <h3 className="font-semibold text-lg text-foreground">{reserva.servico}</h3>
              <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-1">
                <MapPin className="h-3.5 w-3.5" />
                {reserva.loja}
              </p>
            </div>
            <Badge variant={status.variant} className="flex items-center gap-1">
              <StatusIcon className="h-3 w-3" />
              {status.label}
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>{new Date(reserva.data + "T12:00:00").toLocaleDateString("pt-BR")}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>{reserva.hora}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <User className="h-4 w-4" />
              <span>{reserva.profissional}</span>
            </div>
            <div className="font-semibold text-foreground">{formatPrice(reserva.preco)}</div>
          </div>
        </div>

        {isUpcoming && (
          <div className="flex border-t border-border">
            <Button
              variant="ghost"
              className="flex-1 rounded-none h-12 text-destructive hover:text-destructive hover:bg-destructive-light"
            >
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
            <div className="w-px bg-border" />
            <Button variant="ghost" className="flex-1 rounded-none h-12">
              <RefreshCw className="h-4 w-4 mr-2" />
              Remarcar
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
        <Inbox className="h-8 w-8 text-muted-foreground" />
      </div>
      <p className="text-muted-foreground">{message}</p>
    </div>
  );
}

export default function ClienteMinhasReservas() {
  const proximas = mockReservas.filter(
    (r) => r.status === "pendente" || r.status === "confirmado"
  );
  const historico = mockReservas.filter(
    (r) => r.status === "concluido" || r.status === "cancelado"
  );

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
          {proximas.length === 0 ? (
            <EmptyState message="Nenhum agendamento próximo — crie um novo." />
          ) : (
            <div className="space-y-4">
              {proximas.map((reserva) => (
                <ReservaCard key={reserva.id} reserva={reserva} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="historico" className="mt-0">
          {historico.length === 0 ? (
            <EmptyState message="Nenhum agendamento no histórico." />
          ) : (
            <div className="space-y-4">
              {historico.map((reserva) => (
                <ReservaCard key={reserva.id} reserva={reserva} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </ClienteLayout>
  );
}
