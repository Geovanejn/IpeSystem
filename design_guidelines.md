# Design Guidelines - Sistema Integrado IPE (Igreja Presbiteriana Emaús)

## Identidade Visual IPE

**Paleta de Cores Oficial:**
- **Laranja IPE**: `#F39C12` - Cor de destaque e acentuação (presente no logo)
- **Azul Petróleo IPE**: `#1E5F74` - Cor primária institucional (cor "EMAÚS" no logo)
- **Branco**: Para contraste, clareza e fundos
- **Cinza Neutro**: Para textos secundários e bordas

**Logo IPE:**
- Posicionado no topo da sidebar em todos os painéis
- Largura máxima de 200px
- Fundo transparente para adaptação a temas claros/escuros

---

## Abordagem de Design

**Framework Escolhido:** Design System Administrativo Eclesiástico  
**Filosofia:** Interface profissional e acessível para gestão pastoral, financeira, diaconal e compliance LGPD. O design deve transmitir seriedade, confiabilidade e respeito, adequado ao contexto religioso institucional.

**Princípios Fundamentais:**
- **Separação Total de Painéis**: Cada perfil (Pastor, Tesoureiro, Diácono, LGPD) vê apenas suas funções
- **Hierarquia Clara**: Informação organizada por importância e contexto pastoral/administrativo
- **Acessibilidade**: Interface utilizável por pessoas de diferentes níveis de alfabetização digital
- **Conformidade LGPD**: Transparência no tratamento de dados pessoais

---

## Sistema Tipográfico

**Famílias de Fonte:**
- **Principal**: Inter (cabeçalhos, navegação, UI)
- **Secundária**: System UI (corpo de texto, tabelas, formulários)
- **Monospace**: Para códigos, números de documentos

**Escala Tipográfica:**
- **Títulos de Página**: text-3xl font-bold (36px) - Azul Petróleo IPE
- **Cabeçalhos de Seção**: text-xl font-semibold (24px)
- **Títulos de Card**: text-lg font-medium (20px)
- **Texto Corpo**: text-base (16px)
- **Texto Auxiliar**: text-sm (14px)
- **Texto de Tabelas**: text-sm (14px)
- **Labels de Formulário**: text-sm font-medium

---

## Sistema de Espaçamento

**Primitivas de Espaçamento:** Unidades Tailwind de 4, 6, 8, 12, 16
- **Padding de Componentes**: p-6
- **Espaçamento de Seções**: py-8, py-12
- **Espaçamento de Cards**: p-6
- **Gap de Campos de Formulário**: gap-4, gap-6
- **Margens de Página**: px-8

**Sistema de Grid:**
- **Métricas Dashboard**: grid-cols-3 (desktop), grid-cols-1 (mobile)
- **Formulários**: grid-cols-2 (desktop), grid-cols-1 (mobile)
- **Tabelas**: Largura total com scroll horizontal se necessário
- **Cards**: grid-cols-1 md:grid-cols-2 lg:grid-cols-3

---

## Estrutura da Aplicação

**Layout Mestre:**
```
[Sidebar Fixa - 280px] [Área de Conteúdo Principal - flex-1]
```

**Componentes da Sidebar:**
- Logo IPE (topo, 200px largura, centralizado)
- Badge de identificação do painel (Pastor/Tesoureiro/Diácono/LGPD)
- Menu de navegação vertical com ícones
- Informações do usuário (rodapé)
- Botão de logout

**Estrutura do Conteúdo Principal:**
- Cabeçalho da página com breadcrumb
- Barra de ações (busca, filtros, botão primário de ação)
- Área de conteúdo (tabelas, cards, formulários)
- Paginação/carregamento progressivo

---

## Componentes Principais

### Navegação
- **Sidebar**: Fixa à esquerda, 280px largura, menu vertical com ícones Lucide
- **Estado Ativo**: Fundo preenchido com Azul Petróleo IPE, texto em branco
- **Itens de Menu**: py-3 px-4, cantos arredondados (rounded-lg), ícone + texto
- **Badge de Perfil**: Destaque visual mostrando o painel atual com cor correspondente

### Tabelas de Dados
- **Cabeçalho**: Sticky, font-semibold, text-sm uppercase tracking-wide, cor Azul Petróleo IPE
- **Linhas**: Fundo alternado sutil, estado hover, py-4 px-6
- **Coluna de Ações**: Alinhada à direita, botões com ícones
- **Paginação**: Centralizada na parte inferior, mostrando "X-Y de Z resultados"
- **Altura de Linha**: py-4 para leitura confortável

### Formulários
- **Layout**: Grid de duas colunas no desktop (grid-cols-2 gap-6), coluna única no mobile
- **Labels**: text-sm font-medium, mb-2, cor Azul Petróleo IPE
- **Inputs**: Largura total, p-3, rounded-lg border, anel de foco Laranja IPE
- **Campos Obrigatórios**: Marcador asterisco em vermelho no label
- **Texto de Ajuda**: text-sm abaixo do input, cor muted
- **Seção de Envio**: Largura total, pt-8, grupo de botões alinhado à direita

### Cards
- **Container**: rounded-xl, shadow-sm, p-6, fundo card
- **Cabeçalho**: Flex justify-between, mb-4
- **Conteúdo**: Seções organizadas com espaçamento mb-6
- **Ações**: Seção de rodapé com grupo de botões

### Botões
- **Primário**: Azul Petróleo IPE, px-6 py-3, rounded-lg, font-medium, texto branco
- **Secundário**: Estilo com borda, mesmo padding, cor Laranja IPE
- **Destrutivo**: Vermelho, para ações de exclusão
- **Botões com Ícone**: p-2, rounded-lg, apenas ícone
- **Grupos de Botões**: gap-3, layout flex

### Badges de Status
- **Formato Pill**: px-3 py-1, rounded-full, text-xs font-medium
- **Estados:**
  - Ativo: Verde
  - Inativo: Cinza
  - Em Disciplina: Amarelo/Laranja
  - Apto: Azul
  - Concluído: Verde escuro
  - Transferido: Azul claro
- **Posição**: Inline com dados relevantes

### Métricas de Dashboard
- **Cards de Estatísticas**: Layout em grid, cada card mostrando número + label + tendência
- **Estrutura do Card**: p-6, ícone no topo-esquerda, número grande (text-3xl), label abaixo
- **Agrupamento**: Grid de 3 colunas (grid-cols-3 gap-6) no desktop

### Diálogos Modais
- **Overlay**: Fundo semi-transparente
- **Container**: max-w-2xl, rounded-xl, p-8
- **Cabeçalho**: text-xl font-semibold, mb-6, cor Azul Petróleo IPE
- **Rodapé**: Grupo de botões alinhado à direita, pt-6 border-t

### Componentes de Upload
- **Zona Drag & Drop**: border-2 dashed, p-8, rounded-lg, centralizado, cor Laranja IPE ao hover
- **Preview de Arquivo**: Thumbnail + nome do arquivo + botão remover
- **Indicador Obrigatório**: Marcador visual claro para uploads obrigatórios (termos LGPD, comprovantes)

---

## Layouts Específicos por Painel

### Painel do Pastor (Azul Petróleo IPE como cor primária)
- **Dashboard**: Cards de métricas para Membros, Seminaristas, Catecúmenos, Visitantes
- **Gestão de Membros**: Formulário abrangente com seções retráteis (Identificação, Contatos, Situação Espiritual, Cargo Eclesiástico, Status, Observações Pastorais, LGPD)
- **Tabelas**: Colunas ordenáveis para todas as listagens com filtros por status, cargo, situação espiritual
- **Aniversariantes**: Lista automatizada com opção de enviar para boletim

### Painel do Tesoureiro (Laranja IPE como cor de destaque)
- **Dashboard Financeiro**: Gráficos (barras/linhas), totais de entradas/saídas, seletor de período
- **Formulários de Transação**: Dropdowns de categoria, inputs de valor, seletores de data, upload de arquivo
- **Seção de Relatórios**: Filtros de intervalo de data, botões de exportação (PDF/Excel/CSV)
- **Visualização de Comprovantes**: Preview de imagens/PDFs anexados às transações

### Painel do Diácono (Verde como cor de destaque)
- **Gestão de Visitantes**: Formulário de adição de visitante, linha do tempo de histórico de visitas
- **Construtor de Boletim**: Ordenação por arrastar e soltar seções, painel de preview
- **Boletim Dominical**: Editor completo com blocos para liturgia, EBD, avisos, aniversariantes, pedidos de oração, liderança
- **Patrimônio**: Tabela de inventário com filtros, modal de adição de ativo

### Portal LGPD (Cinza neutro com acentos Azul Petróleo IPE)
- **Visualização de Perfil do Usuário**: Exibição de dados somente leitura com botão editar
- **Modo de Edição**: Edição inline com ações de salvar/cancelar
- **Exportação de Dados**: Botão de download para pacote de dados pessoais (PDF/Excel/JSON)
- **Exclusão de Conta**: Modal de confirmação com aviso de consequências

---

## Comportamento Responsivo

- **Desktop (lg:)**: Sidebar completa, layouts multi-coluna
- **Tablet (md:)**: Sidebar retrátil, formulários de 2 colunas
- **Mobile (base)**: Sidebar oculta com menu hambúrguer, navegação empilhada, coluna única

---

## Acessibilidade

- Todos os inputs de formulário com labels adequados e atributos ARIA
- Indicadores de foco em todos os elementos interativos (ring-2 ring-offset-2)
- Suporte completo para navegação por teclado
- Anúncios de leitor de tela para conteúdo dinâmico
- Tamanho mínimo de toque de 44px para mobile
- Taxas de contraste suficientes para todos os textos (WCAG AA)

---

## Ícones

**Biblioteca:** Lucide React (outline para navegação, solid para ações)

**Ícones Comuns:**
- **Gestão de Usuários**: Users, UserPlus, UserCheck
- **Financeiro**: DollarSign, TrendingUp, Receipt, Wallet
- **Ações**: Edit, Trash2, Eye, Download, Upload, FileText
- **Navegação**: ChevronRight, Home, BarChart3, Calendar, Book
- **Pastoral**: Church, BookOpen, Heart, Award
- **LGPD**: Shield, Lock, FileCheck, AlertTriangle

---

## Estados Visuais

### Estados de Loading
- **Skeleton Screens**: Para tabelas e listas durante carregamento
- **Spinners**: Para ações de formulário e botões
- **Progress Bars**: Para uploads de arquivo

### Estados Vazios
- **Ilustração + Mensagem**: Quando não há dados para exibir
- **Call-to-Action**: Botão para adicionar primeiro item
- **Cores suaves**: Cinza claro para não alarmar

### Estados de Erro
- **Mensagens Claras**: Explicação do problema e solução sugerida
- **Cor Destrutiva**: Vermelho para chamar atenção
- **Botões de Ação**: Tentar novamente, voltar, contatar suporte

### Estados de Sucesso
- **Toast Notifications**: Verde com ícone de check
- **Mensagens Temporárias**: Auto-dismiss após 3-5 segundos
- **Feedback Imediato**: Confirmação visual de ações concluídas

---

## Padrões de Interação

### Confirmação de Ações Destrutivas
- Modal de confirmação para exclusões
- Texto claro sobre consequências
- Botão destrutivo (vermelho) separado do botão cancelar

### Upload de Arquivos
- Drag & drop zone com feedback visual
- Preview de arquivo após seleção
- Barra de progresso durante upload
- Validação de tipo e tamanho de arquivo

### Navegação entre Seções
- Breadcrumbs para contexto de localização
- Transições suaves entre páginas
- Preservação de estado de filtros e buscas

### Edição Inline
- Duplo clique para ativar modo de edição
- Enter para salvar, Esc para cancelar
- Indicadores visuais claros de modo de edição

---

## Temas (Claro/Escuro)

**Modo Claro (Padrão):**
- Fundo: Branco (#FFFFFF)
- Texto: Azul Petróleo IPE escuro (#0D2F3F)
- Cards: Cinza muito claro (#F8F9FA)
- Bordas: Cinza claro (#E9ECEF)

**Modo Escuro:**
- Fundo: Azul Petróleo IPE muito escuro (#0A1F2A)
- Texto: Branco (#FFFFFF)
- Cards: Azul Petróleo IPE escuro (#1E5F74)
- Bordas: Azul Petróleo IPE médio (#2C7A94)
- Acentos: Laranja IPE mantém-se (#F39C12)

---

## Considerações Especiais para Contexto Eclesiástico

### Linguagem e Terminologia
- Usar terminologia da IPB (Igreja Presbiteriana do Brasil)
- Respeito ao vocabulário pastoral e teológico
- Clareza para usuários não técnicos

### Privacidade e Sigilo Pastoral
- Observações pastorais sempre ocultas para outros perfis
- Indicadores visuais claros de informação confidencial
- Avisos sobre dados sensíveis (disciplina, aconselhamento)

### Compliance LGPD
- Transparência sobre coleta e uso de dados
- Facilidade de acesso, correção e exclusão de dados pessoais
- Rastreabilidade de consentimentos e revogações
- Logs de auditoria para todas as ações com dados pessoais

### Impressão de Relatórios
- Layouts otimizados para impressão
- Cabeçalho IPE em relatórios impressos
- Formatação adequada de boletins para distribuição física
- Opções de exportação PDF com logo e identidade visual IPE
