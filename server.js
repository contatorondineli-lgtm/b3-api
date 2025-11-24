const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(cors());

// Endpoint principal: /quote?ticker=BBAS3
app.get("/quote", async (req, res) => {
  const ticker = req.query.ticker;

  if (!ticker) {
    return res.status(400).json({ error: "Você deve enviar ?ticker=BBAS3" });
  }

  try {
    const url = `https://statusinvest.com.br/category/indicatorhistoricallist?codes=${ticker}&time=1&categoryType=2`;

    const response = await axios.get(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    });

    res.json({
      ticker: ticker,
      price: response.data?.data[0]?.value ?? null,
      raw: response.data,
    });
  } catch (err) {
    res.status(500).json({
      error: "Erro ao buscar dados no StatusInvest",
      detail: err.message,
    });
  }
});

app.get("/", (req, res) => {
  res.json({
    status: "API da B3 rodando",
    exemplo: "/quote?ticker=PETR4",
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Servidor rodando na porta " + PORT));

