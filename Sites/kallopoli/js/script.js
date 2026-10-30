/* ==========================================================================
   KALLOPOLI — Painel demonstrativo

   Índice deste arquivo:
    1. Constantes
    2. Dados de demonstração
    3. Estado da aplicação
    4. Utilitários (seletores, segurança, mensagens)
    5. Salvar e carregar dados (localStorage)
    6. Funções de apoio (classes de status, etapas)
    7. Páginas — Relatos, Acompanhamento, Regras, Exemplos
    8. Páginas — Visão geral, Colaboradores, Alertas, Jornada,
                 Indicadores, Configurações
    9. Navegação entre páginas
   10. Janelas modais
   11. Tema claro/escuro
   12. Menu lateral no celular
   13. Menu de perfil
   14. Eventos e inicialização
   ========================================================================== */

(() => {
    "use strict";


    /* ======================================================================
       1. CONSTANTES
       ====================================================================== */

    const STORAGE_KEY = "kallopoli-demo-state-v1";
    const THEME_KEY = "kallopoli-theme";

    const MANAGER_NAME_KEY = "kallopoli-manager-name";
    const DEFAULT_UNIT_KEY = "kallopoli-default-unit";
    const NOTIFY_KEY = "kallopoli-notify";

    const TOAST_DURATION_MS = 3800;

    // Etapa do "stepper" correspondente a cada status do relato
    const STEP_BY_STATUS = {
        "Novo": 1,
        "Em análise": 2,
        "Em revisão": 3,
        "Concluído": 5,
    };

    // Classe CSS (cor) de cada status do relato
    const STATUS_CLASS = {
        "Novo": "",
        "Em análise": "analysis",
        "Em revisão": "review",
        "Concluído": "done",
    };

    // Ícones do botão de tema
    const SUN_ICON = `
        <svg viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="12" cy="12" r="4"/>
            <path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42"/>
        </svg>`;

    const MOON_ICON = `
        <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M20.5 15.5A8.5 8.5 0 0 1 8.5 3.5 8.5 8.5 0 1 0 20.5 15.5Z"/>
        </svg>`;


    /* ======================================================================
       2. DADOS DE DEMONSTRAÇÃO (todos fictícios)
       ====================================================================== */

    // Textos do título de cada página
    const PAGES = {
        visao: {
            eyebrow: "PARCEIRO DOS 90 DIAS · KALLOPOLLI",
            title: "Visão geral",
            description: "Olá, Marina. Acompanhe os novos colaboradores.",
        },
        colaboradores: {
            eyebrow: "PARCEIRO DOS 90 DIAS · KALLOPOLLI",
            title: "Colaboradores",
            description: "Acompanhe a jornada de integração dos novos colaboradores.",
        },
        alertas: {
            eyebrow: "ATENÇÃO E CUIDADO · KALLOPOLLI",
            title: "Alertas",
            description: "Olá, Marina. Quem precisa de atenção agora?",
        },
        jornada: {
            eyebrow: "PARCEIRO DOS 90 DIAS · KALLOPOLLI",
            title: "Acompanhamento da jornada",
            description: "Acompanhe check-ins, próximos marcos e retornos.",
        },
        indicadores: {
            eyebrow: "DADOS DA JORNADA · KALLOPOLLI",
            title: "Indicadores",
            description: "Indicadores demonstrativos da jornada de integração.",
        },
        configuracoes: {
            eyebrow: "PREFERÊNCIAS · KALLOPOLLI",
            title: "Configurações",
            description: "Configure as preferências demonstrativas do painel.",
        },
        relatos: {
            eyebrow: "WHATSAPP · KALLOPOLI",
            title: "Relatos salvos",
            description: "Mensagens recebidas pelo chatbot e salvas para análise.",
        },
        acompanhamento: {
            eyebrow: "VISÃO DA EQUIPE · KALLOPOLI",
            title: "Acompanhamento",
            description: "Acompanhe o andamento dos relatos e os próximos passos.",
        },
        regras: {
            eyebrow: "ORIENTAÇÕES · KALLOPOLI",
            title: "Regras de atendimento",
            description: "Princípios para acolher, registrar e encaminhar cada situação.",
        },
        exemplos: {
            eyebrow: "BOAS PRÁTICAS · KALLOPOLI",
            title: "Exemplos",
            description: "Referências demonstrativas para uma escuta respeitosa e responsável.",
        },
    };

    // Relatos recebidos pelo WhatsApp
    const INITIAL_REPORTS = [
        {
            id: 1,
            initials: "MS",
            name: "Marina Souza",
            time: "Hoje, 10:24",
            fullDate: "14/10/2026 às 10:24",
            message: "Preciso de ajuda para trocar meu horário de sexta-feira. Tenho uma consulta médica às 15h e não consegui fazer a troca.",
            unit: "Loja Centro · 014",
            category: "Abertura",
            type: "Áudio",
            status: "Novo",
            attention: false,
            owner: "A definir",
            updated: "Hoje, 10:24",
            observation: "",
        },
        {
            id: 2,
            initials: "CL",
            name: "Carlos Lima",
            time: "Hoje, 09:18",
            fullDate: "14/10/2026 às 09:18",
            message: "Hoje o movimento foi muito puxado, mas no fim conseguimos fechar tudo certo.",
            unit: "Loja Norte · 032",
            category: "Intermediário",
            type: "Texto",
            status: "Novo",
            attention: false,
            owner: "A definir",
            updated: "Hoje, 09:18",
            observation: "",
        },
        {
            id: 3,
            initials: "AF",
            name: "Ana Ferreira",
            time: "Hoje, 08:42",
            fullDate: "14/10/2026 às 08:42",
            message: "Tenho me sentido desconfortável com comentários repetidos de um colega. Gostaria de conversar com alguém de confiança sobre isso.",
            unit: "Loja Sul · 021",
            category: "Convivência",
            type: "Texto",
            status: "Novo",
            attention: true,
            owner: "Gestor de plantão",
            updated: "Hoje, 08:42",
            observation: "",
        },
        {
            id: 4,
            initials: "RM",
            name: "Rafael Martins",
            time: "Ontem, 17:36",
            fullDate: "13/10/2026 às 17:36",
            message: "Quero agradecer à equipe que me ajudou durante meu primeiro fechamento. As orientações fizeram diferença.",
            unit: "Loja Centro · 014",
            category: "Integração",
            type: "Áudio",
            status: "Em análise",
            attention: false,
            owner: "Fernanda Costa",
            updated: "Hoje, 09:10",
            observation: "",
        },
    ];

    // Regras de atendimento que já vêm na página
    const DEFAULT_RULES = [
        {
            title: "Escuta ativa",
            text: "Dê espaço para a pessoa explicar a situação sem interrupções ou julgamentos.",
            points: [
                "Use perguntas abertas e linguagem acolhedora.",
                "Confirme o que entendeu antes de propor caminhos.",
            ],
        },
        {
            title: "Confidencialidade responsável",
            text: "Trate cada relato com discrição e compartilhe informações apenas com quem precisa atuar.",
            points: [
                "Não prometa sigilo absoluto quando houver risco.",
                "Registre somente informações necessárias.",
            ],
        },
        {
            title: "Encaminhamento de situações delicadas",
            text: "Situações de assédio, discriminação ou risco precisam de atenção cuidadosa e encaminhamento adequado.",
            points: [
                "Não investigue por conta própria nem confronte envolvidos.",
                "Siga os canais oficiais e priorize a segurança da pessoa.",
            ],
        },
        {
            title: "Retorno combinado",
            text: "Sempre que possível, combine um próximo passo e um prazo realista para retorno.",
            points: [
                "Explique o que acontecerá depois.",
                "Registre a ação acordada no relato.",
            ],
        },
    ];

    // Colaboradores na jornada dos 90 dias
    const EMPLOYEES = [
        { name: "Ana P.",    id: "C-0401", unit: "Unidade Centro",       start: "11/10/2026", day: 4,  last: "Hoje",      alerts: 0, status: "Em andamento",           done: 4,  next: 7  },
        { name: "Bruno S.",  id: "C-0402", unit: "Unidade Shopping",     start: "06/10/2026", day: 9,  last: "1 d atrás", alerts: 0, status: "Atendimento registrado", done: 8,  next: 15 },
        { name: "Carla M.",  id: "C-0403", unit: "Unidade Rodovia",      start: "03/10/2026", day: 12, last: "2 d atrás", alerts: 1, status: "Alerta pendente",        done: 9,  next: 15 },
        { name: "Diego L.",  id: "C-0404", unit: "Unidade Centro",       start: "28/09/2026", day: 17, last: "1 d atrás", alerts: 0, status: "Em andamento",           done: 12, next: 30 },
        { name: "Elisa R.",  id: "C-0405", unit: "Unidade Bairro Norte", start: "23/09/2026", day: 22, last: "3 d atrás", alerts: 1, status: "Alerta pendente",        done: 11, next: 30 },
        { name: "Felipe T.", id: "C-0406", unit: "Unidade Shopping",     start: "14/09/2026", day: 31, last: "2 d atrás", alerts: 1, status: "Alerta pendente",        done: 16, next: 45 },
        { name: "Gabi N.",   id: "C-0407", unit: "Unidade Rodovia",      start: "10/09/2026", day: 35, last: "6 d atrás", alerts: 1, status: "Aguardando retorno",     done: 12, next: 45 },
        { name: "Hugo C.",   id: "C-0408", unit: "Unidade Centro",       start: "30/08/2026", day: 46, last: "2 d atrás", alerts: 0, status: "Em andamento",           done: 20, next: 60 },
        { name: "Iara V.",   id: "C-0409", unit: "Unidade Bairro Norte", start: "24/08/2026", day: 52, last: "4 d atrás", alerts: 1, status: "Alerta pendente",        done: 21, next: 60 },
        { name: "João K.",   id: "C-0410", unit: "Unidade Shopping",     start: "15/08/2026", day: 61, last: "Hoje",      alerts: 0, status: "Atendimento registrado", done: 25, next: 90 },
        { name: "Lia F.",    id: "C-0411", unit: "Unidade Rodovia",      start: "01/08/2026", day: 75, last: "Hoje",      alerts: 0, status: "Atendimento registrado", done: 29, next: 90 },
        { name: "Marina A.", id: "C-0412", unit: "Unidade Centro",       start: "17/07/2026", day: 90, last: "Hoje",      alerts: 0, status: "Concluída",              done: 32, next: 90 },
    ];

    // Alertas gerados (esta lista é alterada ao registrar um retorno)
    const ALERT_ROWS = [
        { id: "AL-108", name: "Lia F.",    category: "Desmotivação",                         unit: "Unidade Rodovia",      owner: "Gerente direto",           when: "Contato recomendado nos próximos 3 dias", status: "Atendimento registrado" },
        { id: "AL-106", name: "João K.",   category: "Cansaço ou sobrecarga",                unit: "Unidade Shopping",     owner: "Gerente direto",           when: "Contato recomendado nos próximos 3 dias", status: "Atendimento registrado" },
        { id: "AL-104", name: "Bruno S.",  category: "Dúvidas ou dificuldades de adaptação", unit: "Unidade Shopping",     owner: "Gerente direto",           when: "Contato recomendado nos próximos 3 dias", status: "Atendimento registrado" },
        { id: "AL-102", name: "Gabi N.",   category: "Desmotivação",                         unit: "Unidade Rodovia",      owner: "Líder de turno",           when: "Contato recomendado ainda hoje",          status: "Aguardando retorno · fora do prazo" },
        { id: "AL-105", name: "Iara V.",   category: "Dúvidas ou dificuldades de adaptação", unit: "Unidade Bairro Norte", owner: "Líder de turno",           when: "Contato recomendado nos próximos 3 dias", status: "Alerta pendente" },
        { id: "AL-103", name: "Carla M.",  category: "Conflito",                             unit: "Unidade Rodovia",      owner: "RH (canal separado)",      when: "Contato recomendado ainda hoje",          status: "Alerta pendente" },
        { id: "AL-107", name: "Felipe T.", category: "Situação grave ou sensível",           unit: "Unidade Shopping",     owner: "Direção (canal separado)", when: "Contato recomendado ainda hoje",          status: "Alerta pendente" },
    ];

    // Etapas da jornada: rótulo, dia inicial e dia final (exclusivo) de cada uma
    const JOURNEY_STAGES = [
        { label: "Dias 1–6", from: 0,  to: 7  },
        { label: "Dia 7",    from: 7,  to: 15 },
        { label: "Dia 15",   from: 15, to: 30 },
        { label: "Dia 30",   from: 30, to: 45 },
        { label: "Dia 45",   from: 45, to: 60 },
        { label: "Dia 60",   from: 60, to: 90 },
        { label: "Dia 90",   from: 90, to: 91 },
    ];


    /* ======================================================================
       3. ESTADO DA APLICAÇÃO
       ====================================================================== */

    let state = loadState();            // relatos e regras (salvos no navegador)
    let currentPage = "relatos";        // página aberta no momento
    let lastFocused = null;             // elemento que tinha foco antes de abrir a modal


    /* ======================================================================
       4. UTILITÁRIOS
       ====================================================================== */

    // Atalhos para buscar elementos na página
    const $ = (selector, root = document) => root.querySelector(selector);
    const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

    // Troca caracteres especiais por texto seguro antes de colocar no HTML
    const HTML_ESCAPES = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
    };

    function escapeHTML(value) {
        return String(value ?? "").replace(/[&<>"']/g, char => HTML_ESCAPES[char]);
    }

    // Mostra uma mensagem rápida no canto da tela
    function toast(message, type = "success") {
        const region = $("#toast-region");
        const item = document.createElement("div");

        item.className = `toast${type === "error" ? " error" : ""}`;
        item.textContent = message;
        region.append(item);

        window.setTimeout(() => item.remove(), TOAST_DURATION_MS);
    }

    // Lista os valores sem repetição, ex.: todas as unidades
    function uniqueValues(items, key) {
        return [...new Set(items.map(item => item[key]))];
    }

    // Monta <option> para cada valor
    function renderOptions(values) {
        return values.map(value => `<option>${value}</option>`).join("");
    }

    // Esconde ou mostra o quadro de etapas do atendimento
    function setStepperVisible(visible) {
        $("#stepper").closest(".stepper-card").hidden = !visible;
    }


    /* ======================================================================
       5. SALVAR E CARREGAR DADOS
       ====================================================================== */

    function cloneInitialReports() {
        return INITIAL_REPORTS.map(report => ({ ...report }));
    }

    // Lê os dados salvos no navegador e junta com os relatos iniciais
    function loadState() {
        try {
            const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));

            if (saved && Array.isArray(saved.reports)) {
                return {
                    reports: INITIAL_REPORTS.map(report => ({
                        ...report,
                        ...(saved.reports.find(item => item.id === report.id) || {}),
                    })),
                    rules: Array.isArray(saved.rules) ? saved.rules : [],
                };
            }
        } catch (error) {
            console.warn("Não foi possível ler os dados locais.", error);
        }

        return { reports: cloneInitialReports(), rules: [] };
    }

    function persistState() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        } catch (error) {
            toast("Não foi possível salvar neste navegador.", "error");
        }
    }


    /* ======================================================================
       6. FUNÇÕES DE APOIO
       ====================================================================== */

    // Classe CSS do selo de status do relato
    function statusClass(status) {
        return STATUS_CLASS[status] || "";
    }

    // Etapa do stepper em que o relato está
    function activeStep(report) {
        return STEP_BY_STATUS[report?.status] || 1;
    }

    // Marca as etapas como atual (active) ou concluídas (completed)
    function updateStepper(report = null) {
        const step = report ? activeStep(report) : 1;

        $$(".step", $("#stepper")).forEach(element => {
            const number = Number(element.dataset.step);

            element.classList.toggle("active", number === step);
            element.classList.toggle("completed", number < step);
            $(".step-number", element).textContent = number < step ? "✓" : String(number);
        });
    }

    // Um alerta está "em aberto" se está pendente ou fora do prazo
    function isAlertOpen(alert) {
        return alert.status.includes("pendente") || alert.status.includes("fora do prazo");
    }

    // Classe CSS do selo de status do alerta
    function alertBadgeClass(status) {
        if (status.includes("pendente")) return "alert";
        if (status.includes("fora")) return "waiting";
        return "done";
    }

    // Classe CSS do selo de situação do colaborador
    function employeeBadgeClass(status) {
        if (status.includes("Alerta")) return "alert";
        if (status.includes("registrado")) return "done";
        return "";
    }

    // Marca um alerta como atendido e devolve o alerta alterado
    function markAlertAsHandled(alertId) {
        const alert = ALERT_ROWS.find(item => item.id === alertId);

        alert.status = "Atendimento registrado";
        return alert;
    }

    // Cartão de métrica (número grande com legenda)
    function renderMetricCard(label, value, extra = "") {
        return `
            <article class="panel metric-card">
                <div>${label}</div>
                <strong>${value}</strong>
                ${extra ? `<small>${extra}</small>` : ""}
            </article>`;
    }

    // Barra de progresso dos 90 dias
    function renderProgressBar(day) {
        return `
            <div class="progress-track">
                <span style="width:${Math.min(day / 90 * 100, 100)}%"></span>
            </div>`;
    }


    /* ======================================================================
       7. PÁGINAS — RELATOS, ACOMPANHAMENTO, REGRAS, EXEMPLOS
       ====================================================================== */

    /* ---------- Relatos salvos ---------- */

    function renderReportsPage() {
        $("#page-content").innerHTML = `
            <div class="content-grid">
                <section class="panel reports-panel">
                    <div class="panel-heading">
                        <div>
                            <p class="overline" id="new-count">3 NOVOS</p>
                            <h2>Recebidos pelo WhatsApp</h2>
                            <p class="panel-subtitle">Escolha um relato salvo para iniciar a análise.</p>
                        </div>
                        <span class="connection-pill"><span class="status-dot"></span>Chat conectado</span>
                    </div>

                    <div class="panel-rule"></div>
                    <div class="report-list" id="report-list" aria-live="polite"></div>
                    <p class="demo-note">Dados fictícios para demonstração. Nenhuma mensagem é enviada ao WhatsApp.</p>
                </section>

                <aside class="panel how-panel">
                    <div class="how-title">
                        <span class="how-icon" aria-hidden="true">▤</span>
                        <h3>Como funciona</h3>
                    </div>
                    <p>O colaborador envia áudio ou texto pelo WhatsApp. Aqui, cada mensagem fica salva até ser revisada.</p>
                </aside>
            </div>`;

        renderReportList();
    }

    function renderReportCard(report) {
        const typeClass = report.attention ? "alert" : report.type === "Áudio" ? "audio" : "text";
        const typeIcon = report.type === "Áudio" ? "♩" : "▤";

        return `
            <button class="report-card" data-report-id="${report.id}" aria-label="Abrir relato de ${escapeHTML(report.name)}">
                <span class="avatar">${escapeHTML(report.initials)}</span>

                <span class="report-main">
                    <span class="report-topline">
                        <span class="report-name">${escapeHTML(report.name)}</span>
                        <span class="report-date">${escapeHTML(report.time)}</span>
                    </span>
                    <span class="report-preview">${escapeHTML(report.message)}</span>
                    <span class="report-meta">${escapeHTML(report.unit)} · ${escapeHTML(report.category)}</span>
                </span>

                <span class="report-end">
                    <span class="type-pill ${typeClass}">${typeIcon} ${escapeHTML(report.type)}</span>
                    <span class="status-badge ${statusClass(report.status)}">${escapeHTML(report.status)}</span>
                    <span class="report-arrow" aria-hidden="true">›</span>
                </span>
            </button>`;
    }

    function renderReportList() {
        const list = $("#report-list");
        const reports = state.reports;
        const newCount = reports.filter(report => report.status === "Novo").length;

        $("#new-count").textContent = `${newCount} NOVO${newCount === 1 ? "" : "S"}`;

        list.innerHTML = reports.length
            ? reports.map(renderReportCard).join("")
            : `<div class="empty-state"><strong>Nenhum relato encontrado</strong>Os relatos demonstrativos aparecerão aqui.</div>`;

        $$("[data-report-id]", list).forEach(button => {
            button.addEventListener("click", () => openReport(Number(button.dataset.reportId)));
        });
    }

    /* ---------- Acompanhamento (busca e filtro de relatos) ---------- */

    function renderFollowUpRow(report) {
        return `
            <tr>
                <td><strong>${escapeHTML(report.name)}</strong><br><span class="report-meta">${escapeHTML(report.category)}</span></td>
                <td>${escapeHTML(report.unit)}</td>
                <td><span class="status-badge ${statusClass(report.status)}">${escapeHTML(report.status)}</span></td>
                <td>${escapeHTML(report.owner)}</td>
                <td>${escapeHTML(report.updated)}</td>
                <td><button class="button button-secondary" data-follow-open="${report.id}">Ver relato</button></td>
            </tr>`;
    }

    function renderFollowUpPage() {
        const reports = state.reports;

        $("#page-content").innerHTML = `
            <section class="panel section-panel">
                <h2>Relatos em acompanhamento</h2>
                <p class="section-intro">Busque por colaborador ou conteúdo e filtre pelo status atual.</p>

                <div class="page-tools">
                    <input class="field search-field" id="follow-search" type="search" placeholder="Buscar por nome ou mensagem..." aria-label="Buscar por nome ou mensagem">
                    <select class="select-field" id="status-filter" aria-label="Filtrar por status">
                        <option value="">Todos os status</option>
                        <option>Novo</option>
                        <option>Em análise</option>
                        <option>Em revisão</option>
                        <option>Concluído</option>
                    </select>
                </div>

                <div class="table-wrap">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Colaborador</th>
                                <th>Unidade</th>
                                <th>Status</th>
                                <th>Responsável</th>
                                <th>Atualização</th>
                                <th>Ação</th>
                            </tr>
                        </thead>
                        <tbody id="follow-table"></tbody>
                    </table>
                </div>
            </section>`;

        // Desenha a tabela aplicando a busca e o filtro de status
        const drawTable = () => {
            const query = $("#follow-search").value.trim().toLocaleLowerCase("pt-BR");
            const status = $("#status-filter").value;

            const filtered = reports.filter(report => {
                const matchesStatus = !status || report.status === status;
                const searchable = `${report.name} ${report.message} ${report.unit}`.toLocaleLowerCase("pt-BR");

                return matchesStatus && searchable.includes(query);
            });

            $("#follow-table").innerHTML = filtered.length
                ? filtered.map(renderFollowUpRow).join("")
                : `<tr><td colspan="6"><div class="empty-state">Nenhum resultado para os filtros selecionados.</div></td></tr>`;

            $$("[data-follow-open]").forEach(button => {
                button.addEventListener("click", () => openReport(Number(button.dataset.followOpen)));
            });
        };

        $("#follow-search").addEventListener("input", drawTable);
        $("#status-filter").addEventListener("change", drawTable);
        drawTable();
    }

    /* ---------- Regras de atendimento ---------- */

    // "index" é a posição na lista completa (regras padrão + regras criadas)
    function renderRuleCard(rule, index) {
        const isCustomRule = index >= DEFAULT_RULES.length;
        const points = (rule.points || []).map(point => `<li>${escapeHTML(point)}</li>`).join("");

        const deleteButton = isCustomRule
            ? `<button class="button button-secondary" data-delete-rule="${index - DEFAULT_RULES.length}" style="margin-top:14px">Excluir regra</button>`
            : "";

        return `
            <article class="rule-card">
                <h3>${escapeHTML(rule.title)}</h3>
                <p>${escapeHTML(rule.text)}</p>
                <ul>${points}</ul>
                ${deleteButton}
            </article>`;
    }

    function renderRulesPage() {
        const allRules = [...DEFAULT_RULES, ...state.rules];

        $("#page-content").innerHTML = `
            <section class="panel section-panel">
                <div class="panel-heading">
                    <div>
                        <h2>Princípios de atendimento</h2>
                        <p class="section-intro">Orientações demonstrativas para apoiar a equipe gestora.</p>
                    </div>
                    <button class="button button-primary" id="add-rule">+ Adicionar regra</button>
                </div>

                <div class="rule-grid" id="rule-grid">${allRules.map(renderRuleCard).join("")}</div>
            </section>`;

        $("#add-rule").addEventListener("click", openRuleForm);

        $$("[data-delete-rule]").forEach(button => {
            button.addEventListener("click", () => {
                state.rules.splice(Number(button.dataset.deleteRule), 1);
                persistState();
                renderRulesPage();
                toast("Regra removida.");
            });
        });
    }

    /* ---------- Exemplos ---------- */

    function renderExamplesPage() {
        $("#page-content").innerHTML = `
            <section class="panel section-panel">
                <h2>Uma boa resposta começa pela escuta</h2>
                <p class="section-intro">Exemplos fictícios para orientar uma comunicação respeitosa. Cada situação deve ser avaliada conforme os procedimentos oficiais da organização.</p>

                <div class="example-grid">
                    <article class="example-card">
                        <span class="example-label">RECOMENDADO</span>
                        <h3>Pedido de troca de horário</h3>
                        <p><strong>Relato:</strong> “Preciso ajustar meu horário por um compromisso importante.”</p>
                        <p><strong>Resposta acolhedora:</strong> “Obrigado por compartilhar. Vamos entender as possibilidades de ajuste e verificar o procedimento adequado. Posso te dar um retorno até amanhã?”</p>
                    </article>

                    <article class="example-card">
                        <span class="example-label avoid">EVITE</span>
                        <h3>Minimizar uma dificuldade</h3>
                        <p><strong>Resposta inadequada:</strong> “Isso acontece com todo mundo, você precisa se acostumar.”</p>
                        <p>Por que evitar: invalida a experiência da pessoa e pode dificultar que ela procure ajuda novamente.</p>
                    </article>

                    <article class="example-card">
                        <span class="example-label">RECOMENDADO · ATENÇÃO</span>
                        <h3>Relato de desconforto</h3>
                        <p><strong>Resposta acolhedora:</strong> “Sinto muito que você esteja passando por isso. Obrigado por confiar esse relato. Vamos conversar em um ambiente reservado e avaliar o encaminhamento mais seguro.”</p>
                        <p>Conduta: registre com discrição e siga os canais formais apropriados.</p>
                    </article>

                    <article class="example-card">
                        <span class="example-label avoid">EVITE</span>
                        <h3>Prometer algo que não depende de você</h3>
                        <p><strong>Resposta inadequada:</strong> “Pode deixar, garanto que a pessoa será demitida.”</p>
                        <p>Por que evitar: cria expectativas irreais e antecipa uma decisão que exige apuração e procedimento adequado.</p>
                    </article>
                </div>
            </section>`;
    }


    /* ======================================================================
       8. PÁGINAS — VISÃO GERAL, COLABORADORES, ALERTAS, JORNADA,
                    INDICADORES, CONFIGURAÇÕES
       ====================================================================== */

    /* ---------- Visão geral ---------- */

    function renderAlertRow(alert, buttonLabel, badgeClass) {
        return `
            <div class="alert-row">
                <div>
                    <strong>${alert.id} · ${alert.name}</strong>
                    <p>${alert.category} · ${alert.unit} · ${alert.owner}</p>
                    <small>${alert.when}</small>
                </div>
                <span class="status-badge ${badgeClass}">${alert.status}</span>
                <button class="button button-secondary" data-alert-action="${alert.id}">${buttonLabel}</button>
            </div>`;
    }

    function renderOverviewPage() {
        const openAlerts = ALERT_ROWS.filter(isAlertOpen);
        const journeysInProgress = EMPLOYEES.filter(employee => employee.day < 90).slice(0, 6);

        $("#page-content").innerHTML = `
            <div class="notice-strip">Dados de demonstração fictícios. Totais dos cards = registros das tabelas.</div>

            <div class="metrics-grid">
                ${renderMetricCard("Colaboradores na jornada", 12)}
                ${renderMetricCard("Jornadas em andamento", 11)}
                ${renderMetricCard("Alertas pendentes", openAlerts.length)}
                ${renderMetricCard("Alertas atendidos", 3)}
                ${renderMetricCard("Jornadas concluídas", 1)}
            </div>

            <div class="dashboard-grid">
                <section class="panel section-panel attention-panel">
                    <h2>Alertas que precisam de atenção</h2>
                    <div id="overview-alerts"></div>
                </section>

                <section class="panel section-panel">
                    <h2>Jornadas em andamento</h2>
                    <div id="overview-journeys"></div>
                </section>
            </div>`;

        $("#overview-alerts").innerHTML = openAlerts
            .map(alert => renderAlertRow(alert, "Registrar retorno", alertBadgeClass(alert.status)))
            .join("");

        $("#overview-journeys").innerHTML = journeysInProgress.map(employee => `
            <div class="journey-row">
                <strong>${employee.name}</strong>
                <p>Dia ${employee.day} de 90 · próxima etapa: dia ${employee.next}</p>
                ${renderProgressBar(employee.day)}
            </div>`).join("");

        $$("[data-alert-action]").forEach(button => {
            button.onclick = () => {
                const alert = markAlertAsHandled(button.dataset.alertAction);

                renderOverviewPage();
                toast(`Retorno de ${alert.name} registrado localmente.`);
            };
        });
    }

    /* ---------- Colaboradores ---------- */

    function renderEmployeeRow(employee) {
        return `
            <tr>
                <td><strong>${employee.name}</strong> <small>${employee.id}</small></td>
                <td>${employee.unit}</td>
                <td>${employee.start}</td>
                <td>${employee.day}</td>
                <td>${renderProgressBar(employee.day)}${Math.round(employee.day / 90 * 100)}%</td>
                <td>${employee.last}</td>
                <td>${employee.alerts}</td>
                <td><span class="status-badge ${employeeBadgeClass(employee.status)}">${employee.status}</span></td>
            </tr>`;
    }

    function renderEmployeesPage() {
        $("#page-content").innerHTML = `
            <section class="panel section-panel">
                <div class="page-tools">
                    <input class="field" id="employee-search" placeholder="Buscar por nome ou ID" aria-label="Buscar por nome ou ID">
                    <select class="select-field" id="employee-unit">
                        <option value="">Todas as unidades</option>
                        ${renderOptions(uniqueValues(EMPLOYEES, "unit"))}
                    </select>
                    <select class="select-field" id="employee-status">
                        <option value="">Toda situação</option>
                        ${renderOptions(uniqueValues(EMPLOYEES, "status"))}
                    </select>
                </div>

                <div class="table-wrap">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Colaborador</th>
                                <th>Unidade</th>
                                <th>Início</th>
                                <th>Dia</th>
                                <th>Progresso</th>
                                <th>Último check-in</th>
                                <th>Alertas pend.</th>
                                <th>Situação</th>
                            </tr>
                        </thead>
                        <tbody id="employee-table"></tbody>
                    </table>
                </div>
            </section>`;

        const drawTable = () => {
            const query = $("#employee-search").value.toLowerCase();
            const unit = $("#employee-unit").value;
            const status = $("#employee-status").value;

            const rows = EMPLOYEES.filter(employee => {
                const matchesUnit = !unit || employee.unit === unit;
                const matchesStatus = !status || employee.status === status;
                const matchesQuery = `${employee.name} ${employee.id}`.toLowerCase().includes(query);

                return matchesUnit && matchesStatus && matchesQuery;
            });

            $("#employee-table").innerHTML = rows.map(renderEmployeeRow).join("")
                || '<tr><td colspan="8">Nenhum colaborador encontrado.</td></tr>';
        };

        $("#employee-search").addEventListener("input", drawTable);
        $("#employee-unit").addEventListener("change", drawTable);
        $("#employee-status").addEventListener("change", drawTable);
        drawTable();
    }

    /* ---------- Alertas ---------- */

    function renderAlertsPage() {
        $("#page-content").innerHTML = `
            <div class="notice-strip">Alertas são possíveis sinais identificados pela IA. Não são diagnósticos. Prazo recomendado não é prazo legal.</div>

            <section class="panel section-panel attention-panel">
                <div class="page-tools">
                    <select id="alert-status-filter" class="select-field">
                        <option value="">Todos os estados</option>
                        <option>Alerta pendente</option>
                        <option>Atendimento registrado</option>
                        <option>Aguardando retorno · fora do prazo</option>
                    </select>
                    <select id="alert-category-filter" class="select-field">
                        <option value="">Todas as categorias</option>
                        ${renderOptions(uniqueValues(ALERT_ROWS, "category"))}
                    </select>
                </div>

                <div id="alert-list"></div>
            </section>`;

        const drawList = () => {
            const status = $("#alert-status-filter").value;
            const category = $("#alert-category-filter").value;

            const rows = ALERT_ROWS.filter(alert => {
                return (!status || alert.status === status) && (!category || alert.category === category);
            });

            $("#alert-list").innerHTML = rows
                .map(alert => renderAlertRow(
                    alert,
                    isAlertOpen(alert) ? "Registrar retorno" : "Ver registro",
                    alertBadgeClass(alert.status)
                ))
                .join("") || "<p>Nenhum alerta corresponde aos filtros.</p>";

            $$("[data-alert-action]").forEach(button => {
                button.onclick = () => {
                    const alert = markAlertAsHandled(button.dataset.alertAction);

                    drawList();
                    toast(`Atendimento de ${alert.name} atualizado.`);
                };
            });
        };

        $("#alert-status-filter").onchange = drawList;
        $("#alert-category-filter").onchange = drawList;
        drawList();
    }

    /* ---------- Acompanhamento da jornada ---------- */

    // Quantos colaboradores estão em cada etapa da jornada
    function countEmployeesInStage(stage, stageIndex) {
        return EMPLOYEES.filter(employee => {
            // A primeira etapa (dias 1–6) usa uma regra própria
            if (stageIndex === 0) return employee.day <= 6;

            return employee.day >= stage.from && employee.day < stage.to;
        }).length;
    }

    // Check-ins que ainda faltam para o colaborador
    function countPendingCheckIns(employee) {
        return Math.max(0, Math.floor(employee.day / 10) - employee.done + 3);
    }

    function renderJourneyPage() {
        const stageCards = JOURNEY_STAGES
            .map((stage, index) => renderMetricCard(stage.label, countEmployeesInStage(stage, index), "colaboradores na etapa"))
            .join("");

        const checkInRows = EMPLOYEES.map(employee => `
            <tr>
                <td>${employee.name}</td>
                <td>${employee.done}</td>
                <td>${countPendingCheckIns(employee)}</td>
                <td>Dia ${employee.next}</td>
                <td>${employee.alerts}</td>
            </tr>`).join("");

        const historyRows = ALERT_ROWS
            .filter(alert => alert.status === "Atendimento registrado")
            .map(alert => `
                <div class="journey-row">
                    <strong>${alert.id} · ${alert.name}</strong>
                    <p>${alert.category} · retorno registrado</p>
                    <span class="status-badge done">✓ Conversei</span>
                </div>`).join("");

        $("#page-content").innerHTML = `
            <div class="notice-strip">O assistente complementa os encontros presenciais (dias 7, 15, 30, 45, 60 e 90). Check-in sem resposta não indica desmotivação ou risco.</div>

            <div class="metrics-grid stages-grid">${stageCards}</div>

            <div class="dashboard-grid">
                <section class="panel section-panel">
                    <h2>Check-ins e próximos marcos</h2>
                    <div class="table-wrap">
                        <table class="data-table">
                            <thead>
                                <tr>
                                    <th>Colaborador</th>
                                    <th>Realizados</th>
                                    <th>Pendentes</th>
                                    <th>Próximo marco</th>
                                    <th>Alertas abertos</th>
                                </tr>
                            </thead>
                            <tbody>${checkInRows}</tbody>
                        </table>
                    </div>
                </section>

                <section class="panel section-panel">
                    <h2>Histórico de atendimentos</h2>
                    ${historyRows}
                </section>
            </div>`;
    }

    /* ---------- Indicadores ---------- */

    function renderIndicatorsPage() {
        $("#page-content").innerHTML = `
            <div class="metrics-grid">
                ${renderMetricCard("Colaboradores acompanhados", 12)}
                ${renderMetricCard("Alertas gerados", 8)}
                ${renderMetricCard("Alertas atendidos", 3)}
                ${renderMetricCard("Alertas pendentes", 5)}
                ${renderMetricCard("Tempo médio até o 1º retorno", "16 h")}
                ${renderMetricCard("Alertas sem retorno após 24 h", 1)}
                ${renderMetricCard("Taxa de resposta aos check-ins", "79%")}
            </div>

            <section class="panel section-panel">
                <h2>Engajamento (área secundária)</h2>
                <div class="notice-strip">Pontos refletem participação e aprendizado. Não medem desempenho, risco ou qualidade profissional. Sem ranking.</div>

                <div class="metrics-grid engagement-grid">
                    ${renderMetricCard("Pílulas concluídas", 103)}
                    ${renderMetricCard("Quizzes concluídos", 43)}
                    ${renderMetricCard("Pontos acumulados (total)", 3570)}
                    ${renderMetricCard("Conquistas desbloqueadas", 24)}
                </div>
            </section>`;
    }

    /* ---------- Configurações ---------- */

    function saveSettings(event) {
        event.preventDefault();

        try {
            localStorage.setItem(MANAGER_NAME_KEY, $("#manager-name").value.trim());
            localStorage.setItem(DEFAULT_UNIT_KEY, $("#default-unit").value);
            localStorage.setItem(NOTIFY_KEY, String($("#notify-setting").checked));
        } catch (_) {
            // Sem permissão para salvar: segue em frente e só mostra a mensagem
        }

        toast("Preferências salvas neste navegador.");
    }

    function renderSettingsPage() {
        $("#page-content").innerHTML = `
            <section class="panel section-panel">
                <h2>Preferências do painel</h2>
                <p class="section-intro">Configurações locais desta demonstração. Nenhuma alteração será enviada a sistemas externos.</p>

                <form id="settings-form" class="settings-form">
                    <label class="form-label" for="manager-name">Nome de exibição</label>
                    <input id="manager-name" class="field" value="Marina Alves" maxlength="100" required>

                    <label class="form-label" for="default-unit">Unidade padrão</label>
                    <select id="default-unit" class="select-field">
                        <option>Todas as unidades</option>
                        ${renderOptions(uniqueValues(EMPLOYEES, "unit"))}
                    </select>

                    <label class="form-label"><input id="notify-setting" type="checkbox" checked> Exibir avisos demonstrativos de alertas</label>

                    <button class="button button-primary" type="submit">Salvar preferências</button>
                </form>
            </section>`;

        $("#settings-form").onsubmit = saveSettings;
    }


    /* ======================================================================
       9. NAVEGAÇÃO ENTRE PÁGINAS
       ====================================================================== */

    // Qual função desenha o conteúdo de cada página
    const PAGE_RENDERERS = {
        visao: renderOverviewPage,
        colaboradores: renderEmployeesPage,
        alertas: renderAlertsPage,
        jornada: renderJourneyPage,
        indicadores: renderIndicatorsPage,
        configuracoes: renderSettingsPage,
        relatos: renderReportsPage,
        acompanhamento: renderFollowUpPage,
        regras: renderRulesPage,
        exemplos: renderExamplesPage,
    };

    function renderPage(page) {
        currentPage = page;

        // Título da página
        const meta = PAGES[page] || PAGES.relatos;
        $("#page-eyebrow").textContent = meta.eyebrow;
        $("#page-title").textContent = meta.title;
        $("#page-description").textContent = meta.description;

        // Item ativo no menu lateral
        $$(".nav-item").forEach(button => {
            const isActive = button.dataset.page === page;

            button.classList.toggle("active", isActive);

            if (isActive) button.setAttribute("aria-current", "page");
            else button.removeAttribute("aria-current");
        });

        // O quadro de etapas só aparece em "Relatos salvos"
        setStepperVisible(page === "relatos");

        // Conteúdo da página
        (PAGE_RENDERERS[page] || renderExamplesPage)();

        closeMobileMenu();
    }


    /* ======================================================================
       10. JANELAS MODAIS
       ====================================================================== */

    // Abre a modal com um título e um conteúdo em HTML
    function showModal(title, contentHTML) {
        lastFocused = document.activeElement;

        $("#modal-title").textContent = title;
        $("#modal-content").innerHTML = contentHTML;
        $("#modal-backdrop").hidden = false;
        document.body.style.overflow = "hidden";
    }

    function closeModal() {
        $("#modal-backdrop").hidden = true;
        document.body.style.overflow = "";

        if (lastFocused && typeof lastFocused.focus === "function") {
            lastFocused.focus();
        }

        updateStepper(null);

        if (currentPage === "relatos") renderReportList();
    }

    /* ---------- Detalhes de um relato ---------- */

    function renderReportDetails(report) {
        const attentionNote = report.attention
            ? `<br><br><strong style="color:var(--sidebar-bg)">Atenção do gestor:</strong> este relato pede escuta cuidadosa e encaminhamento responsável.`
            : "";

        return `
            <div class="detail-grid">
                <div class="detail-item"><label>Colaborador</label><strong>${escapeHTML(report.name)}</strong></div>
                <div class="detail-item"><label>Data e horário</label><strong>${escapeHTML(report.fullDate)}</strong></div>
                <div class="detail-item"><label>Unidade</label><strong>${escapeHTML(report.unit)}</strong></div>
                <div class="detail-item"><label>Tipo de conteúdo</label><strong>${escapeHTML(report.type)}</strong></div>
                <div class="detail-item"><label>Status atual</label><strong><span class="status-badge ${statusClass(report.status)}">${escapeHTML(report.status)}</span></strong></div>
                <div class="detail-item"><label>Categoria</label><strong>${escapeHTML(report.category)}</strong></div>
            </div>

            <p class="message-full">${escapeHTML(report.message)}${attentionNote}</p>

            <label class="form-label" for="observation">Observações do gestor</label>
            <textarea class="textarea-field" id="observation" maxlength="2000" placeholder="Registre observações e próximos passos...">${escapeHTML(report.observation)}</textarea>
            <p class="report-meta">As observações são salvas neste navegador e não são compartilhadas com outras pessoas.</p>

            <div class="modal-actions">
                <button class="button button-secondary" id="back-reports">Voltar para os relatos</button>
                <button class="button button-secondary" id="mark-review">Marcar como revisado</button>
                <button class="button button-primary" id="start-analysis">Iniciar análise</button>
            </div>`;
    }

    function openReport(id) {
        const report = state.reports.find(item => item.id === id);
        if (!report) return;

        updateStepper(report);
        showModal("Detalhes do relato", renderReportDetails(report));

        // Salva as observações enquanto o gestor digita
        $("#observation").addEventListener("input", event => {
            report.observation = event.target.value;
            report.updated = "Agora";
            persistState();
        });

        $("#back-reports").addEventListener("click", closeModal);
        $("#start-analysis").addEventListener("click", () => updateReportStatus(report, "Em análise"));
        $("#mark-review").addEventListener("click", () => {
            updateReportStatus(report, report.status === "Concluído" ? "Concluído" : "Em revisão");
        });

        $("#modal-close").focus();
    }

    function updateReportStatus(report, status) {
        report.status = status;
        report.updated = "Agora";

        if (report.owner === "A definir") report.owner = "Gestor demonstrativo";

        persistState();
        updateStepper(report);
        toast(`Relato de ${report.name} atualizado para “${status}”.`);
        openReport(report.id);

        if (currentPage === "acompanhamento") renderFollowUpPage();
    }

    /* ---------- Formulário de nova regra ---------- */

    function openRuleForm() {
        showModal("Adicionar regra", `
            <form id="rule-form">
                <label class="form-label" for="rule-title">Título da regra</label>
                <input class="field" id="rule-title" name="title" required maxlength="100" placeholder="Ex.: Comunicação transparente">

                <label class="form-label" for="rule-description">Orientação</label>
                <textarea class="textarea-field" id="rule-description" name="description" required maxlength="500" placeholder="Descreva a orientação..."></textarea>

                <label class="form-label" for="rule-points">Boas práticas (uma por linha)</label>
                <textarea class="textarea-field" id="rule-points" name="points" maxlength="700" placeholder="Ouvir sem interromper&#10;Combinar um próximo passo"></textarea>

                <div class="modal-actions">
                    <button type="button" class="button button-secondary" id="cancel-rule">Cancelar</button>
                    <button type="submit" class="button button-primary">Salvar regra</button>
                </div>
            </form>`);

        $("#cancel-rule").addEventListener("click", closeModal);
        $("#rule-form").addEventListener("submit", saveNewRule);
        $("#rule-title").focus();
    }

    function saveNewRule(event) {
        event.preventDefault();

        const title = $("#rule-title").value.trim();
        const description = $("#rule-description").value.trim();

        if (!title || !description) {
            toast("Preencha o título e a orientação.", "error");
            return;
        }

        const points = $("#rule-points").value
            .split("\n")
            .map(line => line.trim())
            .filter(Boolean);

        state.rules.push({ title, text: description, points });

        persistState();
        closeModal();
        renderRulesPage();
        toast("Regra adicionada.");
    }

    /* ---------- Janela de informação simples ---------- */

    function openInfo(title, body) {
        showModal(title, `
            <p class="section-intro">${escapeHTML(body)}</p>
            <div class="modal-actions">
                <button class="button button-primary" id="info-close">Entendi</button>
            </div>`);

        $("#info-close").addEventListener("click", closeModal);
        $("#info-close").focus();
    }


    /* ======================================================================
       11. TEMA CLARO / ESCURO
       ====================================================================== */

    function setTheme(theme) {
        const isDark = theme === "dark";
        const toggle = $("#theme-toggle");
        const label = isDark ? "Ativar tema claro" : "Ativar tema escuro";

        document.documentElement.dataset.theme = theme;

        toggle.setAttribute("aria-label", label);
        toggle.title = label;
        toggle.innerHTML = isDark ? MOON_ICON : SUN_ICON;

        try {
            localStorage.setItem(THEME_KEY, theme);
        } catch (_) {
            // Sem permissão para salvar: o tema vale apenas nesta visita
        }
    }

    function toggleTheme() {
        setTheme(document.documentElement.dataset.theme === "dark" ? "light" : "dark");
    }

    function loadSavedTheme() {
        try {
            setTheme(localStorage.getItem(THEME_KEY) === "dark" ? "dark" : "light");
        } catch (_) {
            setTheme("light");
        }
    }


    /* ======================================================================
       12. MENU LATERAL NO CELULAR
       ====================================================================== */

    function closeMobileMenu() {
        $("#sidebar").classList.remove("open");
        $("#sidebar-scrim").classList.remove("visible");
        $("#mobile-menu-toggle").setAttribute("aria-expanded", "false");
        $("#mobile-menu-toggle").setAttribute("aria-label", "Abrir menu");
    }

    function toggleMobileMenu() {
        const willOpen = !$("#sidebar").classList.contains("open");

        $("#sidebar").classList.toggle("open", willOpen);
        $("#sidebar-scrim").classList.toggle("visible", willOpen);
        $("#mobile-menu-toggle").setAttribute("aria-expanded", String(willOpen));
        $("#mobile-menu-toggle").setAttribute("aria-label", willOpen ? "Fechar menu" : "Abrir menu");
    }


    /* ======================================================================
       13. MENU DE PERFIL
       ====================================================================== */

    function toggleProfileMenu() {
        const menu = $("#profile-menu");

        menu.hidden = !menu.hidden;
        $("#profile-toggle").setAttribute("aria-expanded", String(!menu.hidden));
    }

    function closeProfileMenu() {
        $("#profile-menu").hidden = true;
        $("#profile-toggle").setAttribute("aria-expanded", "false");
    }

    function selectProfile(button) {
        $("#profile-label").textContent = button.dataset.profile;

        // Move a marca ✓ para o perfil escolhido
        $$("#profile-menu button span").forEach(mark => mark.remove());
        button.insertAdjacentHTML("beforeend", " <span>✓</span>");

        closeProfileMenu();
        toast(`Visualização demonstrativa: ${button.dataset.profile}.`);
    }


    /* ======================================================================
       14. EVENTOS E INICIALIZAÇÃO
       ====================================================================== */

    // Mantém o foco do teclado dentro da modal (Tab e Shift+Tab)
    function trapFocusInModal(event) {
        const focusable = $$(
            "button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled])",
            $("#modal-backdrop")
        ).filter(element => element.offsetParent !== null);

        if (!focusable.length) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first.focus();
        }
    }

    function handleKeydown(event) {
        const modalIsOpen = !$("#modal-backdrop").hidden;

        if (event.key === "Escape") {
            if (modalIsOpen) closeModal();
            closeMobileMenu();
            $("#profile-menu").hidden = true;
        }

        if (event.key === "Tab" && modalIsOpen) {
            trapFocusInModal(event);
        }
    }

    // Menu lateral, tema e menu do celular
    function bindNavigationEvents() {
        $$(".nav-item").forEach(button => {
            button.addEventListener("click", () => renderPage(button.dataset.page));
        });

        $("#theme-toggle").addEventListener("click", toggleTheme);
        $("#mobile-menu-toggle").addEventListener("click", toggleMobileMenu);
        $("#sidebar-scrim").addEventListener("click", closeMobileMenu);
    }

    // Menu de perfil ("Visualizar como")
    function bindProfileEvents() {
        $("#profile-toggle").addEventListener("click", toggleProfileMenu);

        $$("#profile-menu button").forEach(button => {
            button.addEventListener("click", () => selectProfile(button));
        });

        // Clique fora do menu fecha o menu
        document.addEventListener("click", event => {
            if (!event.target.closest(".dropdown-wrap")) closeProfileMenu();
        });
    }

    // Fechar modal e atalhos de teclado
    function bindModalEvents() {
        $("#modal-close").addEventListener("click", closeModal);

        $("#modal-backdrop").addEventListener("click", event => {
            if (event.target === $("#modal-backdrop")) closeModal();
        });

        document.addEventListener("keydown", handleKeydown);
    }

    // Botões que abrem janelas de informação
    function bindInfoButtons() {
        const infoButtons = [
            {
                selector: "#help-top",
                title: "Central de ajuda",
                body: "Este painel é uma demonstração local. Selecione um relato para consultar os detalhes, registrar observações e atualizar o status. As alterações ficam salvas apenas no navegador utilizado.",
            },
            {
                selector: "#support-button",
                title: "Fale com o suporte",
                body: "Em uma versão conectada a serviços reais, este espaço pode reunir os canais oficiais de suporte. Nesta demonstração, nenhuma mensagem é enviada.",
            },
            {
                selector: "#sidebar-options",
                title: "Preferências",
                body: "Use o botão de sol ou lua no cabeçalho para alternar entre tema claro e escuro. Sua preferência é guardada neste navegador.",
            },
            {
                selector: "#signup-button",
                title: "Criar conta com e-mail",
                body: "Cadastro indisponível nesta versão demonstrativa. Nenhuma conta será criada e nenhum dado será enviado.",
            },
            {
                selector: "#google-button",
                title: "Continuar com o Google",
                body: "A autenticação Google não está conectada nesta demonstração. Nenhum login será realizado.",
            },
        ];

        infoButtons.forEach(({ selector, title, body }) => {
            $(selector).addEventListener("click", () => openInfo(title, body));
        });
    }

    // Início do painel
    bindNavigationEvents();
    bindProfileEvents();
    bindModalEvents();
    bindInfoButtons();
    loadSavedTheme();
    renderPage("visao");
})();
