import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Servico {
  id: string;
  loja_id: string;
  nome: string;
  descricao?: string;
  preco_centavos: number | null;
  duracao_minutos: number;
  categoria?: string;
  ativo: boolean;
}

export interface Agendamento {
  id: string;
  loja_id: string;
  user_id: string;
  servico_id: string;
  profissional_id?: string | null;
  data: string;
  hora: string;
  status: 'pendente' | 'confirmado' | 'cancelado' | 'concluido' | 'nao_compareceu';
  observacoes?: string | null;
  origem: string;
  created_at: string;
  updated_at: string;
}

export interface ClienteSalao {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  total_agendamentos: number;
  ultimo_agendamento?: string;
  status: 'ativo' | 'inativo';
}

export interface HorarioDisponivel {
  data: string;
  horarios: string[];
}

export const salaoAPI = {
  // ===== SERVIÇOS =====
  async getServicos(lojaId: string, filtros?: { categoria?: string; ativo?: boolean }) {
    try {
      let query = supabase
        .from('servicos')
        .select('*')
        .eq('loja_id', lojaId)
        .order('nome', { ascending: true });

      if (filtros?.ativo !== undefined) {
        query = query.eq('ativo', filtros.ativo);
      }

      const { data, error } = await query;
      if (error) throw error;

      return { data: data as Servico[], error: null };
    } catch (error) {
      console.error('Erro ao buscar serviços:', error);
      toast.error('Erro ao carregar serviços');
      return { data: null, error: (error as Error).message };
    }
  },

  async createServico(servico: Omit<Servico, 'id'>) {
    try {
      const { data, error } = await supabase
        .from('servicos')
        .insert([{
          loja_id: servico.loja_id,
          nome: servico.nome,
          duracao_minutos: servico.duracao_minutos,
          preco_centavos: servico.preco_centavos,
          ativo: servico.ativo ?? true
        }])
        .select()
        .single();

      if (error) throw error;

      toast.success('Serviço criado com sucesso!');
      return { data: data as Servico, error: null };
    } catch (error) {
      console.error('Erro ao criar serviço:', error);
      toast.error('Erro ao criar serviço');
      return { data: null, error: (error as Error).message };
    }
  },

  async updateServico(id: string, servico: Partial<Servico>) {
    try {
      const updateData: any = {};
      if (servico.nome !== undefined) updateData.nome = servico.nome;
      if (servico.duracao_minutos !== undefined) updateData.duracao_minutos = servico.duracao_minutos;
      if (servico.preco_centavos !== undefined) updateData.preco_centavos = servico.preco_centavos;
      if (servico.ativo !== undefined) updateData.ativo = servico.ativo;

      const { data, error } = await supabase
        .from('servicos')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      toast.success('Serviço atualizado com sucesso!');
      return { data: data as Servico, error: null };
    } catch (error) {
      console.error('Erro ao atualizar serviço:', error);
      toast.error('Erro ao atualizar serviço');
      return { data: null, error: (error as Error).message };
    }
  },

  async deleteServico(id: string) {
    try {
      const { data, error } = await supabase
        .from('servicos')
        .update({ ativo: false })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      toast.success('Serviço desativado com sucesso!');
      return { data: data as Servico, error: null };
    } catch (error) {
      console.error('Erro ao desativar serviço:', error);
      toast.error('Erro ao desativar serviço');
      return { data: null, error: (error as Error).message };
    }
  },

  // ===== AGENDAMENTOS =====
  async getAgendamentos(lojaId: string, filtros?: {
    data?: string;
    status?: string;
  }) {
    try {
      let query = supabase
        .from('agendamentos')
        .select(`
          *,
          servico:servicos(nome, preco_centavos, duracao_minutos)
        `)
        .eq('loja_id', lojaId)
        .order('hora', { ascending: true });

      if (filtros?.data) {
        query = query.eq('data', filtros.data);
      }
      if (filtros?.status) {
        query = query.eq('status', filtros.status);
      }

      const { data, error } = await query;
      if (error) throw error;

      return { data: data as any[], error: null };
    } catch (error) {
      console.error('Erro ao buscar agendamentos:', error);
      toast.error('Erro ao carregar agendamentos');
      return { data: null, error: (error as Error).message };
    }
  },

  async updateAgendamento(id: string, updates: Partial<Agendamento>) {
    try {
      const { data, error } = await supabase
        .from('agendamentos')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      if (updates.status === 'cancelado') {
        toast.success('Agendamento cancelado com sucesso!');
      } else {
        toast.success('Agendamento atualizado com sucesso!');
      }
      
      return { data: data as Agendamento, error: null };
    } catch (error) {
      console.error('Erro ao atualizar agendamento:', error);
      toast.error('Erro ao atualizar agendamento');
      return { data: null, error: (error as Error).message };
    }
  },

  async getHorariosDisponiveis(lojaId: string, data: string, servicoId: string) {
    try {
      // Buscar horários da loja
      const diaSemana = new Date(data + 'T12:00:00').getDay();
      
      const { data: horarioConfig } = await supabase
        .from('horarios_loja')
        .select('abre, fecha, intervalo_minutos')
        .eq('loja_id', lojaId)
        .eq('dia_semana', diaSemana)
        .single();

      if (!horarioConfig) {
        return { data: [], error: null };
      }

      // Buscar agendamentos existentes
      const { data: agendamentos } = await supabase
        .from('agendamentos')
        .select('hora')
        .eq('loja_id', lojaId)
        .eq('data', data)
        .in('status', ['pendente', 'confirmado']);

      const horariosOcupados = new Set(agendamentos?.map(a => a.hora) || []);

      // Gerar horários disponíveis
      const horariosDisponiveis: string[] = [];
      const [horaAbre, minAbre] = horarioConfig.abre.split(':').map(Number);
      const [horaFecha, minFecha] = horarioConfig.fecha.split(':').map(Number);
      const intervalo = horarioConfig.intervalo_minutos || 30;

      let horaAtual = horaAbre;
      let minAtual = minAbre;

      while (horaAtual < horaFecha || (horaAtual === horaFecha && minAtual < minFecha)) {
        const horarioStr = `${horaAtual.toString().padStart(2, '0')}:${minAtual.toString().padStart(2, '0')}`;
        
        if (!horariosOcupados.has(horarioStr)) {
          horariosDisponiveis.push(horarioStr);
        }

        minAtual += intervalo;
        if (minAtual >= 60) {
          horaAtual += Math.floor(minAtual / 60);
          minAtual = minAtual % 60;
        }
      }

      return { data: horariosDisponiveis, error: null };
    } catch (error) {
      console.error('Erro ao buscar horários disponíveis:', error);
      return { data: [], error: (error as Error).message };
    }
  }
};
