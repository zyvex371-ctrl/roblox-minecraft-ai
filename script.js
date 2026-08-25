const parte1 = "AQ.Ab8RN6";
const parte2 = "Ji138Rox2FoxnvTLJK1eoVEMgwEiYWdkUuUPqg0Mgd4A";
const API_KEY = parte1 + parte2;

const chatBox = document.getElementById("chat-box");
const userInput = document.getElementById("user-input");

// 🧠 MEMÓRIA DA IA
let historico = [];

// 📜 REGRAS DE COMPORTAMENTO
const regrasIA = "Você é uma IA especialista em Roblox e Minecraft. REGRAS IMPORTANTES: 1. Seja amigável e converse naturalmente. 2. NUNCA envie blocos de código a menos que o usuário PEÇA EXPLICITAMENTE um código ou script. Se ele disser 'Oi', apenas cumprimente e pergunte como pode ajudar. 3. Para scripts de Roblox, saiba que o usuário pode querer códigos para o Roblox Studio ou para executores como o Delta. Adapte-se ao que ele pedir e crie scripts compatíveis.";

async function enviarMensagem() {
    const textoUsuario = userInput.value.trim();
    if (textoUsuario === "") return;

    adicionarMensagem(textoUsuario, "user-message");
    userInput.value = "";

    // Salva o que VOCÊ disse na memória
    historico.push({ role: "user", parts: [{ text: textoUsuario }] });

    const loadingId = adicionarMensagem("Pensando...", "ai-message");
    
    try {
        // CORRIGIDO: Voltando para a versão 3.6-flash que funciona com a sua chave!
        const resposta = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-3.6-flash:generateContent?key=${API_KEY}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                systemInstruction: { parts: [{ text: regrasIA }] }, 
                contents: historico 
            })
        });

        const dados = await resposta.json();
        
        document.getElementById(loadingId).remove();

        if (dados.candidates && dados.candidates.length > 0) {
            const textoIA = dados.candidates[0].content.parts[0].text;
            
            // Salva o que a IA respondeu na memória
            historico.push({ role: "model", parts: [{ text: textoIA }] }); 
            
            adicionarMensagem(textoIA, "ai-message");
        } else if (dados.error) {
            adicionarMensagem("❌ Erro do Google: " + dados.error.message, "ai-message");
        } else {
            adicionarMensagem("❌ Erro desconhecido: " + JSON.stringify(dados), "ai-message");
        }

    } catch (erro) {
        document.getElementById(loadingId).remove();
        adicionarMensagem("❌ Erro no código: " + erro.message, "ai-message");
    }
}

function adicionarMensagem(texto, classe) {
    const div = document.createElement("div");
    div.className = `message ${classe}`;
    
    if (classe === "ai-message" && texto !== "Pensando..." && !texto.startsWith("❌")) {
        if (typeof marked !== "undefined") {
            div.innerHTML = marked.parse(texto);
            
            // MÁGICA DO BOTÃO DE COPIAR
            const blocosDeCodigo = div.querySelectorAll("pre"); 
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

        } else {
            div.innerHTML = texto.replace(/\n/g, '<br>'); 
        }
    } else {
        div.innerHTML = texto.replace(/\n/g, '<br>'); 
    }
    
    const idUnico = "msg-" + Date.now();
    div.id = idUnico;
    chatBox.appendChild(div);
    chatBox.scrollTop = chatBox.scrollHeight;
    return idUnico;
}
