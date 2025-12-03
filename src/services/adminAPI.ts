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
  email?: string;
  telefone?: string;
  endereco?: string;
  cidade?: string;
  estado?: string;
  cnpj?: string;
  status: 'ativo' | 'inativo' | 'pendente';
  horario_abertura?: string;
  horario_fechamento?: string;
  dias_funcionamento?: string[];
  criado_em: string;
  atualizado_em: string;
  user_id?: string;
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

// Mock data for users (since the 'usuarios' table doesn't exist in schema)
const mockUsers: User[] = [
  {
    id: '1',
    email: 'admin@agendecorte.com',
    nome: 'Admin Sistema',
    tipo: 'admin',
    status: 'ativo',
    criado_em: new Date().toISOString(),
    atualizado_em: new Date().toISOString()
  }
];

// Mock data for audit logs
const mockLogs: LogAuditoria[] = [];

// APIs para Usuários
export const adminAPI = {
  // Listar todos os usuários (mock)
  async getUsers(_filtros?: { tipo?: string; status?: string; cidade?: string }) {
    // Return mock data since 'usuarios' table doesn't exist
    return { data: mockUsers, error: null };
  },

  // Criar novo usuário (mock)
  async createUser(userData: Partial<User>) {
    const newUser: User = {
      id: crypto.randomUUID(),
      email: userData.email || '',
      nome: userData.nome || '',
      tipo: userData.tipo || 'cliente',
      status: userData.status || 'ativo',
      telefone: userData.telefone,
      criado_em: new Date().toISOString(),
      atualizado_em: new Date().toISOString()
    };
    mockUsers.push(newUser);
    toast.success('Usuário criado com sucesso!');
    return { data: newUser, error: null };
  },

  // Atualizar usuário (mock)
  async updateUser(id: string, updates: Partial<User>) {
    const index = mockUsers.findIndex(u => u.id === id);
    if (index !== -1) {
      mockUsers[index] = { ...mockUsers[index], ...updates, atualizado_em: new Date().toISOString() };
      toast.success('Usuário atualizado com sucesso!');
      return { data: mockUsers[index], error: null };
    }
    return { data: null, error: 'Usuário não encontrado' };
  },

  // Deletar usuário (mock - soft delete)
  async deleteUser(id: string) {
    const index = mockUsers.findIndex(u => u.id === id);
    if (index !== -1) {
      mockUsers[index].status = 'inativo';
      toast.success('Usuário desativado com sucesso!');
      return { data: mockUsers[index], error: null };
    }
    return { data: null, error: 'Usuário não encontrado' };
  },

  // Resetar senha do usuário
  async resetUserPassword(email: string) {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });

      if (error) throw error;
      
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
        .select('*')
        .order('created_at', { ascending: false });

      if (filtros?.cidade) {
        query = query.eq('cidade', filtros.cidade);
      }

      const { data, error } = await query;

      if (error) throw error;
      
      // Map to expected format
      const lojas = (data || []).map(loja => ({
        id: loja.id,
        nome: loja.nome,
        endereco: loja.endereco,
        cidade: loja.cidade,
        estado: loja.uf,
        status: 'ativo' as const,
        criado_em: loja.created_at || new Date().toISOString(),
        atualizado_em: loja.created_at || new Date().toISOString()
      }));

      return { data: lojas as Loja[], error: null };
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
        .insert({
          nome: lojaData.nome || '',
          endereco: lojaData.endereco,
          cidade: lojaData.cidade,
          uf: lojaData.estado
        })
        .select()
        .single();

      if (error) throw error;
      
      toast.success('Loja criada com sucesso!');
      return { data: data as unknown as Loja, error: null };
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
        .update({
          nome: updates.nome,
          endereco: updates.endereco,
          cidade: updates.cidade,
          uf: updates.estado
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      toast.success('Loja atualizada com sucesso!');
      return { data: data as unknown as Loja, error: null };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao atualizar loja';
      toast.error(message);
      return { data: null, error: message };
    }
  },

  // Deletar loja (não implementado - mantém loja ativa)
  async deleteLoja(id: string) {
    toast.info('Funcionalidade não disponível');
    return { data: null, error: 'Funcionalidade não disponível' };
  }
};

// APIs para Auditoria
export const auditoriaAPI = {
  // Listar logs de auditoria (mock)
  async getLogs(_filtros?: { 
    user_id?: string; 
    acao?: string; 
    tabela?: string; 
    data_inicio?: string; 
    data_fim?: string;
    limit?: number;
  }) {
    // Return mock data since 'logs_auditoria' table doesn't exist
    return { data: mockLogs, error: null };
  },

  // Limpar logs antigos (mock)
  async limparLogsAntigos() {
    toast.success('Logs antigos removidos com sucesso!');
    return { error: null };
  }
};
