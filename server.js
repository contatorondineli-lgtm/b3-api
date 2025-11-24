const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");
const cors = require("cors");

const app = express();
app.use(cors());

// Função que consulta dados da página da ADVFN
async function consultarOpcaoADVFN(ticker) {
    const url = `https://br.advfn.com/bolsa-de-valores/bovespa/${ticker}/opcoes`;

    try {
        const { data: html } = await axios.get(url, {
            headers: {
                "User-Agent": "Mozilla/5.0"
            }
        });

        const $ = cheerio.load(html);

        // A ADVFN usa tabelas, aqui extraímos as principais informações:
        const preco = $('td[title="Último Preço"]').first().text().trim() ||
                      $('td[data-col="Último"]').first().text().trim();

        const variacao = $('td[title="Variação"]').first().text().trim() ||
                         $('td[data-col="Var%"]').first().text().trim();

        const strike = $('td[title="Strike"]').first().text().trim();

        const vencimento = $('td[title="Vencimento"]').first().text().trim();

        // Tipo CALL/PUT baseado na letra
        const tipo = ticker.includes("A") ? "CALL" : "PUT";

        return {
            ticker,
            preco: preco || null,
            variacao: variacao || null,
            strike: strike || null,
            tipo,
            vencimento: vencimento || null
        };

    } catch (err) {
        return { erro: "Falha ao consultar ADVFN", detalhes: err.message };
    }
}

// Endpoint: /opcao?ticker=BOVAJ140W4
app.get("/opcao", async (req, res) => {
    const ticker = req.query.ticker;

    if (!ticker) {
        return res.status(400).json({ erro: "Você deve enviar ?ticker=BOVAXXXX" });
    }

    const dados = await consultarOpcaoADVFN(ticker.toUpperCase());
    res.json(dados);
});

// Inicia servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log("API rodando na porta " + PORT);
});
