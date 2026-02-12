const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

/**
 * CONFIGURAÇÕES GREEN-API
 * Coloque os dados da sua instância e token aqui
 */
const ID_INSTANCE = 'SEU_ID_INSTANCE_AQUI';
const API_TOKEN = 'SEU_API_TOKEN_AQUI';
const WHATSAPP_GROUP_ID = 'SEU_ID_DO_GRUPO_DE_GUINCHEIROS@g.us'; 

app.post('/send-message', async (req, res) => {
    const data = req.body;

    // Limpa o número de telefone para criar o link do WhatsApp (remove parênteses, espaços, traços)
    const cleanPhone = data.phone.replace(/\D/g, '');
    
    // Formata o link direto para o prestador clicar e já abrir a conversa
    const waLink = `https://wa.me/55${cleanPhone}`;

    // Formatação da mensagem otimizada para leitura rápida no grupo de WhatsApp
    const message = 
        `🛠️ *NOVA SOLICITAÇÃO - CLIENTOU* 🛠️\n\n` +
        `👤 *Cliente:* ${data.name.toUpperCase()}\n` +
        `📱 *WhatsApp:* ${data.phone}\n` +
        `🔗 *Link Direto:* ${waLink}\n\n` +
        `🚗 *Veículo:* ${data.type} - ${data.model}\n` +
        `📍 *Origem (Buscar):* ${data.origin}\n` +
        `🏁 *Destino (Levar):* ${data.destination}\n` +
        `⚠️ *Problema:* ${data.issue}\n` +
        `📅 *Quando:* ${data.schedule}\n` +
        `💳 *Pagamento:* ${data.payment}\n` +
        `📝 *Notas:* ${data.notes || 'Nenhuma'}\n\n` +
        `⚡ *Instrução:* Clique no link acima para falar com o cliente agora!`;

    try {
        const url = `https://api.green-api.com/waInstance${ID_INSTANCE}/sendMessage/${API_TOKEN}`;
        
        const response = await axios.post(url, {
            chatId: WHATSAPP_GROUP_ID,
            message: message
        });

        res.status(200).json({ success: true, response: response.data });
    } catch (error) {
        console.error('Erro GREEN-API:', error.response?.data || error.message);
        res.status(500).json({ success: false, error: 'Erro ao enviar para o WhatsApp' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`CLIENTOU Backend ativo na porta ${PORT}`);
});