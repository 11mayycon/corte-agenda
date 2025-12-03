# 🚀 Instruções de Configuração - Sistema de Agendamento

## 📋 **Pré-requisitos**

- Node.js 18+ instalado
- Conta no Supabase (gratuita)
- Editor de código (VS Code recomendado)

## 🗄️ **Passo 1: Configurar o Banco de Dados Supabase**

### 1.1 Acessar o Painel do Supabase

1. Acesse [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Faça login ou crie uma conta
3. Selecione seu projeto: `plquxyhvuumswgiufdah`

### 1.2 Executar o Schema SQL

1. No painel do Supabase, clique em **SQL Editor** (ícone de código no menu lateral)
2. Clique em **+ New Query**
3. Abra o arquivo `supabase-schema.sql` na raiz do projeto
4. **Copie TODO o conteúdo** do arquivo
5. **Cole** no SQL Editor do Supabase
6. Clique em **Run** (ou pressione `Ctrl+Enter`)

✅ **Aguarde a execução completar**. Você verá uma mensagem de sucesso.

### 1.3 Verificar as Tabelas Criadas

No painel do Supabase, vá em **Table Editor** e confirme que existem as seguintes tabelas:

- ✅ `usuarios`
- ✅ `lojas`
- ✅ `servicos`
- ✅ `profissionais`
- ✅ `agendamentos`
- ✅ `horarios_loja`
- ✅ `avaliacoes`
- ✅ `favoritos`
- ✅ `logs`
- ✅ `logs_auditoria`
- ✅ `whatsapp_sessoes`
- ✅ `mensagens_whatsapp`

## 🔧 **Passo 2: Configurar o Projeto Localmente**

### 2.1 Instalar Dependências

```bash
npm install
```

### 2.2 Verificar Variáveis de Ambiente

O arquivo `src/integrations/supabase/client.ts` já está configurado com suas credenciais:

```typescript
const SUPABASE_URL = "https://plquxyhvuumswgiufdah.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGc...";
```

✅ **Nada precisa ser alterado aqui!**

### 2.3 Iniciar o Servidor de Desenvolvimento

```bash
npm run dev
```

O projeto estará rodando em: **http://localhost:5173**

## 👤 **Passo 3: Criar Usuários de Teste**

### 3.1 Criar Usuário Administrador

1. No Supabase, vá em **Authentication** → **Users**
2. Clique em **Add user** → **Create new user**
3. Preencha:
   - **Email**: `admin@agendecorte.com`
   - **Password**: `Admin@123456`
   - **Auto Confirm User**: ✅ **SIM**
4. Clique em **Create user**

5. Após criar, clique no usuário criado
6. Vá na aba **User Metadata** (ou **Raw user meta data**)
7. Cole o seguinte JSON:

```json
{
  "nome": "Super Admin",
  "tipo": "admin"
}
```

8. Clique em **Save**

### 3.2 Criar Usuário Salão

Repita o processo acima com:

- **Email**: `salao@teste.com`
- **Password**: `Salao@123456`
- **User Metadata**:

```json
{
  "nome": "Barbearia Premium",
  "tipo": "salao"
}
```

### 3.3 Criar Usuário Cliente

Repita o processo com:

- **Email**: `cliente@teste.com`
- **Password**: `Cliente@123456`
- **User Metadata**:

```json
{
  "nome": "João Silva",
  "tipo": "cliente"
}
```

## 🎯 **Passo 4: Acessar o Sistema**

### Rotas de Login

1. **Admin**: [http://localhost:5173/login/administrador](http://localhost:5173/login/administrador)
   - Email: `admin@agendecorte.com`
   - Senha: `Admin@123456`

2. **Salão**: [http://localhost:5173/login/cabeleireiro](http://localhost:5173/login/cabeleireiro)
   - Email: `salao@teste.com`
   - Senha: `Salao@123456`

3. **Cliente**: [http://localhost:5173/login/usuario](http://localhost:5173/login/usuario)
   - Email: `cliente@teste.com`
   - Senha: `Cliente@123456`

## 📊 **Status da Implementação**

### ✅ Implementado

- [x] API completa para Cliente (`clienteAPI.ts`)
- [x] API completa para Admin (`adminAPI.ts`)
- [x] API completa para Salão (`salaoAPI.ts`)
- [x] Schema SQL completo com RLS e triggers
- [x] Tipos TypeScript compartilhados
- [x] Sistema de autenticação completo
- [x] Proteção de rotas por tipo de usuário
- [x] Painel Admin - Visão Geral (com dados reais)

### 🚧 Em Desenvolvimento

- [ ] Painel Admin - Gestão de Lojas
- [ ] Painel Admin - Gestão de Usuários
- [ ] Painel Admin - Auditoria
- [ ] Painel Salão - Agenda
- [ ] Painel Salão - Serviços
- [ ] Painel Salão - Clientes
- [ ] Painel Cliente - Agendar
- [ ] Painel Cliente - Minhas Reservas
- [ ] Painel Cliente - Perfil
- [ ] Sistema de Realtime (Supabase Realtime)
- [ ] Integração com WhatsApp (Evolution API)

## 🔍 **Testando Funcionalidades**

### Admin - Visão Geral

1. Faça login como admin
2. Você verá:
   - **KPIs** com estatísticas reais do banco
   - **Lojas Recentes** cadastradas
   - **Atividade Recente** do log de auditoria

### Criar Dados de Teste

Para testar melhor, você pode criar dados manualmente no Supabase:

#### Criar uma Loja

No **SQL Editor**:

```sql
INSERT INTO public.lojas (nome, cidade, bairro, uf, endereco)
VALUES
  ('Barbearia Premium', 'São Paulo', 'Centro', 'SP', 'Rua das Flores, 123'),
  ('Studio Hair', 'Rio de Janeiro', 'Copacabana', 'RJ', 'Av. Atlântica, 456');
```

#### Criar Serviços

```sql
INSERT INTO public.servicos (loja_id, nome, preco_centavos, duracao_minutos, ativo)
SELECT
  l.id,
  'Corte Masculino',
  5000, -- R$ 50,00
  30,
  true
FROM public.lojas l
LIMIT 1;
```

#### Criar Agendamentos

```sql
INSERT INTO public.agendamentos (loja_id, user_id, servico_id, data, hora, status, origem)
SELECT
  l.id,
  u.id,
  s.id,
  CURRENT_DATE,
  '14:00',
  'confirmado',
  'web'
FROM public.lojas l, public.usuarios u, public.servicos s
WHERE u.tipo = 'cliente'
LIMIT 1;
```

## 🐛 **Solução de Problemas**

### Erro: "relation does not exist"

**Causa**: As tabelas não foram criadas.
**Solução**: Execute o arquivo `supabase-schema.sql` novamente no SQL Editor.

### Erro: "new row violates row-level security policy"

**Causa**: As políticas RLS estão bloqueando a operação.
**Solução**: Verifique se o usuário está autenticado e tem o tipo correto (`admin`, `salao`, `cliente`).

### Login não funciona

**Causa**: User metadata não configurado.
**Solução**: Vá em **Authentication** → **Users** → Clique no usuário → **User Metadata** → Adicione o JSON com `nome` e `tipo`.

### Dados não aparecem

**Causa 1**: Banco vazio.
**Solução**: Crie dados de teste usando os comandos SQL acima.

**Causa 2**: Erro de permissão RLS.
**Solução**: Verifique se o schema SQL foi executado completamente.

## 📚 **Próximos Passos**

1. ✅ Executar o schema SQL no Supabase
2. ✅ Criar usuários de teste
3. ✅ Fazer login e testar o painel Admin
4. 🔄 Aguardar implementação dos demais painéis

## 🆘 **Suporte**

Se encontrar problemas:

1. Verifique o console do navegador (F12) para erros
2. Verifique os logs do Supabase em **Logs** → **Postgres Logs**
3. Confirme que todas as tabelas foram criadas corretamente

---

**Desenvolvido com Supabase + React + TypeScript + shadcn/ui**
