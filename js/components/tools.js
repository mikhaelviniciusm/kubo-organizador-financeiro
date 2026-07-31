/**
 * FinançaOS — Financial Tools, Currency Converter, Categories & Security Hub
 */

window.currentToolsSubTab = 'calculators';

window.renderTools = function (container) {
  const security = window.store.data.security || { isPinEnabled: false, pinCode: '' };
  const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
  const isPrivacyActive = window.store.data.hideValues || false;

  if (!['calculators', 'utilities', 'settings'].includes(window.currentToolsSubTab)) {
    window.currentToolsSubTab = 'calculators';
  }

  container.innerHTML = `
    <!-- Top Segmented Control for Tools Sub-tabs -->
    <div class="segmented-control">
      <button class="${window.currentToolsSubTab === 'calculators' ? 'active' : ''}" onclick="window.switchToolsSubTab('calculators')">Calculadoras</button>
      <button class="${window.currentToolsSubTab === 'utilities' ? 'active' : ''}" onclick="window.switchToolsSubTab('utilities')">Utilitários</button>
      <button class="${window.currentToolsSubTab === 'settings' ? 'active' : ''}" onclick="window.switchToolsSubTab('settings')">Configurações</button>
    </div>

    <div class="tab-sub-content">
      ${window.currentToolsSubTab === 'calculators' ? renderCalculatorsSubTab() : ''}
      ${window.currentToolsSubTab === 'utilities' ? renderUtilitiesSubTab() : ''}
      ${window.currentToolsSubTab === 'settings' ? renderSettingsSubTab(security, currentTheme, isPrivacyActive) : ''}
    </div>
  `;
};

window.switchToolsSubTab = function (subTab) {
  window.currentToolsSubTab = subTab;
  const container = document.getElementById('view-tools');
  if (container) window.renderTools(container);
};

function renderCalculatorsSubTab() {
  return `
    <!-- Header Note -->
    <div style="margin-bottom: 4px;">
      <h3 style="font-size: 1rem; font-weight: 800; color: var(--text-primary); margin-bottom: 2px;">Ferramentas & Simuladores</h3>
      <p style="font-size: 0.8rem; color: var(--text-secondary);">Escolha uma calculadora abaixo para simular rendimentos, empréstimos, impostos ou aposentadoria.</p>
    </div>

    <!-- Card 1: Juros Compostos -->
    <div class="card">
      <div style="display: flex; align-items: flex-start; justify-content: space-between; gap: 12px;">
        <div style="display: flex; align-items: center; gap: 12px;">
          <div style="width: 44px; height: 44px; border-radius: var(--radius-sm); background: var(--color-green-light); color: var(--color-green); display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
            ${window.getSVGIcon('trending-up', 22, 2.5)}
          </div>
          <div>
            <h4 style="font-size: 0.98rem; font-weight: 800; color: var(--text-primary);">Juros Compostos</h4>
            <span style="font-size: 0.72rem; font-weight: 700; color: var(--color-green); text-transform: uppercase;">Investimentos</span>
          </div>
        </div>
      </div>
      <p style="font-size: 0.82rem; color: var(--text-secondary); margin-top: 10px; line-height: 1.4;">
        Simule o crescimento do seu patrimônio com aportes mensais e o efeito dos juros acumulados ao longo do tempo.
      </p>
      <button class="btn-primary" onclick="window.openCalculatorModal('compound')" style="margin-top: 12px; background: linear-gradient(135deg, #30D158 0%, #1A8C3A 100%); border-color: rgba(48,209,88,0.4);">
        Simular Rendimentos
      </button>
    </div>

    <!-- Card 2: SAC vs PRICE -->
    <div class="card">
      <div style="display: flex; align-items: flex-start; justify-content: space-between; gap: 12px;">
        <div style="display: flex; align-items: center; gap: 12px;">
          <div style="width: 44px; height: 44px; border-radius: var(--radius-sm); background: var(--color-blue-light); color: var(--color-blue); display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
            ${window.getSVGIcon('bank', 22, 2.5)}
          </div>
          <div>
            <h4 style="font-size: 0.98rem; font-weight: 800; color: var(--text-primary);">SAC vs PRICE</h4>
            <span style="font-size: 0.72rem; font-weight: 700; color: var(--color-blue); text-transform: uppercase;">Financiamentos</span>
          </div>
        </div>
      </div>
      <p style="font-size: 0.82rem; color: var(--text-secondary); margin-top: 10px; line-height: 1.4;">
        Compare as parcelas decrescentes do sistema SAC contra as parcelas fixas do sistema PRICE para imóveis e veículos.
      </p>
      <button class="btn-primary" onclick="window.openCalculatorModal('loan')" style="margin-top: 12px;">
        Simular Financiamento
      </button>
    </div>

    <!-- Card 3: Regra FIRE (4%) -->
    <div class="card">
      <div style="display: flex; align-items: flex-start; justify-content: space-between; gap: 12px;">
        <div style="display: flex; align-items: center; gap: 12px;">
          <div style="width: 44px; height: 44px; border-radius: var(--radius-sm); background: rgba(191,90,242,0.15); color: var(--color-purple); display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
            ${window.getSVGIcon('target', 22, 2.5)}
          </div>
          <div>
            <h4 style="font-size: 0.98rem; font-weight: 800; color: var(--text-primary);">Independência FIRE (4%)</h4>
            <span style="font-size: 0.72rem; font-weight: 700; color: var(--color-purple); text-transform: uppercase;">Aposentadoria</span>
          </div>
        </div>
      </div>
      <p style="font-size: 0.82rem; color: var(--text-secondary); margin-top: 10px; line-height: 1.4;">
        Calcule quanto patrimônio precisa acumular para viver de renda passiva mantendo seu custo de vida atual.
      </p>
      <button class="btn-primary" onclick="window.openCalculatorModal('fire')" style="margin-top: 12px; background: linear-gradient(135deg, #BF5AF2 0%, #8E24AA 100%); border-color: rgba(191,90,242,0.4);">
        Calcular Meta FIRE
      </button>
    </div>

    <!-- Card 4: Salário Líquido -->
    <div class="card">
      <div style="display: flex; align-items: flex-start; justify-content: space-between; gap: 12px;">
        <div style="display: flex; align-items: center; gap: 12px;">
          <div style="width: 44px; height: 44px; border-radius: var(--radius-sm); background: rgba(255,149,0,0.15); color: var(--color-orange); display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
            ${window.getSVGIcon('percent', 22, 2.5)}
          </div>
          <div>
            <h4 style="font-size: 0.98rem; font-weight: 800; color: var(--text-primary);">Salário Líquido & Impostos</h4>
            <span style="font-size: 0.72rem; font-weight: 700; color: var(--color-orange); text-transform: uppercase;">INSS & IRRF</span>
          </div>
        </div>
      </div>
      <p style="font-size: 0.82rem; color: var(--text-secondary); margin-top: 10px; line-height: 1.4;">
        Calcule os descontos oficiais de INSS e Imposto de Renda (IRRF) com base no salário bruto e dependentes.
      </p>
      <button class="btn-primary" onclick="window.openCalculatorModal('salary')" style="margin-top: 12px; background: linear-gradient(135deg, #FF9500 0%, #C66900 100%); border-color: rgba(255,149,0,0.4);">
        Calcular Salário Líquido
      </button>
    </div>

    <!-- Card 5: Amortização de Dívidas -->
    <div class="card">
      <div style="display: flex; align-items: flex-start; justify-content: space-between; gap: 12px;">
        <div style="display: flex; align-items: center; gap: 12px;">
          <div style="width: 44px; height: 44px; border-radius: var(--radius-sm); background: rgba(255,214,10,0.15); color: #FFD60A; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
            ${window.getSVGIcon('zap', 22, 2.5)}
          </div>
          <div>
            <h4 style="font-size: 0.98rem; font-weight: 800; color: var(--text-primary);">Amortização Extra de Dívidas</h4>
            <span style="font-size: 0.72rem; font-weight: 700; color: #FFD60A; text-transform: uppercase;">Economia de Juros</span>
          </div>
        </div>
      </div>
      <p style="font-size: 0.82rem; color: var(--text-secondary); margin-top: 10px; line-height: 1.4;">
        Descubra a redução de parcelas e a economia total em juros ao realizar aportes extras mensais no seu financiamento.
      </p>
      <button class="btn-primary" onclick="window.openCalculatorModal('mortgage')" style="margin-top: 12px; background: linear-gradient(135deg, #E5B200 0%, #997700 100%); border-color: rgba(255,214,10,0.4);">
        Simular Amortização
      </button>
    </div>

    <!-- Card 6: Conversor de Moedas -->
    <div class="card">
      <div style="display: flex; align-items: flex-start; justify-content: space-between; gap: 12px;">
        <div style="display: flex; align-items: center; gap: 12px;">
          <div style="width: 44px; height: 44px; border-radius: var(--radius-sm); background: var(--color-blue-light); color: var(--color-blue); display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
            ${window.getSVGIcon('dollar-sign', 22, 2.5)}
          </div>
          <div>
            <h4 style="font-size: 0.98rem; font-weight: 800; color: var(--text-primary);">Conversor de Moedas</h4>
            <span style="font-size: 0.72rem; font-weight: 700; color: var(--color-blue); text-transform: uppercase;">Câmbio & IOF</span>
          </div>
        </div>
      </div>
      <p style="font-size: 0.82rem; color: var(--text-secondary); margin-top: 10px; line-height: 1.4;">
        Converte valores em Dólar (USD), Euro (EUR) ou Libra (GBP) para Reais considerando cotação, IOF e spread bancário.
      </p>
      <button class="btn-primary" onclick="window.openCurrencyConverterModal()" style="margin-top: 12px;">
        Abrir Conversor de Moedas
      </button>
    </div>

    <!-- Card 7: Cobertura de Reserva de Emergência -->
    <div class="card">
      <div style="display: flex; align-items: flex-start; justify-content: space-between; gap: 12px;">
        <div style="display: flex; align-items: center; gap: 12px;">
          <div style="width: 44px; height: 44px; border-radius: var(--radius-sm); background: rgba(48,209,88,0.15); color: var(--color-green); display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
            ${window.getSVGIcon('piggy-bank', 22, 2.5)}
          </div>
          <div>
            <h4 style="font-size: 0.98rem; font-weight: 800; color: var(--text-primary);">Cobertura de Reserva de Emergência</h4>
            <span style="font-size: 0.72rem; font-weight: 700; color: var(--color-green); text-transform: uppercase;">Segurança Financeira</span>
          </div>
        </div>
      </div>
      <p style="font-size: 0.82rem; color: var(--text-secondary); margin-top: 10px; line-height: 1.4;">
        Descubra exatamente quantos meses de custo de vida seu saldo de Reservas atual consegue cobrir em caso de imprevistos.
      </p>
      <button class="btn-primary" onclick="window.openCalculatorModal('emergency_reserve')" style="margin-top: 12px; background: linear-gradient(135deg, #30D158 0%, #1A8C3A 100%); border-color: rgba(48,209,88,0.4);">
        Calcular Meses de Cobertura
      </button>
    </div>

    <!-- Card 8: Simulador de Meta por Prazo -->
    <div class="card">
      <div style="display: flex; align-items: flex-start; justify-content: space-between; gap: 12px;">
        <div style="display: flex; align-items: center; gap: 12px;">
          <div style="width: 44px; height: 44px; border-radius: var(--radius-sm); background: var(--color-blue-light); color: var(--color-blue); display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
            ${window.getSVGIcon('target', 22, 2.5)}
          </div>
          <div>
            <h4 style="font-size: 0.98rem; font-weight: 800; color: var(--text-primary);">Meta de Poupança por Prazo</h4>
            <span style="font-size: 0.72rem; font-weight: 700; color: var(--color-blue); text-transform: uppercase;">Planejamento de Sonhos</span>
          </div>
        </div>
      </div>
      <p style="font-size: 0.82rem; color: var(--text-secondary); margin-top: 10px; line-height: 1.4;">
        Calcule o valor exato a poupar por mês, semana e dia para realizar um objetivo ou compra dentro do prazo desejado.
      </p>
      <button class="btn-primary" onclick="window.openCalculatorModal('savings_goal')" style="margin-top: 12px;">
        Simular Meta por Prazo
      </button>
    </div>
  `;
}

function renderUtilitiesSubTab() {
  return `
    <!-- Importador de Extrato Bancário (OFX / CSV Itaú) -->
    <div class="card">
      <div class="card-header">
        <h3 class="card-title">
          ${window.getSVGIcon('upload', 18, 2)} Importar Extrato Bancário (OFX / CSV)
        </h3>
      </div>
      <p style="font-size: 0.82rem; color: var(--text-secondary);">
        Importe seu histórico de transações do Itaú, Nubank ou outros bancos em lote com categorização automática.
      </p>

      <div style="margin-top: 12px;">
        <button class="btn-primary" onclick="window.openImportModal()" style="width: 100%; display: flex; align-items: center; justify-content: center; gap: 8px; background: linear-gradient(135deg, #5C9EAD 0%, #326273 100%); border-color: rgba(92,158,173,0.4);">
          ${window.getSVGIcon('upload', 18, 2)} Importar Extrato
        </button>
      </div>
    </div>

    <!-- Fechamento de Mês & Relatório Consolidado -->
    <div class="card">
      <div class="card-header">
        <h3 class="card-title">
          ${window.getSVGIcon('file-text', 18, 2)} Fechamento de Mês
        </h3>
      </div>
      <p style="font-size: 0.82rem; color: var(--text-secondary);">
        Gere um resumo executivo consolidado do mês com opção de cópia em texto ou impressão em PDF.
      </p>

      <div style="display: flex; gap: 10px; margin-top: 12px; flex-wrap: wrap;">
        <button class="btn-primary" onclick="window.openMonthSummaryModal()" style="flex: 1; min-width: 200px; display: flex; align-items: center; justify-content: center; gap: 8px;">
          ${window.getSVGIcon('file-text', 18, 2)} Gerar Relatório
        </button>
      </div>
    </div>

    <!-- Diagnóstico de Saúde Financeira (Score 0-100) -->
    <div class="card">
      <div class="card-header">
        <h3 class="card-title">
          ${window.getSVGIcon('shield', 18, 2)} Diagnóstico de Saúde Financeira
        </h3>
      </div>
      <p style="font-size: 0.82rem; color: var(--text-secondary);">
        Avalie a saúde das suas finanças em 4 pilares estratégicos e receba um Score de 0 a 100 com conselhos práticos.
      </p>

      <div style="margin-top: 12px;">
        <button class="btn-primary" onclick="window.openFinancialHealthModal()" style="width: 100%; display: flex; align-items: center; justify-content: center; gap: 8px; background: linear-gradient(135deg, #BF5AF2 0%, #8E24AA 100%); border-color: rgba(191,90,242,0.4);">
          ${window.getSVGIcon('shield', 18, 2)} Gerar Diagnóstico
        </button>
      </div>
    </div>
  `;
}

function renderSettingsSubTab(security, currentTheme, isPrivacyActive) {
  return `
    <!-- Modo Privacidade e Segurança -->
    <div class="card">
      <div class="card-header">
        <h3 class="card-title">
          ${window.getSVGIcon('eye', 18, 2)} Privacidade & Segurança
        </h3>
      </div>

      <div style="display: flex; align-items: center; justify-content: space-between; margin-top: 6px; padding: 12px; background: var(--bg-input); border-radius: var(--radius-sm); border: 1px solid var(--border-color);">
        <div style="display: flex; align-items: center; gap: 10px;">
          <span style="color: var(--color-blue);">${window.getSVGIcon('eye-off', 20, 2)}</span>
          <div>
            <div style="font-weight: 700; font-size: 0.9rem;">Modo Discreto</div>
            <div style="font-size: 0.72rem; color: var(--text-secondary);">Desfoca saldos e valores numéricos do aplicativo</div>
          </div>
        </div>
        <input type="checkbox" id="privacy-toggle" ${isPrivacyActive ? 'checked' : ''} onchange="window.togglePrivacyMode(this.checked)" style="width: 20px; height: 20px; cursor: pointer;">
      </div>

      <div style="display: flex; align-items: center; justify-content: space-between; margin-top: 10px; padding: 12px; background: var(--bg-input); border-radius: var(--radius-sm); border: 1px solid var(--border-color);">
        <div style="display: flex; align-items: center; gap: 10px;">
          <span style="color: var(--color-purple);">${window.getSVGIcon('shield', 20, 2)}</span>
          <div>
            <div style="font-weight: 700; font-size: 0.9rem;">Bloqueio por Senha PIN</div>
            <div style="font-size: 0.72rem; color: var(--text-secondary);">Exigir senha numérica ao abrir o Kubo</div>
          </div>
        </div>
        <input type="checkbox" id="pin-toggle-checkbox" ${security.isPinEnabled ? 'checked' : ''} onchange="window.togglePinSecurity(this.checked)" style="width: 20px; height: 20px; cursor: pointer;">
      </div>
    </div>

    <!-- Appearance & Theme Settings Card -->
    <div class="card">
      <div class="card-header">
        <h3 class="card-title">
          ${window.getSVGIcon('palette', 18, 2)} Aparência
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
  `;
}

// --- Modal Openers for Financial Calculators ---
window.openCalculatorModal = function (type) {
  let title = 'Calculadora Financeira';
  let html = '';

  if (type === 'compound') {
    title = 'Calculadora de Juros Compostos';
    html = `
      <div style="display: flex; flex-direction: column; gap: 12px;">
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
          <div class="form-group">
            <label>Valor Inicial (R$)</label>
            <input type="text" inputmode="numeric" id="calc-initial" data-currency-input class="form-input" placeholder="1.000,00" style="font-weight: 700;">
          </div>
          <div class="form-group">
            <label>Aporte Mensal (R$)</label>
            <input type="text" inputmode="numeric" id="calc-monthly" data-currency-input class="form-input" placeholder="300,00" style="font-weight: 700;">
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
          <div class="form-group">
            <label>Taxa Anual (%)</label>
            <input type="number" step="0.1" id="calc-rate" class="form-input" placeholder="12" style="font-weight: 700;">
          </div>
          <div class="form-group">
            <label>Período (Anos)</label>
            <input type="number" id="calc-years" class="form-input" placeholder="5" style="font-weight: 700;">
          </div>
        </div>

        <button class="btn-primary" onclick="window.computeCompoundInterest()" style="margin-top: 4px;">
          Calcular Rendimento
        </button>

        <div id="calc-result" style="display: none; background: var(--bg-input); padding: 16px; border-radius: var(--radius-sm); margin-top: 10px; border: 1px solid var(--border-color); flex-direction: column; gap: 12px;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 0.75rem; color: var(--text-secondary); font-weight: 700; text-transform: uppercase;">Montante Total</span>
            <span style="font-size: 0.78rem; font-weight: 700; color: var(--color-green); background: var(--color-green-light); padding: 2px 8px; border-radius: var(--radius-xs);">Rendimento</span>
          </div>
          <div id="calc-total" style="font-size: 1.7rem; font-weight: 800; color: var(--color-green);">R$ 0,00</div>
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
    `;
  } else if (type === 'loan') {
    title = 'Simulador de Financiamento (SAC vs PRICE)';
    html = `
      <div style="display: flex; flex-direction: column; gap: 12px;">
        <div class="form-group">
          <label>Valor Financiado / Empréstimo (R$)</label>
          <input type="text" inputmode="numeric" id="loan-amount" data-currency-input class="form-input" placeholder="200.000,00" style="font-weight: 700;">
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
          <div class="form-group">
            <label>Taxa de Juros Anual (%)</label>
            <input type="number" step="0.1" id="loan-rate" class="form-input" placeholder="10.5" style="font-weight: 700;">
          </div>
          <div class="form-group">
            <label>Prazo (Meses)</label>
            <input type="number" id="loan-months" class="form-input" placeholder="360" style="font-weight: 700;">
          </div>
        </div>

        <button class="btn-primary" onclick="window.computeLoanSimulation()" style="margin-top: 4px;">
          Simular Financiamento
        </button>

        <div id="loan-result" style="display: none; flex-direction: column; gap: 12px; margin-top: 10px;">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
            <div style="background: var(--bg-input); padding: 14px; border-radius: var(--radius-sm); border: 1px solid var(--border-color);">
              <div style="font-size: 0.75rem; font-weight: 800; color: var(--color-blue); text-transform: uppercase; margin-bottom: 6px;">Tabela SAC (Decrescente)</div>
              <div style="font-size: 0.75rem; color: var(--text-secondary);">Primeira Parcela: <strong id="sac-first" style="color: var(--text-primary);">R$ 0</strong></div>
              <div style="font-size: 0.75rem; color: var(--text-secondary); margin-top: 2px;">Última Parcela: <strong id="sac-last" style="color: var(--text-primary);">R$ 0</strong></div>
              <div style="font-size: 0.78rem; font-weight: 800; color: var(--color-red); margin-top: 6px;">Juros: <span id="sac-interest">R$ 0</span></div>
            </div>

            <div style="background: var(--bg-input); padding: 14px; border-radius: var(--radius-sm); border: 1px solid var(--border-color);">
              <div style="font-size: 0.75rem; font-weight: 800; color: var(--color-purple); text-transform: uppercase; margin-bottom: 6px;">Tabela PRICE (Fixa)</div>
              <div style="font-size: 0.75rem; color: var(--text-secondary);">Parcela Fixa: <strong id="price-pmt" style="color: var(--text-primary);">R$ 0</strong></div>
              <div style="font-size: 0.75rem; color: var(--text-secondary); margin-top: 2px;">Total Pago: <strong id="price-total" style="color: var(--text-primary);">R$ 0</strong></div>
              <div style="font-size: 0.78rem; font-weight: 800; color: var(--color-red); margin-top: 6px;">Juros: <span id="price-interest">R$ 0</span></div>
            </div>
          </div>
        </div>
      </div>
    `;
  } else if (type === 'fire') {
    title = 'Independência Financeira (Regra dos 4% / FIRE)';
    const totalSavings = window.store.getMonthlyMetrics().totalSavings || 0;

    html = `
      <div style="display: flex; flex-direction: column; gap: 12px;">
        <div class="form-group">
          <label>Custo de Vida Mensal Desejado (R$)</label>
          <input type="text" inputmode="numeric" id="fire-expense" data-currency-input class="form-input" placeholder="5.000,00" style="font-weight: 700;">
        </div>
        <div class="form-group">
          <label>Taxa de Rendimento Real Anual (%) <span style="color: var(--text-muted); font-weight: 400;">(acima da inflação)</span></label>
          <input type="number" step="0.5" id="fire-rate" class="form-input" value="4.0" style="font-weight: 700;">
        </div>

        <button class="btn-primary" onclick="window.computeFireCalculator(${totalSavings})" style="margin-top: 4px;">
          Calcular Patrimônio Necessário
        </button>

        <div id="fire-result" style="display: none; background: var(--bg-input); padding: 16px; border-radius: var(--radius-sm); margin-top: 10px; border: 1px solid var(--border-color); flex-direction: column; gap: 12px;">
          <div style="font-size: 0.75rem; color: var(--text-secondary); font-weight: 700; text-transform: uppercase;">Patrimônio Alvo Recomendado</div>
          <div id="fire-target" style="font-size: 1.8rem; font-weight: 800; color: var(--color-green);">R$ 0,00</div>

          <div style="background: var(--bg-card); padding: 12px; border-radius: var(--radius-xs); border: 1px solid var(--border-color);">
            <div style="display: flex; justify-content: space-between; font-size: 0.78rem; font-weight: 700;">
              <span>Acumulado em Reservas: ${window.formatBRL(totalSavings)}</span>
              <span id="fire-progress-pct" style="color: var(--color-blue);">0%</span>
            </div>
            <div class="progress-bar-container" style="height: 8px; margin-top: 6px;">
              <div id="fire-bar-fill" class="progress-bar-fill" style="width: 0%; background-color: var(--color-green);"></div>
            </div>
            <div id="fire-remaining-text" style="font-size: 0.75rem; color: var(--text-secondary); margin-top: 6px; font-weight: 600;"></div>
          </div>
        </div>
      </div>
    `;
  } else if (type === 'salary') {
    title = 'Calculadora de Salário Líquido';
    html = `
      <div style="display: flex; flex-direction: column; gap: 12px;">
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
          <div class="form-group">
            <label>Salário Bruto (R$)</label>
            <input type="text" inputmode="numeric" id="salary-gross" data-currency-input class="form-input" placeholder="5.000,00" style="font-weight: 700;">
          </div>
          <div class="form-group">
            <label>Dependentes</label>
            <input type="number" id="salary-dependents" class="form-input" value="0" style="font-weight: 700;">
          </div>
        </div>

        <button class="btn-primary" onclick="window.computeNetSalary()" style="margin-top: 4px;">
          Calcular Salário Líquido
        </button>

        <div id="salary-result" style="display: none; background: var(--bg-input); padding: 16px; border-radius: var(--radius-sm); margin-top: 10px; border: 1px solid var(--border-color); flex-direction: column; gap: 12px;">
          <div style="font-size: 0.75rem; color: var(--text-secondary); font-weight: 700; text-transform: uppercase;">Salário Líquido Estimado</div>
          <div id="salary-net" style="font-size: 1.8rem; font-weight: 800; color: var(--color-green);">R$ 0,00</div>

          <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; font-size: 0.78rem; text-align: center;">
            <div style="background: var(--bg-card); padding: 8px; border-radius: var(--radius-xs); border: 1px solid var(--border-color);">
              <div style="color: var(--text-secondary); font-size: 0.7rem;">INSS</div>
              <div id="salary-inss" style="font-weight: 800; color: var(--color-red); margin-top: 2px;">R$ 0</div>
            </div>
            <div style="background: var(--bg-card); padding: 8px; border-radius: var(--radius-xs); border: 1px solid var(--border-color);">
              <div style="color: var(--text-secondary); font-size: 0.7rem;">IRRF</div>
              <div id="salary-irrf" style="font-weight: 800; color: var(--color-red); margin-top: 2px;">R$ 0</div>
            </div>
            <div style="background: var(--bg-card); padding: 8px; border-radius: var(--radius-xs); border: 1px solid var(--border-color);">
              <div style="color: var(--text-secondary); font-size: 0.7rem;">Impostos</div>
              <div id="salary-tax-pct" style="font-weight: 800; color: var(--color-orange); margin-top: 2px;">0%</div>
            </div>
          </div>
        </div>
      </div>
    `;
  } else if (type === 'mortgage') {
    title = 'Simulador de Amortização Extra de Dívidas';
    html = `
      <div style="display: flex; flex-direction: column; gap: 12px;">
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
          <div class="form-group">
            <label>Saldo Devedor Atual (R$)</label>
            <input type="text" inputmode="numeric" id="mort-balance" data-currency-input class="form-input" placeholder="150.000,00" style="font-weight: 700;">
          </div>
          <div class="form-group">
            <label>Parcela Atual (R$)</label>
            <input type="text" inputmode="numeric" id="mort-pmt" data-currency-input class="form-input" placeholder="1.800,00" style="font-weight: 700;">
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
          <div class="form-group">
            <label>Taxa de Juros Mensal (%)</label>
            <input type="number" step="0.05" id="mort-rate" class="form-input" placeholder="0.8" style="font-weight: 700;">
          </div>
          <div class="form-group">
            <label>Aporte Extra Mensal (R$)</label>
            <input type="text" inputmode="numeric" id="mort-extra" data-currency-input class="form-input" placeholder="500,00" style="font-weight: 700;">
          </div>
        </div>

        <button class="btn-primary" onclick="window.computeMortgageAmortization()" style="margin-top: 4px;">
          Calcular Economia de Amortização
        </button>

        <div id="mort-result" style="display: none; background: var(--bg-input); padding: 16px; border-radius: var(--radius-sm); margin-top: 10px; border: 1px solid var(--border-color); flex-direction: column; gap: 10px;">
          <div style="font-size: 0.75rem; color: var(--text-secondary); font-weight: 700; text-transform: uppercase;">Economia em Juros Futuros</div>
          <div id="mort-savings-interest" style="font-size: 1.7rem; font-weight: 800; color: var(--color-green);">R$ 0,00</div>
          <div id="mort-months-saved" style="font-size: 0.85rem; font-weight: 700; color: var(--color-blue);"></div>
        </div>
      </div>
    `;
  } else if (type === 'emergency_reserve') {
    title = 'Cobertura de Reserva de Emergência';
    const metrics = window.store.getMonthlyMetrics();
    const currentSavings = metrics.totalSavings || 0;
    const currentExpense = metrics.expense || 0;

    html = `
      <div style="display: flex; flex-direction: column; gap: 12px;">
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
          <div class="form-group">
            <label>Saldo de Reservas (R$)</label>
            <input type="text" inputmode="numeric" id="er-savings" data-currency-input class="form-input" value="${window.formatValueBR(currentSavings)}" style="font-weight: 700;">
          </div>
          <div class="form-group">
            <label>Custo Mensal (R$)</label>
            <input type="text" inputmode="numeric" id="er-expense" data-currency-input class="form-input" value="${window.formatValueBR(currentExpense)}" style="font-weight: 700;">
          </div>
        </div>

        <button class="btn-primary" onclick="window.computeEmergencyReserveCoverage()" style="margin-top: 4px;">
          Calcular Meses de Cobertura
        </button>

        <div id="er-result" style="display: none; background: var(--bg-input); padding: 16px; border-radius: var(--radius-sm); margin-top: 10px; border: 1px solid var(--border-color); flex-direction: column; gap: 10px;">
          <div style="font-size: 0.75rem; color: var(--text-secondary); font-weight: 700; text-transform: uppercase;">Sua Segurança Financeira</div>
          <div id="er-months" style="font-size: 1.8rem; font-weight: 800; color: var(--color-green);">0 Meses</div>
          <div id="er-status-badge" style="font-size: 0.85rem; font-weight: 700;"></div>
          <p id="er-desc" style="font-size: 0.78rem; color: var(--text-secondary); margin: 0; line-height: 1.4;"></p>
        </div>
      </div>
    `;
  } else if (type === 'savings_goal') {
    title = 'Meta de Poupança por Prazo';
    html = `
      <div style="display: flex; flex-direction: column; gap: 12px;">
        <div class="form-group">
          <label>Valor Alvo do Objetivo (R$)</label>
          <input type="text" inputmode="numeric" id="sg-target" data-currency-input class="form-input" placeholder="10.000,00" style="font-weight: 700;">
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
          <div class="form-group">
            <label>Já Possui Guardado (R$)</label>
            <input type="text" inputmode="numeric" id="sg-current" data-currency-input class="form-input" placeholder="0,00" style="font-weight: 700;">
          </div>
          <div class="form-group">
            <label>Prazo (Meses)</label>
            <input type="number" id="sg-months" class="form-input" placeholder="12" style="font-weight: 700;">
          </div>
        </div>

        <button class="btn-primary" onclick="window.computeSavingsGoal()" style="margin-top: 4px;">
          Calcular Meta de Poupança
        </button>

        <div id="sg-result" style="display: none; background: var(--bg-input); padding: 16px; border-radius: var(--radius-sm); margin-top: 10px; border: 1px solid var(--border-color); flex-direction: column; gap: 12px;">
          <div style="font-size: 0.75rem; color: var(--text-secondary); font-weight: 700; text-transform: uppercase;">Necessidade de Poupança</div>
          <div id="sg-monthly" style="font-size: 1.7rem; font-weight: 800; color: var(--color-blue);">R$ 0,00 / mês</div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-size: 0.8rem; margin-top: 2px;">
            <div style="background: var(--bg-card); padding: 10px; border-radius: var(--radius-xs); border: 1px solid var(--border-color);">
              <div style="font-size: 0.7rem; color: var(--text-secondary); font-weight: 600;">Por Semana</div>
              <div id="sg-weekly" style="font-weight: 800; font-size: 0.95rem; color: var(--text-primary); margin-top: 2px;">R$ 0,00</div>
            </div>
            <div style="background: var(--bg-card); padding: 10px; border-radius: var(--radius-xs); border: 1px solid var(--border-color);">
              <div style="font-size: 0.7rem; color: var(--text-secondary); font-weight: 600;">Por Dia</div>
              <div id="sg-daily" style="font-weight: 800; font-size: 0.95rem; color: var(--text-primary); margin-top: 2px;">R$ 0,00</div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  window.openModal(title, html);
  setTimeout(() => {
    const inputs = document.querySelectorAll('#modal-body [data-currency-input]');
    inputs.forEach(input => window.applyCurrencyMask(input));
  }, 50);
};

// --- Modal: Currency Converter ---
window.openCurrencyConverterModal = function () {
  const html = `
    <div style="display: flex; flex-direction: column; gap: 12px;">
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
        <div class="form-group">
          <label>Moeda Estrangeira</label>
          <select id="conv-type" class="form-select" onchange="window.updateCurrencyDefaults()">
            <option value="USD">Dólar (USD $)</option>
            <option value="EUR">Euro (EUR €)</option>
            <option value="GBP">Libra (GBP £)</option>
          </select>
        </div>
        <div class="form-group">
          <label>Valor em Moeda</label>
          <input type="number" step="0.01" id="conv-amount" class="form-input" placeholder="100.00" style="font-weight: 700;">
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px;">
        <div class="form-group">
          <label>Cotação (R$)</label>
          <input type="number" step="0.01" id="conv-rate" class="form-input" placeholder="5.70" style="font-weight: 700;">
        </div>
        <div class="form-group">
          <label>IOF (%)</label>
          <input type="number" step="0.1" id="conv-iof" class="form-input" value="1.1" style="font-weight: 700;">
        </div>
        <div class="form-group">
          <label>Spread (%)</label>
          <input type="number" step="0.5" id="conv-spread" class="form-input" value="2.0" style="font-weight: 700;">
        </div>
      </div>

      <button class="btn-primary" onclick="window.computeCurrencyConversion()" style="margin-top: 4px;">
        Converter para Reais (R$)
      </button>

      <div id="conv-result" style="display: none; background: var(--bg-input); padding: 16px; border-radius: var(--radius-sm); margin-top: 10px; border: 1px solid var(--border-color); flex-direction: column; gap: 8px;">
        <div style="font-size: 0.75rem; color: var(--text-secondary); font-weight: 700; text-transform: uppercase;">Valor Final em Reais</div>
        <div id="conv-total-brl" style="font-size: 1.8rem; font-weight: 800; color: var(--color-green);">R$ 0,00</div>
        <div id="conv-effective-rate" style="font-size: 0.78rem; font-weight: 600; color: var(--text-secondary);"></div>
      </div>
    </div>
  `;

  window.openModal('Conversor de Moedas', html);
  setTimeout(() => window.updateCurrencyDefaults(), 50);
};

window.updateCurrencyDefaults = function () {
  const type = document.getElementById('conv-type')?.value;
  const rateInput = document.getElementById('conv-rate');
  if (!rateInput) return;

  if (type === 'USD') rateInput.value = '5.70';
  if (type === 'EUR') rateInput.value = '6.15';
  if (type === 'GBP') rateInput.value = '7.30';
};

window.computeCurrencyConversion = function () {
  const amount = parseFloat(document.getElementById('conv-amount').value) || 0;
  const rate = parseFloat(document.getElementById('conv-rate').value) || 0;
  const iof = parseFloat(document.getElementById('conv-iof').value) || 0;
  const spread = parseFloat(document.getElementById('conv-spread').value) || 0;

  const effectiveRate = rate * (1 + spread / 100) * (1 + iof / 100);
  const totalBRL = amount * effectiveRate;

  const resEl = document.getElementById('conv-result');
  if (resEl) resEl.style.display = 'flex';
  document.getElementById('conv-total-brl').innerText = window.formatBRL(totalBRL);
  document.getElementById('conv-effective-rate').innerText = `Cotação efetiva (com impostos/spread): ${window.formatBRL(effectiveRate)} / moeda`;
};

// --- Modal: Categories Manager ---
window.openManageCategoriesModal = function () {
  const categories = window.store.getCategories();

  const html = `
    <div style="display: flex; flex-direction: column; gap: 14px;">
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <h4 style="font-weight: 800; font-size: 0.95rem;">Minhas Categorias (${categories.length})</h4>
        <button class="btn-primary" onclick="window.openAddCategoryModal()" style="width: auto; padding: 6px 12px; font-size: 0.78rem;">
          + Nova Categoria
        </button>
      </div>

      <div style="display: flex; flex-direction: column; gap: 8px; max-height: 50vh; overflow-y: auto;">
        ${categories.map(c => `
          <div style="display: flex; align-items: center; justify-content: space-between; padding: 10px 12px; background: var(--bg-input); border-radius: var(--radius-sm); border: 1px solid var(--border-color);">
            <div style="display: flex; align-items: center; gap: 10px;">
              <span style="width: 32px; height: 32px; border-radius: var(--radius-xs); background: ${c.color + '22'}; color: ${c.color}; display: flex; align-items: center; justify-content: center;">
                ${window.getSVGIcon(c.icon || 'package', 18, 2)}
              </span>
              <div>
                <div style="font-weight: 700; font-size: 0.88rem;">${c.name}</div>
                <div style="font-size: 0.68rem; color: var(--text-muted); text-transform: uppercase; font-weight: 700;">${c.type === 'income' ? 'Receita' : 'Despesa'}</div>
              </div>
            </div>
            <button onclick="window.confirmDeleteCategory('${c.id}')" style="background: none; border: none; color: var(--color-red); cursor: pointer; padding: 6px;">
              ${window.getSVGIcon('trash-2', 16, 2)}
            </button>
          </div>
        `).join('')}
      </div>
    </div>
  `;

  window.openModal('Gerenciar Categorias', html);
};

window.openAddCategoryModal = function () {
  const html = `
    <form onsubmit="window.handleAddCategory(event)">
      <div class="form-group">
        <label>Nome da Categoria</label>
        <input type="text" id="new-cat-name" class="form-input" placeholder="Ex: Assinaturas, Cursos, Pet..." required>
      </div>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
        <div class="form-group">
          <label>Tipo</label>
          <select id="new-cat-type" class="form-select">
            <option value="expense">Despesa</option>
            <option value="income">Receita</option>
          </select>
        </div>
        <div class="form-group">
          <label>Cor</label>
          <input type="color" id="new-cat-color" class="form-input" value="#007AFF" style="height: 44px; padding: 4px; cursor: pointer;">
        </div>
      </div>
      <button type="submit" class="btn-primary" style="margin-top: 10px;">Salvar Categoria</button>
    </form>
  `;

  window.openModal('Nova Categoria', html);
};

window.handleAddCategory = function (e) {
  e.preventDefault();
  const name = document.getElementById('new-cat-name').value.trim();
  const type = document.getElementById('new-cat-type').value;
  const color = document.getElementById('new-cat-color').value;

  if (name) {
    window.store.addCategory({ name, type, color, icon: 'package' });
    window.closeModal();
    window.showToast('Categoria criada com sucesso!');
  }
};

window.confirmDeleteCategory = function (id) {
  const cat = window.store.getCategories().find(c => c.id === id);
  if (!cat) return;
  window.store.deleteCategory(id);
  window.showToast('Categoria removida.');
  window.openManageCategoriesModal();
};

// --- Modal: Month Summary & Report Generator ---
window.openMonthSummaryModal = function () {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const metrics = window.store.getMonthlyMetrics(year, month);

  const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
  const monthLabel = `${monthNames[now.getMonth()]} / ${year}`;

  const html = `
    <div id="printable-month-report" style="display: flex; flex-direction: column; gap: 14px;">
      <div style="background: var(--bg-input); padding: 16px; border-radius: var(--radius-sm); border: 1px solid var(--border-color); text-align: center;">
        <div style="font-size: 0.72rem; color: var(--text-secondary); text-transform: uppercase; font-weight: 700;">Relatório de Fechamento</div>
        <div style="font-size: 1.3rem; font-weight: 800; margin: 4px 0;">${monthLabel}</div>
        <div style="font-size: 1.6rem; font-weight: 800; color: ${metrics.net >= 0 ? 'var(--color-green)' : 'var(--color-red)'}; margin-top: 4px;">
          Saldo Líquido: ${window.formatBRL(metrics.net)}
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
        <div style="background: var(--bg-input); padding: 12px; border-radius: var(--radius-sm); border: 1px solid rgba(48,209,88,0.2);">
          <div style="font-size: 0.7rem; color: var(--text-secondary); text-transform: uppercase; font-weight: 700;">Total Receitas</div>
          <div style="font-size: 1.1rem; font-weight: 800; color: var(--color-green); margin-top: 2px;">+${window.formatBRL(metrics.income)}</div>
        </div>
        <div style="background: var(--bg-input); padding: 12px; border-radius: var(--radius-sm); border: 1px solid rgba(255,69,58,0.2);">
          <div style="font-size: 0.7rem; color: var(--text-secondary); text-transform: uppercase; font-weight: 700;">Total Despesas</div>
          <div style="font-size: 1.1rem; font-weight: 800; color: var(--color-red); margin-top: 2px;">-${window.formatBRL(metrics.expense)}</div>
        </div>
      </div>

      <div style="display: flex; flex-direction: column; gap: 8px; margin-top: 4px;">
        <button class="btn-primary" onclick="window.copyMonthSummaryText('${monthLabel}', ${metrics.income}, ${metrics.expense}, ${metrics.net})">
          ${window.getSVGIcon('copy', 16, 2)} Copiar Resumo em Texto
        </button>
        <button class="btn-secondary" onclick="window.print();">
          ${window.getSVGIcon('printer', 16, 2)} Imprimir / Salvar PDF
        </button>
      </div>
    </div>
  `;

  window.openModal('Fechamento do Mês', html);
};

window.copyMonthSummaryText = function (monthLabel, income, expense, net) {
  const text = `📊 *Kubo — Fechamento Financeiro (${monthLabel})*\n\n` +
    `🟢 Receitas: ${window.formatBRL(income)}\n` +
    `🔴 Despesas: ${window.formatBRL(expense)}\n` +
    `💰 Saldo Líquido: ${window.formatBRL(net)}\n\n` +
    `Gerado via Kubo Organizador Financeiro`;

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text);
    window.showToast('Resumo copiado para a área de transferência!');
  } else {
    window.showToast(text);
  }
};

// --- Financial Calculator Logic Functions ---
window.computeCompoundInterest = function () {
  const initialStr = document.getElementById('calc-initial')?.value || '0';
  const monthlyStr = document.getElementById('calc-monthly')?.value || '0';

  const p = window.parseCurrencyValue(initialStr);
  const pmt = window.parseCurrencyValue(monthlyStr);
  const rateAnnual = parseFloat(document.getElementById('calc-rate')?.value) || 0;
  const years = parseInt(document.getElementById('calc-years')?.value) || 1;

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
  if (resEl) resEl.style.display = 'flex';
  document.getElementById('calc-total').innerText = window.formatBRL(total);
  document.getElementById('calc-invested').innerText = window.formatBRL(totalInvested);
  document.getElementById('calc-interest').innerText = window.formatBRL(interest);

  const barEl = document.getElementById('calc-bar-invested');
  if (barEl) barEl.style.width = `${investedPct}%`;
};

window.computeLoanSimulation = function () {
  const pv = window.parseCurrencyValue(document.getElementById('loan-amount')?.value || '0');
  const rateAnnual = parseFloat(document.getElementById('loan-rate')?.value) || 0;
  const n = parseInt(document.getElementById('loan-months')?.value) || 1;

  if (pv <= 0 || n <= 0) return;

  const r = (rateAnnual / 100) / 12;

  // SAC
  const sacAmortization = pv / n;
  const sacFirstPmt = sacAmortization + (pv * r);
  const sacLastPmt = sacAmortization + (sacAmortization * r);
  const sacTotalInterest = ((n + 1) * pv * r) / 2;

  // PRICE
  const pricePmt = r > 0 ? (pv * (r * Math.pow(1 + r, n))) / (Math.pow(1 + r, n) - 1) : (pv / n);
  const priceTotal = pricePmt * n;
  const priceTotalInterest = priceTotal - pv;

  const resEl = document.getElementById('loan-result');
  if (resEl) resEl.style.display = 'flex';

  document.getElementById('sac-first').innerText = window.formatBRL(sacFirstPmt);
  document.getElementById('sac-last').innerText = window.formatBRL(sacLastPmt);
  document.getElementById('sac-interest').innerText = window.formatBRL(sacTotalInterest);

  document.getElementById('price-pmt').innerText = window.formatBRL(pricePmt);
  document.getElementById('price-total').innerText = window.formatBRL(priceTotal);
  document.getElementById('price-interest').innerText = window.formatBRL(priceTotalInterest);
};

window.computeFireCalculator = function (accumulatedSavings) {
  const expense = window.parseCurrencyValue(document.getElementById('fire-expense')?.value || '0');
  const rateReal = parseFloat(document.getElementById('fire-rate')?.value) || 4.0;

  if (expense <= 0) return;

  const annualExpense = expense * 12;
  const targetPatrimony = annualExpense / (rateReal / 100);

  const resEl = document.getElementById('fire-result');
  if (resEl) resEl.style.display = 'flex';

  document.getElementById('fire-target').innerText = window.formatBRL(targetPatrimony);

  const pct = Math.min(100, Math.round((accumulatedSavings / targetPatrimony) * 100));
  document.getElementById('fire-progress-pct').innerText = `${pct}%`;
  document.getElementById('fire-bar-fill').style.width = `${pct}%`;

  const remaining = targetPatrimony - accumulatedSavings;
  document.getElementById('fire-remaining-text').innerText = remaining > 0 ?
    `Restam ${window.formatBRL(remaining)} para atingir a liberdade financeira.` :
    '🎉 Parabéns! Suas reservas ultrapassam o patrimônio necessário para o FIRE!';
};

window.computeNetSalary = function () {
  const gross = window.parseCurrencyValue(document.getElementById('salary-gross')?.value || '0');
  const dependents = parseInt(document.getElementById('salary-dependents')?.value) || 0;

  if (gross <= 0) return;

  // INSS 2024/2025 calculation
  let inss = 0;
  if (gross <= 1412) inss = gross * 0.075;
  else if (gross <= 2666.68) inss = (gross * 0.09) - 21.18;
  else if (gross <= 4000.03) inss = (gross * 0.12) - 101.18;
  else if (gross <= 7786.02) inss = (gross * 0.14) - 181.18;
  else inss = 908.86;

  // IRRF calculation
  const irrfBase = Math.max(0, gross - inss - (dependents * 189.59));
  let irrf = 0;

  if (irrfBase <= 2259.20) irrf = 0;
  else if (irrfBase <= 2826.65) irrf = (irrfBase * 0.075) - 169.44;
  else if (irrfBase <= 3751.05) irrf = (irrfBase * 0.15) - 381.44;
  else if (irrfBase <= 4664.68) irrf = (irrfBase * 0.225) - 662.77;
  else irrf = (irrfBase * 0.275) - 896.00;

  irrf = Math.max(0, irrf);
  const net = gross - inss - irrf;
  const taxPct = Math.round(((inss + irrf) / gross) * 100);

  const resEl = document.getElementById('salary-result');
  if (resEl) resEl.style.display = 'flex';

  document.getElementById('salary-net').innerText = window.formatBRL(net);
  document.getElementById('salary-inss').innerText = window.formatBRL(inss);
  document.getElementById('salary-irrf').innerText = window.formatBRL(irrf);
  document.getElementById('salary-tax-pct').innerText = `${taxPct}%`;
};

window.computeMortgageAmortization = function () {
  const balance = window.parseCurrencyValue(document.getElementById('mort-balance')?.value || '0');
  const pmt = window.parseCurrencyValue(document.getElementById('mort-pmt')?.value || '0');
  const rateMonthlyPct = parseFloat(document.getElementById('mort-rate')?.value) || 0;
  const extra = window.parseCurrencyValue(document.getElementById('mort-extra')?.value || '0');

  if (balance <= 0 || pmt <= 0 || extra <= 0) return;

  const r = rateMonthlyPct / 100;

  // Normal run
  let bNorm = balance;
  let monthsNorm = 0;
  let interestNorm = 0;
  while (bNorm > 0 && monthsNorm < 480) {
    const j = bNorm * r;
    interestNorm += j;
    const amort = pmt - j;
    if (amort <= 0) break;
    bNorm -= amort;
    monthsNorm++;
  }

  // Extra run
  let bExtra = balance;
  let monthsExtra = 0;
  let interestExtra = 0;
  while (bExtra > 0 && monthsExtra < 480) {
    const j = bExtra * r;
    interestExtra += j;
    const amort = (pmt + extra) - j;
    if (amort <= 0) break;
    bExtra -= amort;
    monthsExtra++;
  }

  const interestSaved = Math.max(0, interestNorm - interestExtra);
  const monthsSaved = Math.max(0, monthsNorm - monthsExtra);

  const resEl = document.getElementById('mort-result');
  if (resEl) resEl.style.display = 'flex';

  document.getElementById('mort-savings-interest').innerText = window.formatBRL(interestSaved);
  document.getElementById('mort-months-saved').innerText = `💡 Redução de ${monthsSaved} parcelas (quitação ${Math.round(monthsSaved / 12 * 10) / 10} anos mais rápida!).`;
};

window.handleImportJSON = function (e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function (evt) {
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
      <div style="width: 56px; height: 56px; border-radius: 50%; background: var(--color-red-light); color: var(--color-red); display: flex; align-items: center; justify-content: center; margin: 0 auto;">
        ${window.getSVGIcon('alert-triangle', 28, 2)}
      </div>

      <div>
        <h4 style="font-size: 1.1rem; font-weight: 800; color: var(--text-primary); margin-bottom: 6px;">Substituir Dados Atuais?</h4>
        <p style="font-size: 0.85rem; color: var(--text-secondary); line-height: 1.4;">
          Ao carregar os dados de demonstração, todas as suas transações, contas e metas atuais serão <strong>substituídas</strong> pelos dados de exemplo.
        </p>
      </div>

      <div style="background: var(--bg-input); border: 1px solid var(--border-color); border-radius: var(--radius-sm); padding: 12px; text-align: left; display: flex; align-items: center; gap: 10px;">
        <span style="color: var(--color-red); flex-shrink: 0;">${window.getSVGIcon('shield', 20, 2)}</span>
        <span style="font-size: 0.78rem; color: var(--text-secondary); font-weight: 600;">
          Recomendamos baixar um backup em JSON antes de continuar para não perder suas informações.
        </span>
      </div>

      <div style="display: flex; flex-direction: column; gap: 10px; margin-top: 6px;">
        <button class="btn-primary" onclick="window.store.exportJSON(); window.showToast('Backup JSON baixado com sucesso!');">
          ${window.getSVGIcon('download', 18, 2)} Baixar Backup Primeiro
        </button>

        <button class="btn-danger" onclick="window.store.populateDemoData(); window.showToast('Dados de demonstração carregados!'); location.reload();">
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

window.computeEmergencyReserveCoverage = function () {
  const savings = window.parseCurrencyValue(document.getElementById('er-savings')?.value || '0');
  const expense = window.parseCurrencyValue(document.getElementById('er-expense')?.value || '0');

  if (expense <= 0) return;

  const months = Math.round((savings / expense) * 10) / 10;
  const resEl = document.getElementById('er-result');
  if (resEl) resEl.style.display = 'flex';

  document.getElementById('er-months').innerText = `${months} Meses`;

  const badgeEl = document.getElementById('er-status-badge');
  const descEl = document.getElementById('er-desc');

  if (months < 3) {
    badgeEl.innerText = '🔴 Reserva Inicial (Abaixo do Ideal)';
    badgeEl.style.color = 'var(--color-red)';
    descEl.innerText = 'Recomenda-se formar uma reserva equivalente a pelo menos 3 a 6 meses do seu custo de vida para imprevistos e emergências.';
  } else if (months <= 6) {
    badgeEl.innerText = '🟡 Reserva Moderada (Boa Cobertura)';
    badgeEl.style.color = 'var(--color-orange)';
    descEl.innerText = 'Você tem um colchão financeiro seguro para lidar com imprevistos sem precisar recorrer a empréstimos ou cartões.';
  } else {
    badgeEl.innerText = '🟢 Reserva Sólida (Excelente Segurança)';
    badgeEl.style.color = 'var(--color-green)';
    descEl.innerText = 'Parabéns! Sua reserva garante grande estabilidade e permite que você invista o excedente com tranquilidade.';
  }
};

window.computeSavingsGoal = function () {
  const target = window.parseCurrencyValue(document.getElementById('sg-target')?.value || '0');
  const current = window.parseCurrencyValue(document.getElementById('sg-current')?.value || '0');
  const months = parseInt(document.getElementById('sg-months')?.value) || 1;

  if (target <= 0 || months <= 0) return;

  const neededTotal = Math.max(0, target - current);
  const monthly = neededTotal / months;
  const weekly = monthly / 4.33;
  const daily = monthly / 30;

  const resEl = document.getElementById('sg-result');
  if (resEl) resEl.style.display = 'flex';

  document.getElementById('sg-monthly').innerText = `${window.formatBRL(monthly)} / mês`;
  document.getElementById('sg-weekly').innerText = window.formatBRL(weekly);
  document.getElementById('sg-daily').innerText = window.formatBRL(daily);
};

window.openFinancialHealthModal = function () {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const metrics = window.store.getMonthlyMetrics(year, month);
  const budgets = window.store.getBudgets();
  const txs = window.store.getTransactions();

  const categorySpentMap = {};
  txs.forEach(t => {
    if (t.type === 'expense' && t.categoryId) {
      categorySpentMap[t.categoryId] = (categorySpentMap[t.categoryId] || 0) + Number(t.amount);
    }
  });

  const income = metrics.income || 0;
  const expense = metrics.expense || 0;
  const savings = metrics.totalSavings || 0;

  // 1. Taxa de poupança (30 pts)
  let savingsRate = income > 0 ? ((income - expense) / income) : 0;
  let scoreSavings = 0;
  if (savingsRate >= 0.20) scoreSavings = 30;
  else if (savingsRate >= 0.10) scoreSavings = 20;
  else if (savingsRate > 0) scoreSavings = 10;

  // 2. Comprometimento de Renda (25 pts)
  let commitRate = income > 0 ? (expense / income) : 1;
  let scoreCommit = 0;
  if (commitRate <= 0.50) scoreCommit = 25;
  else if (commitRate <= 0.75) scoreCommit = 15;
  else if (commitRate <= 0.90) scoreCommit = 8;

  // 3. Cobertura de Reserva (25 pts)
  let coverageMonths = expense > 0 ? (savings / expense) : (savings > 0 ? 12 : 0);
  let scoreReserve = 0;
  if (coverageMonths >= 6) scoreReserve = 25;
  else if (coverageMonths >= 3) scoreReserve = 15;
  else if (coverageMonths > 0) scoreReserve = 8;

  // 4. Orçamentos (20 pts)
  let exceededBudgets = 0;
  budgets.forEach(b => {
    const catExp = categorySpentMap[b.categoryId] || 0;
    if (catExp > b.amountLimit) exceededBudgets++;
  });
  let scoreBudgets = 0;
  if (budgets.length === 0 || exceededBudgets === 0) scoreBudgets = 20;
  else if (exceededBudgets === 1) scoreBudgets = 10;
  else scoreBudgets = 5;

  const totalScore = scoreSavings + scoreCommit + scoreReserve + scoreBudgets;

  let badgeColor = 'var(--color-green)';
  let badgeLabel = 'Excelente 🌟';
  if (totalScore < 50) { badgeColor = 'var(--color-red)'; badgeLabel = 'Atenção ⚠️'; }
  else if (totalScore < 75) { badgeColor = 'var(--color-orange)'; badgeLabel = 'Saudável ⚖️'; }

  const tips = [];
  if (scoreSavings < 20) tips.push('💡 Tente guardar pelo menos 10% a 20% das suas receitas mensais assim que receber.');
  if (scoreCommit < 15) tips.push('⚠️ Suas despesas estão comprometendo mais de 75% da sua renda. Reveja gastos dispensáveis.');
  if (scoreReserve < 15) tips.push('🛡️ Sua Reserva de Emergência cobre menos de 3 meses. Priorize formar uma reserva sólida.');
  if (exceededBudgets > 0) tips.push(`📌 Você estourou ${exceededBudgets} orçamento(s) este mês. Ajuste os limites na aba Planejar.`);
  if (tips.length === 0) tips.push('🎉 Parabéns! Suas finanças estão extremamente equilibradas e organizadas.');

  const html = `
    <div style="display: flex; flex-direction: column; gap: 14px;">
      <div style="background: var(--bg-input); padding: 18px; border-radius: var(--radius-sm); border: 1px solid var(--border-color); text-align: center; display: flex; flex-direction: column; align-items: center; gap: 6px;">
        <span style="font-size: 0.72rem; color: var(--text-secondary); text-transform: uppercase; font-weight: 700;">Score de Saúde Financeira</span>
        <div style="font-size: 2.5rem; font-weight: 900; color: ${badgeColor}; line-height: 1;">${totalScore}<span style="font-size: 1.1rem; color: var(--text-muted);">/100</span></div>
        <div style="font-size: 0.88rem; font-weight: 800; color: ${badgeColor}; background: var(--bg-card); padding: 4px 12px; border-radius: var(--radius-xs); border: 1px solid var(--border-color);">${badgeLabel}</div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
        <div style="background: var(--bg-input); padding: 10px; border-radius: var(--radius-xs); border: 1px solid var(--border-color);">
          <div style="font-size: 0.7rem; color: var(--text-secondary); font-weight: 600;">Poupança</div>
          <div style="font-weight: 800; font-size: 0.95rem; color: var(--text-primary); margin-top: 2px;">${scoreSavings}/30 pts</div>
        </div>
        <div style="background: var(--bg-input); padding: 10px; border-radius: var(--radius-xs); border: 1px solid var(--border-color);">
          <div style="font-size: 0.7rem; color: var(--text-secondary); font-weight: 600;">Comprometimento</div>
          <div style="font-weight: 800; font-size: 0.95rem; color: var(--text-primary); margin-top: 2px;">${scoreCommit}/25 pts</div>
        </div>
        <div style="background: var(--bg-input); padding: 10px; border-radius: var(--radius-xs); border: 1px solid var(--border-color);">
          <div style="font-size: 0.7rem; color: var(--text-secondary); font-weight: 600;">Reserva</div>
          <div style="font-weight: 800; font-size: 0.95rem; color: var(--text-primary); margin-top: 2px;">${scoreReserve}/25 pts</div>
        </div>
        <div style="background: var(--bg-input); padding: 10px; border-radius: var(--radius-xs); border: 1px solid var(--border-color);">
          <div style="font-size: 0.7rem; color: var(--text-secondary); font-weight: 600;">Orçamentos</div>
          <div style="font-weight: 800; font-size: 0.95rem; color: var(--text-primary); margin-top: 2px;">${scoreBudgets}/20 pts</div>
        </div>
      </div>

      <div style="background: var(--bg-input); padding: 14px; border-radius: var(--radius-sm); border: 1px solid var(--border-color); display: flex; flex-direction: column; gap: 8px;">
        <div style="font-size: 0.75rem; font-weight: 800; color: var(--text-primary); text-transform: uppercase;">Recomendações Práticas</div>
        ${tips.map(t => `<div style="font-size: 0.8rem; color: var(--text-secondary); line-height: 1.4;">${t}</div>`).join('')}
      </div>
    </div>
  `;

  window.openModal('Diagnóstico Financeiro', html);
};
