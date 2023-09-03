import { Router } from "express";
import { chromium } from "playwright";
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const router = Router();

router.post('/potvrda', async (req, res) => {
  try {
    let jsonData = req.body;

    const browser = await chromium.launch({
      args: [
        '--no-sandbox',
        '--headless',
        '--hide-scrollbars',
        '--printBackground=true',
        '--disable-dev-shm-usage',
        '--font-render-hinting=medium'
      ],
    });

    const page = await browser.newPage();

    //const htmlTemplate = await fs.readFile('index.html', 'utf8');
    const htmlTemplate = jsonData.html;

    // Function to replace placeholders with values
    function replacePlaceholders(template, data) {
        for (const key in data) {
            const placeholder = `$${key}`;
            const value = data[key];
            template = template.replace(placeholder, value);
        }
        return template;
    }

    // Replace placeholders in the HTML template with JSON values
    const htmlContent = replacePlaceholders(htmlTemplate, jsonData.data)

    await page.setContent(htmlContent);

    await page.addStyleTag({ content: '@page { margin: 0cm; }' });
    await page.addStyleTag({ path: 'css/katex.min.css' });
    await page.addStyleTag({ path: 'css/qcss.css' });
    await page.addStyleTag({ path: 'css/tailwind.css' });
    await page.addStyleTag({ content: '* {print-color-adjust: exact; -webkit-print-color-adjust: exact;}' });

    await page.evaluate(() => matchMedia('screen').matches);
    await page.emulateMedia({ media: 'screen' });

    const pdfBuffer = await page.pdf({ format: 'A4' });

    await browser.close();

    // Convert the PDF buffer to a base64-encoded string
    const pdfDataUri = `data:application/pdf;base64,${pdfBuffer.toString('base64')}`;

    // Set response headers for serving the PDF as an HTML page
    res.setHeader('Content-Type', 'text/html');

    // Determine the directory path of the current module using import.meta.url
    const currentModulePath = fileURLToPath(import.meta.url);
    const currentModuleDir = path.dirname(currentModulePath);

    // Serve an HTML page with a link to download the PDF
    const downloadPagePath = path.join(currentModuleDir, 'download.html');
    const downloadPageContent = await fs.readFile(downloadPagePath, 'utf8');

    // Replace the placeholder in the HTML with the PDF data URI
    const updatedDownloadPageContent = downloadPageContent.replace("REPLACE_WITH_BASE64_ENCODED_PDF_DATA", pdfBuffer.toString('base64'));
    res.send(pdfDataUri);

  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

export default router;
