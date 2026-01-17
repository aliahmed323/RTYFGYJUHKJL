const STORAGE_KEY = 'masarif_pro_v3_ui';

const CATEGORIES = [
    // EXPENSE
    { id: 'food', type: 'expense', name: 'الغذاء', icon: 'fa-utensils', color: 'text-orange-500', bg: 'bg-orange-500/20' },
    { id: 'transport', type: 'expense', name: 'المواصلات', icon: 'fa-car', color: 'text-blue-500', bg: 'bg-blue-500/20' },
    { id: 'bills', type: 'expense', name: 'فواتير', icon: 'fa-file-invoice-dollar', color: 'text-rose-500', bg: 'bg-rose-500/20' },
    { id: 'family', type: 'expense', name: 'الأسرة', icon: 'fa-house-user', color: 'text-purple-500', bg: 'bg-purple-500/20' },
    { id: 'education', type: 'expense', name: 'التعليم', icon: 'fa-graduation-cap', color: 'text-yellow-500', bg: 'bg-yellow-500/20' },
    { id: 'investment', type: 'expense', name: 'إستثمار', icon: 'fa-arrow-trend-up', color: 'text-emerald-500', bg: 'bg-emerald-500/20' },
    { id: 'entertainment', type: 'expense', name: 'الترفيه', icon: 'fa-tv', color: 'text-pink-500', bg: 'bg-pink-500/20' },
    { id: 'shopping', type: 'expense', name: 'تسوق', icon: 'fa-bag-shopping', color: 'text-indigo-500', bg: 'bg-indigo-500/20' },
    { id: 'health', type: 'expense', name: 'الصحة', icon: 'fa-notes-medical', color: 'text-red-500', bg: 'bg-red-500/20' },
    { id: 'travel', type: 'expense', name: 'السفر', icon: 'fa-plane', color: 'text-sky-500', bg: 'bg-sky-500/20' },
    { id: 'withdraw', type: 'expense', name: 'سحب رصيد', icon: 'fa-money-bill-transfer', color: 'text-cyan-500', bg: 'bg-cyan-500/20' },

    // INCOME
    { id: 'salary', type: 'income', name: 'الراتب', icon: 'fa-money-bill-wave', color: 'text-emerald-500', bg: 'bg-emerald-500/20' },
    { id: 'rewards', type: 'income', name: 'المكافآت', icon: 'fa-trophy', color: 'text-yellow-500', bg: 'bg-yellow-500/20' },
    { id: 'gifts', type: 'income', name: 'الهدايا', icon: 'fa-gift', color: 'text-rose-500', bg: 'bg-rose-500/20' },
    { id: 'sales', type: 'income', name: 'المبيعات', icon: 'fa-shop', color: 'text-blue-500', bg: 'bg-blue-500/20' },
    { id: 'extra', type: 'income', name: 'الإضافي', icon: 'fa-wallet', color: 'text-purple-500', bg: 'bg-purple-500/20' },
    { id: 'other_inc', type: 'income', name: 'أخرى', icon: 'fa-box-open', color: 'text-gray-400', bg: 'bg-gray-500/20' },
    { id: 'add_bal', type: 'income', name: 'إضافة رصيد', icon: 'fa-circle-plus', color: 'text-emerald-400', bg: 'bg-emerald-400/20' },

    // DEBT
    { id: 'pay_debt', type: 'debt', name: 'دفع ديون وأقساط', icon: 'fa-hand-holding-dollar', color: 'text-orange-500', bg: 'bg-orange-500/20', desc: 'لاقراض جهة ما دين جديد او تسديد دين او اقساط عليك' },
    { id: 'receive_debt', type: 'debt', name: 'استلام ديون وأقساط', icon: 'fa-hand-holding-hand', color: 'text-emerald-500', bg: 'bg-emerald-500/20', desc: 'لاستلام دين جديد او تحصيل دين او اقساط ما من جهة ما' }
];

const app = {
    state: {
        wallets: [],
        transactions: [],
        currency: 'IQD',
        txFilter: 'today',
        activeCatTab: 'expense'
    },

    init() {
        this.loadData();
        if (this.state.wallets.length === 0) {
            this.state.wallets = [{ id: 1, name: 'حساب بنكي', balance: 0 }, { id: 2, name: 'الكاش', balance: 0 }];
            this.saveData();
        }

        this.donutChart = null;
        this.barChart = null;

        // Default to Transactions Tab now
        this.switchHomeTab('tx');
        this.render();
    },

    loadData() {
        const d = localStorage.getItem(STORAGE_KEY);
        if (d) this.state = { ...this.state, ...JSON.parse(d) };
    },
    saveData() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    },

    navTo(page) {
        document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active', 'text-white'));
        const btn = document.querySelector(`button[onclick="app.navTo('${page}')"]`);
        if (btn) btn.classList.add('active', 'text-white');

        document.querySelectorAll('main > section').forEach(s => s.classList.add('hidden'));
        document.getElementById(`page-${page}`).classList.remove('hidden');
    },

    switchHomeTab(tab) {
        document.querySelectorAll('.top-tab').forEach(el => { el.classList.remove('active', 'text-white'); el.style.borderBottom = 'none'; });
        const tabBtn = document.getElementById(`tab-${tab}`);
        if (tabBtn) {
            tabBtn.classList.add('active', 'text-white');
            tabBtn.style.borderBottom = '2px solid #f3f4f6';
        }

        ['stats', 'tx', 'models'].forEach(t => {
            document.getElementById(`view-${t}`).classList.add('hidden');
        });
        document.getElementById(`view-${tab}`).classList.remove('hidden');

        if (tab === 'stats') setTimeout(() => this.renderStats(), 100);
        if (tab === 'tx') this.renderTx();
    },

    toggleCurrency() {
        this.state.currency = this.state.currency === 'IQD' ? 'USD' : 'IQD';
        document.getElementById('header-currency-text').innerText = this.state.currency === 'IQD' ? 'الدينار العراقي' : 'الدولار الأمريكي';
        this.render();
    },

    setTxFilter(filter) {
        this.state.txFilter = filter;
        this.renderTx();
    },

    render() {
        this.renderTx();
        if (!document.getElementById('view-stats').classList.contains('hidden')) {
            this.renderStats();
        }
    },

    // --- Date Utilities ---
    isSameDay(d1, d2) { return d1.toDateString() === d2.toDateString(); },
    isYesterday(d1) {
        const y = new Date(); y.setDate(y.getDate() - 1);
        return this.isSameDay(d1, y);
    },
    isThisWeek(d) {
        const now = new Date();
        const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay())); // Sunday start
        startOfWeek.setHours(0, 0, 0, 0);
        return d >= startOfWeek;
    },
    isThisMonth(d) {
        const now = new Date();
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    },
    isPrevMonth(d) {
        const now = new Date();
        const prev = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        return d.getMonth() === prev.getMonth() && d.getFullYear() === prev.getFullYear();
    },

    getFilteredTotal(filter) {
        return this.state.transactions.filter(tx => {
            const d = new Date(tx.date);
            if (filter === 'today') return this.isSameDay(d, new Date());
            if (filter === 'yesterday') return this.isYesterday(d);
            if (filter === 'week') return this.isThisWeek(d);
            if (filter === 'month') return this.isThisMonth(d);
            if (filter === 'prevMonth') return this.isPrevMonth(d);
            if (filter === 'all') return true;
            return true;
        }).reduce((a, b) => a + b.amount, 0);
    },

    renderTx() {
        const container = document.getElementById('transactions-list-container');
        if (!container) return;
        container.innerHTML = '';

        // 1. Update Slider Cards
        const sliderContainer = document.getElementById('tx-date-slider');
        if (sliderContainer) {
            // ORDER: Prev Month -> Prev Week (mock) -> Month -> Week -> Yesterday -> Today
            // NOTE: Adjusted order to be logical flow or as per user specific ordering.
            // User drawing: [Prev Month] [Month] [Week] [Yesterday] [Today] (Right to left typically)

            const filters = [
                { id: 'prevMonth', label: 'الشهر السابق', val: this.getFilteredTotal('prevMonth') },
                { id: 'month', label: 'الشهر الحالي', val: this.getFilteredTotal('month') },
                { id: 'week', label: 'الأسبوع الحالي', val: this.getFilteredTotal('week') },
                { id: 'yesterday', label: 'أمس', val: this.getFilteredTotal('yesterday') },
                { id: 'today', label: 'اليوم', val: this.getFilteredTotal('today') }
            ];

            sliderContainer.innerHTML = '';
            filters.forEach(f => {
                const isActive = this.state.txFilter === f.id;
                const colorClass = f.val === 0 ? 'text-white' : (f.val < 0 ? 'text-rose-500' : 'text-emerald-500');

                sliderContainer.innerHTML += `
                    <div onclick="app.setTxFilter('${f.id}')" class="date-card ${isActive ? 'active' : ''}">
                        <span class="text-gray-400 text-sm mb-1 font-medium">${f.label}</span>
                        <span class="font-bold text-xl dir-ltr ${colorClass}">${Math.abs(f.val).toLocaleString()}</span>
                    </div>
                `;
            });
        }

        // 2. Filter Logic
        let filteredTx = this.state.transactions.filter(tx => {
            const d = new Date(tx.date);
            if (this.state.txFilter === 'today') return this.isSameDay(d, new Date());
            if (this.state.txFilter === 'yesterday') return this.isYesterday(d);
            if (this.state.txFilter === 'week') return this.isThisWeek(d);
            if (this.state.txFilter === 'month') return this.isThisMonth(d);
            if (this.state.txFilter === 'prevMonth') return this.isPrevMonth(d);
            return true;
        });

        // 3. Current Balance Display (Filtered)
        const currentBalance = filteredTx.reduce((a, b) => a + b.amount, 0);
        const balEl = document.getElementById('tx-total-balance');
        if (balEl) balEl.innerText = Math.abs(currentBalance).toLocaleString();

        // 4. Grouping & Rendering Listing
        if (filteredTx.length === 0) {
            container.innerHTML = '<div class="text-center py-20 text-gray-500">لا توجد معاملات</div>';
            return;
        }

        const sorted = [...filteredTx].sort((a, b) => new Date(b.date) - new Date(a.date));
        const grouped = {};

        sorted.forEach(tx => {
            const d = new Date(tx.date);
            const key = d.toLocaleDateString('ar-IQ', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
            if (!grouped[key]) grouped[key] = { items: [], income: 0, expense: 0, date: key, dayNum: d.getDate() };
            grouped[key].items.push(tx);
            if (tx.amount > 0) grouped[key].income += tx.amount;
            else grouped[key].expense += Math.abs(tx.amount);
        });

        Object.values(grouped).forEach(group => {
            let itemsHtml = '';
            group.items.forEach(tx => {
                const cat = CATEGORIES.find(c => c.id === tx.category) || CATEGORIES[0];
                const color = tx.amount < 0 ? 'text-rose-500' : 'text-emerald-500';

                itemsHtml += `
                    <div class="flex justify-between items-center py-3 border-b border-navy-800 last:border-0">
                        <div class="text-left w-1/3">
                            <p class="${color} font-bold text-lg dir-ltr">${Math.abs(tx.amount).toLocaleString()}</p>
                        </div>
                        <div class="flex items-center gap-3 justify-end w-2/3">
                            <div class="text-right">
                                <p class="text-white font-bold text-sm">${cat.name}</p>
                            </div>
                            <div class="w-10 h-10 rounded-full ${cat.bg} flex items-center justify-center shrink-0">
                                <i class="fa-solid ${cat.icon} ${cat.color} text-lg"></i>
                            </div>
                        </div>
                    </div>
                `;
            });

            const html = `
                <div class="mb-4">
                    <div class="flex justify-between items-end px-2 mb-2">
                        <div class="text-left leading-tight">
                            ${group.income > 0 ? `<p class="text-emerald-500 text-xs font-bold dir-ltr">${group.income.toLocaleString()}</p>` : ''}
                            ${group.expense > 0 ? `<p class="text-rose-500 text-xs font-bold dir-ltr">-${group.expense.toLocaleString()}</p>` : ''}
                        </div>
                        <div class="text-right flex items-center justify-end gap-2">
                            <div class="text-right">
                                <p class="text-white font-bold text-xs">${group.date.split(' ').slice(0, 1)}</p>
                                <p class="text-gray-500 text-[10px]">${group.date.split(' ').slice(1).join(' ')}</p>
                            </div>
                            <span class="text-4xl font-light text-white">${group.dayNum}</span>
                        </div>
                    </div>
                    <div class="bg-navy-900 rounded-xl px-4 py-1 border border-navy-800">
                        ${itemsHtml}
                        <div class="text-center py-3 border-t border-navy-800 mt-1 cursor-pointer hover:bg-navy-800/50 transition">
                            <span class="text-blue-500 text-xs font-bold">المزيد من التفاصيل</span>
                        </div>
                    </div>
                </div>
            `;
            container.innerHTML += html;
        });

        const filterBtn = document.getElementById('bottom-filter-container');
        if (filterBtn) filterBtn.classList.remove('hidden');
    },

    renderStats() {
        const expenses = this.state.transactions.filter(t => t.amount < 0).map(t => Math.abs(t.amount));
        const totalExp = expenses.reduce((a, b) => a + b, 0);
        const incomes = this.state.transactions.filter(t => t.amount > 0).map(t => t.amount);
        const totalInc = incomes.reduce((a, b) => a + b, 0);

        document.getElementById('stats-total-expense').innerText = totalExp.toLocaleString();
        document.getElementById('stats-total-income').innerText = totalInc.toLocaleString();

        const getPrioSum = (p) => this.state.transactions.filter(t => t.priority === p && t.amount < 0).reduce((a, b) => a + Math.abs(b.amount), 0);
        document.getElementById('prio-essential-val').innerText = getPrioSum('essential').toLocaleString();
        document.getElementById('prio-normal-val').innerText = getPrioSum('normal').toLocaleString();
        document.getElementById('prio-luxury-val').innerText = getPrioSum('luxury').toLocaleString();

        const ctxDonut = document.getElementById('balanceDonutChart');
        if (ctxDonut) {
            if (this.donutChart) this.donutChart.destroy();
            this.donutChart = new Chart(ctxDonut.getContext('2d'), {
                type: 'doughnut',
                data: {
                    labels: ['الرصيد', 'المصروف'],
                    datasets: [{
                        data: [totalInc - totalExp > 0 ? totalInc - totalExp : 0, totalExp],
                        backgroundColor: ['#2dd4bf', '#ef4444'],
                        borderWidth: 0,
                        cutout: '70%'
                    }]
                },
                options: { plugins: { legend: { display: false } }, responsive: true, maintainAspectRatio: false }
            });
        }

        const catMap = {};
        this.state.transactions.filter(t => t.amount < 0).forEach(t => { catMap[t.category] = (catMap[t.category] || 0) + Math.abs(t.amount); });

        const catList = document.getElementById('stats-categories-list');
        catList.innerHTML = '';
        Object.entries(catMap).sort((a, b) => b[1] - a[1]).forEach(([id, val]) => {
            const cat = CATEGORIES.find(c => c.id === id);
            catList.innerHTML += `
                <div class="flex items-center justify-between">
                     <p class="text-rose-500 font-bold dir-ltr">${val.toLocaleString()}</p>
                     <div class="flex items-center gap-3">
                         <span class="text-white font-bold">${cat?.name}</span>
                         <div class="w-8 h-8 rounded-full ${cat?.bg} flex items-center justify-center">
                              <i class="fa-solid ${cat?.icon} ${cat?.color}"></i>
                         </div>
                     </div>
                </div>
            `;
        });

        this.renderWeeklyChart();

        const dailyAvgAmt = totalExp > 0 ? Math.round(totalExp / 30) : 0;
        document.getElementById('stats-daily-avg').innerText = `-${dailyAvgAmt.toLocaleString()}`;
        document.getElementById('stats-monthly-avg').innerText = `-${totalExp.toLocaleString()}`;
    },

    renderWeeklyChart() {
        const ctxBar = document.getElementById('weeklyBarChart');
        if (!ctxBar) return;
        if (this.barChart) this.barChart.destroy();
        const labels = ['السبت', 'الجمعة', 'الخميس', 'الاربعاء', 'الثلاثاء', 'الاثنين', 'الاحد'];
        const data = [35000000, 0, 0, 0, 0, 0, 0];
        this.barChart = new Chart(ctxBar.getContext('2d'), {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'المصاريف',
                    data: data,
                    backgroundColor: (ctx) => ctx.dataIndex === 0 ? '#dc2626' : '#1f2937',
                    borderRadius: 4,
                    barThickness: 20
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false }, tooltip: { enabled: false } },
                scales: {
                    y: { beginAtZero: true, grid: { color: '#1f2937', drawBorder: false }, ticks: { color: '#9ca3af', display: true } },
                    x: { grid: { display: false, drawBorder: false }, ticks: { color: '#9ca3af' } }
                }
            }
        });
    },

    // --- Category Modal Logic ---
    openCategoryModal() {
        document.getElementById('modal-categories').classList.remove('hidden');
        this.switchCategoryTab('expense'); // Default to expense
        document.getElementById('cat-search').value = '';
    },

    switchCategoryTab(type) {
        this.state.activeCatTab = type;

        ['expense', 'income', 'debt'].forEach(t => {
            const btn = document.getElementById(`cat-tab-${t}`);
            if (t === type) {
                btn.classList.add('text-white', 'border-emerald-500');
                btn.classList.remove('text-gray-400', 'border-transparent');
            } else {
                btn.classList.add('text-gray-400', 'border-transparent');
                btn.classList.remove('text-white', 'border-emerald-500');
            }
        });

        this.filterCategories();
    },

    filterCategories() {
        const query = document.getElementById('cat-search').value.toLowerCase();
        this.renderCategoriesList(this.state.activeCatTab, query);
    },

    renderCategoriesList(type, query = '') {
        const list = document.getElementById('categories-list');
        list.innerHTML = '';

        const filtered = CATEGORIES.filter(c => c.type === type && c.name.toLowerCase().includes(query));

        if (filtered.length === 0) {
            list.innerHTML = '<div class="text-center py-10 text-gray-500">لا توجد نتائج</div>';
            return;
        }

        filtered.forEach(cat => {
            const isDebt = type === 'debt';
            const descHtml = cat.desc ? `<p class="text-gray-400 text-xs mt-1 leading-normal">${cat.desc}</p>` : '';

            list.innerHTML += `
                <div onclick="app.selectCategory('${cat.id}')" class="flex items-center justify-between p-3 bg-navy-900/50 rounded-xl border border-navy-800 cursor-pointer hover:bg-navy-800 transition group mb-2">
                    <div class="flex items-center gap-4 text-right flex-1">
                         <div class="w-12 h-12 rounded-full ${cat.bg} flex items-center justify-center shrink-0 group-hover:scale-110 transition">
                            <i class="fa-solid ${cat.icon} ${cat.color} text-xl"></i>
                         </div>
                         <div>
                             <h3 class="text-white font-bold text-base">${cat.name}</h3>
                             ${descHtml}
                         </div>
                    </div>
                    ${!isDebt ? '<i class="fa-solid fa-angle-left text-gray-600 group-hover:-translate-x-1 transition"></i>' : ''}
                    ${isDebt ? `<i class="fa-solid fa-chevron-left text-gray-600"></i>` : ''}
                </div>
            `;
        });
    },

    selectCategory(id) {
        const cat = CATEGORIES.find(c => c.id === id);
        if (!cat) return;

        // Update Transaction Modal UI
        document.getElementById('tx-category-id').value = cat.id;
        document.getElementById('tx-category-name').innerText = cat.name;

        const iconContainer = document.getElementById('tx-category-icon-bg');
        iconContainer.className = `w-8 h-8 rounded-full ${cat.bg} flex items-center justify-center shrink-0`;

        const icon = document.getElementById('tx-category-icon');
        icon.className = `fa-solid ${cat.icon} ${cat.color}`;

        this.closeModal('modal-categories');
    },

    toggleTxCurrency() {
        const btn = document.getElementById('tx-currency-label');
        const sym = document.getElementById('tx-currency-symbol');
        if (btn) {
            const current = btn.innerText;
            const next = current === 'IQD' ? 'USD' : 'IQD';
            btn.innerText = next;

            if (sym) sym.innerText = next === 'USD' ? '$' : 'د.ع';
            document.getElementById('tx-amount').placeholder = next === 'USD' ? '$0' : '0';
        }
    },

    openTransactionModal() {
        document.getElementById('modal-transaction').classList.remove('hidden');

        // Populate Selects - Wallet Only
        const ws = document.getElementById('tx-wallet');
        ws.innerHTML = '';
        this.state.wallets.forEach(w => { ws.innerHTML += `<option value="${w.id}">${w.name}</option>`; });

        // Reset Category to default (First Expense)
        const defaultCat = CATEGORIES[0];
        this.selectCategory(defaultCat.id);

        // Reset Fields
        document.getElementById('tx-amount').value = '';
        document.getElementById('tx-note').value = '';
        document.getElementById('tx-contact').value = '';

        // Default Date (Now)
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        document.getElementById('tx-date').value = `${year}-${month}-${day}T${hours}:${minutes}`;

        // Reset Toggles
        document.getElementById('tx-recurring-toggle').checked = false;
        document.getElementById('tx-recurring-interval').classList.add('hidden');
        document.getElementById('tx-reminder-toggle').checked = false;
        document.getElementById('tx-exclude').checked = false;

        // Reset Priority to Essential
        const prioRadios = document.querySelectorAll('input[name="tx-priority"]');
        if (prioRadios.length) prioRadios[0].checked = true;
    },

    saveTransaction() {
        const amount = parseFloat(document.getElementById('tx-amount').value);
        // const cat = document.getElementById('tx-category').value; // OLD
        const catId = document.getElementById('tx-category-id').value;
        const walletId = document.getElementById('tx-wallet').value;
        const note = document.getElementById('tx-note').value;
        const priority = document.querySelector('input[name="tx-priority"]:checked').value;

        // New Fields
        const dateVal = document.getElementById('tx-date').value;
        const contact = document.getElementById('tx-contact').value;
        const isRecurring = document.getElementById('tx-recurring-toggle').checked;
        const recurringInterval = isRecurring ? document.getElementById('tx-recurring-interval').value : null;
        const hasReminder = document.getElementById('tx-reminder-toggle').checked;
        const isExcluded = document.getElementById('tx-exclude').checked;
        const txCurrency = document.getElementById('tx-currency-label').innerText;

        if (!amount) return alert('أدخل المبلغ');
        if (!catId) return alert('اختر القسم');

        // Determine sign based on category type
        const catObj = CATEGORIES.find(c => c.id === catId);
        let finalAmount = -Math.abs(amount); // Default expense
        if (catObj && catObj.type === 'income') finalAmount = Math.abs(amount);
        // Debt logic - for simplicity treat paying debt as expense (-), receiving as income (+) per screenshot intent
        // "Pay Debt" -> Money leaving -> Expense (-)
        // "Receive Debt" -> Money entering -> Income (+)
        if (catObj && catObj.id === 'receive_debt') finalAmount = Math.abs(amount);

        const newTx = {
            id: Date.now(),
            amount: finalAmount,
            category: catId,
            walletId: walletId,
            note: note,
            priority: priority,
            date: dateVal ? new Date(dateVal).toISOString() : new Date().toISOString(),
            contact: contact,
            isRecurring: isRecurring,
            recurringInterval: recurringInterval,
            hasReminder: hasReminder,
            isExcluded: isExcluded,
            currency: txCurrency
        };

        this.state.transactions.push(newTx);

        // Update Wallet Balance ONLY if not excluded
        if (!isExcluded) {
            const w = this.state.wallets.find(x => x.id == walletId);
            if (w) w.balance += finalAmount; // Add (negative for expense, positive for income)
        }

        this.saveData();
        this.closeModal('modal-transaction');
        this.render();
    },

    openSettings() { document.getElementById('modal-settings').classList.remove('hidden'); },
    closeModal(id) { document.getElementById(id).classList.add('hidden'); }
};

document.addEventListener('DOMContentLoaded', () => {
    app.init();
});
