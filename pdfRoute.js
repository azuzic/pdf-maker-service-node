import { Router } from "express";
import { chromium } from "playwright";
import { promises as fs } from 'fs';

// /api/auth
const router = Router();

router.get('/generate-pdf', async (req, res) => {
  try {
    // Launch Playwright Chromium browser
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

    // Read the content of the 'index.html' file
    const htmlContent = await fs.readFile('index.html', 'utf8');

    // Set the content from the 'index.html' file
    await page.setContent(htmlContent);

    // Remove margins
    await page.addStyleTag({ content: '@page { margin: 0cm; }' });
    await page.addStyleTag({ path: 'css/katex.min.css' });
    await page.addStyleTag({ path: 'css/qcss.css' });
    await page.addStyleTag({ path: 'css/tailwind.css' });
    await page.addStyleTag({content: '* {print-color-adjust: exact; -webkit-print-color-adjust: exact;}'})

    // Generate a PDF
    await page.evaluate(() => matchMedia('screen').matches);
    await page.emulateMedia({ media: 'screen' });

    const pdfBuffer = await page.pdf({ format: 'A4' });

    // Close the browser
    await browser.close();

    // Send the PDF as a downloadable file
    res.setHeader('Content-Disposition', 'attachment; filename=output.pdf');
    res.setHeader('Content-Type', 'application/pdf');
    res.send(pdfBuffer);
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

export default router;

