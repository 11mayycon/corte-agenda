import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Servico {
  id: string;
  loja_id: string;
  nome: string;
  descricao: string;
  preco: number;
  duracao_minutos: number;
  categoria: string;
  ativo: boolean;
  criado_em: string;
  atualizado_em: string;
}

export interface Agendamento {
  id: string;
  loja_id: string;
  cliente_id: string;
  servico_id: string;
  profissional_id?: string;
  data_hora: string;
  duracao_minutos: number;
  preco_total: number;
  status: 'pendente' | 'confirmado' | 'cancelado' | 'concluido' | 'nao_compareceu';
  observacoes?: string;
  criado_em: string;
  atualizado_em: string;
  clientes?: {
    nome: string;
    telefone: string;
    email: string;
  };
  servicos?: {
    nome: string;
    duracao_minutos: number;
  };
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

const registrarLog = async (acao: string, tabela: string, registro_id: string, detalhes?: any) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from('logs').insert({
      usuario_id: user.id,
      acao,
      tabela,
      registro_id,
      detalhes: detalhes ? JSON.stringify(detalhes) : null,
      criado_em: new Date().toISOString()
    });
  } catch (error) {
    console.error('Erro ao registrar log:', error);
  }
};

export const salaoAPI = {
  // ===== SERVIÇOS =====
  async getServicos(lojaId: string, filtros?: { categoria?: string; ativo?: boolean }) {
    try {
      let query = supabase
        .from('servicos')
        .select('*')
        .eq('loja_id', lojaId)
        .order('nome', { ascending: true });

      if (filtros?.categoria) {
        query = query.eq('categoria', filtros.categoria);
      }
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

  async createServico(servico: Omit<Servico, 'id' | 'criado_em' | 'atualizado_em'>) {
    try {
      const { data, error } = await supabase
        .from('servicos')
        .insert([{
          ...servico,
          criado_em: new Date().toISOString(),
          atualizado_em: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;

      await registrarLog('CRIAR', 'servicos', data.id, servico);
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
      const { data, error } = await supabase
        .from('servicos')
        .update({
          ...servico,
          atualizado_em: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      await registrarLog('ATUALIZAR', 'servicos', id, servico);
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

      await registrarLog('DELETAR', 'servicos', id, { ativo: false });
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
    cliente_id?: string;
    servico_id?: string;
  }) {
    try {
      let query = supabase
        .from('agendamentos')
        .select(`
          *,
          clientes!inner(nome, telefone, email),
          servicos!inner(nome, duracao_minutos)
        `)
        .eq('loja_id', lojaId)
        .order('data_hora', { ascending: true });

      if (filtros?.data) {
        const dataInicio = new Date(filtros.data);
        const dataFim = new Date(dataInicio);
        dataFim.setDate(dataFim.getDate() + 1);
        
        query = query
          .gte('data_hora', dataInicio.toISOString())
          .lt('data_hora', dataFim.toISOString());
      }
      if (filtros?.status) {
        query = query.eq('status', filtros.status);
      }
      if (filtros?.cliente_id) {
        query = query.eq('cliente_id', filtros.cliente_id);
      }
      if (filtros?.servico_id) {
        query = query.eq('servico_id', filtros.servico_id);
      }

      const { data, error } = await query;
      if (error) throw error;

      return { data: data as Agendamento[], error: null };
    } catch (error) {
      console.error('Erro ao buscar agendamentos:', error);
      toast.error('Erro ao carregar agendamentos');
      return { data: null, error: (error as Error).message };
    }
  },

  async createAgendamento(agendamento: Omit<Agendamento, 'id' | 'criado_em' | 'atualizado_em'>) {
    try {
      // Verificar se o horário está disponível
      const { data: conflitos } = await supabase
        .from('agendamentos')
        .select('id')
        .eq('loja_id', agendamento.loja_id)
        .eq('data_hora', agendamento.data_hora)
        .eq('status', 'confirmado')
        .limit(1);

      if (conflitos && conflitos.length > 0) {
        throw new Error('Horário indisponível');
      }

      const { data, error } = await supabase
        .from('agendamentos')
        .insert([{
          ...agendamento,
          criado_em: new Date().toISOString(),
          atualizado_em: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;

      await registrarLog('CRIAR', 'agendamentos', data.id, agendamento);
      toast.success('Agendamento criado com sucesso!');
      return { data: data as Agendamento, error: null };
    } catch (error) {
      console.error('Erro ao criar agendamento:', error);
      toast.error(error instanceof Error ? error.message : 'Erro ao criar agendamento');
      return { data: null, error: (error as Error).message };
    }
  },

  async updateAgendamento(id: string, agendamento: Partial<Agendamento>) {
    try {
      const { data, error } = await supabase
        .from('agendamentos')
        .update({
          ...agendamento,
          atualizado_em: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      await registrarLog('ATUALIZAR', 'agendamentos', id, agendamento);
      
      if (agendamento.status === 'cancelado') {
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
      // Buscar configuração de horário da loja
      const { data: config } = await supabase
        .from('lojas')
        .select('horario_abertura, horario_fechamento, intervalo_minutos')
        .eq('id', lojaId)
        .single();

      if (!config) {
        throw new Error('Configuração da loja não encontrada');
      }

      // Buscar agendamentos do dia
      const { data: agendamentos } = await this.getAgendamentos(lojaId, { data });
      
      // Buscar duração do serviço
      const { data: servico } = await supabase
        .from('servicos')
        .select('duracao_minutos')
        .eq('id', servicoId)
        .single();

      if (!servico) {
        throw new Error('Serviço não encontrado');
      }

      const horariosOcupados = agendamentos?.data?.map(ag => ({
        horario: new Date(ag.data_hora),
        duracao: ag.duracao_minutos
      })) || [];

      const horariosDisponiveis = [];
      const dataSelecionada = new Date(data);
      const [horaAbertura, minutoAbertura] = config.horario_abertura.split(':').map(Number);
      const [horaFechamento, minutoFechamento] = config.horario_fechamento.split(':').map(Number);
      
      const inicio = new Date(dataSelecionada);
      inicio.setHours(horaAbertura, minutoAbertura, 0, 0);
      
      const fim = new Date(dataSelecionada);
      fim.setHours(horaFechamento, minutoFechamento, 0, 0);

      let horarioAtual = new Date(inicio);
      
      while (horarioAtual < fim) {
        const horarioFim = new Date(horarioAtual);
        horarioFim.setMinutes(horarioFim.getMinutes() + servico.duracao_minutos);
        
        // Verificar se há conflito com agendamentos existentes
        const temConflito = horariosOcupados.some(ocupado => {
          const inicioOcupado = new Date(ocupado.horario);
          const fimOcupado = new Date(inicioOcupado);
          fimOcupado.setMinutes(fimOcupado.getMinutes() + ocupado.duracao);
          
          return (horarioAtual >= inicioOcupado && horarioAtual < fimOcupado) ||
                 (horarioFim > inicioOcupado && horarioFim <= fimOcupado) ||
                 (horarioAtual <= inicioOcupado && horarioFim >= fimOcupado);
        });

        if (!temConflito) {
          horariosDisponiveis.push(horarioAtual.toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit'
          }));
        }

        horarioAtual.setMinutes(horarioAtual.getMinutes() + (config.intervalo_minutos || 30));
      }

      return { data: horariosDisponiveis, error: null };
    } catch (error) {
      console.error('Erro ao buscar horários disponíveis:', error);
      toast.error('Erro ao buscar horários disponíveis');
      return { data: null, error: (error as Error).message };
    }
  },

  // ===== CLIENTES DO SALÃO =====
  async getClientes(lojaId: string, filtros?: { status?: string; search?: string }) {
    try {
      let query = supabase
        .from('usuarios')
        .select(`
          *,
          agendamentos_clientes!inner(count)
        `)
        .eq('tipo', 'cliente')
        .eq('agendamentos_clientes.loja_id', lojaId)
        .order('nome', { ascending: true });

      if (filtros?.status) {
        query = query.eq('status', filtros.status);
      }
      if (filtros?.search) {
        query = query.or(`nome.ilike.%${filtros.search}%,email.ilike.%${filtros.search}%,telefone.ilike.%${filtros.search}%`);
      }

      const { data, error } = await query;
      if (error) throw error;

      const clientes = data.map(cliente => ({
        id: cliente.id,
        nome: cliente.nome,
        email: cliente.email,
        telefone: cliente.telefone,
        total_agendamentos: cliente.agendamentos_clientes?.[0]?.count || 0,
        ultimo_agendamento: cliente.ultimo_agendamento,
        status: cliente.status
      }));

      return { data: clientes as ClienteSalao[], error: null };
    } catch (error) {
      console.error('Erro ao buscar clientes:', error);
      toast.error('Erro ao carregar clientes');
      return { data: null, error: (error as Error).message };
    }
  },

  async getClienteDetalhes(clienteId: string, lojaId: string) {
    try {
      const { data, error } = await supabase
        .from('usuarios')
        .select(`
          *,
          agendamentos_clientes!inner(
            *,
            servicos!inner(nome, preco, duracao_minutos)
          )
        `)
        .eq('id', clienteId)
        .eq('tipo', 'cliente')
        .eq('agendamentos_clientes.loja_id', lojaId)
        .order('agendamentos_clientes.data_hora', { ascending: false });

      if (error) throw error;
      if (!data || data.length === 0) {
        throw new Error('Cliente não encontrado');
      }

      const cliente = data[0];
      return { 
        data: {
          ...cliente,
          historico: cliente.agendamentos_clientes
        }, 
        error: null 
      };
    } catch (error) {
      console.error('Erro ao buscar detalhes do cliente:', error);
      toast.error('Erro ao carregar detalhes do cliente');
      return { data: null, error: (error as Error).message };
    }
  }
};