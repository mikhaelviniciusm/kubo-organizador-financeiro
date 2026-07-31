/**
 * FinançaOS — Dashboard Component Renderer with SVG Vector Icons, Charts & Edit Triggers
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

      <!-- Income / Expense summary clickable to go to extrato -->
      <div class="balance-grid">
        <div class="balance-sub-item" onclick="window.goToTransactionsFiltered('income')" style="cursor: pointer;" title="Ver extrato de receitas">
          <div class="sub-icon income">
            ${window.getSVGIcon('arrow-down-circle', 18, 2.5)}
          </div>
          <div class="sub-info">
            <span class="label">Receitas</span>
            <span class="val income">+${window.formatBRL(metrics.income)}</span>
          </div>
        </div>
        <div class="balance-sub-item" onclick="window.goToTransactionsFiltered('expense')" style="cursor: pointer;" title="Ver extrato de despesas">
          <div class="sub-icon expense">
            ${window.getSVGIcon('arrow-up-circle', 18, 2.5)}
          </div>
          <div class="sub-info">
            <span class="label">Despesas</span>
            <span class="val expense">-${window.formatBRL(metrics.expense)}</span>
          </div>
        </div>
      </div>

      <!-- Separate Checking vs Savings -->
      ${(metrics.totalChecking > 0 || metrics.totalSavings > 0) ? `
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 8px; padding-top: 10px; border-top: 1px solid var(--border-color);">
        <div style="background: rgba(92,158,173,0.08); border: 1px solid rgba(92,158,173,0.2); border-radius: var(--radius-sm); padding: 8px 10px;">
          <div style="font-size: 0.6rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.06em;">Contas</div>
          <div class="hide-val" style="font-size: 0.88rem; font-weight: 800; color: var(--text-primary); margin-top: 2px; white-space: nowrap;">${window.formatBRL(metrics.totalChecking)}</div>
        </div>
        <div style="background: rgba(48,209,88,0.08); border: 1px solid rgba(48,209,88,0.2); border-radius: var(--radius-sm); padding: 8px 10px;">
          <div style="font-size: 0.6rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.06em;">Reservas</div>
          <div class="hide-val" style="font-size: 0.88rem; font-weight: 800; color: var(--color-green); margin-top: 2px; white-space: nowrap;">${window.formatBRL(metrics.totalSavings)}</div>
        </div>
      </div>` : ''}
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

    <!-- Interactive Analytics Charts Moved to Dashboard -->
    ${renderDashboardChartsHTML(categories, allTransactions, now, currentMonthName)}



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

function renderDashboardChartsHTML(categories, allTxs, now, currentMonthName) {
  const currYear = now.getFullYear();
  const currMonth = now.getMonth() + 1;

  const prefix = `${currYear}-${String(currMonth).padStart(2, '0')}`;
  const currentMonthExpenses = allTxs.filter(t => t.type === 'expense' && t.date && t.date.startsWith(prefix));

  const totalExpense = currentMonthExpenses.reduce((acc, t) => acc + Number(t.amount), 0);

  const catExpenses = {};
  currentMonthExpenses.forEach(t => {
    catExpenses[t.categoryId] = (catExpenses[t.categoryId] || 0) + Number(t.amount);
  });

  const catEntries = Object.entries(catExpenses).sort((a, b) => b[1] - a[1]);

  const last6Months = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const y = d.getFullYear();
    const m = d.getMonth() + 1;
    const mPrefix = `${y}-${String(m).padStart(2, '0')}`;

    let inc = 0;
    let exp = 0;
    allTxs.filter(t => t.date && t.date.startsWith(mPrefix)).forEach(t => {
      if (t.type === 'income') inc += Number(t.amount);
      if (t.type === 'expense') exp += Number(t.amount);
    });

    const monthShortNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    last6Months.push({ label: monthShortNames[m - 1], income: inc, expense: exp });
  }

  const maxVal = Math.max(1, ...last6Months.map(m => Math.max(m.income, m.expense)));

  return `
    <!-- Category Distribution SVG Donut Chart -->
    <div class="card">
      <div class="card-header">
        <div>
          <h3 class="card-title">
            ${window.getSVGIcon('target', 18, 2)} Gastos por Categoria
          </h3>
          <span class="card-subtitle">Mês Atual - ${currentMonthName}</span>
        </div>
      </div>

      ${catEntries.length === 0 ? '<p style="color: var(--text-muted); font-size: 0.85rem; text-align: center; padding: 20px;">Nenhum gasto registrado este mês.</p>' : `
        <div style="display: flex; flex-direction: column; align-items: center; gap: 20px; margin-top: 10px;">
          <div class="chart-container" style="height: 200px;">
            <svg viewBox="0 0 100 100" style="width: 180px; height: 180px; transform: rotate(-90deg);">
              ${(() => {
        let cumulativeAngle = 0;
        return catEntries.map(([catId, amount]) => {
          const cat = categories.find(c => c.id === catId) || { color: '#007AFF' };
          const pct = amount / (totalExpense || 1);
          const dashArray = `${pct * 283} 283`;
          const dashOffset = -cumulativeAngle * 283;
          cumulativeAngle += pct;
          return `
                    <circle cx="50" cy="50" r="45" fill="transparent"
                            stroke="${cat.color}" stroke-width="10"
                            stroke-dasharray="${dashArray}"
                            stroke-dashoffset="${dashOffset}"
                            style="transition: all 0.5s ease;"></circle>
                  `;
        }).join('');
      })()}
            </svg>
            <div style="position: absolute; text-align: center;">
              <span style="font-size: 0.72rem; color: var(--text-secondary); text-transform: uppercase; font-weight: 700;">Total</span>
              <div class="hide-val" style="font-weight: 800; font-size: 1.1rem; color: var(--text-primary);">${window.formatBRL(totalExpense)}</div>
            </div>
          </div>

          <div style="display: flex; flex-direction: column; gap: 8px; width: 100%;">
            ${catEntries.map(([catId, amount]) => {
        const cat = categories.find(c => c.id === catId) || { name: 'Outros', icon: 'package', color: '#007AFF' };
        const pct = Math.round((amount / (totalExpense || 1)) * 100);
        return `
                <div style="display: flex; align-items: center; justify-content: space-between; font-size: 0.85rem; background: var(--bg-input); padding: 10px 12px; border-radius: var(--radius-sm); border: 1px solid var(--border-color); gap: 10px;">
                  <div style="display: flex; align-items: center; gap: 10px; min-width: 0; flex: 1;">
                    <span style="width: 10px; height: 10px; border-radius: 50%; background-color: ${cat.color}; flex-shrink: 0;"></span>
                    <span style="font-weight: 700; display: flex; align-items: center; gap: 6px; white-space: normal; word-break: break-word; color: var(--text-primary);">
                      ${window.getSVGIcon(cat.icon, 16, 2)} ${cat.name}
                    </span>
                  </div>
                  <div style="display: flex; align-items: center; gap: 10px; flex-shrink: 0;">
                    <span class="hide-val" style="font-weight: 600; font-size: 0.8rem; color: var(--text-secondary); white-space: nowrap;">${window.formatBRL(amount)}</span>
                    <span style="font-weight: 800; font-size: 0.8rem; color: var(--text-primary); background: var(--bg-tertiary); padding: 3px 8px; border-radius: var(--radius-xs); white-space: nowrap;">${pct}%</span>
                  </div>
                </div>
              `;
      }).join('')}
          </div>
        </div>
      `}
    </div>

    <!-- Monthly Comparison SVG Bar Chart -->
    <div class="card">
      <div class="card-header">
        <div>
          <h3 class="card-title">
            ${window.getSVGIcon('trending-up', 18, 2)} Comparativo Semestral
          </h3>
          <span class="card-subtitle">Evolução dos últimos 6 meses</span>
        </div>
      </div>

      <div style="display: flex; gap: 16px; font-size: 0.78rem; font-weight: 700; margin-top: 6px;">
        <span style="display: flex; align-items: center; gap: 6px; color: var(--color-green);"><span style="width: 10px; height: 10px; background: var(--color-green); border-radius: 2px;"></span> Receitas</span>
        <span style="display: flex; align-items: center; gap: 6px; color: var(--color-red);"><span style="width: 10px; height: 10px; background: var(--color-red); border-radius: 2px;"></span> Despesas</span>
      </div>

      <div style="display: flex; align-items: flex-end; justify-content: space-between; height: 180px; margin-top: 15px; padding-top: 10px; border-bottom: 1px solid var(--border-color); gap: 8px;">
        ${last6Months.map(m => {
        const incHeight = Math.round((m.income / maxVal) * 140);
        const expHeight = Math.round((m.expense / maxVal) * 140);

        return `
            <div style="flex: 1; display: flex; flex-direction: column; align-items: center; gap: 6px; height: 100%; justify-content: flex-end;">
              <div style="display: flex; align-items: flex-end; gap: 3px; height: 140px;">
                <div style="width: 12px; height: ${Math.max(4, incHeight)}px; background: var(--color-green); border-radius: 3px 3px 0 0;" title="Receita: ${window.formatBRL(m.income)}"></div>
                <div style="width: 12px; height: ${Math.max(4, expHeight)}px; background: var(--color-red); border-radius: 3px 3px 0 0;" title="Despesa: ${window.formatBRL(m.expense)}"></div>
              </div>
              <span style="font-size: 0.72rem; font-weight: 700; color: var(--text-secondary);">${m.label}</span>
            </div>
          `;
      }).join('')}
      </div>
    </div>
  `;
}
