import { AdminLayout } from "@/components/layouts/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Store,
  Users,
  Calendar,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

const kpis = [
  {
    label: "Total de Lojas",
    value: "156",
    change: "+12%",
    trend: "up",
    icon: Store,
    color: "primary",
  },
  {
    label: "Usuários Ativos",
    value: "2.4k",
    change: "+8%",
    trend: "up",
    icon: Users,
    color: "secondary",
  },
  {
    label: "Agendamentos Hoje",
    value: "847",
    change: "+23%",
    trend: "up",
    icon: Calendar,
    color: "success",
  },
  {
    label: "Taxa de Conversão",
    value: "68%",
    change: "-2%",
    trend: "down",
    icon: TrendingUp,
    color: "warning",
  },
];

const recentLojas = [
  { id: "1", nome: "Barbearia Premium", cidade: "São Paulo", status: "ativa", agendamentos: 45 },
  { id: "2", nome: "Studio Hair", cidade: "Rio de Janeiro", status: "ativa", agendamentos: 32 },
  { id: "3", nome: "Corte & Estilo", cidade: "Belo Horizonte", status: "pendente", agendamentos: 0 },
  { id: "4", nome: "Barber Shop", cidade: "Curitiba", status: "ativa", agendamentos: 28 },
  { id: "5", nome: "Hair Design", cidade: "Porto Alegre", status: "inativa", agendamentos: 0 },
];

const recentActivity = [
  { id: "1", acao: "Nova loja cadastrada", descricao: "Barbearia Premium", tempo: "5 min" },
  { id: "2", acao: "Usuário criado", descricao: "joao@email.com", tempo: "12 min" },
  { id: "3", acao: "Plano atualizado", descricao: "Studio Hair → Pro", tempo: "1h" },
  { id: "4", acao: "Loja desativada", descricao: "Old Barber", tempo: "2h" },
  { id: "5", acao: "Nova integração", descricao: "WhatsApp API", tempo: "3h" },
];

export default function AdminVisaoGeral() {
  return (
    <AdminLayout
      title="Visão Geral"
      description="Acompanhe as métricas da plataforma em tempo real."
    >
      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {kpis.map((kpi) => (
          <Card key={kpi.label} variant="elevated">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div
                  className={cn(
                    "h-10 w-10 rounded-xl flex items-center justify-center",
                    kpi.color === "primary" && "bg-primary-light text-primary",
                    kpi.color === "secondary" && "bg-secondary-light text-secondary",
                    kpi.color === "success" && "bg-success-light text-success",
                    kpi.color === "warning" && "bg-warning-light text-warning"
                  )}
                >
                  <kpi.icon className="h-5 w-5" />
                </div>
                <div
                  className={cn(
                    "flex items-center gap-1 text-sm font-medium",
                    kpi.trend === "up" ? "text-success" : "text-destructive"
                  )}
                >
                  {kpi.trend === "up" ? (
                    <ArrowUpRight className="h-4 w-4" />
                  ) : (
                    <ArrowDownRight className="h-4 w-4" />
                  )}
                  {kpi.change}
                </div>
              </div>
              <p className="text-2xl font-bold">{kpi.value}</p>
              <p className="text-sm text-muted-foreground">{kpi.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Lojas */}
        <Card variant="elevated">
          <CardHeader>
            <CardTitle>Lojas Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentLojas.map((loja) => (
                <div
                  key={loja.id}
                  className="flex items-center justify-between py-2 border-b border-border last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-primary-light flex items-center justify-center">
                      <Store className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{loja.nome}</p>
                      <p className="text-sm text-muted-foreground">{loja.cidade}</p>
                    </div>
                  </div>
                  <div className="text-right">
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
                    {loja.agendamentos > 0 && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {loja.agendamentos} agendamentos
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card variant="elevated">
          <CardHeader>
            <CardTitle>Atividade Recente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center justify-between py-2 border-b border-border last:border-0"
                >
                  <div>
                    <p className="font-medium">{activity.acao}</p>
                    <p className="text-sm text-muted-foreground">
                      {activity.descricao}
                    </p>
                  </div>
                  <span className="text-sm text-muted-foreground whitespace-nowrap">
                    {activity.tempo}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
