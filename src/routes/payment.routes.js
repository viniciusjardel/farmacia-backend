const express = require('express');
const router = express.Router();
const QRCode = require('qrcode');

// ===== CONFIGURAÇÃO PIX ÚNICO =====
// PIX fixo que será usado por todos os clientes
const PIX_CONFIG = {
    pixKey: '81992659707', // Telefone do PIX
    pixName: 'Vinicius Jardel',
    pixBank: 'NUBANK',
    pixType: 'telefone' // Tipo: telefone, CPF, CNPJ, email ou aleatório
};

// Função para gerar QR Code com chave PIX fixo
async function generateQRCodeWithValue(amount) {
    try {
        console.log('🔄 Iniciando geração de QR Code...');
        // Criar string com PIX + valor para o QR Code
        const pixData = `${PIX_CONFIG.pixKey}|${amount.toFixed(2)}`;
        
        console.log('📦 Dados para QR Code:', pixData);
        
        // Gerar QR Code
        const qrCodeImage = await QRCode.toDataURL(pixData, {
            errorCorrectionLevel: 'H',
            type: 'image/png',
            width: 300,
            margin: 2,
            color: {
                dark: '#000000',
                light: '#FFFFFF'
            }
        });
        
        console.log('✅ QR Code gerado com sucesso');
        return qrCodeImage;
    } catch (error) {
        console.error('❌ Erro ao gerar QR Code:', error);
        return null;
    }
}

// Gerar pagamento PIX (com chave PIX fixa)
router.post('/pix', async (req, res) => {
    try {
        const { amount } = req.body;

        console.log('📝 [/payment/pix] Recebido requisição POST');
        console.log('Amount:', amount);

        // Validação básica
        if (!amount) {
            console.log('❌ Amount não fornecido');
            return res.status(400).json({
                error: 'Amount é obrigatório'
            });
        }

        // Responder rapidamente sem esperar QR Code
        console.log('⏱️ Tentando gerar QR Code...');
        let qrCodeImage = null;
        
        try {
            qrCodeImage = await generateQRCodeWithValue(amount);
        } catch (qrError) {
            console.error('⚠️ Erro ao gerar QR Code, continuando sem ele:', qrError.message);
            qrCodeImage = null;
        }
        
        // Resposta com PIX FIXO (QR Code é opcional)
        const pixResponse = {
            id: `pix_${Date.now()}`,
            amount: parseFloat(amount),
            status: 'pending',
            qr_code_image: qrCodeImage,
            pix_key: PIX_CONFIG.pixKey,
            pix_name: PIX_CONFIG.pixName,
            pix_bank: PIX_CONFIG.pixBank,
            pix_type: PIX_CONFIG.pixType,
            created_at: new Date().toISOString(),
            expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString()
        };

        console.log('✅ Respondendo ao cliente com sucesso');
        res.json(pixResponse);
    } catch (error) {
        console.error('❌ Erro ao processar PIX:', error);
        res.status(500).json({
            error: 'Erro ao processar pagamento PIX',
            details: error.message
        });
    }
});

// Verificar status do pagamento PIX
router.get('/pix/:paymentId', async (req, res) => {
    try {
        const { paymentId } = req.params;

        // TODO: Verificar status no Mercado Pago
        // const status = await axios.get(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
        //     headers: { 'Authorization': `Bearer ${MERCADO_PAGO_ACCESS_TOKEN}` }
        // });

        res.json({
            id: paymentId,
            status: 'pending' // Substituir por status real
        });
    } catch (error) {
        console.error('Erro ao verificar status:', error);
        res.status(500).json({
            error: 'Erro ao verificar status do pagamento'
        });
    }
});

module.exports = router;
