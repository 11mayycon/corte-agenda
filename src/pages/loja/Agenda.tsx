import { useState } from "react";
import { LojaLayout } from "@/components/layouts/LojaLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  Users,
  CheckCircle,
  AlertCircle,
  Plus,
  HelpCircle,
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

const mockAgendamentos = [
  { id: "1", cliente: "João Silva", servico: "Corte", hora: "09:00", profissional: "Carlos", status: "confirmado" },
  { id: "2", cliente: "Pedro Santos", servico: "Barba", hora: "09:30", profissional: "Carlos", status: "pendente" },
  { id: "3", cliente: "Lucas Lima", servico: "Corte + Barba", hora: "10:00", profissional: "João", status: "confirmado" },
  { id: "4", cliente: "Marcos Oliveira", servico: "Corte", hora: "10:30", profissional: "Pedro", status: "confirmado" },
  { id: "5", cliente: "Rafael Costa", servico: "Pigmentação", hora: "11:00", profissional: "Carlos", status: "pendente" },
  { id: "6", cliente: "Bruno Alves", servico: "Corte", hora: "14:00", profissional: "João", status: "confirmado" },
];

const profissionais = ["Carlos", "João", "Pedro"];

const kpis = [
  { label: "Agendados Hoje", value: "12", icon: Calendar, color: "primary" },
  { label: "Confirmados", value: "8", icon: CheckCircle, color: "success" },
  { label: "Pendentes", value: "4", icon: AlertCircle, color: "warning" },
  { label: "Clientes Atendidos", value: "156", icon: Users, color: "secondary" },
];

export default function LojaAgenda() {
  const [selectedDate, setSelectedDate] = useState(new Date());

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("pt-BR", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });
  };

  const changeDate = (days: number) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + days);
    setSelectedDate(newDate);
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
                    kpi.color === "success" && "bg-success-light text-success",
                    kpi.color === "warning" && "bg-warning-light text-warning",
                    kpi.color === "secondary" && "bg-secondary-light text-secondary"
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
          <div className="flex items-center justify-between">
            <Button variant="outline" size="icon" onClick={() => changeDate(-1)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="text-center">
              <p className="font-semibold text-lg capitalize">{formatDate(selectedDate)}</p>
              <p className="text-sm text-muted-foreground">
                {mockAgendamentos.length} agendamentos
              </p>
            </div>
            <Button variant="outline" size="icon" onClick={() => changeDate(1)}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Agenda Grid */}
      <Card variant="elevated">
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle>Agendamentos</CardTitle>
            <Tooltip>
              <TooltipTrigger>
                <HelpCircle className="h-4 w-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Arraste para remarcar um agendamento</p>
              </TooltipContent>
            </Tooltip>
          </div>
          <Button variant="gradient" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Novo Agendamento
          </Button>
        </CardHeader>
        <CardContent>
          {/* Desktop: Grid by professional */}
          <div className="hidden lg:block overflow-x-auto">
            <div className="min-w-[600px]">
              {/* Header */}
              <div className="grid grid-cols-4 gap-4 mb-4 pb-4 border-b border-border">
                <div className="font-medium text-muted-foreground">Horário</div>
                {profissionais.map((prof) => (
                  <div key={prof} className="font-medium text-center">{prof}</div>
                ))}
              </div>

              {/* Time slots */}
              {["09:00", "09:30", "10:00", "10:30", "11:00", "14:00", "14:30", "15:00"].map((hora) => (
                <div key={hora} className="grid grid-cols-4 gap-4 py-2 border-b border-border/50 last:border-0">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Clock className="h-4 w-4 mr-2" />
                    {hora}
                  </div>
                  {profissionais.map((prof) => {
                    const agendamento = mockAgendamentos.find(
                      (a) => a.hora === hora && a.profissional === prof
                    );
                    return (
                      <div key={prof} className="min-h-[60px]">
                        {agendamento ? (
                          <div
                            className={cn(
                              "p-3 rounded-lg cursor-pointer transition-all hover:shadow-md",
                              agendamento.status === "confirmado"
                                ? "bg-success-light border border-success/20"
                                : "bg-warning-light border border-warning/20"
                            )}
                          >
                            <p className="font-medium text-sm truncate">{agendamento.cliente}</p>
                            <p className="text-xs text-muted-foreground">{agendamento.servico}</p>
                          </div>
                        ) : (
                          <div className="h-full min-h-[60px] border-2 border-dashed border-border rounded-lg flex items-center justify-center text-muted-foreground text-xs hover:border-primary/50 hover:bg-primary-light/30 transition-colors cursor-pointer">
                            Disponível
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* Mobile: List view */}
          <div className="lg:hidden space-y-3">
            {mockAgendamentos.map((agendamento) => (
              <div
                key={agendamento.id}
                className={cn(
                  "p-4 rounded-lg border",
                  agendamento.status === "confirmado"
                    ? "bg-success-light/50 border-success/20"
                    : "bg-warning-light/50 border-warning/20"
                )}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold">{agendamento.cliente}</span>
                  <Badge
                    variant={agendamento.status === "confirmado" ? "success" : "warning"}
                  >
                    {agendamento.status === "confirmado" ? "Confirmado" : "Pendente"}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    {agendamento.hora}
                  </span>
                  <span>{agendamento.servico}</span>
                  <span>• {agendamento.profissional}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </LojaLayout>
  );
}
