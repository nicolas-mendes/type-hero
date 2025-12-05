// URL do Backend Apache
const BASE_URL = "http://localhost/type-hero/backend/endpoints";

//Função Assíncrona para Comunicação com o backend
const postData = async (url, data) => {
    const token = localStorage.getItem('game_token');
    const dataWithToken = {
        ...data,
        auth_token: token
    };

    try {
        const response = await fetch(`${BASE_URL}/${url}`, {
            method: 'POST',
            body: JSON.stringify(dataWithToken),
            headers: { 'Content-Type': 'application/json' }
        });

        return await response.json();

    } catch (error) {
        console.error("Erro da API:", error);
        return { status: "erro", msg: "Falha na conexão com o servidor" };
    }
};

// O Objeto principal da API, abriga os métodos de comunicação com diferentes Endpoints
export const GameAPI = {


    // Estrutura geral de um Método:
    // nome_metodo: async (campo01,campo02,campo03,...) => {
    //     return await postData('diretório-no-backend/arquivo-responsável.php',{campo01,campo02,campo03..});
    // },

    //Autenticação
    validateSession: async () => {
        return await postData('auth/validate_session.php', {});
    },

    login: async (user, password) => {
        return await postData('auth/login.php', { user, password });
    },

    register: async (user, password, password_confirm) => {
        return await postData('auth/register.php', { user, password, password_confirm });
    },

    //Ligas
    createLeague: async (league_name, league_password) => {
        return await postData('league/create.php', { league_name, league_password });
    },

    listLeague: async (page = 1, search = "") => {
        return await postData('league/list.php', { page, search });
    },

    getLeagueDetails: async (leagueId, rankFilter) => {
        return await postData('league/get_info.php', { leagueId, rankFilter });
    },

    joinLeague: async (leagueId, attemptPassword) => {
        return await postData('league/join.php', { leagueId, attemptPassword });
    },

    getLeagueMembers: async (leagueId) => {
        return await postData('league/get_members.php', { leagueId });
    },

    updateLeague: async (leagueId, name, password) => {
        return await postData('league/update.php', { leagueId, name, password });
    },

    kickMember: async (leagueId, targetUserId) => {
        return await postData('league/kick.php', { leagueId, targetUserId });
    },

    exitLeague: async (leagueId) => {
        return await postData('league/exit.php', { leagueId });
    },

    excludeLeague: async (leagueId) => {
        return await postData('league/exclude.php', { leagueId });
    },

    getMyLeagues: async () => {
        return await postData('league/get_my_leagues.php', {});
    },

    //GAME
    getHubData: async (leagueId) => {
        return await postData('game/get_hub_data.php', { leagueId });
    },

    startRun: async (leagueId, isNew) => {
        return await postData('game/start_run.php', { leagueId, isNew });
    },

    getLevelEnemies: async (levelId) => {
        return await postData('game/get_level_enemies.php', { levelId });
    },

    completeLevel: async (leagueId, levelId, hp, score, totalScoreAcc) => {
        return await postData('game/complete_level.php', { leagueId, levelId, hp, score, totalScoreAcc: totalScoreAcc || 0 });
    },

    gameOver: async (leagueId, scoreInLevel, stats = {}) => {
        return await postData('game/game_over.php', {
            leagueId, scoreInLevel, avg_wpm: stats.wpm || 0, accuracy: stats.accuracy || 0, total_words: stats.words || 0, total_time: stats.time || 0 });
    },




};