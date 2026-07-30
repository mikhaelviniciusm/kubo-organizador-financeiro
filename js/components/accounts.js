/**
 * FinançaOS — Carteira Component Renderer with Proper 20px Card Spacing
 */

window.currentAccountSubTab = 'accounts';

window.renderAccounts = function (container) {
  const accounts = window.store.getAccounts();
  const bankAccounts = accounts.filter(a => a.type !== 'credit');
  const creditCards = accounts.filter(a => a.type === 'credit');

  const totalBankBalance = bankAccounts.reduce((acc, a) => acc + (Number(a.balance) || 0), 0);

  container.innerHTML = `
    <!-- Top Segmented Control -->
    <div class="segmented-control">
      <button class="${window.currentAccountSubTab === 'accounts' ? 'active' : ''}" onclick="window.switchAccountSubTab('accounts')">Contas & Cartões</button>
      <button class="${window.currentAccountSubTab === 'bills' ? 'active' : ''}" onclick="window.switchAccountSubTab('bills')">Contas a Pagar</button>
    </div>

    ${window.currentAccountSubTab === 'bills' ? `
      <div id="sub-view-bills" class="tab-sub-content"></div>
    ` : `
      <div class="tab-sub-content">
        <!-- Accounts Overview Header -->
        <div class="card full-width-card">
          <div style="display: flex; flex-direction: column; gap: 12px;">
            <div style="display: flex; align-items: center; justify-content: space-between;">
              <div>
                <span class="card-subtitle">Saldo em Contas Bancárias</span>
                <div class="balance-amount" style="color: var(--color-green); font-size: 1.8rem;">${window.formatBRL(totalBankBalance)}</div>
              </div>
            </div>

            <!-- Prominent Action Buttons Row -->
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 4px;">
              <button class="btn-primary" onclick="window.openAddAccountModal()" style="padding: 10px 12px; font-size: 0.82rem; white-space: nowrap; display: flex; align-items: center; justify-content: center; gap: 6px;">
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
              ${window.getSVGIcon('bank', 18, 2)} Minhas Contas & Carteiras
            </h3>
          </div>

          <div style="display: flex; flex-direction: column; gap: 12px;">
            ${bankAccounts.map(acc => {
              const iconName = acc.type === 'savings' ? 'piggy-bank' : 'wallet';
              return `
                <div onclick="window.openEditAccountModal('${acc.id}')" title="Clique para editar ou excluir" style="display: flex; align-items: center; justify-content: space-between; padding: 14px; background: var(--bg-input); border-radius: var(--radius-sm); border: 1px solid var(--border-color); cursor: pointer;">
                  <div style="display: flex; align-items: center; gap: 12px;">
                    <div style="width: 42px; height: 42px; border-radius: var(--radius-sm); background-color: ${acc.color}22; color: ${acc.color}; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                      ${window.getSVGIcon(iconName, 20, 2)}
                    </div>
                    <div>
                      <div style="font-weight: 800; font-size: 0.95rem;">${acc.name}</div>
                      <div style="font-size: 0.75rem; color: var(--text-secondary);">${acc.bank || 'Banco'}</div>
                    </div>
                  </div>
                  <div style="text-align: right;">
                    <div style="font-weight: 800; font-size: 1rem; color: ${acc.balance >= 0 ? 'var(--text-primary)' : 'var(--color-red)'}; white-space: nowrap;">
                      ${window.formatBRL(acc.balance)}
                    </div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <!-- Credit Cards Section -->
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">
              ${window.getSVGIcon('credit-card', 18, 2)} Cartões de Crédito
            </h3>
          </div>

          <div style="display: flex; flex-direction: column; gap: 16px;">
            ${creditCards.length === 0 ? '<p style="color: var(--text-muted); font-size: 0.85rem; text-align: center; padding: 10px;">Nenhum cartão cadastrado.</p>' : ''}
            ${creditCards.map(card => {
              const usedPct = card.limit > 0 ? Math.min(100, Math.round((card.balance / card.limit) * 100)) : 0;
              return `
                <div onclick="window.openEditAccountModal('${card.id}')" title="Clique para editar ou excluir" style="padding: 16px; background: linear-gradient(135deg, ${card.color}15 0%, var(--bg-input) 100%); border-radius: var(--radius-md); border: 1px solid ${card.color}44; cursor: pointer;">
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                    <div>
                      <span style="font-size: 1rem; font-weight: 800;">${card.name} (${card.bank || 'Banco'})</span>
                      <div style="font-size: 0.75rem; color: var(--text-secondary); margin-top: 2px;">
                        Fechamento: dia <strong>${card.closingDay || 5}</strong> • Vencimento: dia <strong>${card.dueDay || 12}</strong>
                      </div>
                    </div>
                    <div style="text-align: right;">
                      <div style="font-size: 0.72rem; color: var(--text-secondary); text-transform: uppercase; font-weight: 700;">Fatura Atual</div>
                      <div style="font-size: 1.1rem; font-weight: 800; color: var(--color-red); white-space: nowrap;">${window.formatBRL(card.balance)}</div>
                    </div>
                  </div>

                  <div>
                    <div style="display: flex; justify-content: space-between; font-size: 0.75rem; font-weight: 600; margin-bottom: 4px; color: var(--text-secondary);">
                      <span>Limite Utilizado (${usedPct}%)</span>
                      <span style="white-space: nowrap;">Disponível: ${window.formatBRL(card.limit - card.balance)}</span>
                    </div>
                    <div class="progress-bar-container">
                      <div class="progress-bar-fill" style="width: ${usedPct}%; background-color: ${usedPct > 80 ? 'var(--color-red)' : card.color};"></div>
                    </div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      </div>
    `}
  `;

  if (window.currentAccountSubTab === 'bills') {
    const billsContainer = document.getElementById('sub-view-bills');
    if (billsContainer && window.renderBills) {
      window.renderBills(billsContainer);
    }
  }
};

window.switchAccountSubTab = function (subTab) {
  window.currentAccountSubTab = subTab;
  const container = document.getElementById('view-accounts');
  if (container) window.renderAccounts(container);
};
