/**
 * FinançaOS — Main Application Orchestrator with Goal Withdrawal Modal
 */

document.addEventListener('DOMContentLoaded', () => {
  // Prevent Pinch Zoom & Double-Tap Zoom on iOS / Android
  document.addEventListener('gesturestart', (e) => e.preventDefault());
  document.addEventListener('gesturechange', (e) => e.preventDefault());
  document.addEventListener('gestureend', (e) => e.preventDefault());

  initTheme();
  initPinLock();
  initTabNavigation();
  updateLockBtnVisibility();

  const fab = document.getElementById('fab-add-transaction');
  if (fab) {
    fab.addEventListener('click', () => window.openAddTransactionModal('expense'));
  }

  const themeBtn = document.getElementById('theme-toggle');
  if (themeBtn) {
    themeBtn.addEventListener('click', toggleTheme);
  }

  const lockBtn = document.getElementById('btn-lock-app');
  if (lockBtn) {
    lockBtn.addEventListener('click', () => {
      const security = window.store.data.security;
      if (security && security.isPinEnabled && security.pinCode) {
        showPinScreen();
      }
    });
  }

  const modalCloseBtn = document.getElementById('modal-close-btn');
  const modalOverlay = document.getElementById('modal-container');
  if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeModal);
  if (modalOverlay) {
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) closeModal();
    });
  }
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeModal();
    }
  });

  window.store.subscribe(() => {
    updateLockBtnVisibility();
    const activeTab = document.querySelector('.tab-item.active');
    if (activeTab) {
      const targetId = activeTab.getAttribute('data-target');
      renderView(targetId);
    }
  });

  renderView('view-dashboard');
});

window.updateLockBtnVisibility = function () {
  const lockBtn = document.getElementById('btn-lock-app');
  const themeBtn = document.getElementById('theme-toggle');
  if (!lockBtn || !themeBtn) return;

  const security = window.store.data.security;
  if (security && security.isPinEnabled && security.pinCode) {
    lockBtn.style.display = 'flex';
    themeBtn.style.display = 'none';
  } else {
    lockBtn.style.display = 'none';
    themeBtn.style.display = 'flex';
  }
};

window.setAppTheme = function (theme) {
  document.documentElement.setAttribute('data-theme', theme);
  window.store.data.theme = theme;
  window.store.save();
  window.showToast(`Tema ${theme === 'dark' ? 'Escuro' : 'Claro'} ativado!`);
  const container = document.getElementById('view-tools');
  if (container && window.renderTools) window.renderTools(container);
};

function initTabNavigation() {
  const tabs = document.querySelectorAll('.tab-item');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const targetId = tab.getAttribute('data-target');
      window.switchTab(targetId);
      updateTabIndicator(tab);
    });
  });

  // Set initial indicator position after DOM is ready
  requestAnimationFrame(() => {
    const activeTab = document.querySelector('.tab-item.active');
    if (activeTab) updateTabIndicator(activeTab, false);
  });
}

function updateTabIndicator(activeTab, animate = true) {
  const indicator = document.getElementById('tab-active-indicator');
  const nav = document.getElementById('ios-tab-bar');
  if (!indicator || !nav || !activeTab) return;

  const navRect = nav.getBoundingClientRect();
  const tabRect = activeTab.getBoundingClientRect();

  const leftOffset = tabRect.left - navRect.left;
  const width = tabRect.width;

  if (!animate) {
    indicator.style.transition = 'none';
    indicator.style.left = `${leftOffset}px`;
    indicator.style.width = `${width}px`;
    // Re-enable transition on next frame
    requestAnimationFrame(() => {
      indicator.style.transition = '';
    });
  } else {
    indicator.style.left = `${leftOffset}px`;
    indicator.style.width = `${width}px`;
  }
}

window.switchTab = function (targetId) {
  const views = document.querySelectorAll('.tab-view');
  views.forEach(v => {
    if (v.id === targetId) {
      v.classList.remove('hidden');
      v.classList.add('active');
    } else {
      v.classList.add('hidden');
      v.classList.remove('active');
    }
  });

  const tabs = document.querySelectorAll('.tab-item');
  let activeTabEl = null;
  tabs.forEach(t => {
    if (t.getAttribute('data-target') === targetId) {
      t.classList.add('active');
      activeTabEl = t;
    } else {
      t.classList.remove('active');
    }
  });

  if (activeTabEl) {
    updateTabIndicator(activeTabEl, true);
  }

  renderView(targetId);
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

function renderView(targetId) {
  const container = document.getElementById(targetId);
  if (!container) return;

  switch (targetId) {
    case 'view-dashboard':
      if (window.renderDashboard) window.renderDashboard(container);
      break;
    case 'view-transactions':
      if (window.renderTransactions) window.renderTransactions(container);
      break;
    case 'view-accounts':
      if (window.renderAccounts) window.renderAccounts(container);
      break;
    case 'view-reports':
      if (window.renderReports) window.renderReports(container);
      break;
    case 'view-tools':
      if (window.renderTools) window.renderTools(container);
      break;
  }
}

function getSystemPreferredTheme() {
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
    return 'light';
  }
  return 'dark';
}

function initTheme() {
  const userChoice = window.store.data.theme;
  const activeTheme = userChoice || getSystemPreferredTheme();
  document.documentElement.setAttribute('data-theme', activeTheme);

  // Auto update when device OS theme changes (e.g. sunset/sunrise or system settings)
  if (window.matchMedia) {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (!window.store.data.theme) {
        const newTheme = e.matches ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', newTheme);
      }
    });
  }
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme');
  const next = current === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  window.store.data.theme = next;
  window.store.save();
}

window.showToast = function (message, type = 'success') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const iconSvg = type === 'success' ? window.getSVGIcon('check-circle', 16, 2) : (type === 'error' ? window.getSVGIcon('alert-triangle', 16, 2) : window.getSVGIcon('file-text', 16, 2));

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <span>${iconSvg}</span>
    <span>${message}</span>
  `;

  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(-10px)';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
};

function openModal(title, contentHtml) {
  const container = document.getElementById('modal-container');
  const titleEl = document.getElementById('modal-title');
  const bodyEl = document.getElementById('modal-body');

  titleEl.innerText = title;
  bodyEl.innerHTML = contentHtml;
  container.classList.remove('hidden');
  document.body.classList.add('modal-open');

  const maskInputs = bodyEl.querySelectorAll('[data-currency-input]');
  maskInputs.forEach(input => window.applyCurrencyMask(input));
}
window.openModal = openModal;

function closeModal() {
  const container = document.getElementById('modal-container');
  container.classList.add('hidden');
  document.body.classList.remove('modal-open');
}
window.closeModal = closeModal;

function renderDayPickerOptions(selectedDay = 5) {
  let options = '';
  for (let i = 1; i <= 31; i++) {
    options += `<option value="${i}" ${Number(i) === Number(selectedDay) ? 'selected' : ''}>${i}</option>`;
  }
  return options;
}

function renderAllInstallmentOptions() {
  let options = '<option value="1">À Vista (1x)</option>';
  for (let i = 2; i <= 24; i++) {
    options += `<option value="${i}">${i}x</option>`;
  }
  return options;
}

// --- Modal: Add Transaction ---
window.openAddTransactionModal = function (defaultType = 'expense') {
  const categories = window.store.getCategories();
  const accounts = window.store.getAccounts();
  const today = new Date().toISOString().split('T')[0];

  const html = `
    <form id="tx-form" onsubmit="window.handleSaveTransaction(event)">
      <div class="segmented-control" style="margin-bottom: 14px;">
        <button type="button" id="type-btn-expense" class="${defaultType === 'expense' ? 'active' : ''}" onclick="window.setModalTxType('expense')">Despesa</button>
        <button type="button" id="type-btn-income" class="${defaultType === 'income' ? 'active' : ''}" onclick="window.setModalTxType('income')">Receita</button>
      </div>
      <input type="hidden" id="modal-tx-type" value="${defaultType}">

      <div class="form-group">
        <label>Valor Total (R$)</label>
        <input type="text" inputmode="numeric" id="tx-amount" data-currency-input class="form-input" placeholder="0,00" required oninput="window.updateInstallmentPreview()" style="font-size: 1.4rem; font-weight: 800; color: var(--color-blue);">
      </div>

      <div class="form-group">
        <label>Descrição / Nota</label>
        <input type="text" id="tx-note" class="form-input" placeholder="Ex: Almoço, Smartphone, Uber..." required>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
        <div class="form-group">
          <label>Categoria</label>
          <select id="tx-category" class="form-select" required>
            ${categories.map(c => `<option value="${c.id}">${c.name}</option>`).join('')}
          </select>
        </div>

        <div class="form-group">
          <label>Conta / Cartão</label>
          <select id="tx-account" class="form-select" onchange="window.onAccountChange('tx-account', 'tx-method')" required>
            ${accounts.map(a => `<option value="${a.id}">${a.name}</option>`).join('')}
          </select>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
        <div class="form-group">
          <label>Forma de Pagamento</label>
          <select id="tx-method" class="form-select" onchange="window.toggleInstallmentsVisibility()">
            <option value="Pix">Pix</option>
            <option value="Débito">Débito</option>
            <option value="Crédito">Crédito</option>
            <option value="Dinheiro">Dinheiro</option>
            <option value="Transferência">Transferência</option>
          </select>
        </div>

        <div class="form-group">
          <label>Data</label>
          <input type="date" id="tx-date" class="form-input" value="${today}" required>
        </div>
      </div>

      <!-- Installments Container -->
      <div id="installments-box-container" style="display: none; background: var(--bg-input); padding: 12px; border-radius: var(--radius-sm); margin-top: 10px; border: 1px solid var(--border-color);">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <label style="font-weight: 700; font-size: 0.85rem;">Parcelamento</label>
          <select id="tx-installments" class="form-select" onchange="window.updateInstallmentPreview()" style="width: 130px; padding: 6px 10px;">
            ${renderAllInstallmentOptions()}
          </select>
        </div>
        <div id="installment-preview" style="font-size: 0.78rem; font-weight: 700; color: var(--color-blue); text-align: right; margin-top: 6px; display: none;"></div>
      </div>

      <!-- Recurrence Checkbox -->
      <div style="background: var(--bg-input); padding: 12px; border-radius: var(--radius-sm); margin-top: 10px; border: 1px solid var(--border-color); display: flex; align-items: center; justify-content: space-between;">
        <label for="tx-recurring" style="font-weight: 600; font-size: 0.82rem; cursor: pointer;">Lançamento Recorrente (Mensal)</label>
        <input type="checkbox" id="tx-recurring" style="width: 18px; height: 18px; cursor: pointer;">
      </div>

      <button type="submit" class="btn-primary" style="margin-top: 14px;">Salvar Transação</button>
    </form>
  `;

  openModal('Nova Transação', html);
  setTimeout(() => {
    window.onAccountChange('tx-account', 'tx-method');
  }, 50);
};

window.onAccountChange = function (accountSelectId, methodSelectId) {
  const accountId = document.getElementById(accountSelectId)?.value;
  const acc = window.store.getAccounts().find(a => a.id === accountId);
  const methodSelect = document.getElementById(methodSelectId);
  if (acc && methodSelect) {
    if (acc.type === 'credit') {
      methodSelect.value = 'Crédito';
    } else {
      methodSelect.value = 'Pix';
    }
  }
  window.toggleInstallmentsVisibility();
};

window.toggleInstallmentsVisibility = function () {
  const method = document.getElementById('tx-method')?.value;
  const accountId = document.getElementById('tx-account')?.value;
  const acc = window.store.getAccounts().find(a => a.id === accountId);
  const container = document.getElementById('installments-box-container');

  const isCredit = method === 'Crédito' || (acc && acc.type === 'credit');
  if (container) {
    container.style.display = isCredit ? 'block' : 'none';
    if (!isCredit) {
      const instSelect = document.getElementById('tx-installments');
      if (instSelect) instSelect.value = '1';
      window.updateInstallmentPreview();
    }
  }
};

window.updateInstallmentPreview = function () {
  const amountStr = document.getElementById('tx-amount')?.value;
  const count = Number(document.getElementById('tx-installments')?.value) || 1;
  const previewEl = document.getElementById('installment-preview');

  if (!previewEl) return;

  if (count > 1 && amountStr) {
    const total = window.parseCurrencyValue(amountStr);
    if (total > 0) {
      const perMonth = total / count;
      previewEl.innerText = `${count}x de ${window.formatBRL(perMonth)} / mês`;
      previewEl.style.display = 'block';
      return;
    }
  }
  previewEl.style.display = 'none';
};

window.setModalTxType = function (type) {
  document.getElementById('modal-tx-type').value = type;
  const btnExp = document.getElementById('type-btn-expense');
  const btnInc = document.getElementById('type-btn-income');
  if (type === 'expense') {
    btnExp.classList.add('active');
    btnInc.classList.remove('active');
  } else {
    btnInc.classList.add('active');
    btnExp.classList.remove('active');
  }
};

window.handleSaveTransaction = function (e) {
  e.preventDefault();
  const type = document.getElementById('modal-tx-type').value;
  const amount = window.parseCurrencyValue(document.getElementById('tx-amount').value);
  const note = document.getElementById('tx-note').value;
  const categoryId = document.getElementById('tx-category').value;
  const accountId = document.getElementById('tx-account').value;
  const paymentMethod = document.getElementById('tx-method').value;
  const date = document.getElementById('tx-date').value;

  const instBox = document.getElementById('installments-box-container');
  const installmentsCount = (instBox && instBox.style.display !== 'none') ? (Number(document.getElementById('tx-installments')?.value) || 1) : 1;
  const isRecurring = document.getElementById('tx-recurring').checked;

  if (amount <= 0) {
    alert('Informe um valor maior que zero.');
    return;
  }

  window.store.addTransaction({
    type,
    amount,
    note,
    categoryId,
    accountId,
    paymentMethod,
    date,
    installmentsCount,
    isRecurring
  });

  closeModal();
  if (installmentsCount > 1) {
    window.showToast(`Compra parcelada em ${installmentsCount}x criada!`);
  } else {
    window.showToast('Transação registrada com sucesso!');
  }
};

// --- Modal: Edit & Delete Transaction ---
window.openEditTransactionModal = function (id) {
  const tx = window.store.getTransactions().find(t => t.id === id);
  if (!tx) return;

  const categories = window.store.getCategories();
  const accounts = window.store.getAccounts();

  const html = `
    <form onsubmit="window.handleUpdateTransaction(event, '${tx.id}')">
      <div class="segmented-control" style="margin-bottom: 14px;">
        <button type="button" id="edit-type-btn-expense" class="${tx.type === 'expense' ? 'active' : ''}" onclick="window.setEditModalTxType('expense')">Despesa</button>
        <button type="button" id="edit-type-btn-income" class="${tx.type === 'income' ? 'active' : ''}" onclick="window.setEditModalTxType('income')">Receita</button>
      </div>
      <input type="hidden" id="edit-modal-tx-type" value="${tx.type}">

      <div class="form-group">
        <label>Valor (R$)</label>
        <input type="text" inputmode="numeric" id="edit-tx-amount" data-currency-input class="form-input" value="${window.formatValueBR(tx.amount)}" required style="font-size: 1.4rem; font-weight: 800; color: var(--color-blue);">
      </div>

      <div class="form-group">
        <label>Descrição</label>
        <input type="text" id="edit-tx-note" class="form-input" value="${tx.note || ''}" required>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
        <div class="form-group">
          <label>Categoria</label>
          <select id="edit-tx-category" class="form-select" required>
            ${categories.map(c => `<option value="${c.id}" ${c.id === tx.categoryId ? 'selected' : ''}>${c.name}</option>`).join('')}
          </select>
        </div>

        <div class="form-group">
          <label>Conta / Cartão</label>
          <select id="edit-tx-account" class="form-select" onchange="window.onAccountChange('edit-tx-account', 'edit-tx-method')" required>
            ${accounts.map(a => `<option value="${a.id}" ${a.id === tx.accountId ? 'selected' : ''}>${a.name}</option>`).join('')}
          </select>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
        <div class="form-group">
          <label>Forma de Pagamento</label>
          <select id="edit-tx-method" class="form-select">
            <option value="Pix" ${tx.paymentMethod === 'Pix' ? 'selected' : ''}>Pix</option>
            <option value="Débito" ${tx.paymentMethod === 'Débito' ? 'selected' : ''}>Débito</option>
            <option value="Crédito" ${tx.paymentMethod === 'Crédito' ? 'selected' : ''}>Crédito</option>
            <option value="Dinheiro" ${tx.paymentMethod === 'Dinheiro' ? 'selected' : ''}>Dinheiro</option>
            <option value="Transferência" ${tx.paymentMethod === 'Transferência' ? 'selected' : ''}>Transferência</option>
          </select>
        </div>

        <div class="form-group">
          <label>Data</label>
          <input type="date" id="edit-tx-date" class="form-input" value="${tx.date}" required>
        </div>
      </div>

      <div style="display: flex; flex-direction: column; gap: 10px; margin-top: 15px;">
        <button type="submit" class="btn-primary">Salvar Alterações</button>
        <button type="button" class="btn-danger" onclick="window.confirmDeleteTx('${tx.id}')">Excluir Transação</button>
      </div>
    </form>
  `;

  openModal('Editar Transação', html);
};

window.setEditModalTxType = function (type) {
  document.getElementById('edit-modal-tx-type').value = type;
  const btnExp = document.getElementById('edit-type-btn-expense');
  const btnInc = document.getElementById('edit-type-btn-income');
  if (type === 'expense') {
    btnExp.classList.add('active');
    btnInc.classList.remove('active');
  } else {
    btnInc.classList.add('active');
    btnExp.classList.remove('active');
  }
};

window.handleUpdateTransaction = function (e, id) {
  e.preventDefault();
  const type = document.getElementById('edit-modal-tx-type').value;
  const amount = window.parseCurrencyValue(document.getElementById('edit-tx-amount').value);
  const note = document.getElementById('edit-tx-note').value;
  const categoryId = document.getElementById('edit-tx-category').value;
  const accountId = document.getElementById('edit-tx-account').value;
  const paymentMethod = document.getElementById('edit-tx-method').value;
  const date = document.getElementById('edit-tx-date').value;

  if (amount <= 0) {
    alert('Informe um valor válido.');
    return;
  }

  window.store.updateTransaction(id, { type, amount, note, categoryId, accountId, paymentMethod, date });
  closeModal();
  window.showToast('Transação atualizada!');
};

window.confirmDeleteTx = function (id) {
  if (confirm('Deseja excluir permanentemente esta transação?')) {
    window.store.deleteTransaction(id);
    closeModal();
    window.showToast('Transação excluída!');
  }
};

// --- Modal: Pay Bill ---
window.openPayBillModal = function (billId) {
  const bill = window.store.getBills().find(b => b.id === billId);
  if (!bill) return;

  const accounts = window.store.getAccounts();
  const today = new Date().toISOString().split('T')[0];

  const html = `
    <form onsubmit="window.handleConfirmPayBill(event, '${bill.id}')">
      <div style="background: var(--bg-input); padding: 14px; border-radius: var(--radius-sm); margin-bottom: 14px; text-align: center; border: 1px solid var(--border-color);">
        <div style="font-size: 0.75rem; color: var(--text-secondary); text-transform: uppercase; font-weight: 700;">Conta a Pagar</div>
        <div style="font-size: 1.1rem; font-weight: 800; margin: 4px 0;">${bill.title}</div>
        <div style="font-size: 1.5rem; font-weight: 800; color: var(--color-red);">${window.formatBRL(bill.amount)}</div>
      </div>

      <div class="form-group">
        <label>De qual conta / cartão deseja tirar este valor?</label>
        <select id="pay-bill-account" class="form-select" required>
          ${accounts.map(a => `<option value="${a.id}">${a.name} (${window.formatBRL(a.balance)})</option>`).join('')}
        </select>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
        <div class="form-group">
          <label>Forma de Pagamento</label>
          <select id="pay-bill-method" class="form-select">
            <option value="Pix">Pix</option>
            <option value="Débito">Débito</option>
            <option value="Crédito">Crédito</option>
            <option value="Dinheiro">Dinheiro</option>
            <option value="Transferência">Transferência</option>
          </select>
        </div>

        <div class="form-group">
          <label>Data do Pagamento</label>
          <input type="date" id="pay-bill-date" class="form-input" value="${today}" required>
        </div>
      </div>

      <button type="submit" class="btn-primary" style="margin-top: 10px;">Confirmar Pagamento</button>
    </form>
  `;

  openModal('Pagar Conta', html);
};

window.handleConfirmPayBill = function (e, billId) {
  e.preventDefault();
  const accountId = document.getElementById('pay-bill-account').value;
  const paymentMethod = document.getElementById('pay-bill-method').value;
  const date = document.getElementById('pay-bill-date').value;

  window.store.markBillPaid(billId, accountId, paymentMethod, date);
  closeModal();
  window.showToast('Pagamento registrado no extrato com sucesso!');
};

// --- Modal: Add & Edit Account ---
window.openAddAccountModal = function () {
  const html = `
    <form onsubmit="window.handleAddAccount(event)">
      <div class="form-group">
        <label>Nome da Conta / Apelido</label>
        <input type="text" id="acc-name" class="form-input" placeholder="Ex: Minha Conta Principal, Cartão Black..." required>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
        <div class="form-group">
          <label>Tipo de Conta</label>
          <select id="acc-type" class="form-select" onchange="window.toggleCardFields(this.value)">
            <option value="checking">Conta Corrente</option>
            <option value="savings">Reserva</option>
            <option value="credit">Cartão de Crédito</option>
          </select>
        </div>

        <div class="form-group">
          <label>Banco / Instituição</label>
          <input type="text" id="acc-bank" class="form-input" placeholder="Ex: Nubank, Itaú, Wise, Nomad..." required>
        </div>
      </div>

      <div class="form-group" id="group-acc-balance">
        <label>Saldo Inicial (R$)</label>
        <input type="text" inputmode="numeric" id="acc-balance" data-currency-input class="form-input" placeholder="0,00" value="0,00">
      </div>

      <!-- Credit Card Specific Fields -->
      <div id="card-fields-container" style="display: none;">
        <div class="form-group">
          <label>Limite Total do Cartão (R$)</label>
          <input type="text" inputmode="numeric" id="acc-limit" data-currency-input class="form-input" placeholder="5.000,00" value="5.000,00">
        </div>

        <div class="form-group">
          <label>Fatura Atual (R$)</label>
          <input type="text" inputmode="numeric" id="acc-card-balance" data-currency-input class="form-input" placeholder="0,00" value="0,00">
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
          <div class="form-group">
            <label>Dia de Fechamento</label>
            <select id="acc-closing-day" class="form-select">
              ${renderDayPickerOptions(5)}
            </select>
          </div>
          <div class="form-group">
            <label>Dia de Vencimento</label>
            <select id="acc-due-day" class="form-select">
              ${renderDayPickerOptions(12)}
            </select>
          </div>
        </div>
      </div>

      <button type="submit" class="btn-primary" style="margin-top: 10px;">Cadastrar Conta</button>
    </form>
  `;

  openModal('Nova Conta Bancária / Cartão', html);
};

window.toggleCardFields = function (type) {
  const cardFields = document.getElementById('card-fields-container');
  const balGroup = document.getElementById('group-acc-balance');
  if (type === 'credit') {
    if (cardFields) cardFields.style.display = 'block';
    if (balGroup) balGroup.style.display = 'none';
  } else {
    if (cardFields) cardFields.style.display = 'none';
    if (balGroup) balGroup.style.display = 'block';
  }
};

window.handleAddAccount = function (e) {
  e.preventDefault();
  const name = document.getElementById('acc-name').value;
  const type = document.getElementById('acc-type').value;
  const bank = document.getElementById('acc-bank').value || name;

  if (type === 'credit') {
    const limit = window.parseCurrencyValue(document.getElementById('acc-limit').value);
    const balance = window.parseCurrencyValue(document.getElementById('acc-card-balance').value);
    const closingDay = Number(document.getElementById('acc-closing-day').value) || 5;
    const dueDay = Number(document.getElementById('acc-due-day').value) || 12;

    window.store.addAccount({ name, type, bank, balance, limit, closingDay, dueDay });
  } else {
    const balance = window.parseCurrencyValue(document.getElementById('acc-balance').value);
    window.store.addAccount({ name, type, bank, balance, limit: 0 });
  }

  closeModal();
  window.showToast('Conta adicionada com sucesso!');
};

window.openEditAccountModal = function (id) {
  const acc = window.store.getAccounts().find(a => a.id === id);
  if (!acc) return;

  const html = `
    <form onsubmit="window.handleUpdateAccount(event, '${acc.id}')">
      <div class="form-group">
        <label>Nome da Conta / Apelido</label>
        <input type="text" id="edit-acc-name" class="form-input" value="${acc.name}" required>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
        <div class="form-group">
          <label>Tipo de Conta</label>
          <select id="edit-acc-type" class="form-select" onchange="window.toggleCardFieldsEdit(this.value)">
            <option value="checking" ${acc.type === 'checking' ? 'selected' : ''}>Conta Corrente</option>
            <option value="savings" ${acc.type === 'savings' ? 'selected' : ''}>Reserva</option>
            <option value="credit" ${acc.type === 'credit' ? 'selected' : ''}>Cartão de Crédito</option>
          </select>
        </div>

        <div class="form-group">
          <label>Banco / Instituição</label>
          <input type="text" id="edit-acc-bank" class="form-input" value="${acc.bank || ''}" placeholder="Ex: Nubank, Itaú, Wise, Nomad..." required>
        </div>
      </div>

      <div class="form-group" id="edit-group-acc-balance" style="${acc.type === 'credit' ? 'display: none;' : ''}">
        <label>Saldo Atual (R$)</label>
        <input type="text" inputmode="numeric" id="edit-acc-balance" data-currency-input class="form-input" value="${window.formatValueBR(acc.balance || 0)}">
      </div>

      <!-- Credit Card Specific Fields -->
      <div id="edit-card-fields-container" style="${acc.type === 'credit' ? 'display: block;' : 'display: none;'}">
        <div class="form-group">
          <label>Limite Total (R$)</label>
          <input type="text" inputmode="numeric" id="edit-acc-limit" data-currency-input class="form-input" value="${window.formatValueBR(acc.limit || 0)}">
        </div>

        <div class="form-group">
          <label>Fatura Atual (R$)</label>
          <input type="text" inputmode="numeric" id="edit-acc-card-balance" data-currency-input class="form-input" value="${window.formatValueBR(acc.balance || 0)}">
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
          <div class="form-group">
            <label>Dia de Fechamento</label>
            <select id="edit-acc-closing-day" class="form-select">
              ${renderDayPickerOptions(acc.closingDay || 5)}
            </select>
          </div>
          <div class="form-group">
            <label>Dia de Vencimento</label>
            <select id="edit-acc-due-day" class="form-select">
              ${renderDayPickerOptions(acc.dueDay || 12)}
            </select>
          </div>
        </div>
      </div>

      <div style="display: flex; flex-direction: column; gap: 10px; margin-top: 15px;">
        <button type="submit" class="btn-primary">Salvar Alterações</button>
        <button type="button" class="btn-danger" onclick="window.confirmDeleteAccount('${acc.id}')">Excluir Conta</button>
      </div>
    </form>
  `;

  openModal('Editar Conta / Cartão', html);
};

window.toggleCardFieldsEdit = function (type) {
  const cardFields = document.getElementById('edit-card-fields-container');
  const balGroup = document.getElementById('edit-group-acc-balance');
  if (type === 'credit') {
    if (cardFields) cardFields.style.display = 'block';
    if (balGroup) balGroup.style.display = 'none';
  } else {
    if (cardFields) cardFields.style.display = 'none';
    if (balGroup) balGroup.style.display = 'block';
  }
};

window.handleUpdateAccount = function (e, id) {
  e.preventDefault();
  const name = document.getElementById('edit-acc-name').value;
  const type = document.getElementById('edit-acc-type').value;
  const bank = document.getElementById('edit-acc-bank').value || name;

  if (type === 'credit') {
    const limit = window.parseCurrencyValue(document.getElementById('edit-acc-limit').value);
    const balance = window.parseCurrencyValue(document.getElementById('edit-acc-card-balance').value);
    const closingDay = Number(document.getElementById('edit-acc-closing-day').value) || 5;
    const dueDay = Number(document.getElementById('edit-acc-due-day').value) || 12;

    window.store.updateAccount(id, { name, type, bank, balance, limit, closingDay, dueDay });
  } else {
    const balance = window.parseCurrencyValue(document.getElementById('edit-acc-balance').value);
    window.store.updateAccount(id, { name, type, bank, balance, limit: 0 });
  }

  closeModal();
  window.showToast('Conta atualizada!');
};

window.confirmDeleteAccount = function (id) {
  if (confirm('Deseja excluir esta conta? As transações vinculadas serão mantidas.')) {
    window.store.deleteAccount(id);
    closeModal();
    window.showToast('Conta excluída!');
  }
};

// --- Modal: Edit & Delete Financial Goal ---
window.openEditGoalModal = function (id) {
  const goal = window.store.getGoals().find(g => g.id === id);
  if (!goal) return;

  const html = `
    <form onsubmit="window.handleUpdateGoal(event, '${goal.id}')">
      <div class="form-group">
        <label>Título da Meta</label>
        <input type="text" id="edit-goal-title" class="form-input" value="${goal.title}" required>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
        <div class="form-group">
          <label>Valor Alvo (R$)</label>
          <input type="text" inputmode="numeric" id="edit-goal-target" data-currency-input class="form-input" value="${window.formatValueBR(goal.targetAmount)}" required style="font-size: 1.1rem; font-weight: 700;">
        </div>
        <div class="form-group">
          <label>Valor Atual (R$)</label>
          <input type="text" inputmode="numeric" id="edit-goal-current" data-currency-input class="form-input" value="${window.formatValueBR(goal.currentAmount || 0)}" required style="font-size: 1.1rem; font-weight: 700;">
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
        <div class="form-group">
          <label>Ícone</label>
          <select id="edit-goal-icon" class="form-select">
            <option value="target" ${goal.icon === 'target' ? 'selected' : ''}>Alvo (Meta)</option>
            <option value="shield" ${goal.icon === 'shield' ? 'selected' : ''}>Reserva / Proteção</option>
            <option value="plane" ${goal.icon === 'plane' ? 'selected' : ''}>Viagem / Voo</option>
            <option value="car" ${goal.icon === 'car' ? 'selected' : ''}>Veículo / Automóvel</option>
            <option value="home" ${goal.icon === 'home' ? 'selected' : ''}>Imóvel / Casa</option>
            <option value="trending-up" ${goal.icon === 'trending-up' ? 'selected' : ''}>Investimento</option>
          </select>
        </div>
        <div class="form-group">
          <label>Data Alvo</label>
          <input type="date" id="edit-goal-date" class="form-input" value="${goal.targetDate || ''}" required>
        </div>
      </div>

      <div style="display: flex; flex-direction: column; gap: 10px; margin-top: 15px;">
        <button type="submit" class="btn-primary">Salvar Alterações</button>
        <button type="button" class="btn-danger" onclick="window.confirmDeleteGoal('${goal.id}')">Excluir Meta</button>
      </div>
    </form>
  `;

  openModal('Editar Meta', html);
};

window.handleUpdateGoal = function (e, id) {
  e.preventDefault();
  const title = document.getElementById('edit-goal-title').value;
  const targetAmount = window.parseCurrencyValue(document.getElementById('edit-goal-target').value);
  const currentAmount = window.parseCurrencyValue(document.getElementById('edit-goal-current').value);
  const icon = document.getElementById('edit-goal-icon').value;
  const targetDate = document.getElementById('edit-goal-date').value;

  window.store.updateGoal(id, { title, targetAmount, currentAmount, icon, targetDate });
  closeModal();
  window.showToast('Meta atualizada!');
};

window.confirmDeleteGoal = function (id) {
  if (confirm('Deseja excluir esta meta financeira?')) {
    window.store.deleteGoal(id);
    closeModal();
    window.showToast('Meta excluída!');
  }
};

// --- Modal: Deposit & Withdraw Goal ---
window.openDepositGoalModal = function (goalId) {
  const html = `
    <form onsubmit="window.handleDepositGoal(event, '${goalId}')">
      <div class="form-group">
        <label>Valor a Guardar (R$)</label>
        <input type="text" inputmode="numeric" id="goal-dep-amount" data-currency-input class="form-input" placeholder="100,00" required style="font-size: 1.3rem; font-weight: 800; color: var(--color-blue);">
      </div>
      <button type="submit" class="btn-primary" style="margin-top: 10px;">Confirmar Depósito</button>
    </form>
  `;

  openModal('Guardar Dinheiro na Meta', html);
};

window.handleDepositGoal = function (e, goalId) {
  e.preventDefault();
  const amount = window.parseCurrencyValue(document.getElementById('goal-dep-amount').value);
  if (amount > 0) {
    window.store.updateGoalDeposit(goalId, amount);
    closeModal();
    window.showToast('Depósito registrado na meta!');
  }
};

window.openWithdrawGoalModal = function (goalId) {
  const goal = window.store.getGoals().find(g => g.id === goalId);
  if (!goal) return;

  const html = `
    <form onsubmit="window.handleWithdrawGoal(event, '${goalId}')">
      <div style="background: var(--bg-input); padding: 14px; border-radius: var(--radius-sm); margin-bottom: 14px; text-align: center; border: 1px solid var(--border-color);">
        <div style="font-size: 0.75rem; color: var(--text-secondary); text-transform: uppercase; font-weight: 700;">Meta / Reserva</div>
        <div style="font-size: 1.1rem; font-weight: 800; margin: 4px 0;">${goal.title}</div>
        <div style="font-size: 1.4rem; font-weight: 800; color: var(--color-green);">${window.formatBRL(goal.currentAmount || 0)} <span style="font-weight: 600; font-size: 0.8rem; color: var(--text-muted);">acumulados</span></div>
      </div>

      <div class="form-group">
        <label>Valor a Retirar (R$)</label>
        <input type="text" inputmode="numeric" id="goal-with-amount" data-currency-input class="form-input" placeholder="100,00" required style="font-size: 1.3rem; font-weight: 800; color: var(--color-red);">
      </div>
      <button type="submit" class="btn-danger" style="margin-top: 10px;">Confirmar Retirada</button>
    </form>
  `;

  openModal('Retirar Dinheiro da Meta', html);
};

window.handleWithdrawGoal = function (e, goalId) {
  e.preventDefault();
  const amount = window.parseCurrencyValue(document.getElementById('goal-with-amount').value);
  if (amount > 0) {
    window.store.updateGoalWithdraw(goalId, amount);
    closeModal();
    window.showToast('Retirada registrada da meta!', 'info');
  }
};

// --- Modal: Add & Edit Bill ---
window.openAddBillModal = function () {
  const categories = window.store.getCategories().filter(c => c.type === 'expense');
  const today = new Date().toISOString().split('T')[0];

  const html = `
    <form onsubmit="window.handleAddBill(event)">
      <div class="form-group">
        <label>Nome da Conta</label>
        <input type="text" id="bill-title" class="form-input" placeholder="Ex: Aluguel, Luz, Internet..." required>
      </div>

      <div class="form-group">
        <label>Valor (R$)</label>
        <input type="text" inputmode="numeric" id="bill-amount" data-currency-input class="form-input" placeholder="0,00" required style="font-size: 1.2rem; font-weight: 700;">
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
        <div class="form-group">
          <label>Data de Vencimento</label>
          <input type="date" id="bill-date" class="form-input" value="${today}" required>
        </div>

        <div class="form-group">
          <label>Categoria</label>
          <select id="bill-category" class="form-select">
            ${categories.map(c => `<option value="${c.id}">${c.name}</option>`).join('')}
          </select>
        </div>
      </div>

      <div style="background: var(--bg-input); padding: 12px; border-radius: var(--radius-sm); margin-top: 10px; border: 1px solid var(--border-color); display: flex; align-items: center; justify-content: space-between;">
        <label for="bill-recurring" style="font-weight: 600; font-size: 0.82rem; cursor: pointer;">Repetir mensalmente</label>
        <input type="checkbox" id="bill-recurring" style="width: 18px; height: 18px; cursor: pointer;">
      </div>

      <button type="submit" class="btn-primary" style="margin-top: 14px;">Cadastrar Conta</button>
    </form>
  `;

  openModal('Nova Conta a Pagar', html);
};

window.handleAddBill = function (e) {
  e.preventDefault();
  const title = document.getElementById('bill-title').value;
  const amount = window.parseCurrencyValue(document.getElementById('bill-amount').value);
  const dueDate = document.getElementById('bill-date').value;
  const categoryId = document.getElementById('bill-category').value;
  const isRecurring = document.getElementById('bill-recurring').checked;

  window.store.addBill({
    title,
    amount,
    dueDate,
    isPaid: false,
    isRecurring,
    categoryId
  });

  closeModal();
  window.showToast('Conta a pagar cadastrada!');
};

window.openEditBillModal = function (id) {
  const bill = window.store.getBills().find(b => b.id === id);
  if (!bill) return;

  const categories = window.store.getCategories().filter(c => c.type === 'expense');

  const html = `
    <form onsubmit="window.handleUpdateBill(event, '${bill.id}')">
      <div class="form-group">
        <label>Nome da Conta</label>
        <input type="text" id="edit-bill-title" class="form-input" value="${bill.title}" required>
      </div>

      <div class="form-group">
        <label>Valor (R$)</label>
        <input type="text" inputmode="numeric" id="edit-bill-amount" data-currency-input class="form-input" value="${window.formatValueBR(bill.amount)}" required style="font-size: 1.2rem; font-weight: 700;">
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
        <div class="form-group">
          <label>Vencimento</label>
          <input type="date" id="edit-bill-date" class="form-input" value="${bill.dueDate}" required>
        </div>

        <div class="form-group">
          <label>Categoria</label>
          <select id="edit-bill-category" class="form-select">
            ${categories.map(c => `<option value="${c.id}" ${c.id === bill.categoryId ? 'selected' : ''}>${c.name}</option>`).join('')}
          </select>
        </div>
      </div>

      <div style="background: var(--bg-input); padding: 12px; border-radius: var(--radius-sm); margin-top: 10px; border: 1px solid var(--border-color); display: flex; align-items: center; justify-content: space-between;">
        <label for="edit-bill-recurring" style="font-weight: 600; font-size: 0.82rem; cursor: pointer;">Repetir mensalmente</label>
        <input type="checkbox" id="edit-bill-recurring" ${bill.isRecurring ? 'checked' : ''} style="width: 18px; height: 18px; cursor: pointer;">
      </div>

      <div style="display: flex; flex-direction: column; gap: 10px; margin-top: 15px;">
        <button type="submit" class="btn-primary">Salvar Alterações</button>
        <button type="button" class="btn-danger" onclick="window.confirmDeleteBill('${bill.id}')">Excluir Conta</button>
      </div>
    </form>
  `;

  openModal('Editar Conta a Pagar', html);
};

window.handleUpdateBill = function (e, id) {
  e.preventDefault();
  const title = document.getElementById('edit-bill-title').value;
  const amount = window.parseCurrencyValue(document.getElementById('edit-bill-amount').value);
  const dueDate = document.getElementById('edit-bill-date').value;
  const categoryId = document.getElementById('edit-bill-category').value;
  const isRecurring = document.getElementById('edit-bill-recurring').checked;

  window.store.updateBill(id, { title, amount, dueDate, categoryId, isRecurring });
  closeModal();
  window.showToast('Conta a pagar atualizada!');
};

window.confirmDeleteBill = function (id) {
  if (confirm('Deseja excluir esta conta a pagar?')) {
    window.store.deleteBill(id);
    closeModal();
    window.showToast('Conta excluída!');
  }
};

// --- Modal: Transfer Funds ---
window.openTransferModal = function () {
  const accounts = window.store.getAccounts();

  const html = `
    <form onsubmit="window.handleTransfer(event)">
      <div class="form-group">
        <label>Conta de Origem</label>
        <select id="tr-from" class="form-select" required>
          ${accounts.map(a => `<option value="${a.id}">${a.name} (${window.formatBRL(a.balance)})</option>`).join('')}
        </select>
      </div>

      <div class="form-group">
        <label>Conta de Destino</label>
        <select id="tr-to" class="form-select" required>
          ${accounts.map(a => `<option value="${a.id}">${a.name}</option>`).join('')}
        </select>
      </div>

      <div class="form-group">
        <label>Valor da Transferência (R$)</label>
        <input type="text" inputmode="numeric" id="tr-amount" data-currency-input class="form-input" placeholder="0,00" required style="font-size: 1.3rem; font-weight: 800;">
      </div>

      <button type="submit" class="btn-primary" style="margin-top: 10px;">Confirmar Transferência</button>
    </form>
  `;

  openModal('Transferir Dinheiro', html);
};

window.handleTransfer = function (e) {
  e.preventDefault();
  const fromId = document.getElementById('tr-from').value;
  const toId = document.getElementById('tr-to').value;
  const amount = window.parseCurrencyValue(document.getElementById('tr-amount').value);

  if (fromId === toId) {
    alert('A conta de origem e destino devem ser diferentes.');
    return;
  }
  if (amount <= 0) {
    alert('Informe um valor válido.');
    return;
  }

  window.store.transferFunds(fromId, toId, amount);
  closeModal();
  window.showToast('Transferência realizada!');
};

// --- Modal: Set Budget ---
window.openSetBudgetModal = function () {
  const categories = window.store.getCategories().filter(c => c.type === 'expense');

  const html = `
    <form onsubmit="window.handleSetBudget(event)">
      <div class="form-group">
        <label>Categoria de Gastos</label>
        <select id="bgt-category" class="form-select" required>
          ${categories.map(c => `<option value="${c.id}">${c.name}</option>`).join('')}
        </select>
      </div>

      <div class="form-group">
        <label>Teto de Gastos Mensal (R$)</label>
        <input type="text" inputmode="numeric" id="bgt-limit" data-currency-input class="form-input" placeholder="1.000,00" required style="font-size: 1.2rem; font-weight: 700;">
      </div>

      <button type="submit" class="btn-primary" style="margin-top: 10px;">Definir Teto</button>
    </form>
  `;

  openModal('Definir Orçamento de Categoria', html);
};

window.handleSetBudget = function (e) {
  e.preventDefault();
  const catId = document.getElementById('bgt-category').value;
  const limit = window.parseCurrencyValue(document.getElementById('bgt-limit').value);

  window.store.setBudget(catId, limit);
  closeModal();
  window.showToast('Teto de gastos definido!');
};

// --- Modal: Add Goal ---
window.openAddGoalModal = function () {
  const html = `
    <form onsubmit="window.handleAddGoal(event)">
      <div class="form-group">
        <label>Título da Meta</label>
        <input type="text" id="goal-title" class="form-input" placeholder="Ex: Viagem, Carro Novo, Reserva..." required>
      </div>

      <div class="form-group">
        <label>Valor Alvo (R$)</label>
        <input type="text" inputmode="numeric" id="goal-target" data-currency-input class="form-input" placeholder="5.000,00" required style="font-size: 1.2rem; font-weight: 700;">
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
        <div class="form-group">
          <label>Ícone da Meta</label>
          <select id="goal-icon" class="form-select">
            <option value="target">Alvo (Meta)</option>
            <option value="shield">Reserva / Proteção</option>
            <option value="plane">Viagem / Voo</option>
            <option value="car">Veículo / Automóvel</option>
            <option value="home">Imóvel / Casa</option>
            <option value="trending-up">Investimento</option>
          </select>
        </div>
        <div class="form-group">
          <label>Data Alvo</label>
          <input type="date" id="goal-date" class="form-input" required>
        </div>
      </div>

      <button type="submit" class="btn-primary" style="margin-top: 10px;">Criar Meta</button>
    </form>
  `;

  openModal('Nova Meta Financeira', html);
};

window.handleAddGoal = function (e) {
  e.preventDefault();
  const title = document.getElementById('goal-title').value;
  const targetAmount = window.parseCurrencyValue(document.getElementById('goal-target').value);
  const icon = document.getElementById('goal-icon').value || 'target';
  const targetDate = document.getElementById('goal-date').value;

  window.store.addGoal({ title, targetAmount, icon, targetDate });
  closeModal();
  window.showToast('Meta criada com sucesso!');
};

let pinBuffer = '';

function initPinLock() {
  const security = window.store.data.security;
  if (security && security.isPinEnabled) {
    showPinScreen();
  }

  const pinBtns = document.querySelectorAll('.pin-btn[data-val]');
  const pinClear = document.getElementById('pin-clear');
  const pinDel = document.getElementById('pin-del');

  pinBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const val = btn.getAttribute('data-val');
      if (pinBuffer.length < 4) {
        pinBuffer += val;
        updatePinDots();
        if (pinBuffer.length === 4) {
          setTimeout(verifyPin, 150);
        }
      }
    });
  });

  if (pinClear) pinClear.addEventListener('click', () => { pinBuffer = ''; updatePinDots(); });
  if (pinDel) pinDel.addEventListener('click', () => { pinBuffer = pinBuffer.slice(0, -1); updatePinDots(); });

  // Support external/physical keyboard input without summoning virtual soft keyboard
  document.addEventListener('keydown', (e) => {
    const pinOverlay = document.getElementById('pin-lock-screen');
    if (!pinOverlay || pinOverlay.classList.contains('hidden')) return;

    if (e.key >= '0' && e.key <= '9') {
      e.preventDefault();
      if (pinBuffer.length < 4) {
        pinBuffer += e.key;
        updatePinDots();
        if (pinBuffer.length === 4) {
          setTimeout(verifyPin, 150);
        }
      }
    } else if (e.key === 'Backspace' || e.key === 'Delete') {
      e.preventDefault();
      pinBuffer = pinBuffer.slice(0, -1);
      updatePinDots();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      pinBuffer = '';
      updatePinDots();
    }
  });
}

function updatePinDots() {
  const errorEl = document.getElementById('pin-error-msg');
  if (errorEl && pinBuffer.length > 0 && !errorEl.classList.contains('hidden')) {
    errorEl.classList.add('hidden');
  }

  const dots = document.querySelectorAll('#pin-dots .dot');
  dots.forEach((dot, idx) => {
    if (idx < pinBuffer.length) dot.classList.add('filled');
    else dot.classList.remove('filled');
  });
}

function verifyPin() {
  const security = window.store.data.security;
  const errorEl = document.getElementById('pin-error-msg');
  const dotsContainer = document.getElementById('pin-dots');

  if (pinBuffer === security.pinCode) {
    document.getElementById('pin-lock-screen').classList.add('hidden');
    if (errorEl) errorEl.classList.add('hidden');
    pinBuffer = '';
    updatePinDots();
  } else {
    if (errorEl) {
      errorEl.innerHTML = `${window.getSVGIcon('alert-triangle', 14, 2)} PIN incorreto! Tente novamente.`;
      errorEl.classList.remove('hidden');
      errorEl.style.animation = 'none';
      errorEl.offsetHeight; // trigger reflow
      errorEl.style.animation = 'shakePin 0.4s cubic-bezier(0.36, 0.07, 0.19, 0.97) both';
    }
    if (dotsContainer) {
      dotsContainer.style.animation = 'none';
      dotsContainer.offsetHeight; // trigger reflow
      dotsContainer.style.animation = 'shakePin 0.4s cubic-bezier(0.36, 0.07, 0.19, 0.97) both';
    }
    pinBuffer = '';
    const dots = document.querySelectorAll('#pin-dots .dot');
    dots.forEach(dot => dot.classList.remove('filled'));
  }
}

function showPinScreen() {
  const errorEl = document.getElementById('pin-error-msg');
  if (errorEl) errorEl.classList.add('hidden');
  document.getElementById('pin-lock-screen').classList.remove('hidden');
  pinBuffer = '';
  updatePinDots();
}
