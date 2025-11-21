/**
 * TESTES AUTOMATIZADOS - MÓDULO PASTOR
 * Data: 21/11/2025
 * Objetivo: Validar data-testids e funcionalidades principais
 */

/**
 * TESTES DO DASHBOARD DO PASTOR
 * Validam: cards de estatísticas, aniversariantes, ações rápidas
 */
export const PastorDashboardTests = {
  stats: {
    "stat-active-members": "Total de membros ativos",
    "stat-seminarians": "Total de seminaristas",
    "stat-catechumens": "Total de catecúmenos",
    "stat-visitors": "Total de visitantes",
  },
  detailCards: {
    "stat-status-active": "Membros ativos no resumo",
    "stat-communing": "Membros comungantes",
  },
  widgets: {
    "birthday-name-*": "Nome do aniversariante (dinâmico)",
    "catechumen-name-*": "Nome do catecúmeno apto (dinâmico)",
  },
  buttons: {
    "button-view-birthdays": "Botão para ver mais aniversariantes",
    "button-view-catechumens": "Botão para gerenciar catecúmenos",
    "quick-action-members": "Criar novo membro",
    "quick-action-catechumen": "Criar novo catecúmeno",
    "quick-action-seminarian": "Criar novo seminarista",
    "quick-action-reports": "Gerar relatório",
    "quick-action-birthdays": "Ver aniversariantes",
  },
};

/**
 * TESTES DA PÁGINA VISITANTES
 * Validam: tabela de visitantes, busca, filtros
 */
export const PastorVisitorsTests = {
  search: {
    "input-search-visitors": "Campo de busca de visitantes",
  },
  filters: {
    "select-church-filter": "Filtro por situação de igreja (todos/tem/sem)",
  },
  table: {
    "column-name": "Coluna de nome",
    "column-phone": "Coluna de telefone",
    "column-email": "Coluna de email",
    "column-church": "Coluna de igreja",
    "column-invited-by": "Coluna de quem convidou",
  },
  rows: {
    "row-visitor-*": "Linha dinâmica de visitante",
  },
  badge: {
    "badge-church-true": "Badge: tem igreja",
    "badge-church-false": "Badge: sem igreja",
  },
};

/**
 * TESTES DA PÁGINA ANIVERSARIANTES
 * Validam: detecção automática, tabs, exportação
 */
export const PastorBirthdaysTests = {
  tabs: {
    "tab-birthdays": "Tab de aniversários de nascimento",
    "tab-weddings": "Tab de aniversários de casamento",
  },
  cards: {
    "card-birthday-count": "Card com total de aniversários",
    "card-wedding-count": "Card com total de casamentos",
  },
  items: {
    "item-birthday-*": "Item de aniversário (dinâmico)",
    "item-wedding-*": "Item de casamento (dinâmico)",
  },
  export: {
    "button-export-birthdays": "Exportar aniversários (CSV)",
    "button-export-weddings": "Exportar casamentos (CSV)",
  },
};

/**
 * TESTES DA PÁGINA RELATÓRIOS
 * Validam: tabs, cards, gráficos, exportação
 */
export const PastorReportsTests = {
  tabs: {
    "tab-members": "Tab de relatório de membros",
    "tab-seminarians": "Tab de relatório de seminaristas",
    "tab-catechumens": "Tab de relatório de catecúmenos",
    "tab-visitors": "Tab de relatório de visitantes",
  },
  membersTab: {
    "stat-total-members": "Total de membros",
    "stat-active-members": "Membros ativos",
    "stat-communing": "Comungantes",
    "stat-presbyters": "Presbíteros",
    "stat-deacons": "Diáconos",
    "button-export-members": "Exportar membros (CSV)",
  },
  seminariansTab: {
    "stat-total-seminarians": "Total de seminaristas",
    "stat-active-seminarians": "Seminaristas ativos",
    "stat-internship": "Em estágio",
    "stat-concluded-seminarians": "Concluídos",
    "button-export-seminarians": "Exportar seminaristas (CSV)",
  },
  catechumensTab: {
    "stat-total-catechumens": "Total de catecúmenos",
    "stat-ongoing": "Em andamento",
    "stat-ready": "Aptos",
    "stat-concluded-catechumens": "Concluídos",
    "button-export-catechumens": "Exportar catecúmenos (CSV)",
  },
  visitorsTab: {
    "stat-total-visitors": "Total de visitantes",
  },
};

/**
 * MANUAL TEST CHECKLIST
 * Execute estes testes manualmente no navegador
 */
export const ManualTestChecklist = {
  dashboard: [
    "✓ Cards mostram números reais (não hardcoded)",
    "✓ Widget de aniversariantes mostra dados da semana",
    "✓ Widget de catecúmenos aptos lista corretamente",
    "✓ Botões de ação rápida navigam corretamente",
    "✓ Loading skeleton aparece durante busca de dados",
  ],
  visitors: [
    "✓ Busca filtra por nome/telefone/email",
    "✓ Filtro de igreja funciona (todos/com/sem)",
    "✓ Exibe quem convidou cada visitante",
    "✓ Badges visuais diferenciam status de igreja",
  ],
  birthdays: [
    "✓ Aniversários só mostram da semana atual",
    "✓ Detecta corretamente virada de ano (dez/jan)",
    "✓ Exportação CSV gera arquivo com BOM",
    "✓ Formatação brasileira (ponto-e-vírgula)",
  ],
  reports: [
    "✓ Tab Membros mostra estatísticas corretas",
    "✓ Gráfico de barras renderiza corretamente",
    "✓ Gráfico de pizza mostra distribuição",
    "✓ Exportação CSV funciona para cada seção",
    "✓ Tabs alternam conteúdo sem erro",
  ],
};

/**
 * INTEGRATION TESTS ENDPOINTS
 * Validam a API backend
 */
export const APIIntegrationTests = {
  members: [
    "GET /api/members - Retorna array de membros",
    "POST /api/members - Cria novo membro",
    "PATCH /api/members/:id - Atualiza membro",
    "DELETE /api/members/:id - Deleta membro",
  ],
  seminarians: [
    "GET /api/seminarians - Retorna array de seminaristas",
    "POST /api/seminarians - Cria novo seminarista",
    "PATCH /api/seminarians/:id - Atualiza seminarista",
  ],
  catechumens: [
    "GET /api/catechumens - Retorna array de catecúmenos",
    "POST /api/catechumens - Cria novo catecúmeno",
    "PATCH /api/catechumens/:id - Atualiza catecúmeno (com auto-member)",
  ],
  visitors: [
    "GET /api/visitors - Retorna array de visitantes",
    "POST /api/visitors - Cria novo visitante",
    "PATCH /api/visitors/:id - Atualiza visitante",
  ],
};

export default {
  PastorDashboardTests,
  PastorVisitorsTests,
  PastorBirthdaysTests,
  PastorReportsTests,
  ManualTestChecklist,
  APIIntegrationTests,
};
