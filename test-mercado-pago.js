#!/usr/bin/env node

/**
 * 🧪 Script de Teste - Mercado Pago PIX Dinâmico
 * 
 * Uso:
 *   node test-mercado-pago.js
 */

const http = require('http');

function makeRequest(method, path, data = null) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 3000,
            path: path,
            method: method,
            headers: {
                'Content-Type': 'application/json'
            }
        };

        const req = http.request(options, (res) => {
            let body = '';
            
            res.on('data', (chunk) => {
                body += chunk;
            });
            
            res.on('end', () => {
                try {
                    const json = JSON.parse(body);
                    resolve({ status: res.statusCode, data: json });
                } catch (e) {
                    resolve({ status: res.statusCode, data: body });
                }
            });
        });

        req.on('error', (e) => {
            reject(e);
        });

        if (data) {
            req.write(JSON.stringify(data));
        }
        req.end();
    });
}

async function runTests() {
    console.log('\n🧪 TESTE: Mercado Pago PIX Dinâmico\n');
    console.log('=' .repeat(60));

    try {
        // ✅ Teste 1: Criar pagamento PIX
        console.log('\n📝 Teste 1: Criar Pagamento PIX Dinâmico');
        console.log('-'.repeat(60));
        
        const paymentData = {
            amount: 99.90,
            customer_email: 'teste@farmacia.com',
            customer_name: 'Cliente Teste'
        };
        
        console.log('Request:');
        console.log(JSON.stringify(paymentData, null, 2));
        
        const createResponse = await makeRequest('POST', '/payment/pix-dinamico', paymentData);
        
        if (createResponse.status === 200) {
            console.log('\n✅ SUCESSO! Pagamento criado');
            console.log('\nResponse:');
            console.log(JSON.stringify(createResponse.data, null, 2));
            
            // ✅ Teste 2: Verificar status
            if (createResponse.data.payment_id) {
                console.log('\n📝 Teste 2: Verificar Status do Pagamento');
                console.log('-'.repeat(60));
                
                const paymentId = createResponse.data.payment_id;
                console.log(`Consultando pagamento: ${paymentId}`);
                
                const statusResponse = await makeRequest('GET', `/payment/pix-dinamico/${paymentId}`);
                
                if (statusResponse.status === 200) {
                    console.log('\n✅ SUCESSO! Status obtido');
                    console.log('\nResponse:');
                    console.log(JSON.stringify(statusResponse.data, null, 2));
                } else {
                    console.log(`\n❌ ERRO ao verificar status (${statusResponse.status})`);
                    console.log(statusResponse.data);
                }
            }
        } else {
            console.log(`\n❌ ERRO ao criar pagamento (${createResponse.status})`);
            console.log(JSON.stringify(createResponse.data, null, 2));
        }
        
    } catch (error) {
        console.error('\n❌ ERRO:', error.message);
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ Testes Concluídos\n');
}

// Executa os testes
runTests().catch(console.error);
