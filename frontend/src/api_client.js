// URL do Backend Apache
const BASE_URL = "http://localhost/type-hero/endpoints";

//Função Assíncrona para Comunicação com o backend
const postData = async (url, data) => {
    try {
        const response = await fetch(`${BASE_URL}/${url}`, {
            method: 'POST',
            body: JSON.stringify(data),
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
    login: async (usuario, senha) => {
        return await postData('auth/login.php', { usuario, senha });
    },

    CriarLiga: async (id, nomeLiga, palavraLiga) => {
        return await postData('auth/CriarLiga.php', { id, nomeLiga, palavraLiga});
    },


};