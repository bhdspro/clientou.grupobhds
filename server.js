const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(express.json());

// CONFIGURAÇÃO DE SEGURANÇA (CORS)
// Permite acesso do seu site e também de testes locais
app.use(cors({
    origin: ['https://clientou.grupobhds.com', 'http://clientou.grupobhds.com', 'http://127.0.0.1:5500', 'http://localhost:3000']
}));

/**
 * ------------------------------------------------------------------
 * DADOS DA GREEN-API - VIA VARIÁVEIS DE AMBIENTE (RENDER)
 * ------------------------------------------------------------------
 * Configure estas chaves na aba "Environment" do seu serviço no Render.
 */

// 1. API URL (Ex: https://7103.api.greenapi.com)
const API_HOST_URL = process.env.API_HOST_URL; 

// 2. ID da Instância
const ID_INSTANCE = process.env.ID_INSTANCE;

// 3. Token da Instância
const API_TOKEN = process.env.API_TOKEN;

// 4. ID do Grupo (@g.us)
const WHATSAPP_GROUP_ID = process.env.WHATSAPP_GROUP_ID; 


app.post('/send-message', async (req, res) => {
    const data = req.body;

    // Verificação de segurança simples para garantir que as variáveis existem
    if (!API_HOST_URL || !ID_INSTANCE || !API_TOKEN || !WHATSAPP_GROUP_ID) {
        console.error("ERRO: Variáveis de ambiente não configuradas no Render.");
        return res.status(500).json({ 
            success: false, 
            error: 'Configuração do servidor incompleta (Environment Variables).' 
        });
    }

    console.log("Recebendo dados:", data); 

    const cleanPhone = data.phone ? data.phone.replace(/\D/g, '') : '';
    const waLink = `https://wa.me/55${cleanPhone}`;

    const message = 
        `⚡ *NOVA SOLICITAÇÃO*\n\n` +
        `- *Cliente:* ${data.name ? data.name.toUpperCase() : 'NÃO INFORMADO'}\n` +
        `- *WhatsApp:* ${data.phone}\n\n` +
        `Clique no link para entrar em contato: ${waLink}\n\n` +
        `- *Veículo:* ${data.type} - ${data.model}\n` +
        `- *Local de Origem:* ${data.origin}\n` +
        `- *Local de Destino:* ${data.destination}\n` +
        `- *Problema:* ${data.issue}\n\n` +
        `- *Quando Retirar:* ${data.schedule}\n` +
        `- *Forma de Pagamento:* ${data.payment}\n` +
        `- *Observações:* ${data.notes || 'Nenhuma'}\n\n` +
        `⚠️ *Atenção:* O cliente está sem guincho agora. Entre em contato imediatamente para pegar o serviço. ​Boas vendas!`;

    try {
        // MONTAGEM DA URL
        const url = `${API_HOST_URL}/waInstance${ID_INSTANCE}/sendMessage/${API_TOKEN}`;
        
        console.log("Tentando enviar mensagem...");

        const response = await axios.post(url, {
            chatId: WHATSAPP_GROUP_ID,
            message: message
        });

        console.log("Sucesso Green-API:", response.data);
        res.status(200).json({ success: true, response: response.data });

    } catch (error) {
        console.error('ERRO DETALHADO:', error.response ? error.response.data : error.message);
        
        res.status(500).json({ 
            success: false, 
            error: 'Erro ao enviar para o WhatsApp.',
            details: error.response ? error.response.data : error.message
        });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`CLIENTOU Backend ativo na porta ${PORT}`);
});