import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Loja {
  id: string;
  nome: string;
  endereco: string | null;
  cidade: string | null;
  bairro: string | null;
  uf: string | null;
  logo_url: string | null;
  whatsapp: string | null;
  politica_cancelamento_horas: number;
  rating?: number;
  total_avaliacoes?: number;
  servicos?: Servico[];
}

export interface Servico {
  id: string;
  loja_id: string;
  nome: string;
  preco_centavos: number | null;
  duracao_minutos: number;
  ativo: boolean;
}

export interface Agendamento {
  id: string;
  loja_id: string;
  servico_id: string;
  data: string;
  hora: string;
  status: 'pendente' | 'confirmado' | 'cancelado' | 'concluido' | 'nao_compareceu';
  observacoes?: string | null;
  origem: string;
  created_at: string;
  updated_at: string;
  loja?: {
    nome: string;
    endereco: string | null;
    whatsapp: string | null;
    logo_url: string | null;
  };
  servico?: {
    nome: string;
    preco_centavos: number | null;
    duracao_minutos: number;
  };
}

export interface HorarioDisponivel {
  horario: string;
  disponivel: boolean;
}

export const clienteAPI = {
  // Buscar lojas
  async getLojas(filtros?: { cidade?: string; bairro?: string; search?: string }) {
    try {
      let query = supabase
        .from('lojas')
        .select(`
          *,
          servicos(id, nome, preco_centavos, duracao_minutos, ativo)
        `)
        .order('nome');

      if (filtros?.cidade) {
        query = query.eq('cidade', filtros.cidade);
      }
      if (filtros?.bairro) {
        query = query.eq('bairro', filtros.bairro);
      }
      if (filtros?.search) {
        query = query.ilike('nome', `%${filtros.search}%`);
      }

      const { data, error } = await query;
      if (error) throw error;

      return { data: data as unknown as Loja[], error: null };
    } catch (error) {
      console.error('Erro ao buscar lojas:', error);
      return { data: null, error: (error as Error).message };
    }
  },

  // Buscar loja por ID
  async getLoja(id: string) {
    try {
      const { data, error } = await supabase
        .from('lojas')
        .select(`
          *,
          servicos(id, nome, preco_centavos, duracao_minutos, ativo),
          horarios_loja(dia_semana, abre, fecha, intervalo_minutos)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;

      return { data: data as unknown as Loja, error: null };
    } catch (error) {
      console.error('Erro ao buscar loja:', error);
      return { data: null, error: (error as Error).message };
    }
  },

  // Buscar agendamentos do cliente
  async getMeusAgendamentos(userId: string, status?: string) {
    try {
      let query = supabase
        .from('agendamentos')
        .select(`
          *,
          loja:lojas(nome, endereco, whatsapp, logo_url),
          servico:servicos(nome, preco_centavos, duracao_minutos)
        `)
        .eq('user_id', userId)
        .order('data', { ascending: false });

      if (status && status !== 'todos') {
        query = query.eq('status', status);
      }

      const { data, error } = await query;
      if (error) throw error;

      return { data: data as Agendamento[], error: null };
    } catch (error) {
      console.error('Erro ao buscar agendamentos:', error);
      return { data: null, error: (error as Error).message };
    }
  },

  // Criar agendamento
  async criarAgendamento(agendamento: {
    loja_id: string;
    servico_id: string;
    data: string;
    hora: string;
    observacoes?: string;
    user_id: string;
  }) {
    try {
      const { data, error } = await supabase
        .from('agendamentos')
        .insert({
          ...agendamento,
          status: 'pendente',
          origem: 'app'
        })
        .select()
        .single();

      if (error) throw error;

      toast.success('Agendamento criado com sucesso!');
      return { data: data as Agendamento, error: null };
    } catch (error) {
      console.error('Erro ao criar agendamento:', error);
      toast.error('Erro ao criar agendamento');
      return { data: null, error: (error as Error).message };
    }
  },

  // Cancelar agendamento
  async cancelarAgendamento(id: string) {
    try {
      const { data, error } = await supabase
        .from('agendamentos')
        .update({ status: 'cancelado' })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      toast.success('Agendamento cancelado!');
      return { data: data as Agendamento, error: null };
    } catch (error) {
      console.error('Erro ao cancelar agendamento:', error);
      toast.error('Erro ao cancelar agendamento');
      return { data: null, error: (error as Error).message };
    }
  },

  // Buscar horários disponíveis
  async getHorariosDisponiveis(lojaId: string, data: string, servicoId: string) {
    try {
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

      const { data: agendamentos } = await supabase
        .from('agendamentos')
        .select('hora')
        .eq('loja_id', lojaId)
        .eq('data', data)
        .in('status', ['pendente', 'confirmado']);

      const horariosOcupados = new Set(agendamentos?.map(a => a.hora) || []);

      const horariosDisponiveis: HorarioDisponivel[] = [];
      const [horaAbre, minAbre] = horarioConfig.abre.split(':').map(Number);
      const [horaFecha, minFecha] = horarioConfig.fecha.split(':').map(Number);
      const intervalo = horarioConfig.intervalo_minutos || 30;

      let horaAtual = horaAbre;
      let minAtual = minAbre;

      while (horaAtual < horaFecha || (horaAtual === horaFecha && minAtual < minFecha)) {
        const horarioStr = `${horaAtual.toString().padStart(2, '0')}:${minAtual.toString().padStart(2, '0')}`;
        
        horariosDisponiveis.push({
          horario: horarioStr,
          disponivel: !horariosOcupados.has(horarioStr)
        });

        minAtual += intervalo;
        if (minAtual >= 60) {
          horaAtual += Math.floor(minAtual / 60);
          minAtual = minAtual % 60;
        }
      }

      return { data: horariosDisponiveis, error: null };
    } catch (error) {
      console.error('Erro ao buscar horários:', error);
      return { data: [], error: (error as Error).message };
    }
  }
};
