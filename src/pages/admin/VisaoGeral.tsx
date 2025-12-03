import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/layouts/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Store,
  Users,
  Calendar,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { EstatisticasAdmin } from "@/types";

interface KPI {
  label: string;
  value: string;
  change: string;
  trend: "up" | "down";
  icon: any;
  color: string;
}

interface LojaRecente {
  id: string;
  nome: string;
  cidade: string | null;
  status: string;
  agendamentos_count: number;
  created_at: string;
}

interface AtividadeRecente {
  id: string;
  acao: string;
  descricao: string;
  tempo: string;
  user_nome: string | null;
}

export default function AdminVisaoGeral() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<EstatisticasAdmin | null>(null);
  const [lojasRecentes, setLojasRecentes] = useState<LojaRecente[]>([]);
  const [atividades, setAtividades] = useState<AtividadeRecente[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Buscar estatísticas gerais
      const [lojasResult, usuariosResult, agendamentosResult] = await Promise.all([
        supabase.from('lojas').select('id, created_at'),
        supabase.from('usuarios').select('id, tipo, status, created_at'),
        supabase.from('agendamentos').select('id, created_at, status')
      ]);

      if (lojasResult.error) throw lojasResult.error;
      if (usuariosResult.error) throw usuariosResult.error;
      if (agendamentosResult.error) throw agendamentosResult.error;

      const lojas = lojasResult.data || [];
      const usuarios = usuariosResult.data || [];
      const agendamentos = agendamentosResult.data || [];

      // Calcular estatísticas
      const now = new Date();
      const mesAtual = now.getMonth();
      const mesPassado = mesAtual === 0 ? 11 : mesAtual - 1;

      const lojasAtivas = lojas.length;
      const usuariosAtivos = usuarios.filter(u => u.status === 'ativo').length;

      const agendamentosMes = agendamentos.filter(a => {
        const agData = new Date(a.created_at);
        return agData.getMonth() === mesAtual && agData.getFullYear() === now.getFullYear();
      }).length;

      const agendamentosMesPassado = agendamentos.filter(a => {
        const agData = new Date(a.created_at);
        return agData.getMonth() === mesPassado;
      }).length;

      const taxaCrescimento = agendamentosMesPassado > 0
        ? ((agendamentosMes - agendamentosMesPassado) / agendamentosMesPassado) * 100
        : 0;

      setStats({
        total_lojas: lojas.length,
        lojas_ativas: lojasAtivas,
        total_usuarios: usuarios.length,
        usuarios_ativos: usuariosAtivos,
        total_agendamentos: agendamentos.length,
        agendamentos_mes: agendamentosMes,
        receita_total: 0, // Implementar quando tiver sistema de pagamentos
        taxa_crescimento: Math.round(taxaCrescimento)
      });

      // Buscar lojas recentes com contagem de agendamentos
      const { data: recentLojas, error: lojasError } = await supabase
        .from('lojas')
        .select(`
          id,
          nome,
          cidade,
          created_at,
          agendamentos(count)
        `)
        .order('created_at', { ascending: false })
        .limit(5);

      if (lojasError) throw lojasError;

      setLojasRecentes(recentLojas?.map(loja => ({
        id: loja.id,
        nome: loja.nome,
        cidade: loja.cidade,
        status: 'ativa',
        agendamentos_count: loja.agendamentos?.[0]?.count || 0,
        created_at: loja.created_at || ''
      })) || []);

      // Buscar atividades recentes
      const { data: logs, error: logsError } = await supabase
        .from('logs_auditoria')
        .select('*')
        .order('criado_em', { ascending: false })
        .limit(5);

      if (!logsError && logs) {
        setAtividades(logs.map(log => {
          const tempo = getTempoDecorrido(log.criado_em);
          return {
            id: log.id,
            acao: formatarAcao(log.acao, log.tabela),
            descricao: log.user_nome || 'Usuário desconhecido',
            tempo,
            user_nome: log.user_nome
          };
        }));
      }

    } catch (error) {
      console.error('Erro ao carregar dashboard:', error);
      toast.error('Erro ao carregar dados do dashboard');
    } finally {
      setLoading(false);
    }
  };

  const formatarAcao = (acao: string, tabela: string): string => {
    const acoes: Record<string, string> = {
      'CRIAR': 'Criou',
      'ATUALIZAR': 'Atualizou',
      'DELETAR': 'Deletou',
      'RESETAR_SENHA': 'Resetou senha'
    };
    const tabelas: Record<string, string> = {
      'usuarios': 'usuário',
      'lojas': 'loja',
      'servicos': 'serviço',
      'agendamentos': 'agendamento'
    };
    return `${acoes[acao] || acao} ${tabelas[tabela] || tabela}`;
  };

  const getTempoDecorrido = (dataStr: string): string => {
    const data = new Date(dataStr);
    const agora = new Date();
    const diffMs = agora.getTime() - data.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'agora';
    if (diffMins < 60) return `${diffMins} min`;
    const diffHoras = Math.floor(diffMins / 60);
    if (diffHoras < 24) return `${diffHoras}h`;
    const diffDias = Math.floor(diffHoras / 24);
    return `${diffDias}d`;
  };

  const kpis: KPI[] = stats ? [
    {
      label: "Total de Lojas",
      value: stats.total_lojas.toString(),
      change: stats.lojas_ativas === stats.total_lojas ? "100%" : `${Math.round((stats.lojas_ativas / stats.total_lojas) * 100)}%`,
      trend: "up",
      icon: Store,
      color: "primary",
    },
    {
      label: "Usuários Ativos",
      value: stats.usuarios_ativos > 999 ? `${(stats.usuarios_ativos / 1000).toFixed(1)}k` : stats.usuarios_ativos.toString(),
      change: `${Math.round((stats.usuarios_ativos / stats.total_usuarios) * 100)}%`,
      trend: "up",
      icon: Users,
      color: "secondary",
    },
    {
      label: "Agendamentos (Mês)",
      value: stats.agendamentos_mes.toString(),
      change: `${stats.taxa_crescimento}%`,
      trend: stats.taxa_crescimento >= 0 ? "up" : "down",
      icon: Calendar,
      color: "success",
    },
    {
      label: "Taxa de Crescimento",
      value: `${Math.abs(stats.taxa_crescimento)}%`,
      change: `${stats.agendamentos_mes} agendamentos`,
      trend: stats.taxa_crescimento >= 0 ? "up" : "down",
      icon: TrendingUp,
      color: stats.taxa_crescimento >= 0 ? "success" : "warning",
    },
  ] : [];

  if (loading) {
    return (
      <AdminLayout
        title="Visão Geral"
        description="Acompanhe as métricas da plataforma em tempo real."
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} variant="elevated">
              <CardContent className="p-4">
                <Skeleton className="h-10 w-10 rounded-xl mb-3" />
                <Skeleton className="h-8 w-20 mb-2" />
                <Skeleton className="h-4 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title="Visão Geral"
      description="Acompanhe as métricas da plataforma em tempo real."
    >
      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 animate-fade-in">
        {kpis.map((kpi) => (
          <Card key={kpi.label} variant="elevated" className="hover:shadow-lg transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div
                  className={cn(
                    "h-10 w-10 rounded-xl flex items-center justify-center transition-transform hover:scale-110",
                    kpi.color === "primary" && "bg-primary/10 text-primary",
                    kpi.color === "secondary" && "bg-secondary/10 text-secondary",
                    kpi.color === "success" && "bg-green-500/10 text-green-600",
                    kpi.color === "warning" && "bg-orange-500/10 text-orange-600"
                  )}
                >
                  <kpi.icon className="h-5 w-5" />
                </div>
                <div
                  className={cn(
                    "flex items-center gap-1 text-sm font-medium",
                    kpi.trend === "up" ? "text-green-600" : "text-red-600"
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

      <div className="grid lg:grid-cols-2 gap-6 animate-slide-up">
        {/* Recent Lojas */}
        <Card variant="elevated">
          <CardHeader>
            <CardTitle>Lojas Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            {lojasRecentes.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                Nenhuma loja cadastrada ainda
              </p>
            ) : (
              <div className="space-y-4">
                {lojasRecentes.map((loja) => (
                  <div
                    key={loja.id}
                    className="flex items-center justify-between py-2 border-b border-border last:border-0 hover:bg-accent/50 rounded-lg px-2 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Store className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{loja.nome}</p>
                        <p className="text-sm text-muted-foreground">
                          {loja.cidade || 'Cidade não informada'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="success">
                        {loja.status}
                      </Badge>
                      {loja.agendamentos_count > 0 && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {loja.agendamentos_count} agendamentos
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card variant="elevated">
          <CardHeader>
            <CardTitle>Atividade Recente</CardTitle>
          </CardHeader>
          <CardContent>
            {atividades.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                Nenhuma atividade registrada
              </p>
            ) : (
              <div className="space-y-4">
                {atividades.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-center justify-between py-2 border-b border-border last:border-0 hover:bg-accent/50 rounded-lg px-2 transition-colors"
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
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
