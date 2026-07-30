/**
 * FinançaOS — Interactive Reports, Budgets, Goals & Installments Analytics Component Renderer
 */

window.currentPlanningSubTab = 'charts';

window.renderReports = function (container) {
  container.innerHTML = `
    <!-- Top Segmented Control for Planning & Analytics Sub-tabs -->
    <div class="segmented-control">
      <button class="${window.currentPlanningSubTab === 'charts' ? 'active' : ''}" onclick="window.switchPlanningSubTab('charts')">Gráficos</button>
      <button class="${window.currentPlanningSubTab === 'budgets' ? 'active' : ''}" onclick="window.switchPlanningSubTab('budgets')">Orçamentos</button>
      <button class="${window.currentPlanningSubTab === 'goals' ? 'active' : ''}" onclick="window.switchPlanningSubTab('goals')">Metas</button>
      <button class="${window.currentPlanningSubTab === 'installments' ? 'active' : ''}" onclick="window.switchPlanningSubTab('installments')">Parcelas</button>
    </div>

    <div id="planning-sub-content" class="tab-sub-content">
    </div>
  `;

  const subContent = document.getElementById('planning-sub-content');
  if (!subContent) return;

  if (window.currentPlanningSubTab === 'charts') {
    renderChartsContent(subContent);
  } else if (window.currentPlanningSubTab === 'budgets') {
    renderBudgetsOnlyContent(subContent);
  } else if (window.currentPlanningSubTab === 'goals') {
    renderGoalsOnlyContent(subContent);
  } else if (window.currentPlanningSubTab === 'installments') {
    renderInstallmentsAnalyticsContent(subContent);
  }
};

window.switchPlanningSubTab = function (subTab) {
  window.currentPlanningSubTab = subTab;
  const container = document.getElementById('view-reports');
  if (container) window.renderReports(container);
};

function renderChartsContent(container) {
  const categories = window.store.getCategories();
  const allTxs = window.store.getTransactions();

  const now = new Date();
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

  container.innerHTML = `
    <!-- Category Distribution SVG Donut Chart -->
    <div class="card">
      <div class="card-header">
        <div>
          <h3 class="card-title">
            ${window.getSVGIcon('target', 18, 2)} Gastos por Categoria
          </h3>
          <span class="card-subtitle">Mês Atual: ${window.formatBRL(totalExpense)}</span>
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
              <div style="font-weight: 800; font-size: 1.1rem; color: var(--text-primary);">${window.formatBRL(totalExpense)}</div>
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
                    <span style="font-weight: 600; font-size: 0.8rem; color: var(--text-secondary); white-space: nowrap;">${window.formatBRL(amount)}</span>
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
                <span style="font-size: 1.15rem; font-weight: 800; color: ${pct >= 100 ? 'var(--color-red)' : 'var(--text-primary)'}; white-space: nowrap;">
                  ${window.formatBRL(spent)}
                </span>
                <span style="font-size: 0.8rem; font-weight: 600; color: var(--text-muted); white-space: nowrap;">
                  Meta: ${window.formatBRL(limit)}
                </span>
              </div>

              <div class="progress-bar-container" style="height: 8px;">
                <div class="progress-bar-fill" style="width: ${pct}%; background-color: ${barColor};"></div>
              </div>

              <div style="text-align: right; font-size: 0.78rem; color: var(--text-secondary); font-weight: 600;">
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
                <span style="font-size: 1.15rem; font-weight: 800; color: var(--color-green); white-space: nowrap;">
                  ${window.formatBRL(current)}
                </span>
                <span style="font-size: 0.8rem; font-weight: 600; color: var(--text-muted); white-space: nowrap;">
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

function renderInstallmentsAnalyticsContent(container) {
  const allTxs = window.store.getTransactions();
  const accounts = window.store.getAccounts();

  const installmentTxs = allTxs.filter(t => t.installmentGroup && t.installmentTotal > 1);

  const groups = {};
  installmentTxs.forEach(t => {
    if (!groups[t.installmentGroup]) {
      groups[t.installmentGroup] = [];
    }
    groups[t.installmentGroup].push(t);
  });

  const activeGroupList = Object.entries(groups).map(([grpId, txList]) => {
    txList.sort((a, b) => a.installmentCurrent - b.installmentCurrent);
    const first = txList[0];
    const totalCount = first.installmentTotal;
    const perInstallment = first.amount;
    const totalPurchase = first.totalPurchaseAmount || (perInstallment * totalCount);
    const rawNote = first.note.replace(/\s*\(\d+\/\d+\)/, '');

    const todayStr = new Date().toISOString().split('T')[0];
    const pastPaidCount = txList.filter(t => t.date <= todayStr).length;
    const remainingCount = totalCount - pastPaidCount;
    const remainingAmount = remainingCount * perInstallment;

    const acc = accounts.find(a => a.id === first.accountId) || { name: 'Cartão / Conta' };

    return {
      grpId,
      title: rawNote,
      totalCount,
      pastPaidCount,
      remainingCount,
      perInstallment,
      totalPurchase,
      remainingAmount,
      accountName: acc.name,
      endDate: txList[txList.length - 1].date
    };
  });

  const totalMonthlyCommitment = activeGroupList.reduce((acc, g) => acc + (g.remainingCount > 0 ? g.perInstallment : 0), 0);
  const totalFutureRemaining = activeGroupList.reduce((acc, g) => acc + g.remainingAmount, 0);

  container.innerHTML = `
    <!-- Installments Header Card -->
    <div class="card">
      <div class="card-header">
        <div>
          <h3 class="card-title">
            ${window.getSVGIcon('credit-card', 18, 2)} Análise de Compras Parceladas
          </h3>
          <span class="card-subtitle">Comprometimento de Faturas Futuras</span>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 6px;">
        <div style="background: var(--bg-input); padding: 14px; border-radius: var(--radius-sm); border: 1px solid var(--border-color);">
          <div style="font-size: 0.72rem; color: var(--text-secondary); text-transform: uppercase; font-weight: 700;">Comprometido/Mês</div>
          <div style="font-size: 1.3rem; font-weight: 800; color: var(--color-orange); margin-top: 2px;">${window.formatBRL(totalMonthlyCommitment)}</div>
        </div>

        <div style="background: var(--bg-input); padding: 14px; border-radius: var(--radius-sm); border: 1px solid var(--border-color);">
          <div style="font-size: 0.72rem; color: var(--text-secondary); text-transform: uppercase; font-weight: 700;">Total a Quitar</div>
          <div style="font-size: 1.3rem; font-weight: 800; color: var(--color-purple); margin-top: 2px;">${window.formatBRL(totalFutureRemaining)}</div>
        </div>
      </div>
    </div>

    <!-- Active Installment Purchases List -->
    <div class="card">
      <div class="card-header">
        <h3 class="card-title">
          ${window.getSVGIcon('shopping-bag', 18, 2)} Compras Parceladas Ativas (${activeGroupList.length})
        </h3>
      </div>

      <div class="grid-cards-container">
        ${activeGroupList.length === 0 ? '<p style="color: var(--text-muted); font-size: 0.85rem; text-align: center; padding: 20px;">Nenhuma compra parcelada registrada.</p>' : ''}
        ${activeGroupList.map(g => {
    const pct = Math.round((g.pastPaidCount / g.totalCount) * 100);
    return `
            <div style="padding: 14px; background: var(--bg-input); border-radius: var(--radius-sm); border: 1px solid var(--border-color);">
              <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
                <div>
                  <div style="font-weight: 800; font-size: 0.95rem;">${g.title}</div>
                  <div style="font-size: 0.75rem; color: var(--text-secondary); margin-top: 2px;">
                    ${g.accountName} • Quitação em ${window.formatDateBR(g.endDate)}
                  </div>
                </div>
                <div style="text-align: right;">
                  <div style="font-weight: 800; font-size: 1rem; color: var(--color-blue);">${window.formatBRL(g.perInstallment)}/mês</div>
                  <div style="font-size: 0.72rem; color: var(--text-muted);">Total: ${window.formatBRL(g.totalPurchase)}</div>
                </div>
              </div>

              <div class="progress-bar-container">
                <div class="progress-bar-fill" style="width: ${pct}%; background-color: var(--color-blue);"></div>
              </div>

              <div style="display: flex; justify-content: space-between; font-size: 0.75rem; color: var(--text-secondary); margin-top: 6px; font-weight: 600;">
                <span>Progresso: ${g.pastPaidCount} de ${g.totalCount} parcelas (${pct}%)</span>
                <span>Restam: ${window.formatBRL(g.remainingAmount)}</span>
              </div>
            </div>
          `;
  }).join('')}
      </div>
    </div>
  `;
}
