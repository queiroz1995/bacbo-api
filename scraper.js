const puppeteer = require("puppeteer");
const fs = require("fs");
const { exec } = require("child_process");

const URL = "https://sortenabet.bet.br/br/historico/betou/bac-bo-ao-vivo";

// função de espera compatível
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

(async () => {
  console.log("Iniciando scraper...");

  const browser = await puppeteer.launch({
    headless: false,
    slowMo: 50
  });

  const page = await browser.newPage();

  console.log("Abrindo site...");
  await page.goto(URL, { waitUntil: "domcontentloaded" });
  console.log("Site aberto.");

  // espera carregar
  await sleep(8000);

  console.log("Lendo resultados...");

  const results = await page.evaluate(() => {
    const data = [];
    const elements = document.querySelectorAll("div");

    elements.forEach(el => {
      const t = el.innerText.toLowerCase();

      if (t.includes("player")) data.push("P");
      else if (t.includes("banker")) data.push("B");
      else if (t.includes("tie")) data.push("T");
    });

    return data.slice(0, 12);
  });

  console.log("Resultados encontrados:", results);

  const json = {
    updated: new Date().toISOString(),
    results: results
  };

  fs.writeFileSync("bacbo.json", JSON.stringify(json, null, 2));
  console.log("Arquivo bacbo.json atualizado.");

  exec("git add . && git commit -m \"update bacbo\" && git push", (err) => {
    if (err) {
      console.log("Erro ao enviar pro GitHub:", err.message);
    } else {
      console.log("Enviado pro GitHub com sucesso.");
    }
  });

  await sleep(5000);

  await browser.close();
  console.log("Finalizado.");
})();
