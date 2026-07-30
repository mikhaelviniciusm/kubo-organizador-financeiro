/**
 * FinançaOS — Financial Tools & Backup Hub with SVG Icons and Formatted Currency Inputs
 */

window.renderTools = function(container) {
  const security = window.store.data.security || { isPinEnabled: false, pinCode: '' };
  const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';

  container.innerHTML = `
    <div class="tab-sub-content">
      <!-- Financial Calculators Card -->
      <div class="card">
      <div class="card-header">
        <h3 class="card-title">
          ${window.getSVGIcon('calculator', 18, 2)} Calculadora de Juros Compostos
        </h3>
      </div>

      <div style="display: flex; flex-direction: column; gap: 12px; margin-top: 6px;">
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
          <div class="form-group">
            <label>Valor Inicial (R$)</label>
            <input type="text" inputmode="numeric" id="calc-initial" data-currency-input class="form-input" value="1.000,00" style="font-weight: 700;">
          </div>
          <div class="form-group">
            <label>Aporte Mensal (R$)</label>
            <input type="text" inputmode="numeric" id="calc-monthly" data-currency-input class="form-input" value="300,00" style="font-weight: 700;">
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
          <div class="form-group">
            <label>Taxa Anual (%)</label>
            <input type="number" step="0.1" id="calc-rate" class="form-input" value="12" style="font-weight: 700;">
          </div>
          <div class="form-group">
            <label>Período (Anos)</label>
            <input type="number" id="calc-years" class="form-input" value="5" style="font-weight: 700;">
          </div>
        </div>

        <button class="btn-primary" onclick="window.computeCompoundInterest()" style="margin-top: 4px;">
          Calcular Rendimento
        </button>

        <div id="calc-result" style="display: none; background: var(--bg-input); padding: 16px; border-radius: var(--radius-sm); margin-top: 10px; border: 1px solid var(--border-color); flex-direction: column; gap: 12px;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 0.75rem; color: var(--text-secondary); font-weight: 700; text-transform: uppercase;">Montante Total</span>
            <span style="font-size: 0.78rem; font-weight: 700; color: var(--color-green); background: var(--color-green-light); padding: 2px 8px; border-radius: var(--radius-xs);">
              Rendimento
            </span>
          </div>

          <div id="calc-total" style="font-size: 1.7rem; font-weight: 800; color: var(--color-green);">R$ 0,00</div>

          <!-- Invested vs Interest Bar -->
          <div class="progress-bar-container" style="height: 8px;">
            <div id="calc-bar-invested" class="progress-bar-fill" style="width: 50%; background-color: var(--color-blue);"></div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-size: 0.82rem; margin-top: 4px;">
            <div style="background: var(--bg-card); padding: 10px; border-radius: var(--radius-xs); border: 1px solid var(--border-color);">
              <div style="font-size: 0.72rem; color: var(--text-secondary); font-weight: 600;">Total Investido</div>
              <div id="calc-invested" style="font-weight: 800; font-size: 0.95rem; color: var(--text-primary); margin-top: 2px;">R$ 0,00</div>
            </div>
            <div style="background: var(--bg-card); padding: 10px; border-radius: var(--radius-xs); border: 1px solid var(--border-color);">
              <div style="font-size: 0.72rem; color: var(--text-secondary); font-weight: 600;">Total em Juros</div>
              <div id="calc-interest" style="font-weight: 800; font-size: 0.95rem; color: var(--color-green); margin-top: 2px;">R$ 0,00</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Data Import & Export Hub -->
    <div class="card">
      <div class="card-header">
        <h3 class="card-title">
          ${window.getSVGIcon('package', 18, 2)} Backup & Exportação de Dados
        </h3>
      </div>
      <p style="font-size: 0.82rem; color: var(--text-secondary);">
        Seus dados ficam 100% salvos no seu dispositivo. Faça backups em JSON ou exporte suas transações para CSV.
      </p>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 6px;">
        <button class="btn-secondary" onclick="window.store.exportJSON(); window.showToast('Backup JSON baixado!');" style="display: flex; align-items: center; justify-content: center; gap: 6px;">
          ${window.getSVGIcon('download', 16, 2)} Exportar JSON
        </button>
        <button class="btn-secondary" onclick="window.store.exportCSV(); window.showToast('Planilha CSV baixada!');" style="display: flex; align-items: center; justify-content: center; gap: 6px;">
          ${window.getSVGIcon('file-text', 16, 2)} Exportar CSV
        </button>
      </div>

      <div style="margin-top: 10px;">
        <label class="btn-secondary" style="display: flex; align-items: center; justify-content: center; gap: 6px; cursor: pointer; background: var(--color-blue-light); color: var(--color-blue); border-color: transparent;">
          ${window.getSVGIcon('upload', 16, 2)} Importar Backup JSON
          <input type="file" id="json-file-input" accept=".json" style="display: none;" onchange="window.handleImportJSON(event)">
        </label>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 14px; padding-top: 14px; border-top: 1px solid var(--border-color);">
        <button class="btn-secondary" onclick="window.confirmLoadDemoData()" style="font-size: 0.78rem; display: flex; align-items: center; justify-content: center; gap: 4px;">
          ${window.getSVGIcon('rotate-ccw', 14, 2)} Dados Demo
        </button>
        <button class="btn-danger" onclick="window.confirmResetData()" style="font-size: 0.78rem; display: flex; align-items: center; justify-content: center; gap: 4px;">
          ${window.getSVGIcon('trash-2', 14, 2)} Apagar Tudo
        </button>
      </div>
    </div>

    <!-- Appearance & Theme Settings Card -->
    <div class="card">
      <div class="card-header">
        <h3 class="card-title">
          ${window.getSVGIcon('palette', 18, 2)} Aparência (Tema)
        </h3>
      </div>
      <p style="font-size: 0.82rem; color: var(--text-secondary);">
        Escolha o tema visual do aplicativo.
      </p>

      <div class="segmented-control" style="margin-top: 10px;">
        <button class="${currentTheme === 'dark' ? 'active' : ''}" onclick="window.setAppTheme('dark')" style="display: flex; align-items: center; justify-content: center; gap: 6px;">
          ${window.getSVGIcon('moon', 14, 2)} Escuro
        </button>
        <button class="${currentTheme === 'light' ? 'active' : ''}" onclick="window.setAppTheme('light')" style="display: flex; align-items: center; justify-content: center; gap: 6px;">
          ${window.getSVGIcon('sun', 14, 2)} Claro
        </button>
      </div>
    </div>

    <!-- Security PIN Lock Config -->
    <div class="card">
      <div class="card-header">
        <h3 class="card-title">
          ${window.getSVGIcon('shield', 18, 2)} Segurança (PIN de 4 dígitos)
        </h3>
      </div>
      <p style="font-size: 0.82rem; color: var(--text-secondary);">
        Proteja o aplicativo com uma senha PIN para exigir ao abrir.
      </p>

      <div style="display: flex; align-items: center; justify-content: space-between; margin-top: 10px;">
        <span style="font-weight: 700; font-size: 0.9rem;">Ativar Bloqueio por PIN</span>
        <input type="checkbox" id="pin-toggle-checkbox" ${security.isPinEnabled ? 'checked' : ''} onchange="window.togglePinSecurity(this.checked)" style="width: 20px; height: 20px; cursor: pointer;">
      </div>
    </div>
  `;

  // Attach currency masks to initial and monthly input elements
  const inputs = container.querySelectorAll('[data-currency-input]');
  inputs.forEach(input => window.applyCurrencyMask(input));
};

window.computeCompoundInterest = function() {
  const initialStr = document.getElementById('calc-initial').value;
  const monthlyStr = document.getElementById('calc-monthly').value;

  const p = window.parseCurrencyValue(initialStr);
  const pmt = window.parseCurrencyValue(monthlyStr);
  const rateAnnual = parseFloat(document.getElementById('calc-rate').value) || 0;
  const years = parseInt(document.getElementById('calc-years').value) || 1;

  const r = (rateAnnual / 100) / 12;
  const months = years * 12;

  let total = p;
  let totalInvested = p;

  for (let i = 0; i < months; i++) {
    total = total * (1 + r) + pmt;
    totalInvested += pmt;
  }

  const interest = total - totalInvested;
  const investedPct = total > 0 ? Math.round((totalInvested / total) * 100) : 50;

  const resEl = document.getElementById('calc-result');
  resEl.style.display = 'flex';
  document.getElementById('calc-total').innerText = window.formatBRL(total);
  document.getElementById('calc-invested').innerText = window.formatBRL(totalInvested);
  document.getElementById('calc-interest').innerText = window.formatBRL(interest);

  const barEl = document.getElementById('calc-bar-invested');
  if (barEl) {
    barEl.style.width = `${investedPct}%`;
  }
};

window.handleImportJSON = function(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(evt) {
    const success = window.store.importJSON(evt.target.result);
    if (success) {
      window.showToast('Backup restaurado com sucesso!');
      setTimeout(() => location.reload(), 1000);
    } else {
      window.showToast('Erro ao importar arquivo JSON.', 'error');
    }
  };
  reader.readAsText(file);
};

window.togglePinSecurity = function (enabled) {
  if (enabled) {
    window.openPinSetupModal();
  } else {
    window.store.data.security = { isPinEnabled: false, pinCode: '' };
    window.store.save();
    window.updateLockBtnVisibility();
    window.showToast('Bloqueio por PIN desativado.');
  }
};

window.openPinSetupModal = function () {
  const html = `
    <div style="display: flex; flex-direction: column; align-items: center; gap: 16px; text-align: center; padding: 10px 0;">
      <div style="width: 56px; height: 56px; border-radius: 50%; background: var(--color-blue-light); color: var(--color-blue); display: flex; align-items: center; justify-content: center; margin: 0 auto; border: 1px solid rgba(0, 122, 255, 0.3);">
        ${window.getSVGIcon('shield', 28, 2)}
      </div>

      <div>
        <h4 style="font-size: 1.1rem; font-weight: 800; color: var(--text-primary); margin-bottom: 4px;">Configurar PIN de Segurança</h4>
        <p style="font-size: 0.82rem; color: var(--text-secondary); line-height: 1.35;">
          Crie uma senha numérica de 4 dígitos para exigir ao abrir o Kubo.
        </p>
      </div>

      <div style="width: 100%; max-width: 220px; margin: 6px 0;">
        <input type="password" id="pin-setup-input" maxlength="4" inputmode="numeric" pattern="[0-9]*" class="form-input" placeholder="• • • •" style="text-align: center; font-size: 1.8rem; letter-spacing: 0.4em; font-weight: 800; padding: 12px;" autofocus>
      </div>

      <div style="display: flex; flex-direction: column; gap: 10px; width: 100%; margin-top: 4px;">
        <button class="btn-primary" onclick="window.savePinSetup()">
          ${window.getSVGIcon('check-circle', 18, 2)} Salvar e Ativar PIN
        </button>
        <button class="btn-secondary" onclick="window.cancelPinSetup()">
          Cancelar
        </button>
      </div>
    </div>
  `;

  window.openModal('Trava por PIN', html);
  setTimeout(() => {
    const input = document.getElementById('pin-setup-input');
    if (input) {
      input.focus();
      input.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') window.savePinSetup();
      });
    }
  }, 100);
};

window.savePinSetup = function () {
  const input = document.getElementById('pin-setup-input');
  const pin = input ? input.value.trim() : '';

  if (pin.length === 4 && /^\d{4}$/.test(pin)) {
    window.store.data.security = { isPinEnabled: true, pinCode: pin };
    window.store.save();
    window.updateLockBtnVisibility();
    window.closeModal();
    window.showToast('Bloqueio por PIN ativado com sucesso!');
  } else {
    window.showToast('O PIN deve conter exatamente 4 números.', 'error');
    if (input) input.focus();
  }
};

window.cancelPinSetup = function () {
  const checkbox = document.getElementById('pin-toggle-checkbox');
  if (checkbox) checkbox.checked = false;
  window.closeModal();
};

window.confirmLoadDemoData = function () {
  const html = `
    <div style="display: flex; flex-direction: column; gap: 16px; text-align: center; padding: 10px 0;">
      <div style="width: 56px; height: 56px; border-radius: 50%; background: var(--color-orange-light); color: var(--color-orange); display: flex; align-items: center; justify-content: center; margin: 0 auto;">
        ${window.getSVGIcon('alert-triangle', 28, 2)}
      </div>

      <div>
        <h4 style="font-size: 1.1rem; font-weight: 800; color: var(--text-primary); margin-bottom: 6px;">Substituir Dados Atuais?</h4>
        <p style="font-size: 0.85rem; color: var(--text-secondary); line-height: 1.4;">
          Ao carregar os dados de demonstração, todas as suas transações, contas e metas atuais serão <strong>substituídas</strong> pelos dados de exemplo.
        </p>
      </div>

      <div style="background: var(--bg-input); border: 1px solid var(--border-color); border-radius: var(--radius-sm); padding: 12px; text-align: left; display: flex; align-items: center; gap: 10px;">
        <span style="color: var(--color-blue); flex-shrink: 0;">${window.getSVGIcon('shield', 20, 2)}</span>
        <span style="font-size: 0.78rem; color: var(--text-secondary); font-weight: 600;">
          Recomendamos baixar um backup em JSON antes de continuar para não perder suas informações.
        </span>
      </div>

      <div style="display: flex; flex-direction: column; gap: 10px; margin-top: 6px;">
        <button class="btn-primary" onclick="window.store.exportJSON(); window.showToast('Backup JSON baixado com sucesso!');">
          ${window.getSVGIcon('download', 18, 2)} Baixar Backup Primeiro
        </button>

        <button class="btn-secondary" onclick="window.store.populateDemoData(); window.showToast('Dados de demonstração carregados!'); location.reload();" style="border-color: rgba(255, 149, 0, 0.4); color: var(--color-orange);">
          ${window.getSVGIcon('rotate-ccw', 16, 2)} Carregar Dados Demo
        </button>

        <button class="btn-secondary" onclick="window.closeModal()" style="margin-top: 2px;">
          Cancelar
        </button>
      </div>
    </div>
  `;

  window.openModal('Aviso de Substituição', html);
};

window.confirmResetData = function () {
  const html = `
    <div style="display: flex; flex-direction: column; gap: 16px; text-align: center; padding: 10px 0;">
      <div style="width: 56px; height: 56px; border-radius: 50%; background: var(--color-red-light); color: var(--color-red); display: flex; align-items: center; justify-content: center; margin: 0 auto;">
        ${window.getSVGIcon('trash-2', 28, 2)}
      </div>

      <div>
        <h4 style="font-size: 1.1rem; font-weight: 800; color: var(--text-primary); margin-bottom: 6px;">Apagar Todos os Dados?</h4>
        <p style="font-size: 0.85rem; color: var(--text-secondary); line-height: 1.4;">
          Esta ação apagará <strong>permanentemente</strong> todas as suas transações, categorias, orçamentos e contas deste dispositivo.
        </p>
      </div>

      <div style="background: var(--bg-input); border: 1px solid var(--border-color); border-radius: var(--radius-sm); padding: 12px; text-align: left; display: flex; align-items: center; gap: 10px;">
        <span style="color: var(--color-blue); flex-shrink: 0;">${window.getSVGIcon('shield', 20, 2)}</span>
        <span style="font-size: 0.78rem; color: var(--text-secondary); font-weight: 600;">
          Deseja salvar uma cópia dos seus dados em arquivo JSON antes de apagar?
        </span>
      </div>

      <div style="display: flex; flex-direction: column; gap: 10px; margin-top: 6px;">
        <button class="btn-primary" onclick="window.store.exportJSON(); window.showToast('Backup JSON baixado!');">
          ${window.getSVGIcon('download', 18, 2)} Baixar Backup Antes de Apagar
        </button>

        <button class="btn-danger" onclick="window.store.resetData(); location.reload();">
          ${window.getSVGIcon('trash-2', 16, 2)} Apagar Tudo Definitivamente
        </button>

        <button class="btn-secondary" onclick="window.closeModal()" style="margin-top: 2px;">
          Cancelar
        </button>
      </div>
    </div>
  `;

  window.openModal('Aviso de Exclusão', html);
};
