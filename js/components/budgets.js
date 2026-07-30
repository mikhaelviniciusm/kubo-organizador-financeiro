/**
 * FinançaOS — Budgets & Financial Goals Component Renderer
 */

window.renderBudgets = function(container) {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  
  const budgets = window.store.getBudgets();
  const goals = window.store.getGoals();
  const categories = window.store.getCategories();
  
  const prefix = `${year}-${String(month).padStart(2, '0')}`;
  const monthlyExpenses = window.store.getTransactions().filter(t => t.type === 'expense' && t.date && t.date.startsWith(prefix));

  // Compute category spendings for this month
  const categorySpentMap = {};
  monthlyExpenses.forEach(t => {
    categorySpentMap[t.categoryId] = (categorySpentMap[t.categoryId] || 0) + Number(t.amount);
  });

  const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
  const monthLabel = `${monthNames[now.getMonth()]} ${year}`;

  container.innerHTML = `
    <!-- Category Monthly Budgets -->
    <div class="card">
      <div class="card-header">
        <div>
          <h3 class="card-title">🎯 Orçamentos de Categorias</h3>
          <span class="card-subtitle">Tetos de Gastos para ${monthLabel}</span>
        </div>
        <button class="btn-primary" onclick="window.openSetBudgetModal()" style="width: auto; padding: 8px 14px; font-size: 0.8rem;">+ Ajustar Teto</button>
      </div>

      <div style="display: flex; flex-direction: column; gap: 16px;">
        ${budgets.length === 0 ? '<p style="color: var(--text-muted); font-size: 0.85rem; text-align: center; padding: 15px;">Nenhum teto de gastos definido ainda.</p>' : ''}
        ${budgets.map(b => {
          const cat = categories.find(c => c.id === b.categoryId) || { name: 'Outros', icon: '📦', color: '#007AFF' };
          const spent = categorySpentMap[b.categoryId] || 0;
          const limit = b.monthlyLimit || 1;
          const pct = Math.min(100, Math.round((spent / limit) * 100));
          const remaining = limit - spent;
          
          let barColor = 'var(--color-green)';
          if (pct >= 100) barColor = 'var(--color-red)';
          else if (pct >= 80) barColor = 'var(--color-orange)';

          return `
            <div>
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                <span style="font-weight: 700; font-size: 0.9rem;">${cat.icon} ${cat.name}</span>
                <span style="font-size: 0.82rem; font-weight: 800; color: ${pct >= 100 ? 'var(--color-red)' : 'var(--text-primary)'};">
                  ${window.formatBRL(spent)} / ${window.formatBRL(limit)}
                </span>
              </div>
              <div class="progress-bar-container">
                <div class="progress-bar-fill" style="width: ${pct}%; background-color: ${barColor};"></div>
              </div>
              <div style="display: flex; justify-content: space-between; font-size: 0.72rem; color: var(--text-secondary); margin-top: 4px;">
                <span>${pct}% do orçamento</span>
                <span>${remaining >= 0 ? `Restam ${window.formatBRL(remaining)}` : `<strong style="color: var(--color-red);">Excedido em ${window.formatBRL(Math.abs(remaining))}</strong>`}</span>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </div>

    <!-- Savings & Investments Goals (Metas) -->
    <div class="card">
      <div class="card-header">
        <div>
          <h3 class="card-title">🚀 Metas Financeiras</h3>
          <span class="card-subtitle">Acompanhamento dos seus Objetivos</span>
        </div>
        <button class="btn-primary" onclick="window.openAddGoalModal()" style="width: auto; padding: 8px 14px; font-size: 0.8rem;">+ Nova Meta</button>
      </div>

      <div style="display: flex; flex-direction: column; gap: 14px;">
        ${goals.length === 0 ? '<p style="color: var(--text-muted); font-size: 0.85rem; text-align: center; padding: 15px;">Nenhuma meta financeira cadastrada.</p>' : ''}
        ${goals.map(g => {
          const target = g.targetAmount || 1;
          const current = g.currentAmount || 0;
          const pct = Math.min(100, Math.round((current / target) * 100));

          return `
            <div style="padding: 16px; background: var(--bg-input); border-radius: var(--radius-md); border: 1px solid var(--border-color);">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                <div style="display: flex; align-items: center; gap: 10px;">
                  <span style="font-size: 1.6rem; background: var(--bg-card); padding: 8px; border-radius: var(--radius-sm);">${g.icon || '🎯'}</span>
                  <div>
                    <div style="font-weight: 800; font-size: 0.95rem;">${g.title}</div>
                    <div style="font-size: 0.75rem; color: var(--text-secondary);">Prazo: ${window.formatDateBR(g.targetDate) || 'Sem data'}</div>
                  </div>
                </div>
                <div style="text-align: right;">
                  <span style="font-size: 1rem; font-weight: 800; color: var(--color-green);">${window.formatBRL(current)}</span>
                  <div style="font-size: 0.72rem; color: var(--text-muted);">Meta: ${window.formatBRL(target)}</div>
                </div>
              </div>

              <div class="progress-bar-container">
                <div class="progress-bar-fill" style="width: ${pct}%; background: linear-gradient(90deg, var(--color-blue) 0%, var(--color-green) 100%);"></div>
              </div>

              <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 10px;">
                <span style="font-size: 0.75rem; font-weight: 700; color: var(--color-blue);">${pct}% Concluído</span>
                <button onclick="window.openDepositGoalModal('${g.id}')" style="background: var(--color-blue-light); color: var(--color-blue); border: none; padding: 6px 12px; border-radius: var(--radius-xs); font-weight: 700; font-size: 0.75rem; cursor: pointer;">
                  + Guardar Dinheiro
                </button>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;
};
