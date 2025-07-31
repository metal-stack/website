import puppeteer from 'puppeteer';

const fs = require("fs");

if (!fs.existsSync("pdf")) {
      fs.mkdirSync("pdf");
    }

(async () => {
    // Launch the browser and open a new blank page
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto('http://localhost:3033/docs/architecture', {
    waitUntil: 'networkidle2',
    });
    // Saves the PDF to hn.pdf.
    await page.pdf({
        path: 'pdf/architecture.pdf',
        format: 'A4',
        margin: {top: "20mm", left: "20mm", right: "20mm", bottom: "15mm"},
        displayHeaderFooter: false
    });

    await browser.close();
})();