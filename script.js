const parte1 = "AQ.Ab8RN6";
const parte2 = "Ji138Rox2FoxnvTLJK1eoVEMgwEiYWdkUuUPqg0Mgd4A";
const API_KEY = parte1 + parte2;

const chatBox = document.getElementById("chat-box");
const userInput = document.getElementById("user-input");

let globalMemory = localStorage.getItem('codecraft_global_memory') || "Nenhum histórico anterior.";
let customMemory = localStorage.getItem('codecraft_custom_memory') || "Nenhuma instrução personalizada definida.";

const atualizarRegras = () => {
    return `Você é uma IA sênior especialista em criar sistemas inteiros, gigantes, modulares e COMPLETOS para Roblox (Roblox Studio / Luau) e para executores como Delta, além de mods para Minecraft. 
REGRAS OBRIGATÓRIAS:
1. Nunca economize código. Quando o usuário pedir um sistema, forneça o script inteiro, robusto, funcional e estruturado do início ao fim, sem usar atalhos, comentários vazios do tipo '-- coloque seu código aqui' ou reticências (...).
2. NUNCA envie blocos de código a menos que o usuário PEÇA EXPLICITAMENTE um script. Se ele disser apenas 'Oi', responda naturalmente sem código.
3. INSTRUÇÕES E MEMÓRIA PERSONALIZADA DEFINIDAS PELO DONO: ${customMemory}
4. MEMÓRIA GLOBAL DE CONVERSAS ANTERIORES: ${globalMemory}
5. Seja direto, amigável e especialista técnico em Luau, Java e JSON.`;
};

let sessoes = JSON.parse(localStorage.getItem('codecraft_chats')) || [];
let chatAtualId = localStorage.getItem('codecraft_atual_id') || null;

window.onload = function() {
    carregarListaChats();
    if (sessoes.length === 0) {
        novoChat();
    } else if (chatAtualId) {
        carregarChat(chatAtualId);
    } else {
        novoChat();
    }
};

function abrirMenu() {
    document.getElementById('sidebar').classList.add('open');
    document.getElementById('overlay').classList.add('active');
}

function fecharMenu() {
    document.getElementById('sidebar').classList.remove('open');
    document.getElementById('overlay').classList.remove('active');
}

function observarEnter(event) {
    if (event.key === 'Enter') enviarMensagem();
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
    
    chatBox.innerHTML = `
        <div class="message ai-message">
            Olá! Novo chat iniciado. O que vamos programar hoje?
        </div>
    `;
    carregarListaChats();
    fecharMenu();
}

function configurarCerebro() {
    fecharMenu();
    const promptAtual = customMemory === "Nenhuma instrução personalizada definida." ? "" : customMemory;
    const novaInstrucao = prompt("🧠 Digite o que você quer gravar permanentemente no cérebro da IA (Ex: 'Lembre-se que meu nome é Gabriel e sou seu dono'):", promptAtual);
    
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
    localStorage.setItem('codecraft_chats', JSON.stringify(sessoes));
    localStorage.setItem('codecraft_atual_id', chatAtualId);
    
    let resumo = sessoes.map(s => `[Chat: ${s.titulo}]`).join(' | ');
    globalMemory = resumo;
    localStorage.setItem('codecraft_global_memory', globalMemory);
}

function carregarListaChats() {
    const listDiv = document.getElementById('history-list');
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
    
    chatBox.innerHTML = '';
    
    if (sessao.mensagens.length === 0) {
        chatBox.innerHTML = `
            <div class="message ai-message">
                Chat carregado. Como posso ajudar com seus scripts?
            </div>
        `;
    } else {
        sessao.mensagens.forEach(msg => {
            renderizarMensagemNaTelaInstantanea(msg.texto, msg.classe);
        });
    }
    fecharMenu();
}

async function enviarMensagem() {
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
        const resposta = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-3.6-flash:generateContent?key=${API_KEY}`, {
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
        document.getElementById(loadingId).remove();

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
        document.getElementById(loadingId).remove();
        renderizarMensagemNaTelaInstantanea("❌ Erro de conexão: " + erro.message, "ai-message");
    }
}

function adicionarMensagemGenerica(texto, classe) {
    const div = document.createElement("div");
    div.className = `message ${classe}`;
    div.innerHTML = texto.replace(/\n/g, '<br>');
    const idUnico = "msg-" + Date.now();
    div.id = idUnico;
    chatBox.appendChild(div);
    chatBox.scrollTop = chatBox.scrollHeight;
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
    
    chatBox.appendChild(div);
    chatBox.scrollTop = chatBox.scrollHeight;
}

async function renderizarComEfeitoDigitacao(textoCompleto) {
    const div = document.createElement("div");
    div.className = "message ai-message";
    chatBox.appendChild(div);

    let i = 0;
    const velocidade = 6; 
    
    return new Promise((resolve) => {
        const timer = setInterval(() => {
            if (i < textoCompleto.length) {
                div.textContent += textoCompleto.substring(i, i + 4);
                i += 4;
                chatBox.scrollTop = chatBox.scrollHeight;
            } else {
                clearInterval(timer);
                if (typeof marked !== "undefined") {
                    div.innerHTML = marked.parse(textoCompleto);
                    adicionarBotoesCopiar(div);
                } else {
                    div.innerHTML = textoCompleto.replace(/\n/g, '<br>');
                }
                chatBox.scrollTop = chatBox.scrollHeight;
                resolve();
            }
        }, velocidade);
    });
}

function adicionarBotoesCopiar(containerDiv) {
    const blocosDeCodigo = containerDiv.querySelectorAll("pre"); 
    blocosDeCodigo.forEach((bloco) => {
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
