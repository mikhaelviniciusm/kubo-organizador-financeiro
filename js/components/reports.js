/**
 * FinançaOS — Planejamento Component Renderer (Orçamentos, Metas e Contas a Pagar)
 */

window.currentPlanningSubTab = 'budgets';

window.renderReports = function (container) {
  // Sanitize subTab if previously set to 'charts' or 'installments'
  if (!['budgets', 'goals', 'bills'].includes(window.currentPlanningSubTab)) {
    window.currentPlanningSubTab = 'budgets';
  }

  container.innerHTML = `
    <!-- Top Segmented Control for Planejamento Sub-tabs -->
    <div class="segmented-control">
      <button class="${window.currentPlanningSubTab === 'budgets' ? 'active' : ''}" onclick="window.switchPlanningSubTab('budgets')">Orçamentos</button>
      <button class="${window.currentPlanningSubTab === 'goals' ? 'active' : ''}" onclick="window.switchPlanningSubTab('goals')">Metas</button>
      <button class="${window.currentPlanningSubTab === 'bills' ? 'active' : ''}" onclick="window.switchPlanningSubTab('bills')">Contas a Pagar</button>
    </div>

    <div id="planning-sub-content" class="tab-sub-content">
    </div>
  `;

  const subContent = document.getElementById('planning-sub-content');
  if (!subContent) return;

  if (window.currentPlanningSubTab === 'budgets') {
    renderBudgetsOnlyContent(subContent);
  } else if (window.currentPlanningSubTab === 'goals') {
    renderGoalsOnlyContent(subContent);
  } else if (window.currentPlanningSubTab === 'bills') {
    if (window.renderBills) {
      window.renderBills(subContent);
    }
  }
};

window.switchPlanningSubTab = function (subTab) {
  window.currentPlanningSubTab = subTab;
  const container = document.getElementById('view-reports');
  if (container) window.renderReports(container);
};

function renderBudgetsOnlyContent(container) {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const budgets = window.store.getBudgets();
  const categories = window.store.getCategories();

  const prefix = `${year}-${String(month).padStart(2, '0')}`;
  const monthlyExpenses = window.store.getTransactions().filter(t => t.type === 'expense' && t.date && t.date.startsWith(prefix));

  const categorySpentMap = {};
  monthlyExpenses.forEach(t => {
    categorySpentMap[t.categoryId] = (categorySpentMap[t.categoryId] || 0) + Number(t.amount);
  });

  const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
  const monthLabel = `${monthNames[now.getMonth()]} ${year}`;

  container.innerHTML = `
    <div class="card full-width-card">
      <div class="card-header" style="flex-wrap: nowrap; gap: 12px; align-items: center;">
        <div style="min-width: 0; flex: 1;">
          <h3 class="card-title" style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
            ${window.getSVGIcon('target', 18, 2)} Orçamentos
          </h3>
          <span class="card-subtitle">Tetos de Gastos • ${monthLabel}</span>
        </div>
        <button class="btn-primary" onclick="window.openSetBudgetModal()" style="width: auto; padding: 8px 12px; font-size: 0.78rem; white-space: nowrap; flex-shrink: 0;">
          Ajustar Teto
        </button>
      </div>

      <div class="grid-cards-container" style="margin-top: 10px;">
        ${budgets.length === 0 ? '<p style="color: var(--text-muted); font-size: 0.85rem; text-align: center; padding: 25px 10px;">Nenhum teto de gastos definido ainda.</p>' : ''}
        ${budgets.map(b => {
    const cat = categories.find(c => c.id === b.categoryId) || { name: 'Outros', icon: 'package', color: '#007AFF' };
    const spent = categorySpentMap[b.categoryId] || 0;
    const limit = b.monthlyLimit || 1;
    const pct = Math.min(100, Math.round((spent / limit) * 100));
    const remaining = limit - spent;

    let barColor = 'var(--color-green)';
    if (pct >= 100) barColor = 'var(--color-red)';
    else if (pct >= 80) barColor = 'var(--color-orange)';

    return `
            <div onclick="window.openSetBudgetModal()" title="Clique para editar teto de gastos" style="padding: 16px; background: var(--bg-input); border-radius: var(--radius-sm); border: 1px solid var(--border-color); cursor: pointer; display: flex; flex-direction: column; gap: 12px;">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="font-weight: 700; font-size: 0.95rem; display: flex; align-items: center; gap: 8px; color: var(--text-primary);">
                  <span style="width: 32px; height: 32px; border-radius: var(--radius-xs); background: ${cat.color + '22'}; color: ${cat.color}; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                    ${window.getSVGIcon(cat.icon, 18, 2)}
                  </span>
                  ${cat.name}
                </span>
                <span style="font-size: 0.78rem; font-weight: 700; color: var(--text-secondary); background: var(--bg-tertiary); padding: 3px 8px; border-radius: var(--radius-xs);">
                  ${pct}% do limite
                </span>
              </div>

              <div style="display: flex; justify-content: space-between; align-items: baseline; gap: 10px; margin-top: 2px;">
                <span class="hide-val" style="font-size: 1.15rem; font-weight: 800; color: ${pct >= 100 ? 'var(--color-red)' : 'var(--text-primary)'}; white-space: nowrap;">
                  ${window.formatBRL(spent)}
                </span>
                <span class="hide-val" style="font-size: 0.8rem; font-weight: 600; color: var(--text-muted); white-space: nowrap;">
                  Meta: ${window.formatBRL(limit)}
                </span>
              </div>

              <div class="progress-bar-container" style="height: 8px;">
                <div class="progress-bar-fill" style="width: ${pct}%; background-color: ${barColor};"></div>
              </div>

              <div class="hide-val" style="text-align: right; font-size: 0.78rem; color: var(--text-secondary); font-weight: 600;">
                ${remaining >= 0 ? `Restam ${window.formatBRL(remaining)}` : `<strong style="color: var(--color-red);">Excedido em ${window.formatBRL(Math.abs(remaining))}</strong>`}
              </div>
            </div>
          `;
  }).join('')}
      </div>
    </div>
  `;
}

function renderGoalsOnlyContent(container) {
  const goals = window.store.getGoals();

  container.innerHTML = `
    <div class="card full-width-card">
      <div class="card-header" style="flex-wrap: nowrap; gap: 12px; align-items: center;">
        <div style="min-width: 0; flex: 1;">
          <h3 class="card-title" style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
            ${window.getSVGIcon('target', 18, 2)} Metas
          </h3>
          <span class="card-subtitle">Acompanhe seus objetivos</span>
        </div>
        <button class="btn-primary" onclick="window.openAddGoalModal()" style="width: auto; padding: 8px 12px; font-size: 0.78rem; white-space: nowrap; flex-shrink: 0;">
          Nova Meta
        </button>
      </div>

      <div class="grid-cards-container" style="margin-top: 10px;">
        ${goals.length === 0 ? '<p style="color: var(--text-muted); font-size: 0.85rem; text-align: center; padding: 25px 10px;">Nenhuma meta financeira cadastrada.</p>' : ''}
        ${goals.map(g => {
    const target = g.targetAmount || 1;
    const current = g.currentAmount || 0;
    const pct = Math.min(100, Math.round((current / target) * 100));

    return `
            <div style="padding: 16px; background: var(--bg-input); border-radius: var(--radius-sm); border: 1px solid var(--border-color); display: flex; flex-direction: column; gap: 12px;">
              <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 10px;">
                <div onclick="window.openEditGoalModal('${g.id}')" style="display: flex; align-items: center; gap: 10px; cursor: pointer; flex: 1; min-width: 0;">
                  <span style="width: 34px; height: 34px; border-radius: var(--radius-xs); background: rgba(0, 122, 255, 0.15); color: var(--color-blue); display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                    ${window.getSVGIcon(g.icon || 'target', 18, 2)}
                  </span>
                  <div style="min-width: 0;">
                    <div style="font-weight: 800; font-size: 0.95rem; color: var(--text-primary); word-break: break-word; line-height: 1.25;">
                      ${g.title}
                    </div>
                    <div style="font-size: 0.72rem; color: var(--text-secondary); margin-top: 2px;">
                      Prazo: ${window.formatDateBR(g.targetDate) || 'Sem data'}
                    </div>
                  </div>
                </div>

                <span style="font-size: 0.78rem; font-weight: 700; color: var(--color-blue); background: var(--bg-tertiary); padding: 3px 8px; border-radius: var(--radius-xs); flex-shrink: 0;">
                  ${pct}% concluído
                </span>
              </div>

              <div style="display: flex; justify-content: space-between; align-items: baseline; gap: 10px; margin-top: 2px;">
                <span class="hide-val" style="font-size: 1.15rem; font-weight: 800; color: var(--color-green); white-space: nowrap;">
                  ${window.formatBRL(current)}
                </span>
                <span class="hide-val" style="font-size: 0.8rem; font-weight: 600; color: var(--text-muted); white-space: nowrap;">
                  Meta: ${window.formatBRL(target)}
                </span>
              </div>

              <div class="progress-bar-container" style="height: 8px;">
                <div class="progress-bar-fill" style="width: ${pct}%; background: linear-gradient(90deg, var(--color-blue) 0%, var(--color-green) 100%);"></div>
              </div>

              <div style="display: flex; justify-content: flex-end; align-items: center; gap: 6px; margin-top: 2px;">
                <button onclick="window.openEditGoalModal('${g.id}')" style="background: var(--bg-tertiary); color: var(--text-primary); border: 1px solid var(--border-color); padding: 5px 9px; border-radius: var(--radius-xs); font-weight: 600; font-size: 0.75rem; cursor: pointer;">
                  Editar
                </button>
                <button onclick="window.openWithdrawGoalModal('${g.id}')" style="background: rgba(255, 59, 48, 0.15); color: var(--color-red); border: none; padding: 5px 9px; border-radius: var(--radius-xs); font-weight: 700; font-size: 0.75rem; cursor: pointer;">
                  Retirar
                </button>
                <button onclick="window.openDepositGoalModal('${g.id}')" style="background: var(--color-blue-light); color: var(--color-blue); border: none; padding: 5px 9px; border-radius: var(--radius-xs); font-weight: 700; font-size: 0.75rem; cursor: pointer;">
                  Guardar
                </button>
              </div>
            </div>
          `;
  }).join('')}
      </div>
    </div>
  `;
}
