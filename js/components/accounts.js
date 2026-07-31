/**
 * FinançaOS — Carteira Component Renderer (Contas, Reservas e Cartões + Parcelas)
 */

window.currentAccountSubTab = 'checking';

window.renderAccounts = function (container) {
  const accounts = window.store.getAccounts();
  const bankAccounts = accounts.filter(a => a.type === 'checking');
  const savingsAccounts = accounts.filter(a => a.type === 'savings');
  const creditCards = accounts.filter(a => a.type === 'credit');

  // Sanitize subTab if previously set to an obsolete tab
  if (!['checking', 'savings', 'credit'].includes(window.currentAccountSubTab)) {
    window.currentAccountSubTab = 'checking';
  }

  const totalBankBalance = bankAccounts.reduce((acc, a) => acc + (Number(a.balance) || 0), 0);
  const totalSavings = savingsAccounts.reduce((acc, a) => acc + (Number(a.balance) || 0), 0);
  const totalCreditBalance = creditCards.reduce((acc, a) => acc + (Number(a.balance) || 0), 0);
  const totalCreditLimit = creditCards.reduce((acc, a) => acc + (Number(a.limit) || 0), 0);

  container.innerHTML = `
    <!-- Top Segmented Control for Contas, Reservas & Cartões de Crédito -->
    <div class="segmented-control">
      <button class="${window.currentAccountSubTab === 'checking' ? 'active' : ''}" onclick="window.switchAccountSubTab('checking')">Contas</button>
      <button class="${window.currentAccountSubTab === 'savings' ? 'active' : ''}" onclick="window.switchAccountSubTab('savings')">Reservas</button>
      <button class="${window.currentAccountSubTab === 'credit' ? 'active' : ''}" onclick="window.switchAccountSubTab('credit')">Cartões</button>
    </div>

    <div class="tab-sub-content">
      ${window.currentAccountSubTab === 'checking' ? renderCheckingSubTab(bankAccounts, totalBankBalance) : ''}
      ${window.currentAccountSubTab === 'savings' ? renderSavingsSubTab(savingsAccounts, totalSavings) : ''}
      ${window.currentAccountSubTab === 'credit' ? renderCreditSubTab(creditCards, totalCreditBalance, totalCreditLimit) : ''}
    </div>
  `;
};

window.switchAccountSubTab = function (subTab) {
  window.currentAccountSubTab = subTab;
  const container = document.getElementById('view-accounts');
  if (container) window.renderAccounts(container);
};

function renderCheckingSubTab(bankAccounts, totalBankBalance) {
  return `
    <!-- Accounts Overview Header -->
    <div class="card full-width-card">
      <div style="display: flex; flex-direction: column; gap: 12px;">
        <div style="display: flex; align-items: center; justify-content: space-between;">
          <div>
            <span class="card-subtitle">Saldo em Contas Bancárias</span>
            <div class="balance-amount" style="color: var(--color-blue); font-size: 1.8rem;">${window.formatBRL(totalBankBalance)}</div>
          </div>
        </div>

        <!-- Prominent Action Buttons Row -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 4px;">
          <button class="btn-primary" onclick="window.openAddAccountModal('checking')" style="padding: 10px 12px; font-size: 0.82rem; white-space: nowrap; display: flex; align-items: center; justify-content: center; gap: 6px;">
            ${window.getSVGIcon('bank', 16, 2)} Nova Conta
          </button>
          <button class="btn-secondary" onclick="window.openTransferModal()" style="padding: 10px 12px; font-size: 0.82rem; white-space: nowrap; color: var(--color-blue); background: var(--color-blue-light); border-color: transparent; display: flex; align-items: center; justify-content: center; gap: 6px;">
            ${window.getSVGIcon('repeat', 16, 2)} Transferir
          </button>
        </div>
      </div>
    </div>

    <!-- Bank Accounts Section -->
    <div class="card">
      <div class="card-header">
        <h3 class="card-title">
          ${window.getSVGIcon('bank', 18, 2)} Contas Bancárias (${bankAccounts.length})
        </h3>
        <button onclick="window.openAddAccountModal('checking')" style="background: none; border: none; color: var(--color-blue); font-weight: 700; font-size: 0.8rem; cursor: pointer;">
          + Adicionar
        </button>
      </div>

      <div style="display: flex; flex-direction: column; gap: 12px;">
        ${bankAccounts.length === 0 ? '<p style="color: var(--text-muted); font-size: 0.85rem; text-align: center; padding: 20px;">Nenhuma conta bancária cadastrada.</p>' : ''}
        ${bankAccounts.map(acc => `
          <div onclick="window.openEditAccountModal('${acc.id}')" title="Clique para editar ou excluir" style="display: flex; align-items: center; justify-content: space-between; padding: 14px; background: var(--bg-input); border-radius: var(--radius-sm); border: 1px solid var(--border-color); cursor: pointer;">
            <div style="display: flex; align-items: center; gap: 12px;">
              <div style="width: 42px; height: 42px; border-radius: var(--radius-sm); background-color: ${acc.color || '#007AFF'}22; color: ${acc.color || 'var(--color-blue)'}; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                ${window.getSVGIcon('wallet', 20, 2)}
              </div>
              <div>
                <div style="font-weight: 800; font-size: 0.95rem;">${acc.name}</div>
                <div style="font-size: 0.72rem; color: var(--text-secondary);">Conta Corrente</div>
              </div>
            </div>
            <div style="text-align: right;">
              <div class="hide-val" style="font-weight: 800; font-size: 1rem; color: ${acc.balance >= 0 ? 'var(--text-primary)' : 'var(--color-red)'}; white-space: nowrap;">
                ${window.formatBRL(acc.balance)}
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function renderSavingsSubTab(savingsAccounts, totalSavings) {
  return `
    <!-- Savings Overview Header -->
    <div class="card full-width-card">
      <div style="display: flex; flex-direction: column; gap: 12px;">
        <div style="display: flex; align-items: center; justify-content: space-between;">
          <div>
            <span class="card-subtitle">Total em Reservas</span>
            <div class="balance-amount" style="color: var(--color-green); font-size: 1.8rem;">${window.formatBRL(totalSavings)}</div>
          </div>
        </div>

        <!-- Prominent Action Buttons Row -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 4px;">
          <button class="btn-primary" onclick="window.openAddSavingsModal()" style="padding: 10px 12px; font-size: 0.82rem; white-space: nowrap; display: flex; align-items: center; justify-content: center; gap: 6px; background: linear-gradient(135deg, #30D158 0%, #1A8C3A 100%); border-color: rgba(48,209,88,0.5);">
            ${window.getSVGIcon('piggy-bank', 16, 2)} Nova Reserva
          </button>
          <button class="btn-secondary" onclick="window.openTransferModal()" style="padding: 10px 12px; font-size: 0.82rem; white-space: nowrap; color: var(--color-green); background: rgba(48,209,88,0.12); border-color: transparent; display: flex; align-items: center; justify-content: center; gap: 6px;">
            ${window.getSVGIcon('repeat', 16, 2)} Transferir
          </button>
        </div>
      </div>
    </div>

    <!-- Savings Section -->
    <div class="card">
      <div class="card-header">
        <h3 class="card-title">
          ${window.getSVGIcon('piggy-bank', 18, 2)} Reservas Financeiras (${savingsAccounts.length})
        </h3>
        <button onclick="window.openAddSavingsModal()" style="background: none; border: none; color: var(--color-green); font-weight: 700; font-size: 0.8rem; cursor: pointer;">
          + Adicionar
        </button>
      </div>

      <div style="display: flex; flex-direction: column; gap: 12px;">
        ${savingsAccounts.length === 0 ? '<p style="color: var(--text-muted); font-size: 0.85rem; text-align: center; padding: 20px;">Nenhuma reserva cadastrada.</p>' : ''}
        ${savingsAccounts.map(acc => `
          <div onclick="window.openEditAccountModal('${acc.id}')" title="Clique para editar ou excluir" style="display: flex; align-items: center; justify-content: space-between; padding: 14px; background: var(--bg-input); border-radius: var(--radius-sm); border: 1px solid rgba(48,209,88,0.2); cursor: pointer;">
            <div style="display: flex; align-items: center; gap: 12px;">
              <div style="width: 42px; height: 42px; border-radius: var(--radius-sm); background-color: rgba(48,209,88,0.12); color: var(--color-green); display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                ${window.getSVGIcon('piggy-bank', 20, 2)}
              </div>
              <div>
                <div style="font-weight: 800; font-size: 0.95rem;">${acc.name}</div>
                <div style="font-size: 0.72rem; color: var(--text-secondary);">Reserva</div>
              </div>
            </div>
            <div style="text-align: right;">
              <div class="hide-val" style="font-weight: 800; font-size: 1rem; color: var(--color-green); white-space: nowrap;">
                ${window.formatBRL(acc.balance)}
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function renderCreditSubTab(creditCards, totalCreditBalance, totalCreditLimit) {
  const availableLimit = totalCreditLimit - totalCreditBalance;
  return `
    <!-- Credit Cards Overview Header -->
    <div class="card full-width-card">
      <div style="display: flex; flex-direction: column; gap: 12px;">
        <div style="display: flex; align-items: center; justify-content: space-between;">
          <div>
            <span class="card-subtitle">Faturas Totais dos Cartões</span>
            <div class="balance-amount" style="color: var(--color-red); font-size: 1.8rem;">${window.formatBRL(totalCreditBalance)}</div>
          </div>
          <div style="text-align: right;">
            <span class="card-subtitle">Limite Disponível</span>
            <div class="hide-val" style="font-size: 1.2rem; font-weight: 800; color: var(--text-primary);">${window.formatBRL(availableLimit)}</div>
          </div>
        </div>

        <!-- Prominent Action Buttons Row -->
        <div style="display: grid; grid-template-columns: 1fr; margin-top: 4px;">
          <button class="btn-primary" onclick="window.openAddCardModal()" style="padding: 10px 12px; font-size: 0.82rem; white-space: nowrap; display: flex; align-items: center; justify-content: center; gap: 6px; background: linear-gradient(135deg, #BF5AF2 0%, #8E24AA 100%); border-color: rgba(191,90,242,0.5);">
            ${window.getSVGIcon('credit-card', 16, 2)} Novo Cartão de Crédito
          </button>
        </div>
      </div>
    </div>

    <!-- Credit Cards Section -->
    <div class="card">
      <div class="card-header">
        <h3 class="card-title">
          ${window.getSVGIcon('credit-card', 18, 2)} Cartões de Crédito (${creditCards.length})
        </h3>
        <button onclick="window.openAddCardModal()" style="background: none; border: none; color: var(--color-purple); font-weight: 700; font-size: 0.8rem; cursor: pointer;">
          + Adicionar
        </button>
      </div>

      <div style="display: flex; flex-direction: column; gap: 16px;">
        ${creditCards.length === 0 ? '<p style="color: var(--text-muted); font-size: 0.85rem; text-align: center; padding: 20px;">Nenhum cartão cadastrado.</p>' : ''}
        ${creditCards.map(card => {
          const usedPct = card.limit > 0 ? Math.min(100, Math.round((card.balance / card.limit) * 100)) : 0;
          return `
            <div onclick="window.openEditAccountModal('${card.id}')" title="Clique para editar ou excluir" style="padding: 16px; background: linear-gradient(135deg, ${card.color || '#BF5AF2'}15 0%, var(--bg-input) 100%); border-radius: var(--radius-md); border: 1px solid ${card.color || '#BF5AF2'}44; cursor: pointer;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                <div>
                  <span style="font-size: 1rem; font-weight: 800;">${card.name}</span>
                  <div style="font-size: 0.75rem; color: var(--text-secondary); margin-top: 2px;">
                    Fechamento: dia <strong>${card.closingDay || 5}</strong> • Vencimento: dia <strong>${card.dueDay || 12}</strong>
                  </div>
                </div>
                <div style="text-align: right;">
                  <div style="font-size: 0.72rem; color: var(--text-secondary); text-transform: uppercase; font-weight: 700;">Fatura Atual</div>
                  <div class="hide-val" style="font-size: 1.1rem; font-weight: 800; color: var(--color-red); white-space: nowrap;">${window.formatBRL(card.balance)}</div>
                </div>
              </div>

              <div>
                <div style="display: flex; justify-content: space-between; font-size: 0.75rem; font-weight: 600; margin-bottom: 4px; color: var(--text-secondary);">
                  <span>Limite Utilizado (${usedPct}%)</span>
                  <span class="hide-val" style="white-space: nowrap;">Disponível: ${window.formatBRL(card.limit - card.balance)}</span>
                </div>
                <div class="progress-bar-container">
                  <div class="progress-bar-fill" style="width: ${usedPct}%; background-color: ${usedPct > 80 ? 'var(--color-red)' : (card.color || 'var(--color-purple)')};"></div>
                </div>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </div>

    <!-- Installment Purchases Analytics Cards Moved to Credit Cards Sub-tab -->
    ${renderInstallmentsAnalyticsHTML()}
  `;
}

function renderInstallmentsAnalyticsHTML() {
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

  return `
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
          <div class="hide-val" style="font-size: 1.3rem; font-weight: 800; color: var(--color-orange); margin-top: 2px;">${window.formatBRL(totalMonthlyCommitment)}</div>
        </div>

        <div style="background: var(--bg-input); padding: 14px; border-radius: var(--radius-sm); border: 1px solid var(--border-color);">
          <div style="font-size: 0.72rem; color: var(--text-secondary); text-transform: uppercase; font-weight: 700;">Total a Quitar</div>
          <div class="hide-val" style="font-size: 1.3rem; font-weight: 800; color: var(--color-purple); margin-top: 2px;">${window.formatBRL(totalFutureRemaining)}</div>
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
                  <div class="hide-val" style="font-weight: 800; font-size: 1rem; color: var(--color-blue);">${window.formatBRL(g.perInstallment)}/mês</div>
                  <div class="hide-val" style="font-size: 0.72rem; color: var(--text-muted);">Total: ${window.formatBRL(g.totalPurchase)}</div>
                </div>
              </div>

              <div class="progress-bar-container">
                <div class="progress-bar-fill" style="width: ${pct}%; background-color: var(--color-blue);"></div>
              </div>

              <div style="display: flex; justify-content: space-between; font-size: 0.75rem; color: var(--text-secondary); margin-top: 6px; font-weight: 600;">
                <span>Progresso: ${g.pastPaidCount} de ${g.totalCount} parcelas (${pct}%)</span>
                <span class="hide-val">Restam: ${window.formatBRL(g.remainingAmount)}</span>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;
}
