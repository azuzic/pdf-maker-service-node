import { Router } from "express";
import puppeteer from "puppeteer";
import { promises as fs } from 'fs';

// /api/auth
const router = Router();

router.get('/generate-pdf', async (req, res) => {
  try {
    // Launch Puppeteer with custom flags
    const browser = await puppeteer.launch({
      args: [
        '--no-sandbox', // This flag is often required when running as a non-root user in certain environments
        '--disable-setuid-sandbox',
        '--font-render-hinting=none', // Set font render hinting to medium
      ],
    });

    const page = await browser.newPage();

    // Read the content of the 'index.html' file
    const htmlContent = await fs.readFile('index.html', 'utf8');

    // Set the content from the 'index.html' file
    await page.setContent(htmlContent);

    // Remove margins
    await page.addStyleTag({ content: '@page { margin: 0cm; }' });

    // Generate a PDF
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
