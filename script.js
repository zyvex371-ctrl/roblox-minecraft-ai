const parte1 = "AQ.Ab8RN6";
const parte2 = "Ji138Rox2FoxnvTLJK1eoVEMgwEiYWdkUuUPqg0Mgd4A";
const API_KEY = parte1 + parte2;

const chatBox = document.getElementById("chat-box");
const userInput = document.getElementById("user-input");

async function enviarMensagem() {
    const textoUsuario = userInput.value.trim();
    if (textoUsuario === "") return;

    adicionarMensagem(textoUsuario, "user-message");
    userInput.value = "";

    const loadingId = adicionarMensagem("Pensando no código...", "ai-message");

    const systemPrompt = "Você é uma IA sênior especialista em scripts para Roblox (Luau) e criação de mods para Minecraft. Forneça códigos prontos, limpos e explique como usar. O usuário perguntou: ";
    
    try {
        // Atualizado para o modelo Gemini 3.6 Flash recomendado pelo Google
        const resposta = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-3.6-flash:generateContent?key=${API_KEY}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: systemPrompt + textoUsuario }]
                }]
            })
        });

        const dados = await resposta.json();
        
        document.getElementById(loadingId).remove();

        if (dados.candidates && dados.candidates.length > 0) {
            const textoIA = dados.candidates[0].content.parts[0].text;
            adicionarMensagem(textoIA, "ai-message");
        } else if (dados.error) {
            adicionarMensagem("❌ Erro do Google: " + dados.error.message, "ai-message");
        } else {
            adicionarMensagem("❌ Erro desconhecido: " + JSON.stringify(dados), "ai-message");
        }

    } catch (erro) {
        document.getElementById(loadingId).remove();
        adicionarMensagem("❌ Erro de conexão com a internet.", "ai-message");
    }
}

function adicionarMensagem(texto, classe) {
    const div = document.createElement("div");
    div.className = `message ${classe}`;
    div.innerHTML = texto.replace(/\n/g, '<br>'); 
    const idUnico = "msg-" + Date.now();
    div.id = idUnico;
    chatBox.appendChild(div);
    chatBox.scrollTop = chatBox.scrollHeight;
    return idUnico;
}
