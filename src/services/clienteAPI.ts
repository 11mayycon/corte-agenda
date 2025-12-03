import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Loja {
  id: string;
  nome: string;
  endereco: string;
  cidade: string;
  bairro: string;
  uf: string;
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
  preco_centavos: number;
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
  observacoes?: string;
  created_at: string;
  loja?: {
    nome: string;
    endereco: string;
    whatsapp: string;
  };
  servico?: {
    nome: string;
    preco_centavos: number;
    duracao_minutos: number;
  };
}

export interface Avaliacao {
  id: string;
  loja_id: string;
  nota: number;
  comentario: string;
  created_at: string;
}

export interface Perfil {
  id: string;
  nome: string;
  sobrenome: string;
  telefone: string;
  data_nascimento: string;
  regiao: string;
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

export const clienteAPI = {
  // ===== EXPLORAR SALÕES =====
  async getLojas(filtros?: {
    cidade?: string;
    bairro?: string;
    servico?: string;
    search?: string;
  }) {
    try {
      let query = supabase
        .from('lojas')
        .select(`
          *,
          servicos!inner(id, nome, preco_centavos, duracao_minutos, ativo)
        `)
        .eq('servicos.ativo', true)
        .order('nome', { ascending: true });

      if (filtros?.cidade) {
        query = query.ilike('cidade', `%${filtros.cidade}%`);
      }
      if (filtros?.bairro) {
        query = query.ilike('bairro', `%${filtros.bairro}%`);
      }
      if (filtros?.search) {
        query = query.or(`nome.ilike.%${filtros.search}%,endereco.ilike.%${filtros.search}%`);
      }

      const { data, error } = await query;
      if (error) throw error;

      return { data: data as Loja[], error: null };
    } catch (error) {
      console.error('Erro ao buscar lojas:', error);
      toast.error('Erro ao carregar salões');
      return { data: null, error: (error as Error).message };
    }
  },

  async getLojaById(lojaId: string) {
    try {
      const { data, error } = await supabase
        .from('lojas')
        .select(`
          *,
          servicos!inner(id, nome, preco_centavos, duracao_minutos, ativo),
          horarios_loja(dia_semana, abre, fecha, intervalo_minutos)
        `)
        .eq('id', lojaId)
        .single();

      if (error) throw error;

      return { data: data as Loja, error: null };
    } catch (error) {
      console.error('Erro ao buscar loja:', error);
      toast.error('Erro ao carregar detalhes do salão');
      return { data: null, error: (error as Error).message };
    }
  },

  async getServicosLoja(lojaId: string) {
    try {
      const { data, error } = await supabase
        .from('servicos')
        .select('*')
        .eq('loja_id', lojaId)
        .eq('ativo', true)
        .order('nome', { ascending: true });

      if (error) throw error;

      return { data: data as Servico[], error: null };
    } catch (error) {
      console.error('Erro ao buscar serviços:', error);
      toast.error('Erro ao carregar serviços');
      return { data: null, error: (error as Error).message };
    }
  },

  // ===== AGENDAMENTOS =====
  async getAgendamentos(filtros?: {
    status?: string;
    data_inicio?: string;
    data_fim?: string;
  }) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      let query = supabase
        .from('agendamentos')
        .select(`
          *,
          loja:lojas!inner(nome, endereco, whatsapp),
          servico:servicos!inner(nome, preco_centavos, duracao_minutos)
        `)
        .eq('user_id', user.id)
        .order('data', { ascending: false })
        .order('hora', { ascending: false });

      if (filtros?.status) {
        query = query.eq('status', filtros.status);
      }
      if (filtros?.data_inicio) {
        query = query.gte('data', filtros.data_inicio);
      }
      if (filtros?.data_fim) {
        query = query.lte('data', filtros.data_fim);
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

  async createAgendamento(agendamento: {
    loja_id: string;
    servico_id: string;
    data: string;
    hora: string;
    observacoes?: string;
  }) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      // Verificar se o horário está disponível
      const { data: conflitos } = await supabase
        .from('agendamentos')
        .select('id')
        .eq('loja_id', agendamento.loja_id)
        .eq('data', agendamento.data)
        .eq('hora', agendamento.hora)
        .in('status', ['pendente', 'confirmado'])
        .limit(1);

      if (conflitos && conflitos.length > 0) {
        toast.error('Horário indisponível. Por favor, escolha outro horário.');
        throw new Error('Horário indisponível');
      }

      const { data, error } = await supabase
        .from('agendamentos')
        .insert([{
          ...agendamento,
          user_id: user.id,
          status: 'pendente',
          origem: 'web',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select(`
          *,
          loja:lojas!inner(nome, endereco, whatsapp),
          servico:servicos!inner(nome, preco_centavos, duracao_minutos)
        `)
        .single();

      if (error) throw error;

      await registrarLog('CRIAR', 'agendamentos', data.id, agendamento);
      toast.success('Agendamento criado com sucesso!');
      return { data: data as Agendamento, error: null };
    } catch (error) {
      console.error('Erro ao criar agendamento:', error);
      const message = error instanceof Error ? error.message : 'Erro ao criar agendamento';
      if (!message.includes('Horário indisponível')) {
        toast.error(message);
      }
      return { data: null, error: message };
    }
  },

  async cancelarAgendamento(agendamentoId: string) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      // Buscar agendamento para verificar política de cancelamento
      const { data: agendamento } = await supabase
        .from('agendamentos')
        .select(`
          *,
          loja:lojas!inner(politica_cancelamento_horas)
        `)
        .eq('id', agendamentoId)
        .eq('user_id', user.id)
        .single();

      if (!agendamento) {
        throw new Error('Agendamento não encontrado');
      }

      // Verificar se pode cancelar baseado na política
      const dataHoraAgendamento = new Date(`${agendamento.data}T${agendamento.hora}`);
      const agora = new Date();
      const horasAntecedencia = (dataHoraAgendamento.getTime() - agora.getTime()) / (1000 * 60 * 60);

      const politicaHoras = agendamento.loja?.politica_cancelamento_horas || 24;

      if (horasAntecedencia < politicaHoras) {
        throw new Error(`Não é possível cancelar com menos de ${politicaHoras} horas de antecedência`);
      }

      const { data, error } = await supabase
        .from('agendamentos')
        .update({
          status: 'cancelado',
          updated_at: new Date().toISOString()
        })
        .eq('id', agendamentoId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      await registrarLog('CANCELAR', 'agendamentos', agendamentoId, { status: 'cancelado' });
      toast.success('Agendamento cancelado com sucesso!');
      return { data: data as Agendamento, error: null };
    } catch (error) {
      console.error('Erro ao cancelar agendamento:', error);
      const message = error instanceof Error ? error.message : 'Erro ao cancelar agendamento';
      toast.error(message);
      return { data: null, error: message };
    }
  },

  async remarcarAgendamento(agendamentoId: string, novaData: string, novaHora: string) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      // Buscar agendamento original
      const { data: agendamento } = await supabase
        .from('agendamentos')
        .select('*')
        .eq('id', agendamentoId)
        .eq('user_id', user.id)
        .single();

      if (!agendamento) {
        throw new Error('Agendamento não encontrado');
      }

      // Verificar se o novo horário está disponível
      const { data: conflitos } = await supabase
        .from('agendamentos')
        .select('id')
        .eq('loja_id', agendamento.loja_id)
        .eq('data', novaData)
        .eq('hora', novaHora)
        .in('status', ['pendente', 'confirmado'])
        .neq('id', agendamentoId)
        .limit(1);

      if (conflitos && conflitos.length > 0) {
        toast.error('Horário indisponível. Por favor, escolha outro horário.');
        throw new Error('Horário indisponível');
      }

      const { data, error } = await supabase
        .from('agendamentos')
        .update({
          data: novaData,
          hora: novaHora,
          updated_at: new Date().toISOString()
        })
        .eq('id', agendamentoId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      await registrarLog('REMARCAR', 'agendamentos', agendamentoId, { novaData, novaHora });
      toast.success('Agendamento remarcado com sucesso!');
      return { data: data as Agendamento, error: null };
    } catch (error) {
      console.error('Erro ao remarcar agendamento:', error);
      const message = error instanceof Error ? error.message : 'Erro ao remarcar agendamento';
      if (!message.includes('Horário indisponível')) {
        toast.error(message);
      }
      return { data: null, error: message };
    }
  },

  async getHorariosDisponiveis(lojaId: string, servicoId: string, data: string) {
    try {
      // Buscar configuração de horário da loja para o dia da semana
      const dataSelecionada = new Date(data);
      const diaSemana = dataSelecionada.getDay();

      const { data: horarioConfig } = await supabase
        .from('horarios_loja')
        .select('abre, fecha, intervalo_minutos')
        .eq('loja_id', lojaId)
        .eq('dia_semana', diaSemana)
        .single();

      if (!horarioConfig) {
        toast.error('Loja fechada neste dia');
        return { data: [], error: 'Loja fechada neste dia' };
      }

      // Buscar duração do serviço
      const { data: servico } = await supabase
        .from('servicos')
        .select('duracao_minutos')
        .eq('id', servicoId)
        .single();

      if (!servico) {
        throw new Error('Serviço não encontrado');
      }

      // Buscar agendamentos do dia
      const { data: agendamentos } = await supabase
        .from('agendamentos')
        .select('hora, servicos!inner(duracao_minutos)')
        .eq('loja_id', lojaId)
        .eq('data', data)
        .in('status', ['pendente', 'confirmado']);

      const horariosOcupados = agendamentos?.map(ag => ({
        horario: ag.hora,
        duracao: ag.servicos.duracao_minutos
      })) || [];

      // Gerar horários disponíveis
      const horariosDisponiveis: string[] = [];
      const [horaAbre, minutoAbre] = horarioConfig.abre.split(':').map(Number);
      const [horaFecha, minutoFecha] = horarioConfig.fecha.split(':').map(Number);

      let horaAtual = horaAbre;
      let minutoAtual = minutoAbre;

      while (horaAtual < horaFecha || (horaAtual === horaFecha && minutoAtual < minutoFecha)) {
        const horarioFormatado = `${String(horaAtual).padStart(2, '0')}:${String(minutoAtual).padStart(2, '0')}`;

        // Verificar se há conflito
        const temConflito = horariosOcupados.some(ocupado => {
          const [horaOcupado, minutoOcupado] = ocupado.horario.split(':').map(Number);
          const minutosOcupado = horaOcupado * 60 + minutoOcupado;
          const minutosAtual = horaAtual * 60 + minutoAtual;
          const fimOcupado = minutosOcupado + ocupado.duracao;
          const fimAtual = minutosAtual + servico.duracao_minutos;

          return (minutosAtual >= minutosOcupado && minutosAtual < fimOcupado) ||
                 (fimAtual > minutosOcupado && fimAtual <= fimOcupado) ||
                 (minutosAtual <= minutosOcupado && fimAtual >= fimOcupado);
        });

        if (!temConflito) {
          horariosDisponiveis.push(horarioFormatado);
        }

        // Avançar para o próximo horário
        minutoAtual += horarioConfig.intervalo_minutos || 30;
        if (minutoAtual >= 60) {
          horaAtual += Math.floor(minutoAtual / 60);
          minutoAtual = minutoAtual % 60;
        }
      }

      return { data: horariosDisponiveis, error: null };
    } catch (error) {
      console.error('Erro ao buscar horários disponíveis:', error);
      toast.error('Erro ao buscar horários disponíveis');
      return { data: null, error: (error as Error).message };
    }
  },

  // ===== PERFIL =====
  async getPerfil() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('perfis')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error; // PGRST116 = não encontrado

      return { data: data as Perfil | null, error: null };
    } catch (error) {
      console.error('Erro ao buscar perfil:', error);
      toast.error('Erro ao carregar perfil');
      return { data: null, error: (error as Error).message };
    }
  },

  async updatePerfil(perfil: Partial<Perfil>) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('perfis')
        .upsert({
          id: user.id,
          ...perfil,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      await registrarLog('ATUALIZAR', 'perfis', user.id, perfil);
      toast.success('Perfil atualizado com sucesso!');
      return { data: data as Perfil, error: null };
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      toast.error('Erro ao atualizar perfil');
      return { data: null, error: (error as Error).message };
    }
  },

  // ===== FAVORITOS =====
  async getFavoritos() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('favoritos')
        .select(`
          loja:lojas!inner(*)
        `)
        .eq('user_id', user.id);

      if (error) throw error;

      return { data: data?.map(f => f.loja) as Loja[] || [], error: null };
    } catch (error) {
      console.error('Erro ao buscar favoritos:', error);
      return { data: null, error: (error as Error).message };
    }
  },

  async toggleFavorito(lojaId: string) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      // Verificar se já é favorito
      const { data: favorito } = await supabase
        .from('favoritos')
        .select('id')
        .eq('user_id', user.id)
        .eq('loja_id', lojaId)
        .single();

      if (favorito) {
        // Remover favorito
        const { error } = await supabase
          .from('favoritos')
          .delete()
          .eq('user_id', user.id)
          .eq('loja_id', lojaId);

        if (error) throw error;
        toast.success('Removido dos favoritos');
        return { isFavorito: false, error: null };
      } else {
        // Adicionar favorito
        const { error } = await supabase
          .from('favoritos')
          .insert({
            user_id: user.id,
            loja_id: lojaId
          });

        if (error) throw error;
        toast.success('Adicionado aos favoritos');
        return { isFavorito: true, error: null };
      }
    } catch (error) {
      console.error('Erro ao alterar favorito:', error);
      toast.error('Erro ao alterar favorito');
      return { isFavorito: false, error: (error as Error).message };
    }
  }
};
