const parte1 = "AQ.Ab8RN6Lsonh";
const parte2 = "k347uSOBJmzQlPtNioPPiwr2QDmBRhJ0ZhLG_Hw";
const API_KEY = parte1 + parte2;

const chatBox = document.getElementById("chat-box");
const userInput = document.getElementById("user-input");

let globalMemory = localStorage.getItem('codecraft_global_memory') || "Nenhum histórico anterior.";
let customMemory = localStorage.getItem('codecraft_custom_memory') || "Nenhuma instrução personalizada definida.";

const atualizarRegras = () => {
    return `Você é uma IA sênior especialista em engenharia reversa, Roblox Studio e Luau, focada em criar scripts altamente otimizados para EXECUTORES MOBILE (como o Delta).

PROCESSO OBRIGATÓRIO DE PENSAMENTO (Pense estrategicamente antes de gerar o código):
1. ANÁLISE DE SEGURANÇA E SERVIDOR: Antes de escrever qualquer script, analise barreiras de autoridade de servidor, anti-cheats básicos ou grupos de colisão do jogo.
2. ENGENHARIA DEFENSIVA RIGOROSA: Nunca assuma que objetos, partes do avatar ou serviços existem. Todo script deve obrigatoriamente usar verificações de nulidade defensivas (ex: 'if character and humanoid then') e blocos 'pcall()' para evitar que erros quebrem o executor no celular.
3. OTIMIZAÇÃO MOBILE: Em loops contínuos (como RunService.Stepped), garanta varreduras leves, condicionais inteligentes (ex: verificar se v.CanCollide é verdadeiro antes de alterar) e otimizadas para não causar travamentos ou queda de FPS.
4. PADRÃO DE QUALIDADE: Forneça o código inteiro, robusto, funcional, limpo e estruturado do início ao fim, sem usar atalhos ou reticências (...).

REGRAS GERAIS:
5. NUNCA envie blocos de código a menos que o usuário PEÇA EXPLICITAMENTE um script. Se ele disser apenas 'Oi', responda naturalmente sem código.
6. INSTRUÇÕES E MEMÓRIA PERSONALIZADA DO DONO: ${customMemory}
7. MEMÓRIA GLOBAL DE CONVERSAS ANTERIORES: ${globalMemory}
8. Seja direto, amigável e especialista técnico em Luau, Java e JSON.`;
};

let sessoes = [];
try {
    sessoes = JSON.parse(localStorage.getItem('codecraft_chats')) || [];
} catch (e) {
    sessoes = [];
}

let chatAtualId = localStorage.getItem('codecraft_atual_id') || null;

window.onload = function() {
    try {
        carregarListaChats();
        if (sessoes.length === 0) {
            novoChat();
        } else if (chatAtualId) {
            carregarChat(chatAtualId);
        } else {
            novoChat();
        }
    } catch (err) {
        console.error("Erro ao iniciar:", err);
        novoChat();
    }
};

function abrirMenu() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('overlay');
    if (sidebar) sidebar.classList.add('open');
    if (overlay) overlay.classList.add('active');
}

function fecharMenu() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('overlay');
    if (sidebar) sidebar.classList.remove('open');
    if (overlay) overlay.classList.remove('active');
}

function novoChat() {
    const novoId = 'chat_' + Date.now();
    const novaSessao = {
        id: novoId,
        titulo: 'Novo Chat',
        mensagens: []
    };
    sessoes.unshift(novaSessao);
    chatAtualId = novoId;
    salvarDados();
    
    if (chatBox) {
        chatBox.innerHTML = `
            <div class="message ai-message">
                Olá, Heitor! CodeCraft pronto para o Delta Mobile. O que vamos programar hoje?
            </div>
        `;
    }
    carregarListaChats();
    fecharMenu();
}

function configurarCerebro() {
    fecharMenu();
    const promptAtual = customMemory === "Nenhuma instrução personalizada definida." ? "" : customMemory;
    const novaInstrucao = prompt("🧠 Digite o que você quer gravar permanentemente no cérebro da IA:", promptAtual);
    
    if (novaInstrucao !== null) {
        customMemory = novaInstrucao.trim() || "Nenhuma instrução personalizada definida.";
        localStorage.setItem('codecraft_custom_memory', customMemory);
        alert("✅ Cérebro atualizado com sucesso!");
    }
}

function renomearChat(event, id) {
    event.stopPropagation();
    const sessao = sessoes.find(s => s.id === id);
    if (!sessao) return;

    const novoNome = prompt("Digite o novo nome para este chat:", sessao.titulo);
    if (novoNome && novoNome.trim() !== "") {
        sessao.titulo = novoNome.trim();
        salvarDados();
        carregarListaChats();
    }
}

function salvarDados() {
    try {
        localStorage.setItem('codecraft_chats', JSON.stringify(sessoes));
        localStorage.setItem('codecraft_atual_id', chatAtualId);
        let resumo = sessoes.map(s => `[Chat: ${s.titulo}]`).join(' | ');
        globalMemory = resumo;
        localStorage.setItem('codecraft_global_memory', globalMemory);
    } catch (e) {
        console.error("Erro ao salvar dados:", e);
    }
}

function carregarListaChats() {
    const listDiv = document.getElementById('history-list');
    if (!listDiv) return;
    listDiv.innerHTML = '';
    
    sessoes.forEach(sessao => {
        const item = document.createElement('div');
        item.className = `history-item ${sessao.id === chatAtualId ? 'active' : ''}`;
        
        const spanTexto = document.createElement('span');
        spanTexto.className = 'history-text';
        spanTexto.innerText = sessao.titulo;
        
        const btnRenomear = document.createElement('button');
        btnRenomear.className = 'rename-btn';
        btnRenomear.innerHTML = '✏️';
        btnRenomear.title = 'Renomear chat';
        btnRenomear.onclick = (e) => renomearChat(e, sessao.id);

        item.appendChild(spanTexto);
        item.appendChild(btnRenomear);
        item.onclick = () => carregarChat(sessao.id);
        
        listDiv.appendChild(item);
    });
}

function carregarChat(id) {
    chatAtualId = id;
    salvarDados();
    carregarListaChats();
    
    const sessao = sessoes.find(s => s.id === id);
    if (!sessao) return;
    
    if (chatBox) chatBox.innerHTML = '';
    
    if (sessao.mensagens.length === 0) {
        if (chatBox) {
            chatBox.innerHTML = `
                <div class="message ai-message">
                    Chat carregado. Como posso ajudar com seus scripts?
                </div>
            `;
        }
    } else {
        sessao.mensagens.forEach(msg => {
            renderizarMensagemNaTelaInstantanea(msg.texto, msg.classe);
        });
    }
    fecharMenu();
}

async function enviarMensagem() {
    if (!userInput) return;
    const textoUsuario = userInput.value.trim();
    if (textoUsuario === "") return;

    renderizarMensagemNaTelaInstantanea(textoUsuario, "user-message");
    userInput.value = "";

    const sessao = sessoes.find(s => s.id === chatAtualId);
    if (!sessao) return;

    if (sessao.mensagens.length === 0 && sessao.titulo === 'Novo Chat') {
        sessao.titulo = textoUsuario.substring(0, 22) + (textoUsuario.length > 22 ? '...' : '');
        carregarListaChats();
    }

    sessao.mensagens.push({ texto: textoUsuario, classe: "user-message" });
    salvarDados();

    const loadingId = adicionarMensagemGenerica("Pensando...", "ai-message");

    let historicoFormatado = [];
    sessao.mensagens.forEach(m => {
        historicoFormatado.push({
            role: m.classe === "user-message" ? "user" : "model",
            parts: [{ text: m.texto }]
        });
    });

    try {
        const resposta = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${API_KEY}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                systemInstruction: { parts: [{ text: atualizarRegras() }] },
                contents: historicoFormatado,
                generationConfig: {
                    maxOutputTokens: 8192,
                    temperature: 0.7
                }
            })
        });

        const dados = await resposta.json();
        const loadEl = document.getElementById(loadingId);
        if (loadEl) loadEl.remove();

        if (dados.candidates && dados.candidates.length > 0) {
            const textoIA = dados.candidates[0].content.parts[0].text;
            sessao.mensagens.push({ texto: textoIA, classe: "ai-message" });
            salvarDados();
            
            await renderizarComEfeitoDigitacao(textoIA);

        } else if (dados.error) {
            renderizarMensagemNaTelaInstantanea("❌ Erro do Google: " + dados.error.message, "ai-message");
        } else {
            renderizarMensagemNaTelaInstantanea("❌ Erro desconhecido: " + JSON.stringify(dados), "ai-message");
        }

    } catch (erro) {
        const loadEl = document.getElementById(loadingId);
        if (loadEl) loadEl.remove();
        renderizarMensagemNaTelaInstantanea("❌ Erro de conexão: " + erro.message, "ai-message");
    }
}

function adicionarMensagemGenerica(texto, classe) {
    const div = document.createElement("div");
    div.className = `message ${classe}`;
    div.innerHTML = texto.replace(/\n/g, '<br>');
    const idUnico = "msg-" + Date.now();
    div.id = idUnico;
    if (chatBox) {
        chatBox.appendChild(div);
        chatBox.scrollTop = chatBox.scrollHeight;
    }
    return idUnico;
}

function renderizarMensagemNaTelaInstantanea(texto, classe) {
    const div = document.createElement("div");
    div.className = `message ${classe}`;
    
    if (classe === "ai-message" && !texto.startsWith("❌")) {
        if (typeof marked !== "undefined") {
            div.innerHTML = marked.parse(texto);
            adicionarBotoesCopiar(div);
        } else {
            div.innerHTML = texto.replace(/\n/g, '<br>'); 
        }
    } else {
        div.innerHTML = texto.replace(/\n/g, '<br>'); 
    }
    
    if (chatBox) {
        chatBox.appendChild(div);
        chatBox.scrollTop = chatBox.scrollHeight;
    }
}

async function renderizarComEfeitoDigitacao(textoCompleto) {
    const div = document.createElement("div");
    div.className = "message ai-message";
    if (chatBox) {
        chatBox.appendChild(div);
    }

    let i = 0;
    const velocidade = 6; 
    
    return new Promise((resolve) => {
        const timer = setInterval(() => {
            if (i < textoCompleto.length) {
                div.textContent += textoCompleto.substring(i, i + 4);
                i += 4;
                if (chatBox) chatBox.scrollTop = chatBox.scrollHeight;
            } else {
                clearInterval(timer);
                if (typeof marked !== "undefined") {
                    div.innerHTML = marked.parse(textoCompleto);
                    adicionarBotoesCopiar(div);
                } else {
                    div.innerHTML = textoCompleto.replace(/\n/g, '<br>');
                }
                if (chatBox) chatBox.scrollTop = chatBox.scrollHeight;
                resolve();
            }
        }, velocidade);
    });
}

function adicionarBotoesCopiar(containerDiv) {
    const blocosDeCodigo = containerDiv.querySelectorAll("pre"); 
    blocosDeCodigo.forEach((bloco) => {
        if (bloco.querySelector(".copy-btn")) return;
        const botaoCopiar = document.createElement("button");
        botaoCopiar.className = "copy-btn";
        botaoCopiar.innerHTML = "📋 Copiar";
        
        botaoCopiar.onclick = function() {
            const codigo = bloco.querySelector("code").innerText;
            navigator.clipboard.writeText(codigo); 
            botaoCopiar.innerHTML = "✅ Copiado!"; 
            setTimeout(() => { botaoCopiar.innerHTML = "📋 Copiar"; }, 2000); 
        };
        
        bloco.appendChild(botaoCopiar); 
    });
}
