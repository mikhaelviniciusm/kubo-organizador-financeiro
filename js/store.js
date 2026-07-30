/**
 * FinançaOS — State Management with Goal Withdrawal API Support
 */

const STORAGE_KEY = 'financaos_db_v1';

// Default Categories Configuration with SVG icon names
const DEFAULT_CATEGORIES = [
  { id: 'cat-1', name: 'Alimentação', icon: 'utensils', color: '#FF9500', type: 'expense' },
  { id: 'cat-2', name: 'Moradia', icon: 'home', color: '#5856D6', type: 'expense' },
  { id: 'cat-3', name: 'Transporte', icon: 'car', color: '#007AFF', type: 'expense' },
  { id: 'cat-4', name: 'Lazer', icon: 'ticket', color: '#AF52DE', type: 'expense' },
  { id: 'cat-5', name: 'Saúde', icon: 'heart-pulse', color: '#FF2D55', type: 'expense' },
  { id: 'cat-6', name: 'Educação', icon: 'book-open', color: '#5AC8FA', type: 'expense' },
  { id: 'cat-7', name: 'Compras', icon: 'shopping-bag', color: '#FF3B30', type: 'expense' },
  { id: 'cat-8', name: 'Salário', icon: 'briefcase', color: '#34C759', type: 'income' },
  { id: 'cat-9', name: 'Investimentos', icon: 'trending-up', color: '#30B0C7', type: 'income' },
  { id: 'cat-10', name: 'Extra', icon: 'zap', color: '#34C759', type: 'income' },
  { id: 'cat-11', name: 'Outros', icon: 'package', color: '#8E8E93', type: 'expense' }
];

// Default Accounts Configuration
const DEFAULT_ACCOUNTS = [
  { id: 'acc-1', name: 'Conta Corrente', type: 'checking', balance: 3500.00, color: '#007AFF', bank: 'Nubank', icon: 'wallet' },
  { id: 'acc-2', name: 'Reserva de Emergência', type: 'savings', balance: 12000.00, color: '#34C759', bank: 'Inter', icon: 'piggy-bank' },
  { id: 'acc-3', name: 'Cartão de Crédito Ultra', type: 'credit', limit: 8000.00, closingDay: 5, dueDay: 12, balance: 1450.00, color: '#AF52DE', bank: 'XP', icon: 'credit-card' }
];

// Default Budgets Configuration
const DEFAULT_BUDGETS = [
  { categoryId: 'cat-1', monthlyLimit: 1200.00 },
  { categoryId: 'cat-2', monthlyLimit: 1800.00 },
  { categoryId: 'cat-3', monthlyLimit: 500.00 },
  { categoryId: 'cat-4', monthlyLimit: 600.00 }
];

// Default Goals Configuration
const DEFAULT_GOALS = [
  { id: 'goal-1', title: 'Reserva de Emergência (6 Meses)', targetAmount: 20000.00, currentAmount: 12000.00, icon: 'shield', targetDate: '2026-12-31' },
  { id: 'goal-2', title: 'Viagem para Europa', targetAmount: 15000.00, currentAmount: 4500.00, icon: 'plane', targetDate: '2027-06-30' }
];

// Default Bills Configuration
const DEFAULT_BILLS = [
  { id: 'bill-1', title: 'Aluguel do Apê', amount: 1500.00, dueDate: '2026-08-05', isPaid: false, isRecurring: true, categoryId: 'cat-2', accountId: 'acc-1' },
  { id: 'bill-2', title: 'Fatura do Cartão', amount: 1450.00, dueDate: '2026-08-12', isPaid: false, isRecurring: false, categoryId: 'cat-7', accountId: 'acc-1' },
  { id: 'bill-3', title: 'Assinatura Netflix & Spotify', amount: 79.90, dueDate: '2026-08-15', isPaid: true, isRecurring: true, paidDate: new Date().toISOString().split('T')[0], categoryId: 'cat-4', accountId: 'acc-3' }
];

class FinanceStore {
  constructor() {
    this.listeners = [];
    this.data = this.loadFromStorage();
  }

  loadFromStorage() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.categories) {
          parsed.categories.forEach(c => {
            const def = DEFAULT_CATEGORIES.find(dc => dc.id === c.id);
            if (def) c.icon = def.icon;
          });
        }
        return parsed;
      }
    } catch (e) {
      console.error('Erro ao carregar dados do localStorage', e);
    }
    return this.createInitialSeed();
  }

  createInitialSeed() {
    const today = new Date();
    const currYear = today.getFullYear();
    const currMonth = String(today.getMonth() + 1).padStart(2, '0');

    return {
      version: '1.0.0',
      theme: 'dark',
      security: { isPinEnabled: false, pinCode: '' },
      categories: DEFAULT_CATEGORIES,
      accounts: DEFAULT_ACCOUNTS,
      budgets: DEFAULT_BUDGETS,
      goals: DEFAULT_GOALS,
      bills: DEFAULT_BILLS,
      transactions: [
        {
          id: 'tx-1',
          type: 'income',
          amount: 5500.00,
          categoryId: 'cat-8',
          accountId: 'acc-1',
          paymentMethod: 'Pix',
          date: `${currYear}-${currMonth}-01`,
          note: 'Salário mensal',
          tags: ['trabalho']
        },
        {
          id: 'tx-2',
          type: 'expense',
          amount: 450.00,
          categoryId: 'cat-1',
          accountId: 'acc-1',
          paymentMethod: 'Débito',
          date: `${currYear}-${currMonth}-03`,
          note: 'Supermercado da semana',
          tags: ['essencial']
        },
        {
          id: 'tx-3',
          type: 'expense',
          amount: 89.90,
          categoryId: 'cat-4',
          accountId: 'acc-3',
          paymentMethod: 'Crédito',
          date: `${currYear}-${currMonth}-04`,
          note: 'Jantar com amigos',
          tags: ['lazer']
        },
        {
          id: 'tx-4',
          type: 'expense',
          amount: 120.00,
          categoryId: 'cat-3',
          accountId: 'acc-1',
          paymentMethod: 'Pix',
          date: `${currYear}-${currMonth}-05`,
          note: 'Combustível',
          tags: ['carro']
        }
      ]
    };
  }

  save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
      this.notify();
    } catch (e) {
      console.error('Erro ao salvar no localStorage', e);
    }
  }

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notify() {
    this.listeners.forEach(fn => fn(this.data));
  }

  applyTxToAccount(acc, type, amount, isRevert = false) {
    if (!acc) return;
    const numAmount = Number(amount) || 0;

    if (acc.type === 'credit') {
      if (type === 'expense') {
        acc.balance += isRevert ? -numAmount : numAmount;
      } else if (type === 'income') {
        acc.balance += isRevert ? numAmount : -numAmount;
      }
    } else {
      if (type === 'expense') {
        acc.balance += isRevert ? numAmount : -numAmount;
      } else if (type === 'income') {
        acc.balance += isRevert ? -numAmount : numAmount;
      }
    }
  }

  // --- Transactions API ---
  getTransactions() {
    return this.data.transactions || [];
  }

  addTransaction(tx) {
    const installmentsCount = Number(tx.installmentsCount) || 1;
    const isRecurring = tx.isRecurring || false;
    const recurringFrequency = tx.recurringFrequency || 'monthly';

    if (installmentsCount > 1) {
      const totalAmount = Number(tx.amount);
      const installmentAmount = totalAmount / installmentsCount;
      const groupId = 'inst-grp-' + Date.now();
      const baseDate = tx.date || new Date().toISOString().split('T')[0];

      const createdTxs = [];
      for (let i = 1; i <= installmentsCount; i++) {
        const instDate = window.addMonthsToDateStr(baseDate, i - 1);
        const instTx = {
          id: `tx-inst-${Date.now()}-${i}`,
          type: tx.type || 'expense',
          amount: installmentAmount,
          categoryId: tx.categoryId,
          accountId: tx.accountId,
          paymentMethod: tx.paymentMethod || 'Crédito',
          date: instDate,
          note: `${tx.note} (${i}/${installmentsCount})`,
          installmentGroup: groupId,
          installmentCurrent: i,
          installmentTotal: installmentsCount,
          totalPurchaseAmount: totalAmount
        };

        this.data.transactions.unshift(instTx);
        const acc = this.data.accounts.find(a => a.id === tx.accountId);
        if (acc) {
          this.applyTxToAccount(acc, instTx.type, instTx.amount, false);
        }
        createdTxs.push(instTx);
      }
      this.save();
      return createdTxs[0];
    } else {
      const newTx = {
        id: 'tx-' + Date.now(),
        date: new Date().toISOString().split('T')[0],
        note: '',
        tags: isRecurring ? ['recorrente'] : [],
        isRecurring,
        recurringFrequency,
        ...tx
      };
      this.data.transactions.unshift(newTx);

      const acc = this.data.accounts.find(a => a.id === newTx.accountId);
      if (acc) {
        this.applyTxToAccount(acc, newTx.type, newTx.amount, false);
      }

      this.save();
      return newTx;
    }
  }

  updateTransaction(id, updatedFields) {
    const tx = this.data.transactions.find(t => t.id === id);
    if (!tx) return;

    const oldAcc = this.data.accounts.find(a => a.id === tx.accountId);
    if (oldAcc) {
      this.applyTxToAccount(oldAcc, tx.type, tx.amount, true);
    }

    Object.assign(tx, updatedFields);

    const newAcc = this.data.accounts.find(a => a.id === tx.accountId);
    if (newAcc) {
      this.applyTxToAccount(newAcc, tx.type, tx.amount, false);
    }

    this.save();
  }

  deleteTransaction(id) {
    const txIndex = this.data.transactions.findIndex(t => t.id === id);
    if (txIndex !== -1) {
      const tx = this.data.transactions[txIndex];
      const acc = this.data.accounts.find(a => a.id === tx.accountId);
      if (acc) {
        this.applyTxToAccount(acc, tx.type, tx.amount, true);
      }
      this.data.transactions.splice(txIndex, 1);
      this.save();
    }
  }

  // --- Accounts API ---
  getAccounts() {
    return this.data.accounts || [];
  }

  addAccount(acc) {
    const newAcc = {
      id: 'acc-' + Date.now(),
      balance: 0,
      color: '#007AFF',
      icon: 'bank',
      ...acc
    };
    this.data.accounts.push(newAcc);
    this.save();
    return newAcc;
  }

  updateAccount(id, updatedFields) {
    const acc = this.data.accounts.find(a => a.id === id);
    if (acc) {
      Object.assign(acc, updatedFields);
      this.save();
    }
  }

  deleteAccount(id) {
    const idx = this.data.accounts.findIndex(a => a.id === id);
    if (idx !== -1) {
      this.data.accounts.splice(idx, 1);
      this.save();
    }
  }

  transferFunds(fromId, toId, amount) {
    const fromAcc = this.data.accounts.find(a => a.id === fromId);
    const toAcc = this.data.accounts.find(a => a.id === toId);

    if (fromAcc && toAcc && amount > 0) {
      this.applyTxToAccount(fromAcc, 'expense', amount, false);
      this.applyTxToAccount(toAcc, 'income', amount, false);

      this.addTransaction({
        type: 'transfer',
        amount: Number(amount),
        categoryId: 'cat-11',
        accountId: fromId,
        paymentMethod: 'Transferência',
        note: `Transferência de ${fromAcc.name} para ${toAcc.name}`
      });

      this.save();
    }
  }

  // --- Budgets API ---
  getBudgets() {
    return this.data.budgets || [];
  }

  setBudget(categoryId, limit) {
    const existing = this.data.budgets.find(b => b.categoryId === categoryId);
    if (existing) {
      existing.monthlyLimit = Number(limit);
    } else {
      this.data.budgets.push({ categoryId, monthlyLimit: Number(limit) });
    }
    this.save();
  }

  deleteBudget(categoryId) {
    const idx = this.data.budgets.findIndex(b => b.categoryId === categoryId);
    if (idx !== -1) {
      this.data.budgets.splice(idx, 1);
      this.save();
    }
  }

  // --- Goals API (With Deposit & Withdrawal Support) ---
  getGoals() {
    return this.data.goals || [];
  }

  addGoal(goal) {
    const newGoal = {
      id: 'goal-' + Date.now(),
      currentAmount: 0,
      icon: 'target',
      ...goal
    };
    this.data.goals.push(newGoal);
    this.save();
    return newGoal;
  }

  updateGoal(id, updatedFields) {
    const goal = this.data.goals.find(g => g.id === id);
    if (goal) {
      Object.assign(goal, updatedFields);
      this.save();
    }
  }

  deleteGoal(id) {
    const idx = this.data.goals.findIndex(g => g.id === id);
    if (idx !== -1) {
      this.data.goals.splice(idx, 1);
      this.save();
    }
  }

  updateGoalDeposit(goalId, depositAmount) {
    const goal = this.data.goals.find(g => g.id === goalId);
    if (goal) {
      goal.currentAmount += Number(depositAmount);
      this.save();
    }
  }

  updateGoalWithdraw(goalId, withdrawAmount) {
    const goal = this.data.goals.find(g => g.id === goalId);
    if (goal) {
      goal.currentAmount = Math.max(0, goal.currentAmount - Number(withdrawAmount));
      this.save();
    }
  }

  // --- Bills API ---
  getBills() {
    return this.data.bills || [];
  }

  addBill(bill) {
    const newBill = {
      id: 'bill-' + Date.now(),
      isPaid: false,
      isRecurring: false,
      ...bill
    };
    this.data.bills.push(newBill);
    this.save();
    return newBill;
  }

  updateBill(id, updatedFields) {
    const bill = this.data.bills.find(b => b.id === id);
    if (bill) {
      Object.assign(bill, updatedFields);
      this.save();
    }
  }

  deleteBill(id) {
    const idx = this.data.bills.findIndex(b => b.id === id);
    if (idx !== -1) {
      this.data.bills.splice(idx, 1);
      this.save();
    }
  }

  markBillPaid(billId, accountId, paymentMethod = 'Pix', date = null) {
    const bill = this.data.bills.find(b => b.id === billId);
    if (bill && !bill.isPaid) {
      const payDate = date || new Date().toISOString().split('T')[0];
      bill.isPaid = true;
      bill.paidDate = payDate;
      bill.accountId = accountId;

      this.addTransaction({
        type: 'expense',
        amount: bill.amount,
        categoryId: bill.categoryId || 'cat-2',
        accountId: accountId,
        paymentMethod: paymentMethod,
        date: payDate,
        note: `Pagamento: ${bill.title}`
      });

      if (bill.isRecurring) {
        const nextDueDate = window.addMonthsToDateStr(bill.dueDate, 1);
        const nextBillExists = this.data.bills.some(b => b.title === bill.title && b.dueDate === nextDueDate);
        if (!nextBillExists) {
          this.data.bills.push({
            id: 'bill-' + Date.now() + '-next',
            title: bill.title,
            amount: bill.amount,
            dueDate: nextDueDate,
            isPaid: false,
            isRecurring: true,
            categoryId: bill.categoryId,
            accountId: bill.accountId
          });
        }
      }

      this.save();
    }
  }

  unmarkBillPaid(billId) {
    const bill = this.data.bills.find(b => b.id === billId);
    if (bill && bill.isPaid) {
      bill.isPaid = false;
      delete bill.paidDate;

      const txIndex = this.data.transactions.findIndex(t => t.note === `Pagamento: ${bill.title}`);
      if (txIndex !== -1) {
        const tx = this.data.transactions[txIndex];
        this.deleteTransaction(tx.id);
      } else {
        this.save();
      }
    }
  }

  getCategories() {
    return this.data.categories || DEFAULT_CATEGORIES;
  }

  getMonthlyMetrics(year, month) {
    const prefix = `${year}-${String(month).padStart(2, '0')}`;
    const txs = this.getTransactions().filter(t => t.date && t.date.startsWith(prefix));

    let income = 0;
    let expense = 0;

    txs.forEach(t => {
      if (t.type === 'income') income += Number(t.amount);
      if (t.type === 'expense') expense += Number(t.amount);
    });

    const net = income - expense;
    const savingsRate = income > 0 ? ((net / income) * 100).toFixed(1) : 0;

    const totalNetWorth = this.getAccounts().reduce((acc, a) => {
      if (a.type === 'credit') {
        return acc - (Number(a.balance) || 0);
      }
      return acc + (Number(a.balance) || 0);
    }, 0);

    return { income, expense, net, savingsRate, totalNetWorth };
  }

  exportJSON() {
    const jsonStr = JSON.stringify(this.data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `financaos-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  exportCSV() {
    const headers = ['Data', 'Tipo', 'Categoria', 'Descrição', 'Valor (R$)', 'Forma de Pagamento', 'Conta'];
    const rows = this.getTransactions().map(t => {
      const cat = this.getCategories().find(c => c.id === t.categoryId)?.name || '';
      const acc = this.getAccounts().find(a => a.id === t.accountId)?.name || '';
      return [
        t.date,
        t.type,
        `"${cat}"`,
        `"${t.note || ''}"`,
        t.amount.toFixed(2),
        `"${t.paymentMethod || ''}"`,
        `"${acc}"`
      ];
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transacoes-financaos-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  importJSON(jsonString) {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed && parsed.transactions && parsed.accounts) {
        this.data = parsed;
        this.save();
        return true;
      }
    } catch (e) {
      console.error('Import JSON Error:', e);
    }
    return false;
  }

  populateDemoData() {
    this.data = this.createInitialSeed();
    this.save();
  }

  resetData() {
    this.data = {
      version: '1.0.0',
      theme: 'dark',
      security: { isPinEnabled: false, pinCode: '' },
      categories: DEFAULT_CATEGORIES,
      accounts: [
        { id: 'acc-1', name: 'Conta Principal', type: 'checking', balance: 0.00, color: '#007AFF', bank: 'Nubank' }
      ],
      budgets: [],
      goals: [],
      bills: [],
      transactions: []
    };
    this.save();
  }
}

window.store = new FinanceStore();

// --- Date Utility for Installments & Recurrences ---
window.addMonthsToDateStr = function (dateStr, monthsToAdd) {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-').map(Number);

  // Calculate target year and month (0-indexed month for arithmetic)
  const totalMonths = (m - 1) + monthsToAdd;
  const resYear  = y + Math.floor(totalMonths / 12);
  const resMonth = ((totalMonths % 12) + 12) % 12; // keep in [0,11]

  // Clamp day to the last day of the target month to avoid overflow
  const lastDayOfMonth = new Date(resYear, resMonth + 1, 0).getDate();
  const resDay = Math.min(d, lastDayOfMonth);

  return `${resYear}-${String(resMonth + 1).padStart(2, '0')}-${String(resDay).padStart(2, '0')}`;
};

// --- BRL Format & Currency Input Mask Utilities ---
window.formatBRL = function (amount) {
  const formatted = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(amount || 0);
  return formatted.replace(/\s/g, '\u00A0');
};

window.formatValueBR = function (num) {
  if (num === null || num === undefined || isNaN(num)) return '0,00';
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(num);
};

window.parseCurrencyValue = function (str) {
  if (typeof str === 'number') return str;
  if (!str) return 0;
  const clean = String(str).replace(/[^0-9,-]/g, '').replace(',', '.');
  return parseFloat(clean) || 0;
};

window.applyCurrencyMask = function (inputEl) {
  if (!inputEl) return;
  inputEl.addEventListener('input', (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (!value) {
      e.target.value = '';
      return;
    }
    const floatVal = parseFloat(value) / 100;
    e.target.value = window.formatValueBR(floatVal);
  });
};

window.formatDateBR = function (dateStr) {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return dateStr;
};
