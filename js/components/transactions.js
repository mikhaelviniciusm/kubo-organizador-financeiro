/**
 * FinançaOS — Transactions Component Renderer with Edit Modal Trigger
 */

window.currentTxFilter = {
  type: 'all',
  search: '',
  year: new Date().getFullYear(),
  month: new Date().getMonth() + 1
};

window.renderTransactions = function (container) {
  const categories = window.store.getCategories();
  const allTxs = window.store.getTransactions();

  const prefix = `${window.currentTxFilter.year}-${String(window.currentTxFilter.month).padStart(2, '0')}`;
  let filtered = allTxs.filter(t => t.date && t.date.startsWith(prefix));

  if (window.currentTxFilter.type !== 'all') {
    filtered = filtered.filter(t => t.type === window.currentTxFilter.type);
  }

  if (window.currentTxFilter.search.trim()) {
    const q = window.currentTxFilter.search.toLowerCase();
    filtered = filtered.filter(t => {
      const cat = categories.find(c => c.id === t.categoryId);
      const catName = cat ? cat.name.toLowerCase() : '';
      const note = (t.note || '').toLowerCase();
      const method = (t.paymentMethod || '').toLowerCase();
      return note.includes(q) || catName.includes(q) || method.includes(q);
    });
  }

  const groups = {};
  filtered.forEach(t => {
    if (!groups[t.date]) groups[t.date] = [];
    groups[t.date].push(t);
  });

  const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
  const monthLabel = `${monthNames[window.currentTxFilter.month - 1]} ${window.currentTxFilter.year}`;

  container.innerHTML = `
    <!-- Header & Month Navigator -->
    <div class="card">
      <div style="display: flex; align-items: center; justify-content: space-between;">
        <button class="icon-btn" onclick="window.changeTxMonth(-1)" title="Mês anterior" style="width: 44px; height: 44px;">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
        </button>
        <h2 style="font-size: 1.1rem; font-weight: 800;">${monthLabel}</h2>
        <button class="icon-btn" onclick="window.changeTxMonth(1)" title="Mês seguinte" style="width: 44px; height: 44px;">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
        </button>
      </div>

      <!-- Search Input -->
      <div class="form-group" style="margin-bottom: 0;">
        <input type="text" id="tx-search-input" class="form-input" placeholder="Buscar por descrição, categoria..." value="${window.currentTxFilter.search}">
      </div>

      <!-- Type Filter Segmented Control -->
      <div class="segmented-control">
        <button class="${window.currentTxFilter.type === 'all' ? 'active' : ''}" onclick="window.setTxTypeFilter('all')">Todas</button>
        <button class="${window.currentTxFilter.type === 'expense' ? 'active' : ''}" onclick="window.setTxTypeFilter('expense')">Despesas</button>
        <button class="${window.currentTxFilter.type === 'income' ? 'active' : ''}" onclick="window.setTxTypeFilter('income')">Receitas</button>
      </div>
    </div>

    <!-- Transaction Groups by Date -->
    <div class="transaction-list">
      ${Object.keys(groups).length === 0 ? `
        <div class="card" style="text-align: center; padding: 40px 20px;">
          <div style="display: flex; justify-content: center; color: var(--text-muted); margin-bottom: 10px;">
            ${window.getSVGIcon('file-text', 40, 1.5)}
          </div>
          <p style="color: var(--text-secondary); font-weight: 600;">Nenhuma transação encontrada para o período.</p>
          <button class="btn-primary" onclick="window.openAddTransactionModal()" style="margin-top: 15px; width: auto; align-self: center;">Adicionar Transação</button>
        </div>
      ` : ''}

      ${Object.keys(groups).sort((a, b) => b.localeCompare(a)).map(dateStr => {
    const txList = groups[dateStr];
    const daySum = txList.reduce((acc, t) => {
      if (t.type === 'income') return acc + t.amount;
      if (t.type === 'expense') return acc - t.amount;
      return acc;
    }, 0);

    return `
          <div class="date-group-header">
            <span>${window.formatDateBR(dateStr)}</span>
            <span style="color: ${daySum >= 0 ? 'var(--color-green)' : 'var(--color-red)'}; font-weight: 700;">
              ${daySum >= 0 ? '+' : ''}${window.formatBRL(daySum)}
            </span>
          </div>

          ${txList.map(t => {
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
                    <span class="t-meta">${t.paymentMethod || 'Geral'}</span>
                  </div>
                </div>
                <div class="t-right">
                  <span class="t-amount ${amountClass}">${sign}${window.formatBRL(t.amount)}</span>
                  <span class="t-method" style="color: var(--text-muted);">${cat.name}</span>
                </div>
              </div>
            `;
    }).join('')}
        `;
  }).join('')}
    </div>
  `;

  const searchInput = document.getElementById('tx-search-input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      window.currentTxFilter.search = e.target.value;
      window.renderTransactions(container);
    });
  }
};

window.changeTxMonth = function (delta) {
  let m = window.currentTxFilter.month + delta;
  let y = window.currentTxFilter.year;
  if (m > 12) { m = 1; y++; }
  if (m < 1) { m = 12; y--; }
  window.currentTxFilter.month = m;
  window.currentTxFilter.year = y;
  const container = document.getElementById('view-transactions');
  if (container) window.renderTransactions(container);
};

window.setTxTypeFilter = function (type) {
  window.currentTxFilter.type = type;
  const container = document.getElementById('view-transactions');
  if (container) window.renderTransactions(container);
};

window.goToTransactionsFiltered = function (type) {
  window.currentTxFilter.type = type;
  window.switchTab('view-transactions');
};
