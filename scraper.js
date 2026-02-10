const fs = require("fs");
const https = require("https");

const API_URL = "https://raw.githubusercontent.com/queiroz1995/bacbo-api/main/bacbo.json";

function atualizar() {
  console.log("Buscando dados...");

  https.get(API_URL, res => {
    let data = "";

    res.on("data", chunk => data += chunk);
    res.on("end", () => {
      try {
        const json = JSON.parse(data);

        fs.writeFileSync("bacbo.json", JSON.stringify(json, null, 2));

        console.log("Atualizado com sucesso!");
      } catch (e) {
        console.log("Erro ao converter JSON:", e.message);
      }
    });
  }).on("error", err => {
    console.log("Erro na requisição:", err.message);
  });
}

atualizar();
