import { GameAPI } from "../api_client.js";
import { Button } from "../components/Button.js";
import { Window } from "../components/Window.js";

export class Leagues extends Phaser.Scene {
    constructor() { super('Leagues'); }

    create() {
        const { width, height } = this.scale;
        this.currentPage = 1;
        this.currentSearch = "";


        this.add.image(width / 2, height / 2, 'background').setDisplaySize(width, height).setTint(0x222222);
        this.add.text(width / 2, 50, "CENTRAL DE LIGAS", { fontSize: '40px', fontFamily: '"Orbitron"' }).setOrigin(0.5);

        new Button(this, 100, 50, "VOLTAR", 120, 40, () => this.scene.start('MainMenu'));

        this.viewRanking = this.add.container(0, 100);
        this.viewList = this.add.container(0, 100);
        this.viewCreate = this.add.container(0, 100);

        this.domRanking = null;
        this.domList = null;
        this.domCreateForm = null;
        this.domJoinPassword = null;

        this.resetRankingView();
        this.buildListView();
        this.buildCreateView();

        const tabY = 120;

        new Button(this, width * 0.3, tabY, "DETALHES / RANK", 200, 50, () => this.switchTab('ranking'));
        new Button(this, width * 0.5, tabY, "LISTA DE LIGAS", 200, 50, () => this.switchTab('list'));
        new Button(this, width * 0.7, tabY, "CRIAR NOVA", 200, 50, () => this.switchTab('create'));

        this.switchTab('list');
    }

    switchTab(viewName) {
        this.viewRanking.setVisible(false);
        this.viewList.setVisible(false);
        this.viewCreate.setVisible(false);

        if (this.domList) this.domList.setVisible(false);
        if (this.domCreateForm) this.domCreateForm.setVisible(false);
        if (this.domRanking) this.domRanking.setVisible(false);
        if (this.domJoinPassword) this.domJoinPassword.setVisible(false);

        if (viewName === 'ranking') {
            this.viewRanking.setVisible(true);
            if (this.domRanking) this.domRanking.setVisible(true);
        }
        if (viewName === 'list') {
            this.viewList.setVisible(true);
            if (this.domList) this.domList.setVisible(true);
        }
        if (viewName === 'create') {
            this.viewCreate.setVisible(true);
            if (this.domCreateForm) this.domCreateForm.setVisible(true);
        }
    }

    async showLeagueDetails(leagueId) {
        const { width, height } = this.scale;
        const filterY = 160;
        this.switchTab('ranking');
        this.viewRanking.removeAll(true);

        if (this.domJoinPassword) this.domJoinPassword.setVisible(false);
        if (this.domRanking) this.domRanking.setVisible(false);

        const loadingTxt = this.add.text(width / 2, 200, "Carregando dados da liga...", { fontSize: '24px' }).setOrigin(0.5);
        this.viewRanking.add(loadingTxt);

        try {
            if (!this.rankFilter) this.rankFilter = 'weekly';
            const response = await GameAPI.getLeagueDetails(leagueId, this.rankFilter);

            if (response.status === 'sucesso') {
                loadingTxt.destroy();
                const filterY = 160; // Posição acima da tabela

                // Botão SEMANAL
                const colorWeekly = this.rankFilter === 'weekly' ? 0x00ff00 : 0x555555;
                const btnWeekly = new Button(this, width / 2 - 80, filterY, "SEMANAL", 150, 35, () => {
                    if (this.rankFilter !== 'weekly') {
                        this.rankFilter = 'weekly';
                        this.showLeagueDetails(leagueId); // Recarrega a tela com novo filtro
                    }
                });
                // Hack visual: Pintar o botão para mostrar qual está ativo
                btnWeekly.background.setTint(colorWeekly);

                // Botão GERAL
                const colorAllTime = this.rankFilter === 'all_time' ? 0x00ff00 : 0x555555;
                const btnAllTime = new Button(this, width / 2 + 80, filterY, "GERAL", 150, 35, () => {
                    if (this.rankFilter !== 'all_time') {
                        this.rankFilter = 'all_time';
                        this.showLeagueDetails(leagueId);
                    }
                });
                btnAllTime.background.setTint(colorAllTime);

                this.viewRanking.add([btnWeekly, btnAllTime]);

                const info = response.data.info;
                const relation = response.data.user_relation;
                const rankingData = response.data.ranking_preview;

                const title = this.add.text(width / 2, 80, info.name.toUpperCase(), {
                    fontSize: '36px', color: '#ffd700', fontStyle: 'bold'
                }).setOrigin(0.5);

                const subTitle = this.add.text(width / 2, 120, `Dono: ${info.owner_name || 'Sistema'} | Membros: ${info.member_count}`, {
                    fontSize: '16px', color: '#aaaaaa'
                }).setOrigin(0.5);

                this.viewRanking.add([title, subTitle]);

                if (!this.domRanking) {
                    this.domRanking = this.add.dom(width / 2, height / 1.5).createFromCache('table_infoLeague');
                }
                this.domRanking.setVisible(true);

                const tbody = this.domRanking.getChildByID('rankingBody');
                if (tbody) {
                    let rows = "";
                    if (response.data.ranking_preview.length === 0) {
                        const msg = this.rankFilter === 'weekly' ? "Ninguém pontuou esta semana." : "Sem dados.";
                        rows = `<tr><td colspan='3' class='p-4 text-center text-gray-400'>${msg}</td></tr>`;
                    } else {
                        rankingData.forEach((r, index) => {
                            // Destaque para o top 3
                            const colorClass = index === 0 ? 'text-yellow-400 font-bold' : (index < 3 ? 'text-gray-200' : 'text-gray-400');
                            rows += `
                                <tr class="border-b border-gray-800">
                                    <td class="p-2 ${colorClass}">${index + 1}º</td>
                                    <td class="p-2 ${colorClass}">${r.username}</td>
                                    <td class="p-2 text-right ${colorClass}">${r.total_score}</td>
                                </tr>`;
                        });
                    }
                    tbody.innerHTML = rows;
                }

                if (relation.is_owner) {
                    const btnManage = new Button(this, width * 0.85, 100, "GERENCIAR", 150, 40, () => {
                        this.openAdminPanel(leagueId, info.name);
                    });
                    this.viewRanking.add(btnManage);
                }

                if (!relation.is_member && !relation.is_owner) {

                    if (info.is_private) {
                        const txtPrivate = this.add.text(width / 2, 430, "🔒 Esta liga requer senha", {
                            fontSize: '14px', color: '#ffaaaa'
                        }).setOrigin(0.5);
                        this.viewRanking.add(txtPrivate);
                    }

                    const btnJoin = new Button(this, width / 2, 500, "ENTRAR NESTA LIGA", 250, 50, async () => {

                        let attemptPassword = null;

                        if (info.is_private) {
                            if (!this.domJoinPassword || !this.domJoinPassword.visible) {

                                if (!this.domJoinPassword) {
                                    this.domJoinPassword = this.add.dom(width / 2, 460).createFromHTML(
                                        `<input type="password" id="joinPassInput" placeholder="Digite a Senha..." 
                                          style="padding: 10px; width: 250px; border-radius: 5px; border: none; text-align: center; color: black;">`
                                    );
                                }

                                const inputEl = this.domJoinPassword.getChildByID('joinPassInput');
                                if (inputEl) inputEl.value = "";
                                this.domJoinPassword.setVisible(true);
                                return;
                            }

                            const inputEl = this.domJoinPassword.getChildByID('joinPassInput');
                            attemptPassword = inputEl ? inputEl.value : "";

                            if (attemptPassword === "") {
                                alert("Por favor, digite a senha.");
                                return;
                            }
                        }

                        try {
                            const res = await GameAPI.joinLeague(leagueId, attemptPassword);
                            if (res.status === 'sucesso') {
                                alert("Bem vindo à liga!");
                                if (this.domJoinPassword) this.domJoinPassword.setVisible(false);
                                this.showLeagueDetails(leagueId); // Recarrega a tela
                            } else {
                                alert(res.msg);
                            }
                        } catch (err) {
                            console.error(err);
                            alert("Erro ao entrar na liga.");
                        }
                    });

                    this.viewRanking.add(btnJoin);
                }
            }
            else if (relation.is_member) {
                const txtMember = this.add.text(width * 0.15, 100, "✅ MEMBRO", { color: '#00ff00' }).setOrigin(0.5);
                this.viewRanking.add(txtMember);
            }
            else {
                loadingTxt.setText("Erro: " + response.msg);
            }

        } catch (e) {
            console.error(e);
            loadingTxt.setText("Erro de conexão.");
        }
    }

    resetRankingView() {
        this.viewRanking.removeAll(true);
        if (this.domRanking) this.domRanking.setVisible(false);

        const txt = this.add.text(this.scale.width / 2, this.scale.height / 2, "Selecione uma Liga na lista\npara ver os detalhes.", {
            align: 'center', fontSize: '24px', color: '#666'
        }).setOrigin(0.5);
        this.viewRanking.add(txt);
    }

    buildListView() {
        const { width, height } = this.scale;

        this.domList = this.add.dom(width / 2, height / 2.5).createFromCache('table_listLeague');
        this.domList.setVisible(false);

        this.domList.addListener('click');
        this.domList.on('click', (event) => {
            if (!this.domList.visible) return;

            const target = event.target;

            if (target.id === 'btnSearchLeague') {
                const input = this.domList.getChildByID('inputSearchLeague');
                this.currentSearch = input.value;
                this.currentPage = 1;
                this.fetchLeagues();
            }
            if (target.id === 'btnPrevPage' && this.currentPage > 1) {
                this.currentPage--;
                this.fetchLeagues();
            }
            if (target.id === 'btnNextPage') {
                this.currentPage++;
                this.fetchLeagues();
            }

            const btnView = target.closest('.btn-view-league');
            if (btnView) {
                const leagueId = btnView.dataset.id;
                this.showLeagueDetails(leagueId);
            }
        });

        this.fetchLeagues();
    }

    async fetchLeagues() {
        const tbody = this.domList.getChildByID('leagueTableBody');
        const pageInd = this.domList.getChildByID('pageIndicator');
        const btnPrev = this.domList.getChildByID('btnPrevPage');
        const btnNext = this.domList.getChildByID('btnNextPage');

        tbody.innerHTML = '<tr><td colspan="4" class="p-4 text-center text-gray-500">Carregando...</td></tr>';

        try {
            // VERIFIQUE SE O NOME NO api_client.js É 'listLeague' OU 'listarLigas'
            const response = await GameAPI.listLeague(this.currentPage, this.currentSearch);

            if (response.status === 'sucesso') {
                let htmlRows = "";

                if (response.data.length === 0) {
                    htmlRows = '<tr><td colspan="4" class="p-4 text-center">Nenhuma liga encontrada.</td></tr>';
                } else {
                    response.data.forEach(league => {
                        const rowClass = league.is_default == 1 ? 'border-l-4 border-green-500 bg-gray-800' : 'border-b border-gray-800 hover:bg-gray-800';
                        const ownerName = league.is_default == 1 ? 'SISTEMA' : (league.owner || 'Desconhecido');

                        htmlRows += `
                            <tr class="${rowClass} transition">
                                <td class="p-2 font-bold">${league.name}</td>
                                <td class="p-2 text-gray-400 text-sm uppercase">${ownerName}</td>
                                <td class="p-2 text-gray-400 text-sm">${league.member_count}</td>
                                <td class="p-2 text-right">
                                    <button 
                                        class="btn-view-league bg-green-600 text-black px-3 py-1 rounded text-xs font-bold hover:bg-white transition-colors"
                                        data-id="${league.id}"
                                        data-name="${league.name}"
                                    >
                                        VER
                                    </button>
                                </td>
                            </tr>
                        `;
                    });
                }

                tbody.innerHTML = htmlRows;
                if (pageInd) pageInd.innerText = `Página ${this.currentPage}`;
                if (btnPrev) btnPrev.disabled = (this.currentPage <= 1);

            } else {
                console.error("Erro ao listar:", response.msg);
                tbody.innerHTML = `<tr><td colspan="4" class="text-red-500 p-4">Erro: ${response.msg}</td></tr>`;
            }
        } catch (error) {
            console.error("Erro de conexão:", error);
            tbody.innerHTML = `<tr><td colspan="4" class="text-red-500 p-4">Erro de Conexão</td></tr>`;
        }
    }


    buildCreateView() {
        const { width, height } = this.scale;

        const title = this.add.text(width / 2, 150, "CRIAR NOVA LIGA", { fontSize: '28px' }).setOrigin(0.5);
        this.viewCreate.add(title);

        this.domCreateForm = this.add.dom(width / 2, 350).createFromCache('form_createLeague');
        this.domCreateForm.setOrigin(0.5);
        this.domCreateForm.setVisible(false);

        this.domCreateForm.addListener('click');
        this.domCreateForm.on('click', async (event) => {
            if (!this.domCreateForm.visible) return;

            if (event.target.id === 'btnCreateLeague') {
                const btnCreateLeague = event.target;
                const nameInput = this.domCreateForm.getChildByName('league_name');
                const passInput = this.domCreateForm.getChildByName('league_password');

                if (!nameInput || nameInput.value === "") {
                    alert("Por favor, preencha o Nome da Liga.");
                    return;
                }

                const league_name = nameInput.value;
                const league_password = passInput.value;

                const resetButtonState = (btn) => {
                    btn.innerText = "CRIAR LIGA";
                    btn.disabled = false;
                    btn.style.cursor = "pointer";
                    btn.style.opacity = "1";
                };

                btnCreateLeague.innerText = "Carregando...";
                btnCreateLeague.disabled = true;
                btnCreateLeague.style.cursor = "wait";
                btnCreateLeague.style.opacity = "0.7";

                try {
                    const response = await GameAPI.createLeague(league_name, league_password);

                    if (response.status === 'sucesso') {
                        btnCreateLeague.innerText = "Sucesso!";
                        btnCreateLeague.style.backgroundColor = "#00ff00";
                        alert(`Liga "${league_name}" criada!`);
                        this.fetchLeagues();

                        this.time.delayedCall(2500, () => {
                            resetButtonState(btnCreateLeague);
                        });

                    } else {
                        alert(`Erro: ${response.msg}`);
                        resetButtonState(btnCreateLeague);
                    }
                } catch (error) {
                    console.error("Erro de conexão:", error);
                    resetButtonState(btnCreateLeague);
                }
            }
        });
    }

    openAdminPanel(leagueId, currentLeagueName) {
        const { width, height } = this.scale;

        // Limpeza de segurança (Correção do deslocamento)
        if (this.currentAdminBlocker) this.currentAdminBlocker.destroy();
        if (this.currentDomAdmin) this.currentDomAdmin.destroy();

        // 1. Blocker
        this.currentAdminBlocker = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.8);
        this.currentAdminBlocker.setInteractive();

        // 2. DOM (Usando this.currentDomAdmin consistentemente)
        this.currentDomAdmin = this.add.dom(width / 2, height / 2).createFromCache('admin_panel');
        this.currentDomAdmin.setOrigin(0.5);
        this.currentDomAdmin.updateSize(); // Correção do bug visual

        // --- CORREÇÃO 1: Usar this.currentDomAdmin aqui também ---
        const inputName = this.currentDomAdmin.getChildByID('editName');
        inputName.value = currentLeagueName;

        // Função para carregar membros
        const loadMembers = async () => {
            // --- CORREÇÃO 2: Usar this.currentDomAdmin ---
            const tbody = this.currentDomAdmin.getChildByID('membersBody');

            // Segurança: Se o painel foi fechado enquanto carregava, para tudo
            if (!tbody) return;

            tbody.innerHTML = '<tr><td class="p-2 text-gray-500">Carregando...</td></tr>';

            try {
                const res = await GameAPI.getLeagueMembers(leagueId);

                if (res.status === 'sucesso') {
                    let rows = "";
                    res.data.forEach(member => {
                        const isMe = (member.id == this.registry.get('user_id'));

                        // Botão de expulsar (não aparece para si mesmo)
                        const kickBtn = isMe ? '<span class="text-xs text-green-500">DONO</span>' :
                            `<button class="btn-kick text-red-500 hover:text-red-300 font-bold text-xs border border-red-900 px-2 py-1 rounded cursor-pointer" 
                              data-id="${member.id}" data-name="${member.username}">EXPULSAR</button>`;

                        rows += `
                            <tr class="border-b border-gray-800 hover:bg-gray-900">
                                <td class="p-2">${member.username}</td>
                                <td class="p-2 text-right">${kickBtn}</td>
                            </tr>
                        `;
                    });
                    tbody.innerHTML = rows;
                    this.currentDomAdmin.updateSize();
                } else {
                    tbody.innerHTML = `<tr><td class="text-red-500 p-2">${res.msg}</td></tr>`;
                }
            } catch (error) {
                console.error(error);
                if (tbody) tbody.innerHTML = `<tr><td class="text-red-500 p-2">Erro de conexão</td></tr>`;
            }

        };

        // Listeners
        this.currentDomAdmin.addListener('click');
        this.currentDomAdmin.on('click', async (event) => {
            // --- CORREÇÃO 3: Definir target ---
            const target = event.target;

            // 1. FECHAR
            if (target.id === 'btnCloseAdmin') {
                this.currentDomAdmin.destroy();
                this.currentAdminBlocker.destroy();
                this.currentDomAdmin = null;
                this.currentAdminBlocker = null;
                this.showLeagueDetails(leagueId);
            }

            // 2. SALVAR
            if (target.id === 'btnSaveConfig') {
                // CORREÇÃO: Usar this.currentDomAdmin para buscar inputs
                const newName = this.currentDomAdmin.getChildByID('editName').value;
                const newPass = this.currentDomAdmin.getChildByID('editPass').value;

                if (!newName) return alert("Nome não pode ser vazio");

                target.innerText = "Salvando...";
                target.disabled = true;

                try {
                    const res = await GameAPI.updateLeague(leagueId, newName, newPass);

                    if (res.status === 'sucesso') {
                        alert("Dados atualizados!");
                    } else {
                        alert(res.msg);
                    }
                } catch (e) {
                    alert("Erro de conexão");
                } finally {
                    target.innerText = "SALVAR ALTERAÇÕES";
                    target.disabled = false;
                }
            }

            // 3. EXPULSAR
            if (target.classList.contains('btn-kick')) {
                const userId = target.dataset.id;
                const userName = target.dataset.name;

                // Usamos o confirm nativo ou seu modal customizado
                if (confirm(`Tem certeza que deseja expulsar ${userName}?`)) {
                    const res = await GameAPI.kickMember(leagueId, userId);
                    if (res.status === 'sucesso') {
                        loadMembers(); // Recarrega a lista
                    } else {
                        alert(res.msg);
                    }
                }
            }
        });

        // Carrega a lista inicial
        loadMembers();
    }
}