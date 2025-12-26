# Type-hero (phaser 3 + PHP 8.0+)
O sistema se baseia em um jogo de digitação utilizando o framework phaser para o frontend e o PHP puro para backend. Para comunicação com os endpoints foi criado um objeto com metodos para cada requisição diferente do jogo (register/login/ligas/pontuações/...).
Banco utilizado : MySQL

## Funcionalidades
  Dentro do sistema há a possibilidade do usuário se registrar, de login com suas credencias, de criação de uma liga, de verificar as pontuações gerais e semanais de cada liga, e é claro, escolher a liga para jogar.
### Ligas
  É possível entrar em uma liga ou criar uma, as ligas são um sistema para jogadores competirem em si as maiores pontuações dentro dos níveis do jogo. O dono de uma liga tem capacidade de alterar nome e senha da liga, alem de remover jogadores.
## Mecanicas
  O jogo é dividido em turnos de ataque e defesa, as duas sendo efetuadas se o jogador conseguir digitar todas as palavras dentro do tempo de cada inimigo. Sendo divido em mundos com inimigos diversificados e numero de palavras diferentes.
  As palavras são escolhidas aleatoriamente de uma array.
### Animações
  Animações foram feitas a partir de uma imagem de IA e posteriomente animadas. Utilizando funções do framework e jsons fornecidos na exportação foi possivel criar as animações mais facilmente. 

# Como Rodar
É necessario criar um arquivo .env na pasta backend com as credencias na sequinte estrutura:
- DB_HOST=localhost
- DB_USERNAME=root
- DB_PASSWORD=
- DB_DATABASE=type-hero
- MIGRATION_KEY = admin
E rodar o arquivo setup_database.php na pasta backend adicionando na url "?key=admin".
Após isso, para a criação de dos inimigos, fases e inimigos por fase é necessario inserir no banco de dados do mysql esses inserts:

-- =================================================================
-- 1. MONSTROS (Bestiário)
-- =================================================================
select * from monsters;
-- Monster 1: Goblin (O mais fraco - Mob básico)
INSERT INTO monsters (id, name, sprite_key, base_hp, damage, word_streak_attack, attack_time) 
VALUES (1, 'Goblin', 'goblin', 15, 5, 5, 8);

-- Monster 2: Lobo (Rápido - Mob médio)
INSERT INTO monsters (id, name, sprite_key, base_hp, damage, word_streak_attack, attack_time) 
VALUES (2, 'Lobo', 'lobo', 25, 10, 5, 8);
-- Monster 3: Lobo (Rápido - Mob médio)
INSERT INTO monsters (id, name, sprite_key, base_hp, damage, word_streak_attack, attack_time) 
VALUES (3, 'Lobo de Fogo', 'lobo2', 40, 15, 3, 2);

-- Monster 4: Líder Goblin (Chefe Intermediário)
INSERT INTO monsters (id, name, sprite_key, base_hp, damage, word_streak_attack, attack_time) 
VALUES (4, 'Líder Goblin', 'goblin2', 50, 20, 10, 10);

-- Monster 5: Paladino (Chefe Final - O mais difícil)
INSERT INTO monsters (id, name, sprite_key, base_hp, damage, word_streak_attack, attack_time) 
VALUES (5, 'Paladino', 'paladino', 50, 35, 15, 12);

-- =================================================================
-- 2. MUNDOS (3 Ambientes)
-- =================================================================

INSERT INTO worlds (id, name, order_index, bg_image) VALUES 
(1, 'Floresta dos Goblins', 1, 'bg_forest'),
(2, 'Trilha dos Lobos', 2, 'bg_mountain'),
(3, 'Fortaleza Real', 3, 'bg_castle');

-- =================================================================
-- 3. FASES (2 por Mundo)
-- =================================================================

-- MUNDO 1: FLORESTA
-- Fase 1-1: Tutorial (Sem Boss)
INSERT INTO levels (id, world_id, order_index, name, boss_monster_id) 
VALUES (1, 1, 1, 'Acampamento Goblin', NULL);



-- MUNDO 2: TRILHA
-- Fase 2-1: Emboscada (Sem Boss, mas muitos inimigos)
INSERT INTO levels (id, world_id, order_index, name, boss_monster_id) 
VALUES (2, 2, 1, 'Caminho Perigoso', NULL);


-- MUNDO 3: FORTALEZA
-- Fase 3-1: Guarda do Castelo (Inimigos Fortes)
INSERT INTO levels (id, world_id, order_index, name, boss_monster_id) 
VALUES (3, 3, 1, 'Salão do Trono', NULL);

-- =================================================================
-- 4. INIMIGOS POR FASE (Spawn List)
-- =================================================================

-- Fase 1-1: Apenas 2 Goblins fáceis e 1 líder Goblin
INSERT INTO level_enemies (level_id, monster_id, quantity) VALUES 
(1, 1, 2), 
(1, 4, 1);

-- Fase 2-1: 2 Lobos (Mais dano que Goblins) e 1 Lobo de fogo
INSERT INTO level_enemies (level_id, monster_id, quantity) VALUES 
(2, 2, 2),
(2, 3, 1);


-- Fase 3-1: 1 Lobo de fogo + 1 Líder Goblin + boss final(Paladino)
INSERT INTO level_enemies (level_id, monster_id, quantity) VALUES 
(3, 3, 1),
(3, 4, 1),
(3, 5, 1);
(3, 5, 1);

	
