# 🏪 Corte Agenda - Sistema de Agendamento para Salões

Sistema completo de agendamento para salões de beleza, barbearias e estabelecimentos de cortes, desenvolvido com React, TypeScript e tecnologias modernas.

## 📋 Funcionalidades

### 🎨 Temas
- **Modo Claro/Escuro**: Interface com suporte completo a temas
- **Alternância rápida**: Botão de tema na barra de navegação
- **Persistência**: Tema salvo no localStorage
- **Sistema de cores**: Paleta de cores profissional com gradientes

### 🔐 Sistema de Login
- **Login de Usuário**: `/login/usuario` - Rota principal (página inicial)
- **Login de Cabeleireiro**: `/login/cabeleireiro`
- **Login de Administrador**: `/login/administrador`
- **Logout funcional**: Com notificação e limpeza de sessão

### 👤 Área do Cliente
- **Agendar Serviço**: `/cliente/agendar`
  - Visualização de serviços disponíveis
  - Seleção de profissional
  - Escolha de data e horário
  - Confirmação de agendamento

- **Minhas Reservas**: `/cliente/minhas-reservas`
  - Lista de agendamentos ativos
  - Histórico de serviços
  - Cancelamento de agendamentos

- **Meu Perfil**: `/cliente/perfil`
  - Edição de dados pessoais
  - Preferências de notificação
  - **Modo Escuro**: Ativar/desativar tema escuro
  - **Lembretes**: Notificações 24h antes
  - **Promoções**: Receber ofertas especiais
  - **Acessibilidade**: Alto contraste, fonte maior

### 🏪 Área da Loja
- **Agenda**: `/loja/agenda`
  - Visualização diária/semanal dos agendamentos
  - Status dos agendamentos (confirmado/pendente)
  - Gerenciamento de horários disponíveis

- **Serviços**: `/loja/servicos`
  - Cadastro de serviços oferecidos
  - Definição de preços e duração
  - Categorias de serviços

- **Profissionais**: `/loja/profissionais`
  - Gerenciamento de funcionários
  - Horários de trabalho por profissional
  - Ativar/desativar profissionais

- **Horários**: `/loja/horarios`
  - Configuração de horário de funcionamento
  - Duração padrão dos serviços
  - Horários por dia da semana

- **Clientes**: `/loja/clientes`
  - Cadastro e gerenciamento de clientes
  - Histórico de atendimentos
  - Informações de contato

- **WhatsApp**: `/loja/whatsapp`
  - Integração com WhatsApp Business
  - Envio de lembretes automáticos
  - Confirmações de agendamento

### 👨‍💼 Área Administrativa
- **Visão Geral**: `/admin/visao-geral`
  - Dashboard com métricas gerais
  - Gráficos de desempenho
  - Estatísticas de uso

- **Lojas**: `/admin/lojas`
  - Gerenciamento de múltiplas unidades
  - Planos e assinaturas
  - Status das lojas (ativa/pendente)

- **Usuários**: `/admin/usuarios`
  - Controle de acessos e permissões
  - Gerenciamento de administradores
  - Auditoria de usuários

- **Auditoria**: `/admin/auditoria`
  - Logs de atividades do sistema
  - Histórico de ações por usuário
  - Filtros por tipo de ação

- **Configurações**: `/admin/configuracoes`
  - **Segurança**: 2FA, timeout de sessão, whitelist de IPs
  - **Sistema**: Modo de manutenção, debug mode, backup automático
  - **Email**: Configurações de SMTP e notificações

### 🎯 Botões e Funcionalidades

#### Botões Funcionais
- ✅ **Login**: Sistema completo de autenticação
- ✅ **Logout**: Com notificação e redirecionamento
- ✅ **Agendar**: Sistema de agendamento completo
- ✅ **Alternar Tema**: Modo claro/escuro instantâneo
- ✅ **Salvar Perfil**: Atualização de dados do usuário
- ✅ **Cancelar Agendamento**: Com confirmação

#### Botões Sem Função (Placeholders)
- ⚠️ **Resetar Acesso**: Em administração de lojas
- ⚠️ **Desativar Loja**: Em administração de lojas
- ⚠️ **Ver Detalhes**: Em várias telas de listagem
- ⚠️ **Editar Serviço**: Em gerenciamento de serviços
- ⚠️ **Adicionar Novo**: Em formulários de cadastro
- ⚠️ **Exportar Dados**: Em relatórios e listagens
- ⚠️ **Imprimir**: Em comprovantes e relatórios

### 🎨 Design e Interface
- **Design Moderno**: Interface limpa e profissional
- **Responsivo**: Adaptável a todos os dispositivos
- **Animações**: Transições suaves e feedback visual
- **Componentes shadcn/ui**: Biblioteca de componentes modernos
- **Ícones Lucide**: Ícones consistentes e bonitos

### 📱 Responsividade
- **Desktop**: Layout completo com sidebar
- **Tablet**: Adaptação intermediária
- **Mobile**: Menu hambúrguer e navegação otimizada
- **Touch-friendly**: Botões e elementos adaptados para toque

## 🚀 Tecnologias Utilizadas

### Frontend
- **Vite**: Build tool rápido e moderno
- **React 18**: Biblioteca de UI com hooks e context
- **TypeScript**: Type safety e melhor desenvolvimento
- **Tailwind CSS**: Framework de CSS utilitário
- **shadcn/ui**: Componentes React modernos e acessíveis
- **Lucide React**: Ícones SVG otimizados

### Estado e Dados
- **TanStack Query**: Gerenciamento de estado servidor
- **React Hook Form**: Formulários performáticos
- **Zod**: Validação de esquemas
- **date-fns**: Manipulação de datas

### Integrações
- **Supabase**: Backend como serviço (configurado)
- **React Router**: Roteamento client-side
- **Sonner**: Notificações toast
- **next-themes**: Sistema de temas

## 📁 Estrutura do Projeto

```
src/
├── components/          # Componentes reutilizáveis
│   ├── ui/             # Componentes shadcn/ui
│   ├── layouts/        # Layouts por tipo de usuário
│   └── auth/           # Componentes de autenticação
├── pages/              # Páginas da aplicação
│   ├── admin/          # Área administrativa
│   ├── cliente/        # Área do cliente
│   ├── loja/           # Área da loja
│   └── login/          # Telas de login
├── hooks/              # Hooks customizados
├── lib/                # Utilitários e configurações
└── integrations/       # Integrações externas
```

## 🎯 Como Executar

### Pré-requisitos
- Node.js 18+ 
- npm ou yarn

### Instalação
```bash
# Clone o repositório
git clone https://github.com/11mayycon/corte-agenda.git

# Entre no diretório
cd corte-agenda

# Instale as dependências
npm install

# Execute o servidor de desenvolvimento
npm run dev
```

### Build para Produção
```bash
# Build otimizado
npm run build

# Preview do build
npm run preview
```

## 🔧 Configurações Adicionais

### Variáveis de Ambiente
O projeto possui arquivo `.env` configurado com:
- Configurações do Supabase
- URLs de API
- Configurações de tema

### Customização de Temas
- Cores principais: `--primary` (roxo) e `--secondary` (azul)
- Sistema de gradientes pré-configurado
- Suporte a modo escuro completo
- Variáveis CSS customizáveis

## 📞 Suporte

Este projeto foi desenvolvido com [Lovable](https://lovable.dev/) e está disponível para contribuição.

**URL do Projeto**: https://lovable.dev/projects/a1fe44f0-51ba-4ec7-a776-bd565df89b00

---

⭐ Se este projeto foi útil, considere dar uma estrela no GitHub!