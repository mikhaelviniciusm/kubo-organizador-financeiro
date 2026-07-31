/**
 * FinançaOS — Contas a Pagar Component Renderer (With Recurring Badges)
 */

window.renderBills = function(container) {
  const bills = window.store.getBills();
  const categories = window.store.getCategories();
  const todayStr = new Date().toISOString().split('T')[0];

  const pendingBills = bills.filter(b => !b.isPaid);
  const paidBills = bills.filter(b => b.isPaid);

  const totalPendingAmount = pendingBills.reduce((acc, b) => acc + Number(b.amount), 0);

  container.innerHTML = `
    <!-- Top Summary Card (Matching Contas & Cartões Header Style) -->
    <div class="card full-width-card">
        <div style="display: flex; flex-direction: column; gap: 12px;">
          <div style="display: flex; align-items: center; justify-content: space-between;">
            <div>
              <span class="card-subtitle">Total de Contas Pendentes</span>
              <div class="balance-amount" style="color: var(--color-orange); font-size: 1.8rem;">${window.formatBRL(totalPendingAmount)}</div>
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr; margin-top: 4px;">
            <button class="btn-primary" onclick="window.openAddBillModal()" style="padding: 10px 12px; font-size: 0.82rem; white-space: nowrap; display: flex; align-items: center; justify-content: center; gap: 6px;">
              ${window.getSVGIcon('file-text', 16, 2)} Nova Conta a Pagar
            </button>
          </div>
        </div>
      </div>

      <!-- Pending Bills Section -->
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">
            ${window.getSVGIcon('alert-circle', 18, 2)} Contas Pendentes (${pendingBills.length})
          </h3>
        </div>

        <div style="display: flex; flex-direction: column; gap: 12px;">
          ${pendingBills.length === 0 ? `
            <div style="text-align: center; padding: 25px 10px; color: var(--text-muted);">
              <div style="display: flex; justify-content: center; margin-bottom: 8px;">
                ${window.getSVGIcon('check-circle', 36, 1.5)}
              </div>
              <p style="font-size: 0.88rem; font-weight: 600; color: var(--text-secondary);">Nenhuma conta pendente! Tudo em dia.</p>
            </div>
          ` : ''}

          ${pendingBills.map(b => {
            const isOverdue = b.dueDate < todayStr;
            const cat = categories.find(c => c.id === b.categoryId) || { icon: 'file-text', name: 'Contas', color: '#5856D6' };
            const itemBorderColor = isOverdue ? 'rgba(255, 59, 48, 0.4)' : 'var(--border-color)';
            const itemBg = isOverdue ? 'rgba(255, 59, 48, 0.08)' : 'var(--bg-input)';

            return `
              <div style="display: flex; align-items: center; justify-content: space-between; padding: 14px; background: ${itemBg}; border-radius: var(--radius-sm); border: 1px solid ${itemBorderColor}; gap: 10px;">
                <div onclick="window.openEditBillModal('${b.id}')" title="Clique para editar ou excluir" style="display: flex; align-items: center; gap: 12px; cursor: pointer; min-width: 0; flex: 1;">
                  <div style="width: 42px; height: 42px; border-radius: var(--radius-sm); background-color: ${isOverdue ? 'rgba(255, 59, 48, 0.2)' : (cat.color + '22')}; color: ${isOverdue ? 'var(--color-red)' : cat.color}; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                    ${window.getSVGIcon(isOverdue ? 'alert-triangle' : cat.icon, 20, 2)}
                  </div>
                  <div style="min-width: 0; flex: 1;">
                    <div style="font-weight: 800; font-size: 0.95rem; color: var(--text-primary); word-break: break-word; line-height: 1.25;">
                      ${b.title}
                    </div>
                    <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap; margin-top: 4px;">
                      ${b.isRecurring ? `<span style="background: rgba(0,122,255,0.15); color: var(--color-blue); font-size: 0.68rem; padding: 2px 6px; border-radius: 4px; font-weight: 700; display: inline-flex; align-items: center; gap: 3px;">${window.getSVGIcon('repeat', 10, 2)} Recorrente</span>` : ''}
                      <span style="font-size: 0.75rem; color: ${isOverdue ? 'var(--color-red)' : 'var(--text-secondary)'}; font-weight: 600;">
                        ${isOverdue ? '⚠️ Vencida em:' : 'Vence em:'} ${window.formatDateBR(b.dueDate)}
                      </span>
                    </div>
                  </div>
                </div>

                <div style="text-align: right; display: flex; flex-direction: column; align-items: flex-end; gap: 6px; flex-shrink: 0;">
                  <div class="hide-val" style="font-weight: 800; font-size: 1rem; color: ${isOverdue ? 'var(--color-red)' : 'var(--text-primary)'}; white-space: nowrap;">
                    ${window.formatBRL(b.amount)}
                  </div>
                  <button onclick="window.openPayBillModal('${b.id}')"
                          style="background: var(--color-green-light); color: var(--color-green); border: none; padding: 6px 12px; border-radius: var(--radius-xs); font-weight: 700; font-size: 0.75rem; cursor: pointer; display: flex; align-items: center; gap: 4px;">
                    ${window.getSVGIcon('check-circle', 14, 2)} Pagar
                  </button>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>

      <!-- Paid Bills History Section -->
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">
            ${window.getSVGIcon('check-circle', 18, 2)} Contas Já Pagas (${paidBills.length})
          </h3>
        </div>

        <div style="display: flex; flex-direction: column; gap: 10px;">
          ${paidBills.length === 0 ? '<p style="color: var(--text-muted); font-size: 0.85rem; text-align: center; padding: 10px;">Nenhuma conta paga registrada.</p>' : ''}
          ${paidBills.map(b => {
            const cat = categories.find(c => c.id === b.categoryId) || { icon: 'file-text', name: 'Contas', color: '#34C759' };
            const actualPaymentDate = b.paidDate || todayStr;

            return `
              <div style="display: flex; align-items: center; justify-content: space-between; padding: 14px; background: var(--bg-input); border-radius: var(--radius-sm); border: 1px solid var(--border-color); opacity: 0.85; gap: 10px;">
                <div onclick="window.openEditBillModal('${b.id}')" title="Clique para editar ou excluir" style="display: flex; align-items: center; gap: 12px; cursor: pointer; min-width: 0; flex: 1;">
                  <div style="width: 42px; height: 42px; border-radius: var(--radius-sm); background: var(--color-green-light); color: var(--color-green); display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                    ${window.getSVGIcon('check-circle', 20, 2)}
                  </div>
                  <div style="min-width: 0; flex: 1;">
                    <div style="font-weight: 700; font-size: 0.95rem; text-decoration: line-through; color: var(--text-primary); word-break: break-word; line-height: 1.25;">
                      ${b.title}
                    </div>
                    <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap; margin-top: 4px;">
                      ${b.isRecurring ? `<span style="background: rgba(0,122,255,0.15); color: var(--color-blue); font-size: 0.68rem; padding: 2px 6px; border-radius: 4px; font-weight: 700; display: inline-flex; align-items: center; gap: 3px;">${window.getSVGIcon('repeat', 10, 2)} Recorrente</span>` : ''}
                      <span style="font-size: 0.75rem; color: var(--text-muted); font-weight: 600;">
                        Paga em ${window.formatDateBR(actualPaymentDate)}
                      </span>
                    </div>
                  </div>
                </div>

                <div style="text-align: right; display: flex; flex-direction: column; align-items: flex-end; gap: 6px; flex-shrink: 0;">
                  <div class="hide-val" style="font-weight: 800; font-size: 0.95rem; color: var(--color-green); white-space: nowrap;">
                    ${window.formatBRL(b.amount)}
                  </div>
                  <button onclick="window.store.unmarkBillPaid('${b.id}'); window.showToast('Pagamento desfeito! Conta de volta para pendentes.', 'info'); window.refreshBillsView();"
                          style="background: var(--bg-tertiary); color: var(--text-secondary); border: 1px solid var(--border-color); padding: 5px 10px; border-radius: var(--radius-xs); font-weight: 700; font-size: 0.72rem; cursor: pointer; display: flex; align-items: gap: 4px;" title="Desfazer pagamento">
                    ${window.getSVGIcon('rotate-ccw', 12, 2)} Desfazer
                  </button>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
  `;
};

window.refreshBillsView = function() {
  const container = document.getElementById('planning-sub-content') || document.getElementById('sub-view-bills');
  if (container && window.renderBills) {
    window.renderBills(container);
  }
};
