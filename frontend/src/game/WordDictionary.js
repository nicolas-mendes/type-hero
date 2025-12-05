const WORD_POOL = [
    // Curtas (3-4 letras)
    "ceu", "mar", "luz", "pao", "ave", "bom", "dor", "fim", "nos", "vos",
    "frio", "alto", "belo", "doce", "fogo", "jogo", "lobo", "mesa", "novo", "olho",
    "casa", "vida", "mao", "pe", "sol", "lua", "rio", "som", "cor", "flor",
    
    // Médias (5-7 letras)
    "tempo", "vento", "chuva", "norte", "sorte", "morte", "livro", "carro", "terra", "navio",
    "papel", "pluma", "pedra", "campo", "canto", "sonho", "mundo", "fundo", "gesto", "festa",
    "amigo", "bicho", "coisa", "dados", "elite", "faixa", "gente", "honra", "idade", "jovem",
    "largo", "magia", "noite", "ontem", "poeta", "quase", "razao", "sabor", "tarde", "uniao",
    
    // Longas/Complexas (8+ letras)
    "horizonte", "liberdade", "esperanca", "conquista", "felicidade", "velocidade", "sociedade",
    "realidade", "qualidade", "quantidade", "montanha", "natureza", "profundo", "trabalho",
    "silencio", "presente", "historia", "memoria", "vitoria", "derrota", "coragem", "verdade",
    "passado", "futuro", "espelho", "caminho", "destino", "estrela", "universo", "galaxia",
    "fantasma", "monstro", "dragao", "espada", "escudo", "feitico", "pocao", "armadura"
];

export const WordDictionary = {
    
    /**
     * Retorna um array de palavras aleatórias.
     * @param {number} count
     * @returns {string[]}
     */
    getWords: (count) => {
        const selection = [];
        
        for (let i = 0; i < count; i++) {
            const randomIndex = Math.floor(Math.random() * WORD_POOL.length);
            let word = WORD_POOL[randomIndex].toUpperCase();
            word = word.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            
            selection.push(word);
        }
        
        return selection;
    }
};