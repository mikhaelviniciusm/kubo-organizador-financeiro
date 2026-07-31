/**
 * FinançaOS — Bank Statement Importer Component (PDF / OFX / CSV / TXT Itaú & General Banks)
 * Uses native app window.openModal for 100% design consistency
 */

window.openImportModal = function (defaultAccountId = null) {
  const accounts = window.store.getAccounts();
  const categories = window.store.getCategories();

  if (accounts.length === 0) {
    window.showToast('Cadastre ao menos uma conta bancária antes de importar.', 'warning');
    return;
  }

  const defaultAcc = defaultAccountId ? accounts.find(a => a.id === defaultAccountId) : accounts[0];
  const selectedAccId = defaultAcc ? defaultAcc.id : accounts[0].id;

  const contentHtml = `
    <!-- Step 1: Configuration & File Picker -->
    <div id="import-step-1">
      <div class="form-group">
        <label class="form-label">Selecione a Conta Destino</label>
        <select id="import-account-select" class="form-input">
          ${accounts.map(a => `<option value="${a.id}" ${a.id === selectedAccId ? 'selected' : ''}>${a.name} (${window.formatBRL(a.balance)})</option>`).join('')}
        </select>
      </div>

      <div class="form-group">
        <label class="form-label">Arquivo de Extrato</label>
        <div id="import-dropzone" style="border: 2px dashed rgba(92,158,173,0.35); background: rgba(92,158,173,0.06); border-radius: var(--radius-md); padding: 28px 16px; text-align: center; cursor: pointer; transition: var(--transition-fast);">
          <div style="display: flex; justify-content: center; color: var(--brand-teal); margin-bottom: 10px;">
            ${window.getSVGIcon('file-text', 36, 1.8)}
          </div>
          <h4 style="font-size: 0.95rem; font-weight: 800; margin-bottom: 4px; color: var(--text-primary);">Clique para selecionar ou arraste o extrato aqui</h4>
          <p style="font-size: 0.78rem; color: var(--text-secondary);">Aceita arquivos PDF, OFX ou CSV</p>
          <input type="file" id="import-file-input" accept=".pdf,.ofx,.csv,.txt" style="display: none;">
        </div>
      </div>

      <div style="display: flex; gap: 10px; margin-top: 10px;">
        <button type="button" class="btn-secondary" onclick="window.closeModal()" style="flex: 1;">Cancelar</button>
      </div>
    </div>

    <!-- Step 2: Preview & Selection Table -->
    <div id="import-step-2" style="display: none;">
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; background: var(--bg-tertiary); padding: 10px 14px; border-radius: var(--radius-sm);">
        <div>
          <span id="import-summary-count" style="font-weight: 800; color: var(--brand-teal); font-size: 0.9rem;">0 de 0 selecionadas</span>
          <div id="import-summary-total" style="font-size: 0.78rem; color: var(--text-secondary); margin-top: 2px;">Total: R$ 0,00</div>
        </div>
        <div style="display: flex; gap: 6px;">
          <button type="button" class="btn-secondary" onclick="window.toggleAllImportItems(true)" style="padding: 6px 10px; font-size: 0.75rem;">Marcar Todas</button>
          <button type="button" class="btn-secondary" onclick="window.toggleAllImportItems(false)" style="padding: 6px 10px; font-size: 0.75rem;">Desmarcar</button>
        </div>
      </div>

      <div style="max-height: 300px; overflow-y: auto; border-radius: var(--radius-sm); border: 1px solid var(--border-color); padding: 4px; margin-bottom: 18px;">
        <div id="import-items-container"></div>
      </div>

      <div style="display: flex; gap: 10px;">
        <button type="button" class="btn-secondary" onclick="window.resetImportStep()" style="flex: 1;">Voltar</button>
        <button type="button" class="btn-primary" onclick="window.processImportSubmission()" style="flex: 1.5;">Confirmar Importação</button>
      </div>
    </div>
  `;

  // Open using the native app modal sheet system
  window.openModal('Importar Extrato Bancário', contentHtml);

  // Setup event listeners after DOM injection
  setTimeout(() => {
    const dropzone = document.getElementById('import-dropzone');
    const fileInput = document.getElementById('import-file-input');

    if (!dropzone || !fileInput) return;

    dropzone.addEventListener('click', () => fileInput.click());

    dropzone.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropzone.style.borderColor = 'var(--brand-teal)';
      dropzone.style.background = 'rgba(92,158,173,0.14)';
    });

    dropzone.addEventListener('dragleave', () => {
      dropzone.style.borderColor = 'rgba(92,158,173,0.35)';
      dropzone.style.background = 'rgba(92,158,173,0.06)';
    });

    dropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropzone.style.borderColor = 'rgba(92,158,173,0.35)';
      dropzone.style.background = 'rgba(92,158,173,0.06)';
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        handleFileSelected(e.dataTransfer.files[0]);
      }
    });

    fileInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files[0]) {
        handleFileSelected(e.target.files[0]);
      }
    });
  }, 50);
};

window.parsedImportTxs = [];

window.resetImportStep = function () {
  const step1 = document.getElementById('import-step-1');
  const step2 = document.getElementById('import-step-2');
  if (step1 && step2) {
    step1.style.display = 'block';
    step2.style.display = 'none';
  }
};

function handleFileSelected(file) {
  const filename = file.name.toLowerCase();

  if (filename.endsWith('.pdf')) {
    parsePDFFile(file);
    return;
  }

  const reader = new FileReader();
  reader.onload = function (e) {
    const content = e.target.result;
    let parsed = [];

    if (filename.endsWith('.ofx') || content.includes('<OFX>') || content.includes('<STMTTRN>')) {
      parsed = parseOFX(content);
    } else {
      parsed = parseCSV(content);
    }

    if (parsed.length === 0) {
      window.showToast('Nenhuma transação válida encontrada no arquivo.', 'warning');
      return;
    }

    processParsedTransactions(parsed);
  };

  reader.readAsText(file, 'ISO-8859-1');
}

async function parsePDFFile(file) {
  try {
    if (typeof pdfjsLib === 'undefined') {
      window.showToast('Carregando leitor de PDF...', 'info');
      await loadScript('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js');
      pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    }

    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let textItems = [];

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const strings = textContent.items.map(item => item.str);
      textItems = textItems.concat(strings);
    }

    const rawText = textItems.join('\n');
    const parsed = parsePDFText(rawText, textItems);

    if (parsed.length === 0) {
      window.showToast('Nenhuma transação identificada no PDF. Tente salvar em formato OFX ou CSV no Itaú.', 'warning');
      return;
    }

    processParsedTransactions(parsed);
  } catch (err) {
    console.error('PDF Read Error:', err);
    window.showToast('Erro ao ler PDF do Itaú. Verifique o arquivo selecionado.', 'error');
  }
}

function loadScript(src) {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) return resolve();
    const script = document.createElement('script');
    script.src = src;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

function parsePDFText(rawText, textItems) {
  const txs = [];
  const combined = textItems.join(' ');
  const currentYear = new Date().getFullYear();

  const pdfRegex = /(\d{2}\/\d{2}(?:\/\d{4})?)\s+([A-Za-z0-9\*\.\s\/\-\_]{3,45}?)\s+([+-]?\d{1,3}(?:\.\d{3})*,\d{2}\s*[-+DC]?)/gi;
  let match;

  while ((match = pdfRegex.exec(combined)) !== null) {
    const rawDate = match[1].trim();
    const note = match[2].trim();
    const rawAmt = match[3].trim();

    if (note.toLowerCase().includes('saldo') || note.toLowerCase().includes('total') || note.toLowerCase().includes('subtotal')) {
      continue;
    }

    let dateStr = '';
    if (rawDate.length === 10) {
      const [d, m, y] = rawDate.split('/');
      dateStr = `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
    } else if (rawDate.length === 5) {
      const [d, m] = rawDate.split('/');
      dateStr = `${currentYear}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
    }

    let isIncome = true;
    if (rawAmt.includes('-') || rawAmt.endsWith('D') || rawAmt.startsWith('-')) {
      isIncome = false;
    }

    let cleanAmt = rawAmt.replace(/[R$\s]/g, '').replace('D', '').replace('C', '');
    cleanAmt = cleanAmt.replace(/\./g, '').replace(',', '.');
    const amount = Math.abs(parseFloat(cleanAmt) || 0);

    if (dateStr && amount > 0) {
      txs.push({
        date: dateStr,
        amount: amount,
        type: isIncome ? 'income' : 'expense',
        note: note || 'Extrato Itaú PDF'
      });
    }
  }

  if (txs.length === 0) {
    const lines = rawText.split(/\r?\n/);
    lines.forEach(line => {
      const lineMatch = line.match(/(\d{2}\/\d{2}(?:\/\d{4})?)\s+(.*?)\s+([+-]?\d{1,3}(?:\.\d{3})*,\d{2}\s*[-+DC]?)/);
      if (lineMatch) {
        const rawDate = lineMatch[1];
        const note = lineMatch[2].trim();
        const rawAmt = lineMatch[3].trim();

        if (!note.toLowerCase().includes('saldo')) {
          let dateStr = '';
          if (rawDate.length === 10) {
            const [d, m, y] = rawDate.split('/');
            dateStr = `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
          } else {
            const [d, m] = rawDate.split('/');
            dateStr = `${currentYear}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
          }

          let isIncome = !rawAmt.includes('-') && !rawAmt.endsWith('D');
          let cleanAmt = rawAmt.replace(/[R$\s]/g, '').replace('D', '').replace('C', '').replace(/\./g, '').replace(',', '.');
          const amount = Math.abs(parseFloat(cleanAmt) || 0);

          if (dateStr && amount > 0) {
            txs.push({
              date: dateStr,
              amount: amount,
              type: isIncome ? 'income' : 'expense',
              note: note || 'Transação PDF'
            });
          }
        }
      }
    });
  }

  return txs;
}

function processParsedTransactions(parsed) {
  const existingTxs = window.store.getTransactions();
  const categories = window.store.getCategories();

  window.parsedImportTxs = parsed.map((t, idx) => {
    const catId = autoDetectCategory(t.note, t.type, categories);
    const isDuplicate = existingTxs.some(ex => ex.date === t.date && Math.abs(ex.amount - t.amount) < 0.01 && ex.type === t.type);

    return {
      id: `imp-${Date.now()}-${idx}`,
      date: t.date,
      amount: t.amount,
      type: t.type,
      note: t.note,
      categoryId: catId,
      selected: !isDuplicate,
      isDuplicate: isDuplicate
    };
  });

  renderImportPreview();
}

function parseOFX(text) {
  const txs = [];
  const stmttrnRegex = /<STMTTRN>([\s\S]*?)(?:<\/STMTTRN>|(?=<STMTTRN>|<\/BANKTRANLIST>))/gi;
  let match;

  while ((match = stmttrnRegex.exec(text)) !== null) {
    const block = match[1];
    const trntype = (block.match(/<TRNTYPE>(.*)/i) || [])[1] || '';
    const dtposted = (block.match(/<DTPOSTED>(.*)/i) || [])[1] || '';
    const trnamt = (block.match(/<TRNAMT>(.*)/i) || [])[1] || '';
    const memo = (block.match(/<MEMO>(.*)/i) || [])[1] || (block.match(/<NAME>(.*)/i) || [])[1] || '';

    let dateStr = '';
    if (dtposted && dtposted.trim().length >= 8) {
      const cleanDt = dtposted.trim();
      const year = cleanDt.substring(0, 4);
      const month = cleanDt.substring(4, 6);
      const day = cleanDt.substring(6, 8);
      dateStr = `${year}-${month}-${day}`;
    }

    const cleanAmtStr = trnamt.trim().replace(',', '.');
    const numericAmt = parseFloat(cleanAmtStr) || 0;
    const amount = Math.abs(numericAmt);
    const isIncome = trntype.toUpperCase().includes('CREDIT') || numericAmt > 0;
    const cleanMemo = memo.trim().replace(/\s+/g, ' ') || (isIncome ? 'Receita Itaú' : 'Despesa Itaú');

    if (dateStr && amount > 0) {
      txs.push({
        date: dateStr,
        amount: amount,
        type: isIncome ? 'income' : 'expense',
        note: cleanMemo
      });
    }
  }
  return txs;
}

function parseCSV(text) {
  const lines = text.split(/\r?\n/).filter(line => line.trim().length > 0);
  if (lines.length < 2) return [];

  const txs = [];
  const firstLine = lines[0];
  const delimiter = firstLine.includes(';') ? ';' : (firstLine.includes('\t') ? '\t' : ',');

  lines.forEach((line, idx) => {
    const parts = line.split(delimiter).map(p => p.trim().replace(/^"/, '').replace(/"$/, ''));
    if (parts.length < 2) return;

    if (idx === 0 && (line.toLowerCase().includes('data') || line.toLowerCase().includes('valor') || line.toLowerCase().includes('lançamento'))) {
      return;
    }

    let dateStr = '';
    let note = '';
    let rawAmount = '';

    parts.forEach(part => {
      if (/^\d{2}\/\d{2}\/\d{4}$/.test(part)) {
        const [d, m, y] = part.split('/');
        dateStr = `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
      } else if (/^\d{4}-\d{2}-\d{2}$/.test(part)) {
        dateStr = part;
      } else if (/[0-9]/.test(part) && (part.includes(',') || part.includes('.') || part.startsWith('-') || part.endsWith('D') || part.endsWith('C'))) {
        if (!rawAmount) rawAmount = part;
      } else if (part.length >= 2 && !note && isNaN(part)) {
        note = part;
      }
    });

    if (dateStr && rawAmount) {
      let isIncome = true;
      if (rawAmount.includes('-') || rawAmount.endsWith('D')) {
        isIncome = false;
      }
      let cleanAmt = rawAmount.replace(/[R$\s]/g, '').replace('D', '').replace('C', '');
      cleanAmt = cleanAmt.replace(/\./g, '').replace(',', '.');
      const amount = Math.abs(parseFloat(cleanAmt) || 0);

      if (amount > 0) {
        txs.push({
          date: dateStr,
          amount: amount,
          type: isIncome ? 'income' : 'expense',
          note: note || 'Transação Importada'
        });
      }
    }
  });

  return txs;
}

function autoDetectCategory(note, type, categories) {
  const text = (note || '').toUpperCase();

  if (text.includes('UBER') || text.includes('99') || text.includes('POSTO') || text.includes('GASOLINA') || text.includes('PARQUE') || text.includes('METRO') || text.includes('VELOE') || text.includes('CONECTCAR')) {
    const cat = categories.find(c => c.name.toLowerCase().includes('transp') || c.icon === 'car');
    if (cat) return cat.id;
  }
  if (text.includes('IFOOD') || text.includes('RAPPI') || text.includes('MERCADO') || text.includes('SUPERMERCADO') || text.includes('PADARIA') || text.includes('RESTAURANTE') || text.includes('PAO DE ACUCAR') || text.includes('CARREFOUR') || text.includes('ATACADAO')) {
    const cat = categories.find(c => c.name.toLowerCase().includes('alimen') || c.icon === 'utensils');
    if (cat) return cat.id;
  }
  if (text.includes('NETFLIX') || text.includes('SPOTIFY') || text.includes('STEAM') || text.includes('PLAYSTATION') || text.includes('CINEMA') || text.includes('INGRESSO')) {
    const cat = categories.find(c => c.name.toLowerCase().includes('lazer') || c.icon === 'ticket');
    if (cat) return cat.id;
  }
  if (text.includes('SALARIO') || text.includes('RENDIMENTO') || text.includes('ESTORNO') || text.includes('PROVENTO') || text.includes('FOLHA')) {
    const cat = categories.find(c => c.name.toLowerCase().includes('salár') || c.icon === 'dollar-sign');
    if (cat) return cat.id;
  }
  if (text.includes('FARMACIA') || text.includes('DROGASIL') || text.includes('DROGARAIA') || text.includes('HOSPITAL') || text.includes('CONSULTA') || text.includes('EXAME')) {
    const cat = categories.find(c => c.name.toLowerCase().includes('saúd') || c.icon === 'heart-pulse');
    if (cat) return cat.id;
  }

  return categories[0] ? categories[0].id : 'cat-1';
}

function renderImportPreview() {
  const step1 = document.getElementById('import-step-1');
  const step2 = document.getElementById('import-step-2');
  if (step1 && step2) {
    step1.style.display = 'none';
    step2.style.display = 'block';
  }

  const container = document.getElementById('import-items-container');
  const categories = window.store.getCategories();

  if (!container) return;

  container.innerHTML = window.parsedImportTxs.map((t, idx) => `
    <div style="display: flex; align-items: center; gap: 10px; padding: 10px 12px; border-bottom: 1px solid var(--border-color); background: ${t.selected ? 'rgba(255,255,255,0.02)' : 'transparent'};">
      <input type="checkbox" id="chk-imp-${idx}" ${t.selected ? 'checked' : ''} onchange="window.updateImportSelection(${idx}, this.checked)" style="width: 18px; height: 18px; cursor: pointer;">
      
      <div style="flex: 1; min-width: 0;">
        <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px;">
          <span style="font-weight: 700; font-size: 0.88rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${t.note}</span>
          <span style="font-weight: 800; font-size: 0.88rem; color: ${t.type === 'income' ? 'var(--color-green)' : 'var(--color-red)'}; white-space: nowrap;">
            ${t.type === 'income' ? '+' : '-'}${window.formatBRL(t.amount)}
          </span>
        </div>
        
        <div style="display: flex; align-items: center; gap: 8px; margin-top: 4px; flex-wrap: wrap;">
          <span style="font-size: 0.75rem; color: var(--text-muted);">${window.formatDateBR(t.date)}</span>
          ${t.isDuplicate ? `<span style="font-size: 0.7rem; background: var(--color-orange-light); color: var(--color-orange); padding: 1px 6px; border-radius: 4px; font-weight: 700;">Possível Duplicada</span>` : ''}
          <select onchange="window.updateImportCategory(${idx}, this.value)" style="font-size: 0.75rem; padding: 2px 6px; border-radius: 6px; background: var(--glass-input); color: var(--text-primary); border: 1px solid var(--border-color);">
            ${categories.map(c => `<option value="${c.id}" ${c.id === t.categoryId ? 'selected' : ''}>${c.name}</option>`).join('')}
          </select>
        </div>
      </div>
    </div>
  `).join('');

  updateImportSummary();
}

window.updateImportSelection = function (index, checked) {
  if (window.parsedImportTxs[index]) {
    window.parsedImportTxs[index].selected = checked;
    updateImportSummary();
  }
};

window.updateImportCategory = function (index, categoryId) {
  if (window.parsedImportTxs[index]) {
    window.parsedImportTxs[index].categoryId = categoryId;
  }
};

window.toggleAllImportItems = function (selectAll) {
  window.parsedImportTxs.forEach((t, idx) => {
    t.selected = selectAll;
    const chk = document.getElementById(`chk-imp-${idx}`);
    if (chk) chk.checked = selectAll;
  });
  updateImportSummary();
};

function updateImportSummary() {
  const selectedItems = window.parsedImportTxs.filter(t => t.selected);
  const count = selectedItems.length;
  const total = selectedItems.reduce((acc, t) => acc + (t.type === 'income' ? t.amount : -t.amount), 0);

  const countEl = document.getElementById('import-summary-count');
  const totalEl = document.getElementById('import-summary-total');

  if (countEl) countEl.innerText = `${count} de ${window.parsedImportTxs.length} selecionadas`;
  if (totalEl) totalEl.innerHTML = `Saldo líquido importado: <strong style="color: ${total >= 0 ? 'var(--color-green)' : 'var(--color-red)'}">${total >= 0 ? '+' : ''}${window.formatBRL(total)}</strong>`;
}

window.processImportSubmission = function () {
  const selectedAccountId = document.getElementById('import-account-select').value;
  const itemsToImport = window.parsedImportTxs.filter(t => t.selected);

  if (itemsToImport.length === 0) {
    window.showToast('Selecione ao menos uma transação para importar.', 'warning');
    return;
  }

  const account = window.store.getAccounts().find(a => a.id === selectedAccountId);
  const accountName = account ? account.name : 'Conta Geral';

  let addedCount = 0;
  itemsToImport.forEach(item => {
    window.store.addTransaction({
      date: item.date,
      type: item.type,
      amount: item.amount,
      categoryId: item.categoryId,
      paymentMethod: accountName,
      accountId: selectedAccountId,
      note: item.note
    });
    addedCount++;
  });

  window.showToast(`${addedCount} transações importadas com sucesso para ${accountName}!`, 'success');
  window.closeModal();

  if (window.activeTab === 'transactions' && typeof window.renderTransactions === 'function') {
    const container = document.getElementById('view-transactions');
    if (container) window.renderTransactions(container);
  }
  if (window.renderDashboard) window.renderDashboard();
};
