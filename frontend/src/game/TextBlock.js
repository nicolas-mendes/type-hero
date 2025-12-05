export class TextBlock extends Phaser.GameObjects.Container {

    constructor(scene, x, y, wordsArray, timeLimitSeconds, onComplete, onFail) {
        super(scene, x, y);
        this.scene = scene;

        this.fullText = wordsArray.join(" ").toLowerCase();
        this.userInput = "";
        this.totalTime = timeLimitSeconds * 1000;
        this.currentTime = this.totalTime;

        this.onComplete = onComplete;
        this.onFail = onFail;
        this.isActive = true;

        // Estilo
        this.fontFamily = '"JetBrains Mono", "Courier New", monospace';
        this.fontSize = '24px';
        this.fontStr = `bold ${this.fontSize} ${this.fontFamily}`;

        // 1. LÓGICA DE LINHAS (Word Wrap)
        const MAX_WIDTH = 500;
        this.lines = this.wrapText(wordsArray, MAX_WIDTH, scene);

        // 2. CÁLCULO DINÂMICO DE LARGURA (Correção do BG)
        // Medimos qual é a linha mais longa para o fundo não ficar gigante
        let maxLinePixelWidth = 0;
        const measurer = scene.add.text(0, 0, "", { font: this.fontStr }).setVisible(false);

        this.lines.forEach(line => {
            measurer.setText(line);
            if (measurer.width > maxLinePixelWidth) maxLinePixelWidth = measurer.width;
        });
        measurer.destroy();

        // Largura final = A maior linha + Padding
        this.boxWidth = maxLinePixelWidth + 40;
        this.boxHeight = (this.lines.length * 30) + 40;

        // Visual
        this.bg = scene.add.rectangle(0, 0, this.boxWidth, this.boxHeight, 0x323437, 0.9);
        this.add(this.bg);

        // Textos (1 Grupo por linha)
        this.lineObjects = [];
        let startY = -(this.lines.length * 30) / 2 + 15;

        this.lines.forEach((lineText) => {
            const createText = () => scene.add.text(0, startY, "", {
                fontFamily: this.fontFamily, fontSize: this.fontSize, fontStyle: 'bold'
            }).setOrigin(0, 0.5);

            const obj = {
                txtDone: createText().setColor('#cccbc2'),
                txtCurrent: createText().setColor('#636568'),
                txtFuture: createText().setColor('#636568'),
                fullText: lineText
            };

            this.add([obj.txtDone, obj.txtCurrent, obj.txtFuture]);
            this.lineObjects.push(obj);
            startY += 30;
        });

        // Barra de Tempo
        const barY = this.boxHeight / 2 - 10;
        this.timerBarBg = scene.add.rectangle(0, barY, this.boxWidth, 6, 0x555555).setOrigin(0.5);
        this.timerBarFill = scene.add.rectangle(-this.boxWidth / 2, barY, this.boxWidth, 6, 0x00ff00).setOrigin(0, 0.5);

        this.add([this.timerBarBg, this.timerBarFill]);

        this.updateTextVisual();

        scene.add.existing(this);
        this.scene.events.on('update', this.update, this);

        this.scene.time.delayedCall(50, () => {
            if (this.active) this.updateTextVisual();
        });
    }

    wrapText(words, maxWidth, scene) {
        let lines = [];
        let currentLine = words[0];
        const measure = scene.add.text(0, 0, "", { font: this.fontStr }).setVisible(false);

        for (let i = 1; i < words.length; i++) {
            const word = words[i];
            const testLine = currentLine + " " + word;
            measure.setText(testLine);

            if (measure.width > maxWidth) {
                lines.push(currentLine);
                currentLine = word;
            } else {
                currentLine = testLine;
            }
        }
        lines.push(currentLine);
        measure.destroy();
        return lines;
    }

    update(time, delta) {
        if (!this.isActive) return;
        this.currentTime -= delta;
        const pct = Math.max(0, this.currentTime / this.totalTime);
        this.timerBarFill.scaleX = pct;

        if (pct < 0.3) this.timerBarFill.setFillStyle(0xff4444);
        else if (pct < 0.6) this.timerBarFill.setFillStyle(0xffdd00);
        else this.timerBarFill.setFillStyle(0x00ff00);

        if (this.currentTime <= 0) this.fail();
    }

    handleKey(key) {
        if (!this.isActive) return;

        if (key === 'BACKSPACE') {
            if (this.userInput.length > 0) {
                this.userInput = this.userInput.slice(0, -1);
                this.updateTextVisual();
            }
            return;
        }

        if (this.userInput.length < this.fullText.length) {
            const isCorrectSoFar = this.fullText.startsWith(this.userInput);
            if (isCorrectSoFar) {
                this.userInput += key.toLowerCase();
                if (this.userInput === this.fullText) {
                    this.updateTextVisual();
                    this.complete();
                    return;
                }
                this.updateTextVisual();
            } else {
                this.scene.cameras.main.shake(50, 0.002);
            }
        }
    }

    updateTextVisual() {
        const globalInputLen = this.userInput.length;
        let charCounter = 0; 

        // 1. Detecta onde está o erro
        let globalErrorIndex = -1;
        for(let i=0; i<globalInputLen; i++) {
            if(this.userInput[i] !== this.fullText[i]) { 
                globalErrorIndex = i; 
                break; 
            }
        }
        const hasError = (globalErrorIndex !== -1);

        // 2. Define os Limites Visuais
        // Verde: Vai até o erro ou até o fim do input (se correto)
        const greenLimitIndex = hasError ? globalErrorIndex : globalInputLen;

        // Cursor Visual: AQUI ESTAVA O ERRO
        // Se tiver erro, o cursor TRAVA no erro. Se não, segue o input.
        const cursorIndex = hasError ? globalErrorIndex : globalInputLen;

        this.lineObjects.forEach((lineObj) => {
            const lineLen = lineObj.fullText.length;
            const lineStartIndex = charCounter;
            // const lineEndIndex = charCounter + lineLen; // (Não usado, mas bom pra ref)

            let localStrDone = "";
            let localStrCurrent = "";
            let localStrFuture = "";
            let isErrorInThisChar = false;

            // Transforma índices globais em locais desta linha
            const localGreenLimit = greenLimitIndex - lineStartIndex;
            const localCursor = cursorIndex - lineStartIndex;

            // --- A) PARTE VERDE (DONE) ---
            if (localGreenLimit > 0) {
                const end = Math.min(lineLen, localGreenLimit);
                localStrDone = lineObj.fullText.substring(0, end);
            }

            // --- B) CARACTERE ATUAL (CURRENT - ERRO OU CURSOR) ---
            // Verifica se o cursor visual cai dentro desta linha
            if (localCursor >= 0 && localCursor < lineLen) {
                // Pegamos a letra ORIGINAL que deveria ser digitada
                let char = lineObj.fullText[localCursor];
                localStrCurrent = (char === ' ') ? '_' : char;
                
                // Se o cursor está aqui por causa de um erro, marca flag
                if (hasError) isErrorInThisChar = true;
            }

            // --- C) PARTE FUTURA (FUTURE) ---
            // O futuro começa logo após o cursor atual
            // Se o cursor estava nesta linha, o futuro é o resto da linha
            // Se o cursor já passou desta linha, futuro é vazio
            // Se o cursor ainda não chegou nesta linha, futuro é a linha toda
            
            if (localCursor < lineLen) {
                // Se o cursor está antes ou no meio desta linha
                // O início do futuro é cursor + 1 (se tiver cursor nesta linha) ou 0
                let startFuture = Math.max(0, localCursor + 1);
                
                // Caso especial: Se o cursor está em uma linha anterior, startFuture seria negativo
                // Precisamos garantir que pegue a linha toda se o cursor estiver atrás
                if (localCursor < 0) startFuture = 0;

                localStrFuture = lineObj.fullText.substring(startFuture);
            }

            // Renderiza
            lineObj.txtDone.setText(localStrDone);
            lineObj.txtCurrent.setText(localStrCurrent);
            lineObj.txtFuture.setText(localStrFuture);

            // Estilos
            const font = { fontFamily: this.fontFamily, fontSize: this.fontSize, fontStyle: 'bold' };
            
            lineObj.txtDone.setStyle({ ...font, color: '#cccbc2' });
            
            // Se for erro, Vermelho. Se for cursor normal, Branco.
            lineObj.txtCurrent.setStyle({ ...font, color: isErrorInThisChar ? '#c44653' : '#636568' });
            
            lineObj.txtFuture.setStyle({ ...font, color: '#636568' });

            // Alinhamento
            const w1 = lineObj.txtDone.width;
            const w2 = lineObj.txtCurrent.width;
            const w3 = lineObj.txtFuture.width;
            const totalW = w1 + w2 + w3;
            const startX = -totalW / 2;

            lineObj.txtDone.x = startX;
            lineObj.txtCurrent.x = startX + w1;
            lineObj.txtFuture.x = startX + w1 + w2;

            charCounter += lineLen + 1; 
        });
    }

    complete() {
        this.cleanup();
        this.timerBarFill.setFillStyle(0x00ff00);
        this.scene.tweens.add({
            targets: this, scaleX: 1.2, scaleY: 1.2, alpha: 0, duration: 300,
            onComplete: () => { this.destroy(); if (this.onComplete) this.onComplete(); }
        });
    }

    fail() {
        this.cleanup();
        this.lineObjects.forEach(obj => {
            obj.txtDone.setColor('#c44653');
            obj.txtCurrent.setColor('#c44653');
            obj.txtFuture.setColor('#c44653');
        });
        this.scene.tweens.add({
            targets: this, y: this.y + 50, alpha: 0, duration: 500,
            onComplete: () => { this.destroy(); if (this.onFail) this.onFail(); }
        });
    }

    cleanup() {
        this.isActive = false;
        if (this.scene) this.scene.events.off('update', this.update, this);
    }
}