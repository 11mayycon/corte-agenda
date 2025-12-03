// =============================================
// TIPOS COMPARTILHADOS DO SISTEMA
// =============================================

export type UserType = 'admin' | 'salao' | 'cliente';
export type UserStatus = 'ativo' | 'inativo' | 'pendente';
export type AgendamentoStatus = 'pendente' | 'confirmado' | 'cancelado' | 'concluido' | 'nao_compareceu';
export type DiaSemana = 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0 = Domingo, 6 = Sábado

// =============================================
// USUÁRIOS
// =============================================
export interface User {
  id: string;
  nome: string;
  email: string;
  telefone?: string;
  tipo: UserType;
  status: UserStatus;
  avatar_url?: string;
  criado_em: string;
  atualizado_em: string;
  ultimo_acesso?: string;
}

export interface Perfil {
  id: string;
  conta_id: string;
  nome: string;
  sobrenome: string;
  telefone: string;
  data_nascimento: string;
  regiao: string;
  created_at: string;
  updated_at: string;
}

// =============================================
// LOJAS
// =============================================
export interface Loja {
  id: string;
  nome: string;
  endereco: string | null;
  bairro: string | null;
  cidade: string | null;
  uf: string | null;
  cep: string | null;
  logo_url: string | null;
  whatsapp: string | null;
  politica_cancelamento_horas: number;
  onboarding_pendente: boolean;
  created_at: string | null;
  user_id?: string;
  status?: UserStatus;
  horario_abertura?: string;
  horario_fechamento?: string;
  intervalo_minutos?: number;
}

export interface LojaComServicos extends Loja {
  servicos: Servico[];
  avaliacoes?: Avaliacao[];
  rating?: number;
  total_avaliacoes?: number;
}

export interface HorarioLoja {
  id: string;
  loja_id: string;
  dia_semana: DiaSemana;
  abre: string;
  fecha: string;
  intervalo_minutos: number;
}

// =============================================
// SERVIÇOS
// =============================================
export interface Servico {
  id: string;
  loja_id: string;
  nome: string;
  preco_centavos: number | null;
  duracao_minutos: number;
  ativo: boolean;
  descricao?: string;
  categoria?: string;
}

export interface ServicoForm {
  nome: string;
  preco_centavos: number;
  duracao_minutos: number;
  descricao?: string;
  categoria?: string;
  ativo: boolean;
}

// =============================================
// PROFISSIONAIS
// =============================================
export interface Profissional {
  id: string;
  loja_id: string;
  nome: string;
  ativo: boolean;
  created_at: string | null;
  foto_url?: string;
  especialidades?: string[];
}

// =============================================
// AGENDAMENTOS
// =============================================
export interface Agendamento {
  id: string;
  loja_id: string;
  user_id: string;
  servico_id: string;
  profissional_id: string | null;
  data: string;
  hora: string;
  status: AgendamentoStatus;
  observacoes: string | null;
  origem: string;
  created_at: string;
  updated_at: string;
}

export interface AgendamentoComRelacoes extends Agendamento {
  loja?: {
    nome: string;
    endereco: string;
    whatsapp: string;
    logo_url: string;
  };
  servico?: {
    nome: string;
    preco_centavos: number;
    duracao_minutos: number;
  };
  cliente?: {
    nome: string;
    telefone: string;
    email: string;
  };
  profissional?: {
    nome: string;
  };
}

export interface AgendamentoForm {
  loja_id: string;
  servico_id: string;
  profissional_id?: string;
  data: string;
  hora: string;
  observacoes?: string;
}

// =============================================
// AVALIAÇÕES
// =============================================
export interface Avaliacao {
  id: string;
  loja_id: string;
  cliente_id: string;
  agendamento_id: string | null;
  nota: number; // 1-5
  comentario: string | null;
  resposta: string | null;
  criado_em: string;
  atualizado_em: string;
}

export interface AvaliacaoComCliente extends Avaliacao {
  cliente?: {
    nome: string;
    avatar_url?: string;
  };
}

export interface AvaliacaoForm {
  loja_id: string;
  agendamento_id?: string;
  nota: number;
  comentario?: string;
}

// =============================================
// WHATSAPP
// =============================================
export interface WhatsAppSessao {
  id: string;
  loja_id: string;
  session_name: string;
  provider: string;
  status: string;
  qr_base64: string | null;
  dados: any;
  created_at: string | null;
  updated_at: string | null;
}

export interface MensagemWhatsApp {
  id: string;
  loja_id: string | null;
  user_id: string | null;
  tipo: string;
  direcao: string;
  wa_from: string | null;
  wa_to: string | null;
  conteudo: any;
  correlacao: string | null;
  created_at: string | null;
}

// =============================================
// LOGS E AUDITORIA
// =============================================
export interface Log {
  id: string;
  usuario_id: string | null;
  acao: string;
  tabela: string;
  registro_id: string | null;
  detalhes: any;
  criado_em: string;
}

export interface LogAuditoria {
  id: string;
  user_id: string | null;
  user_nome: string | null;
  user_tipo: string | null;
  acao: string;
  tabela: string;
  registro_id: string;
  alteracoes: any;
  ip: string | null;
  user_agent: string | null;
  criado_em: string;
}

// =============================================
// FAVORITOS
// =============================================
export interface Favorito {
  id: string;
  user_id: string;
  loja_id: string;
  criado_em: string;
}

// =============================================
// ESTATÍSTICAS E MÉTRICAS
// =============================================
export interface EstatisticasLoja {
  total_agendamentos: number;
  agendamentos_mes: number;
  agendamentos_hoje: number;
  agendamentos_proximos: number;
  taxa_cancelamento: number;
  ticket_medio: number;
  avaliacao_media: number;
  total_clientes: number;
  servicos_ativos: number;
  receita_mes: number;
}

export interface EstatisticasAdmin {
  total_lojas: number;
  lojas_ativas: number;
  total_usuarios: number;
  usuarios_ativos: number;
  total_agendamentos: number;
  agendamentos_mes: number;
  receita_total: number;
  taxa_crescimento: number;
}

export interface ClienteRecorrente {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  total_agendamentos: number;
  ultimo_agendamento: string;
  ticket_medio: number;
  status: UserStatus;
}

// =============================================
// FILTROS
// =============================================
export interface FiltrosAgendamento {
  data_inicio?: string;
  data_fim?: string;
  status?: AgendamentoStatus;
  loja_id?: string;
  cliente_id?: string;
  servico_id?: string;
}

export interface FiltrosLoja {
  cidade?: string;
  bairro?: string;
  status?: UserStatus;
  search?: string;
}

export interface FiltrosUsuario {
  tipo?: UserType;
  status?: UserStatus;
  search?: string;
}

// =============================================
// RESPOSTAS DE API
// =============================================
export interface APIResponse<T> {
  data: T | null;
  error: string | null;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}

// =============================================
// NOTIFICAÇÕES
// =============================================
export interface Notificacao {
  id: string;
  user_id: string;
  tipo: 'agendamento' | 'cancelamento' | 'avaliacao' | 'sistema';
  titulo: string;
  mensagem: string;
  lida: boolean;
  link?: string;
  criado_em: string;
}

// =============================================
// HORÁRIOS DISPONÍVEIS
// =============================================
export interface HorarioDisponivel {
  horario: string;
  disponivel: boolean;
  profissional_id?: string;
}

export interface DisponibilidadeDia {
  data: string;
  dia_semana: DiaSemana;
  aberto: boolean;
  horarios: HorarioDisponivel[];
}
