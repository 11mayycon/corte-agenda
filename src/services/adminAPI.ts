import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface User {
  id: string;
  email: string;
  nome: string;
  tipo: 'admin' | 'salao' | 'cliente';
  telefone?: string;
  status: 'ativo' | 'inativo' | 'pendente';
  criado_em: string;
  atualizado_em: string;
  ultimo_acesso?: string;
}

export interface Loja {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  endereco: string;
  cidade: string;
  estado: string;
  cnpj?: string;
  status: 'ativo' | 'inativo' | 'pendente';
  horario_abertura: string;
  horario_fechamento: string;
  dias_funcionamento: string[];
  criado_em: string;
  atualizado_em: string;
  user_id: string; // ID do dono do salão
}

export interface LogAuditoria {
  id: string;
  user_id: string;
  user_nome: string;
  user_tipo: string;
  acao: string;
  tabela: string;
  registro_id: string;
  alteracoes: Record<string, any>;
  ip?: string;
  user_agent?: string;
  criado_em: string;
}

// Função auxiliar para registrar logs de auditoria
const registrarLog = async (acao: string, tabela: string, registro_id: string, alteracoes: Record<string, any>) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const log = {
      user_id: user.id,
      user_nome: user.user_metadata?.nome || 'Desconhecido',
      user_tipo: user.user_metadata?.tipo || 'desconhecido',
      acao,
      tabela,
      registro_id,
      alteracoes,
      ip: null, // IP pode ser capturado do request se estiver usando Edge Functions
      user_agent: navigator.userAgent
    };

    await supabase.from('logs_auditoria').insert(log);
  } catch (error) {
    console.error('Erro ao registrar log:', error);
  }
};

// APIs para Usuários
export const adminAPI = {
  // Listar todos os usuários
  async getUsers(filtros?: { tipo?: string; status?: string; cidade?: string }) {
    try {
      let query = supabase
        .from('usuarios')
        .select(`
          *,
          lojas:nome
        `)
        .order('criado_em', { ascending: false });

      if (filtros?.tipo) {
        query = query.eq('tipo', filtros.tipo);
      }
      if (filtros?.status) {
        query = query.eq('status', filtros.status);
      }

      const { data, error } = await query;

      if (error) throw error;
      return { data: data as User[], error: null };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao buscar usuários';
      toast.error(message);
      return { data: null, error: message };
    }
  },

  // Criar novo usuário
  async createUser(userData: Partial<User>) {
    try {
      const { data, error } = await supabase
        .from('usuarios')
        .insert(userData)
        .select()
        .single();

      if (error) throw error;

      await registrarLog('CRIAR', 'usuarios', data.id, userData);
      
      toast.success('Usuário criado com sucesso!');
      return { data: data as User, error: null };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao criar usuário';
      toast.error(message);
      return { data: null, error: message };
    }
  },

  // Atualizar usuário
  async updateUser(id: string, updates: Partial<User>) {
    try {
      const { data, error } = await supabase
        .from('usuarios')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      await registrarLog('ATUALIZAR', 'usuarios', id, updates);
      
      toast.success('Usuário atualizado com sucesso!');
      return { data: data as User, error: null };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao atualizar usuário';
      toast.error(message);
      return { data: null, error: message };
    }
  },

  // Deletar usuário (soft delete)
  async deleteUser(id: string) {
    try {
      const { data, error } = await supabase
        .from('usuarios')
        .update({ status: 'inativo' })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      await registrarLog('DELETAR', 'usuarios', id, { status: 'inativo' });
      
      toast.success('Usuário desativado com sucesso!');
      return { data: data as User, error: null };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao desativar usuário';
      toast.error(message);
      return { data: null, error: message };
    }
  },

  // Resetar senha do usuário
  async resetUserPassword(email: string) {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });

      if (error) throw error;

      await registrarLog('RESETAR_SENHA', 'usuarios', email, {});
      
      toast.success('Email de recuperação enviado!');
      return { error: null };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao resetar senha';
      toast.error(message);
      return { error: message };
    }
  }
};

// APIs para Lojas
export const lojasAPI = {
  // Listar todas as lojas
  async getLojas(filtros?: { status?: string; cidade?: string; user_id?: string }) {
    try {
      let query = supabase
        .from('lojas')
        .select(`
          *,
          usuarios:nome
        `)
        .order('criado_em', { ascending: false });

      if (filtros?.status) {
        query = query.eq('status', filtros.status);
      }
      if (filtros?.cidade) {
        query = query.eq('cidade', filtros.cidade);
      }
      if (filtros?.user_id) {
        query = query.eq('user_id', filtros.user_id);
      }

      const { data, error } = await query;

      if (error) throw error;
      return { data: data as Loja[], error: null };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao buscar lojas';
      toast.error(message);
      return { data: null, error: message };
    }
  },

  // Criar nova loja
  async createLoja(lojaData: Partial<Loja>) {
    try {
      const { data, error } = await supabase
        .from('lojas')
        .insert(lojaData)
        .select()
        .single();

      if (error) throw error;

      await registrarLog('CRIAR', 'lojas', data.id, lojaData);
      
      toast.success('Loja criada com sucesso!');
      return { data: data as Loja, error: null };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao criar loja';
      toast.error(message);
      return { data: null, error: message };
    }
  },

  // Atualizar loja
  async updateLoja(id: string, updates: Partial<Loja>) {
    try {
      const { data, error } = await supabase
        .from('lojas')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      await registrarLog('ATUALIZAR', 'lojas', id, updates);
      
      toast.success('Loja atualizada com sucesso!');
      return { data: data as Loja, error: null };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao atualizar loja';
      toast.error(message);
      return { data: null, error: message };
    }
  },

  // Deletar loja (soft delete)
  async deleteLoja(id: string) {
    try {
      const { data, error } = await supabase
        .from('lojas')
        .update({ status: 'inativo' })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      await registrarLog('DELETAR', 'lojas', id, { status: 'inativo' });
      
      toast.success('Loja desativada com sucesso!');
      return { data: data as Loja, error: null };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao desativar loja';
      toast.error(message);
      return { data: null, error: message };
    }
  }
};

// APIs para Auditoria
export const auditoriaAPI = {
  // Listar logs de auditoria
  async getLogs(filtros?: { 
    user_id?: string; 
    acao?: string; 
    tabela?: string; 
    data_inicio?: string; 
    data_fim?: string;
    limit?: number;
  }) {
    try {
      let query = supabase
        .from('logs_auditoria')
        .select(`
          *,
          usuarios:nome
        `)
        .order('criado_em', { ascending: false });

      if (filtros?.limit) {
        query = query.limit(filtros.limit);
      }
      if (filtros?.user_id) {
        query = query.eq('user_id', filtros.user_id);
      }
      if (filtros?.acao) {
        query = query.eq('acao', filtros.acao);
      }
      if (filtros?.tabela) {
        query = query.eq('tabela', filtros.tabela);
      }
      if (filtros?.data_inicio) {
        query = query.gte('criado_em', filtros.data_inicio);
      }
      if (filtros?.data_fim) {
        query = query.lte('criado_em', filtros.data_fim);
      }

      const { data, error } = await query;

      if (error) throw error;
      return { data: data as LogAuditoria[], error: null };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao buscar logs';
      toast.error(message);
      return { data: null, error: message };
    }
  },

  // Limpar logs antigos (mantém últimos 90 dias)
  async limparLogsAntigos() {
    try {
      const dataLimite = new Date();
      dataLimite.setDate(dataLimite.getDate() - 90);

      const { error } = await supabase
        .from('logs_auditoria')
        .delete()
        .lt('criado_em', dataLimite.toISOString());

      if (error) throw error;

      toast.success('Logs antigos removidos com sucesso!');
      return { error: null };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao limpar logs';
      toast.error(message);
      return { error: message };
    }
  }
};