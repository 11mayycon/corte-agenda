-- =============================================
-- SCHEMA COMPLETO PARA SUPABASE
-- Sistema de Agendamento de Salões
-- =============================================

-- Limpar tabelas existentes (cuidado em produção!)
-- DROP TABLE IF EXISTS public.logs CASCADE;
-- DROP TABLE IF EXISTS public.favoritos CASCADE;
-- DROP TABLE IF EXISTS public.avaliacoes CASCADE;
-- DROP TABLE IF EXISTS public.logs_auditoria CASCADE;
-- DROP TABLE IF EXISTS public.usuarios CASCADE;

-- =============================================
-- 1. TABELA DE USUÁRIOS (Complementar ao Auth)
-- =============================================
CREATE TABLE IF NOT EXISTS public.usuarios (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nome VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  telefone VARCHAR(20),
  tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('admin', 'salao', 'cliente')),
  status VARCHAR(20) DEFAULT 'ativo' CHECK (status IN ('ativo', 'inativo', 'pendente')),
  avatar_url TEXT,
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW(),
  ultimo_acesso TIMESTAMPTZ
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_usuarios_tipo ON public.usuarios(tipo);
CREATE INDEX IF NOT EXISTS idx_usuarios_status ON public.usuarios(status);
CREATE INDEX IF NOT EXISTS idx_usuarios_email ON public.usuarios(email);

-- =============================================
-- 2. TABELA DE LOGS (para logging de ações)
-- =============================================
CREATE TABLE IF NOT EXISTS public.logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID REFERENCES public.usuarios(id) ON DELETE SET NULL,
  acao VARCHAR(100) NOT NULL,
  tabela VARCHAR(100) NOT NULL,
  registro_id VARCHAR(255),
  detalhes JSONB,
  criado_em TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_logs_usuario ON public.logs(usuario_id);
CREATE INDEX IF NOT EXISTS idx_logs_tabela ON public.logs(tabela);
CREATE INDEX IF NOT EXISTS idx_logs_criado_em ON public.logs(criado_em);

-- =============================================
-- 3. TABELA DE LOGS DE AUDITORIA (para admin)
-- =============================================
CREATE TABLE IF NOT EXISTS public.logs_auditoria (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_nome VARCHAR(255),
  user_tipo VARCHAR(20),
  acao VARCHAR(100) NOT NULL,
  tabela VARCHAR(100) NOT NULL,
  registro_id VARCHAR(255) NOT NULL,
  alteracoes JSONB,
  ip VARCHAR(50),
  user_agent TEXT,
  criado_em TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_logs_auditoria_user ON public.logs_auditoria(user_id);
CREATE INDEX IF NOT EXISTS idx_logs_auditoria_acao ON public.logs_auditoria(acao);
CREATE INDEX IF NOT EXISTS idx_logs_auditoria_tabela ON public.logs_auditoria(tabela);
CREATE INDEX IF NOT EXISTS idx_logs_auditoria_criado_em ON public.logs_auditoria(criado_em DESC);

-- =============================================
-- 4. TABELA DE AVALIAÇÕES
-- =============================================
CREATE TABLE IF NOT EXISTS public.avaliacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  loja_id UUID REFERENCES public.lojas(id) ON DELETE CASCADE,
  cliente_id UUID REFERENCES public.usuarios(id) ON DELETE CASCADE,
  agendamento_id UUID REFERENCES public.agendamentos(id) ON DELETE SET NULL,
  nota INTEGER NOT NULL CHECK (nota >= 1 AND nota <= 5),
  comentario TEXT,
  resposta TEXT, -- Resposta do salão
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_avaliacoes_loja ON public.avaliacoes(loja_id);
CREATE INDEX IF NOT EXISTS idx_avaliacoes_cliente ON public.avaliacoes(cliente_id);
CREATE INDEX IF NOT EXISTS idx_avaliacoes_nota ON public.avaliacoes(nota);

-- =============================================
-- 5. TABELA DE FAVORITOS
-- =============================================
CREATE TABLE IF NOT EXISTS public.favoritos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  loja_id UUID REFERENCES public.lojas(id) ON DELETE CASCADE,
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, loja_id)
);

CREATE INDEX IF NOT EXISTS idx_favoritos_user ON public.favoritos(user_id);
CREATE INDEX IF NOT EXISTS idx_favoritos_loja ON public.favoritos(loja_id);

-- =============================================
-- 6. ADICIONAR CAMPOS FALTANTES EM LOJAS
-- =============================================
-- Adicionar campos que podem estar faltando
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name='lojas' AND column_name='status') THEN
    ALTER TABLE public.lojas ADD COLUMN status VARCHAR(20) DEFAULT 'ativo'
      CHECK (status IN ('ativo', 'inativo', 'pendente'));
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name='lojas' AND column_name='horario_abertura') THEN
    ALTER TABLE public.lojas ADD COLUMN horario_abertura TIME DEFAULT '08:00';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name='lojas' AND column_name='horario_fechamento') THEN
    ALTER TABLE public.lojas ADD COLUMN horario_fechamento TIME DEFAULT '18:00';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name='lojas' AND column_name='intervalo_minutos') THEN
    ALTER TABLE public.lojas ADD COLUMN intervalo_minutos INTEGER DEFAULT 30;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name='lojas' AND column_name='user_id') THEN
    ALTER TABLE public.lojas ADD COLUMN user_id UUID REFERENCES public.usuarios(id) ON DELETE SET NULL;
  END IF;
END $$;

-- =============================================
-- 7. ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.logs_auditoria ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.avaliacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favoritos ENABLE ROW LEVEL SECURITY;

-- Políticas para USUARIOS
DROP POLICY IF EXISTS "Usuários podem ver próprio perfil" ON public.usuarios;
CREATE POLICY "Usuários podem ver próprio perfil"
  ON public.usuarios FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Usuários podem atualizar próprio perfil" ON public.usuarios;
CREATE POLICY "Usuários podem atualizar próprio perfil"
  ON public.usuarios FOR UPDATE
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admin pode ver todos usuários" ON public.usuarios;
CREATE POLICY "Admin pode ver todos usuários"
  ON public.usuarios FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.usuarios
      WHERE id = auth.uid() AND tipo = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admin pode criar usuários" ON public.usuarios;
CREATE POLICY "Admin pode criar usuários"
  ON public.usuarios FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.usuarios
      WHERE id = auth.uid() AND tipo = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admin pode atualizar usuários" ON public.usuarios;
CREATE POLICY "Admin pode atualizar usuários"
  ON public.usuarios FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.usuarios
      WHERE id = auth.uid() AND tipo = 'admin'
    )
  );

-- Políticas para LOGS_AUDITORIA
DROP POLICY IF EXISTS "Admin pode ver todos logs" ON public.logs_auditoria;
CREATE POLICY "Admin pode ver todos logs"
  ON public.logs_auditoria FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.usuarios
      WHERE id = auth.uid() AND tipo = 'admin'
    )
  );

DROP POLICY IF EXISTS "Sistema pode inserir logs" ON public.logs_auditoria;
CREATE POLICY "Sistema pode inserir logs"
  ON public.logs_auditoria FOR INSERT
  WITH CHECK (true);

-- Políticas para AVALIACOES
DROP POLICY IF EXISTS "Todos podem ver avaliações" ON public.avaliacoes;
CREATE POLICY "Todos podem ver avaliações"
  ON public.avaliacoes FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Clientes podem criar avaliações" ON public.avaliacoes;
CREATE POLICY "Clientes podem criar avaliações"
  ON public.avaliacoes FOR INSERT
  WITH CHECK (auth.uid() = cliente_id);

DROP POLICY IF EXISTS "Salão pode responder avaliações" ON public.avaliacoes;
CREATE POLICY "Salão pode responder avaliações"
  ON public.avaliacoes FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.lojas
      WHERE id = loja_id AND user_id = auth.uid()
    )
  );

-- Políticas para FAVORITOS
DROP POLICY IF EXISTS "Usuário pode ver próprios favoritos" ON public.favoritos;
CREATE POLICY "Usuário pode ver próprios favoritos"
  ON public.favoritos FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuário pode adicionar favoritos" ON public.favoritos;
CREATE POLICY "Usuário pode adicionar favoritos"
  ON public.favoritos FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuário pode remover favoritos" ON public.favoritos;
CREATE POLICY "Usuário pode remover favoritos"
  ON public.favoritos FOR DELETE
  USING (auth.uid() = user_id);

-- Políticas para LOJAS
ALTER TABLE public.lojas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Todos podem ver lojas ativas" ON public.lojas;
CREATE POLICY "Todos podem ver lojas ativas"
  ON public.lojas FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Salão pode atualizar própria loja" ON public.lojas;
CREATE POLICY "Salão pode atualizar própria loja"
  ON public.lojas FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admin pode gerenciar todas lojas" ON public.lojas;
CREATE POLICY "Admin pode gerenciar todas lojas"
  ON public.lojas FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.usuarios
      WHERE id = auth.uid() AND tipo = 'admin'
    )
  );

-- Políticas para AGENDAMENTOS
ALTER TABLE public.agendamentos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Cliente pode ver próprios agendamentos" ON public.agendamentos;
CREATE POLICY "Cliente pode ver próprios agendamentos"
  ON public.agendamentos FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Salão pode ver agendamentos da loja" ON public.agendamentos;
CREATE POLICY "Salão pode ver agendamentos da loja"
  ON public.agendamentos FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.lojas
      WHERE id = loja_id AND user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Cliente pode criar agendamentos" ON public.agendamentos;
CREATE POLICY "Cliente pode criar agendamentos"
  ON public.agendamentos FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Cliente pode atualizar próprios agendamentos" ON public.agendamentos;
CREATE POLICY "Cliente pode atualizar próprios agendamentos"
  ON public.agendamentos FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Salão pode atualizar agendamentos da loja" ON public.agendamentos;
CREATE POLICY "Salão pode atualizar agendamentos da loja"
  ON public.agendamentos FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.lojas
      WHERE id = loja_id AND user_id = auth.uid()
    )
  );

-- Políticas para SERVICOS
ALTER TABLE public.servicos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Todos podem ver serviços ativos" ON public.servicos;
CREATE POLICY "Todos podem ver serviços ativos"
  ON public.servicos FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Salão pode gerenciar próprios serviços" ON public.servicos;
CREATE POLICY "Salão pode gerenciar próprios serviços"
  ON public.servicos FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.lojas
      WHERE id = loja_id AND user_id = auth.uid()
    )
  );

-- =============================================
-- 8. FUNCTIONS E TRIGGERS
-- =============================================

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger em tabelas relevantes
DROP TRIGGER IF EXISTS update_usuarios_updated_at ON public.usuarios;
CREATE TRIGGER update_usuarios_updated_at
  BEFORE UPDATE ON public.usuarios
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_avaliacoes_updated_at ON public.avaliacoes;
CREATE TRIGGER update_avaliacoes_updated_at
  BEFORE UPDATE ON public.avaliacoes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function para criar usuário automaticamente após signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.usuarios (id, nome, email, tipo, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nome', 'Usuário'),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'tipo', 'cliente'),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para criar usuário após signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Function para calcular média de avaliações
CREATE OR REPLACE FUNCTION public.calcular_media_avaliacoes(loja_uuid UUID)
RETURNS NUMERIC AS $$
  SELECT COALESCE(AVG(nota), 0)::NUMERIC(3,2)
  FROM public.avaliacoes
  WHERE loja_id = loja_uuid;
$$ LANGUAGE sql STABLE;

-- =============================================
-- 9. HABILITAR REALTIME
-- =============================================
-- Habilitar realtime para tabelas importantes
ALTER PUBLICATION supabase_realtime ADD TABLE public.agendamentos;
ALTER PUBLICATION supabase_realtime ADD TABLE public.avaliacoes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.mensagens_whatsapp;
ALTER PUBLICATION supabase_realtime ADD TABLE public.servicos;

-- =============================================
-- 10. GRANTS (Permissões)
-- =============================================
-- Garantir que o usuário authenticated tenha acesso
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- =============================================
-- FIM DO SCHEMA
-- =============================================
