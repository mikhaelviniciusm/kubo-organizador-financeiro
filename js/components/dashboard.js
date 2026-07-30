/**
 * FinançaOS — Dashboard Component Renderer with SVG Vector Icons & Edit Triggers
 */

window.renderDashboard = function (container) {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;

  const metrics = window.store.getMonthlyMetrics(year, month);
  const categories = window.store.getCategories();
  const allTransactions = window.store.getTransactions();

  // Collapse installment groups: only show first installment of each group,
  // but display the totalPurchaseAmount and a label like "Smartphone (3x)"
  const seenGroups = new Set();
  const collapsedTransactions = [];
  for (const t of allTransactions) {
    if (t.installmentGroup) {
      if (!seenGroups.has(t.installmentGroup)) {
        seenGroups.add(t.installmentGroup);
        // Show with the total purchase amount and strip the "(1/N)" suffix from note
        const cleanNote = (t.note || '').replace(/\s*\(\d+\/\d+\)$/, '');
        collapsedTransactions.push({
          ...t,
          note: `${cleanNote} (${t.installmentTotal}x)`,
          amount: t.totalPurchaseAmount || t.amount
        });
      }
    } else {
      collapsedTransactions.push(t);
    }
    if (collapsedTransactions.length >= 5) break;
  }
  const transactions = collapsedTransactions;

  const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
  const currentMonthName = monthNames[now.getMonth()];

  let healthText = 'Excelente';
  let healthClass = 'excellent';
  let healthIcon = window.getSVGIcon('trending-up', 14, 2.5);

  if (metrics.income > 0) {
    const expenseRatio = metrics.expense / metrics.income;
    if (expenseRatio > 0.9) {
      healthText = 'Atenção Crítica';
      healthClass = 'critical';
      healthIcon = window.getSVGIcon('alert-triangle', 14, 2.5);
    } else if (expenseRatio > 0.75) {
      healthText = 'Alerta de Gastos';
      healthClass = 'warning';
      healthIcon = window.getSVGIcon('zap', 14, 2.5);
    } else if (expenseRatio > 0.5) {
      healthText = 'Equilibrado';
      healthClass = 'good';
      healthIcon = window.getSVGIcon('check-circle', 14, 2.5);
    }
  }

  const prefix = `${year}-${String(month).padStart(2, '0')}`;
  const monthlyTxs = window.store.getTransactions().filter(t => t.type === 'expense' && t.date && t.date.startsWith(prefix));

  const catTotals = {};
  monthlyTxs.forEach(t => {
    catTotals[t.categoryId] = (catTotals[t.categoryId] || 0) + Number(t.amount);
  });

  const sortedCatExpenses = Object.entries(catTotals)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);

  container.innerHTML = `
    <!-- Top Greeting & Balance Card -->
    <div class="card balance-card">
      <div class="card-header">
        <div>
          <span class="card-subtitle">Patrimônio Líquido Total</span>
        </div>
        <div style="font-size: 0.75rem; font-weight: 700; color: var(--color-blue); background: var(--color-blue-light); padding: 4px 10px; border-radius: var(--radius-full); white-space: nowrap;">
          ${currentMonthName} / ${year}
        </div>
      </div>

      <!-- Main Balance Amount & Health Badge Underneath -->
      <div style="display: flex; flex-direction: column; gap: 6px; margin: 4px 0 10px;">
        <div class="balance-amount">${window.formatBRL(metrics.totalNetWorth)}</div>
        <div style="display: flex;">
          <div class="health-badge ${healthClass}">
            ${healthIcon}
            <span>${healthText}</span>
          </div>
        </div>
      </div>

      <div class="balance-grid">
        <div class="balance-sub-item">
          <div class="sub-icon income">
            ${window.getSVGIcon('arrow-down-circle', 18, 2.5)}
          </div>
          <div class="sub-info">
            <span class="label">Receitas</span>
            <span class="val income">+${window.formatBRL(metrics.income)}</span>
          </div>
        </div>
        <div class="balance-sub-item">
          <div class="sub-icon expense">
            ${window.getSVGIcon('arrow-up-circle', 18, 2.5)}
          </div>
          <div class="sub-info">
            <span class="label">Despesas</span>
            <span class="val expense">-${window.formatBRL(metrics.expense)}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Quick Action Shortcuts -->
    <div class="quick-actions">
      <button class="quick-action-btn" onclick="window.openAddTransactionModal('expense')">
        <span class="quick-action-icon red">
          ${window.getSVGIcon('arrow-up-circle', 20, 2.5)}
        </span>
        <span class="quick-action-label">Despesa</span>
      </button>

      <button class="quick-action-btn" onclick="window.openAddTransactionModal('income')">
        <span class="quick-action-icon green">
          ${window.getSVGIcon('arrow-down-circle', 20, 2.5)}
        </span>
        <span class="quick-action-label">Receita</span>
      </button>

      <button class="quick-action-btn" onclick="window.openTransferModal()">
        <span class="quick-action-icon blue">
          ${window.getSVGIcon('repeat', 20, 2.5)}
        </span>
        <span class="quick-action-label">Transferir</span>
      </button>

      <button class="quick-action-btn" onclick="window.openAddGoalModal()">
        <span class="quick-action-icon purple">
          ${window.getSVGIcon('target', 20, 2.5)}
        </span>
        <span class="quick-action-label">Nova Meta</span>
      </button>
    </div>

    <!-- Top Spending Categories This Month -->
    <div class="card">
      <div class="card-header">
        <h3 class="card-title">
          ${window.getSVGIcon('trending-up', 18, 2)} Maiores Gastos do Mês
        </h3>
        <span class="card-subtitle">${currentMonthName}</span>
      </div>
      <div style="display: flex; flex-direction: column; gap: 12px;">
        ${sortedCatExpenses.length === 0 ? '<p style="color: var(--text-muted); font-size: 0.85rem; text-align: center; padding: 10px;">Nenhuma despesa registrada este mês.</p>' : ''}
        ${sortedCatExpenses.map(([catId, amount]) => {
    const cat = categories.find(c => c.id === catId) || { name: 'Outros', icon: 'package', color: '#8E8E93' };
    const pct = metrics.expense > 0 ? Math.round((amount / metrics.expense) * 100) : 0;
    return `
            <div>
              <div style="display: flex; justify-content: space-between; font-size: 0.85rem; font-weight: 700; margin-bottom: 4px; align-items: center;">
                <span style="display: flex; align-items: center; gap: 6px;">
                  ${window.getSVGIcon(cat.icon, 16, 2)} ${cat.name}
                </span>
                <span style="white-space: nowrap;">${window.formatBRL(amount)} (${pct}%)</span>
              </div>
              <div class="progress-bar-container">
                <div class="progress-bar-fill" style="width: ${pct}%; background-color: ${cat.color};"></div>
              </div>
            </div>
          `;
  }).join('')}
      </div>
    </div>

    <!-- Recent Transactions Feed -->
    <div class="card">
      <div class="card-header">
        <h3 class="card-title">
          ${window.getSVGIcon('file-text', 18, 2)} Transações Recentes
        </h3>
        <button onclick="window.switchTab('view-transactions')" style="background: none; border: none; color: var(--color-blue); font-weight: 700; font-size: 0.8rem; cursor: pointer;">Ver Todas</button>
      </div>

      <div class="transaction-list">
        ${transactions.length === 0 ? '<p style="color: var(--text-muted); font-size: 0.85rem; text-align: center; padding: 15px;">Nenhuma transação encontrada.</p>' : ''}
        ${transactions.map(t => {
    const cat = categories.find(c => c.id === t.categoryId) || { name: 'Geral', icon: 'credit-card', color: '#007AFF' };
    const isIncome = t.type === 'income';
    const sign = isIncome ? '+' : (t.type === 'transfer' ? '' : '-');
    const amountClass = isIncome ? 'income' : (t.type === 'transfer' ? 'transfer' : 'expense');

    return `
            <div class="transaction-item" onclick="window.openEditTransactionModal('${t.id}')" title="Clique para editar ou excluir">
              <div class="t-left">
                <div class="t-icon" style="background-color: ${cat.color}22; color: ${cat.color};">
                  ${window.getSVGIcon(cat.icon, 20, 2)}
                </div>
                <div class="t-info">
                  <span class="t-title">${t.note || cat.name}</span>
                  <span class="t-meta">${window.formatDateBR(t.date)} • ${t.paymentMethod || 'Geral'}</span>
                </div>
              </div>
              <div class="t-right">
                <span class="t-amount ${amountClass}">${sign}${window.formatBRL(t.amount)}</span>
                <span class="t-method">${cat.name}</span>
              </div>
            </div>
          `;
  }).join('')}
      </div>
    </div>
  `;
};
