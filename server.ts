import express from "express";
import path from "path";
import twilio from "twilio";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // -------------------------------------------------------------
  // LÓGICA DE INTEGRAÇÃO REAL DA API DE TELEFONIA (TWILIO)
  // -------------------------------------------------------------
  // Aqui inicializamos o cliente da Twilio com as credenciais do .env
  // Atenção: Configure TWILIO_ACCOUNT_SID e TWILIO_AUTH_TOKEN no arquivo .env
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  
  let twilioClient: twilio.Twilio | null = null;
  if (accountSid && authToken && accountSid.startsWith('AC')) {
    try {
      twilioClient = twilio(accountSid, authToken);
    } catch (e) {
      console.error("Erro ao inicializar Twilio:", e);
    }
  } else if (accountSid || authToken) {
    console.warn("TWILIO_ACCOUNT_SID precisa começar com 'AC'. Rodando em modo DEMO.");
  }

  // Obter Saldo
  app.get("/api/balance", async (req, res) => {
    // Como o cliente solicitou o símbolo de infinito para saldo ilimitado, 
    // retornamos "∞" independentemente da API, mas em uma aplicação financeira real
    // você poderia consultar client.api.v2010.accounts(accountSid).fetch()
    res.json({ balance: "∞", demoMode: !twilioClient });
  });

  // Comprar/Obter Número Virtual
  app.post("/api/numbers/buy", async (req, res) => {
    try {
      const { countryCode = 'BR', service = 'Outros' } = req.body;
      
      if (!twilioClient) {
        // MODO DEMO: Retorna dados simulados se a API Key não estiver configurada
        // Gerando números no padrão estrito E.164 com tamanhos reais por país
        let generatedNumber = '';
        switch (countryCode) {
          case 'BR':
            generatedNumber = `+55119${Math.floor(10000000 + Math.random() * 90000000)}`;
            break;
          case 'US':
            generatedNumber = `+1415${Math.floor(1000000 + Math.random() * 9000000)}`;
            break;
          case 'GB':
            generatedNumber = `+447415${Math.floor(100000 + Math.random() * 900000)}`;
            break;
          case 'CA':
            generatedNumber = `+1416${Math.floor(1000000 + Math.random() * 9000000)}`;
            break;
          case 'PT':
            generatedNumber = `+35191${Math.floor(1000000 + Math.random() * 9000000)}`;
            break;
          case 'ES':
            generatedNumber = `+346${Math.floor(10000000 + Math.random() * 90000000)}`;
            break;
          case 'CH':
            generatedNumber = `+4179${Math.floor(1000000 + Math.random() * 9000000)}`;
            break;
          case 'PL':
            generatedNumber = `+485${Math.floor(10000000 + Math.random() * 90000000)}`;
            break;
          default:
            generatedNumber = `+55119${Math.floor(10000000 + Math.random() * 90000000)}`;
        }
        
        return res.json({
          phoneNumber: generatedNumber,
          sid: `simulated_sid_${Date.now()}`,
          dateCreated: new Date().toISOString(),
          countryCode,
          service
        });
      }

      // INTEGRAÇÃO REAL COM TWILIO:
      // 1. Busca números móveis disponíveis no país solicitado
      const availableNumbers = await twilioClient.availablePhoneNumbers(countryCode).mobile.list({ limit: 1 });
      
      if (availableNumbers.length === 0) {
        return res.status(404).json({ error: `Nenhum número disponível para ${countryCode} no momento.` });
      }
      
      // 2. Compra o número automaticamente
      // CUIDADO: Este trecho debita dinheiro real da sua conta Twilio.
      const incomingNumber = await twilioClient.incomingPhoneNumbers.create({
        phoneNumber: availableNumbers[0].phoneNumber
      });

      res.json({
        phoneNumber: incomingNumber.phoneNumber,
        sid: incomingNumber.sid,
        dateCreated: incomingNumber.dateCreated,
        countryCode,
        service
      });
      
    } catch (error) {
      console.error('Erro ao comprar número:', error);
      res.status(500).json({ error: 'Falha na comunicação com a API de telefonia.' });
    }
  });

  // Obter mensagens recebidas (Inbox) de um número específico
  app.get("/api/messages/:phoneNumber", async (req, res) => {
    try {
      const { phoneNumber } = req.params;

      if (!twilioClient) {
        // MODO DEMO
        return res.json({
          messages: [
            {
              id: 'msg_1',
              body: `[MODO DEMO] Seu número é falso. Para receber SMS reais do Telegram ou WhatsApp, configure a chave da API Twilio (TWILIO_ACCOUNT_SID) no servidor. Código falso gerado: 12345`,
              from: 'Telegram (Falso)',
              dateCreated: new Date().toISOString()
            },
            {
              id: 'msg_2',
              body: `[MODO DEMO] Este não é um SMS real. Adicione saldo e chaves da API de telefonia para que funcione de verdade. Código de teste: 123456`,
              from: 'WhatsApp (Falso)',
              dateCreated: new Date(Date.now() - 60000).toISOString()
            }
          ]
        });
      }

      // INTEGRAÇÃO REAL COM TWILIO:
      // Busca as mensagens SMS recebidas para o número específico
      const messages = await twilioClient.messages.list({
        to: phoneNumber,
        limit: 20
      });

      const formattedMessages = messages.map(msg => ({
        id: msg.sid,
        body: msg.body,
        from: msg.from,
        dateCreated: msg.dateCreated
      }));

      res.json({ messages: formattedMessages });

    } catch (error) {
      console.error('Erro ao buscar mensagens:', error);
      res.status(500).json({ error: 'Erro ao conectar à caixa de entrada.' });
    }
  });


  // -------------------------------------------------------------
  // CONFIGURAÇÃO DO FRONTEND VITE
  // -------------------------------------------------------------
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
