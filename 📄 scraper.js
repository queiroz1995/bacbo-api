const puppeteer = require("puppeteer");
const fs = require("fs");
const { exec } = require("child_process");

const URL = "https://sortenabet.bet.br/br/historico/betou/bac-bo-ao-vivo";

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  await page.goto(URL, { waitUntil: "networkidle2" });
  await page.waitForTimeout(5000);

  const results = await page.evaluate(() => {
    const data = [];
    const items = document.querySelectorAll("div");

    items.forEach(el => {
      const t = el.innerText.toLowerCase();
      if (t.includes("player")) data.push("P");
      else if (t.includes("banker")) data.push("B");
      else if (t.includes("tie")) data.push("T");
    });

    return data.slice(0, 12);
  });

  const json = {
    updated: new Date().toISOString(),
    results
  };

  fs.writeFileSync("bacbo.json", JSON.stringify(json, null, 2));

  console.log("Atualizado:", json);

  exec("git add . && git commit -m \"update bacbo\" && git push", (err) => {
    if (err) console.log("Erro git:", err.message);
    else console.log("Enviado pro GitHub");
  });

  await browser.close();
})();

