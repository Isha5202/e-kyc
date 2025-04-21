import { NextRequest, NextResponse } from 'next/server';
import puppeteer from 'puppeteer';
import { getCurrentUser } from '@/lib/current-user';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json(); // Expects { type, data }

    if (!body.type || !body.data) {
      return new NextResponse(
        JSON.stringify({ error: 'Missing type or data' }),
        { status: 400 }
      );
    }

    // ✅ Fetch user from session
    const currentUser = await getCurrentUser();
    const userName = currentUser?.name || 'Unknown User';

    const htmlContent = generateHTML(body.type, body.data, userName);

    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
    });

    await browser.close();

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename=kyc_report_${body.type}.pdf`,
      },
    });
  } catch (error) {
    console.error('PDF generation error:', error);
    return new NextResponse('Failed to generate PDF', { status: 500 });
  }
}

function generateHTML(type: string, data: any, userName: string): string {
  const resultData = data?.data || data || {};

  const rows = Object.entries(resultData)
    .map(([key, value]) => {
      const formattedKey = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

      let formattedValue;

      if (typeof value === 'string' && value.startsWith('data:image')) {
        formattedValue = `<img src="${value}" alt="${formattedKey}" style="max-height: 150px; border: 1px solid #ccc; padding: 4px;" />`;
      } else if (typeof value === 'object') {
        formattedValue = `<pre style="white-space: pre-wrap; background: #f0f0f0; padding: 5px; border-radius: 4px;">${JSON.stringify(value, null, 2)}</pre>`;
      } else {
        formattedValue = value || 'N/A';
      }

      return `<tr><td><strong>${formattedKey}</strong></td><td>${formattedValue}</td></tr>`;
    })
    .join('');

  return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>${type.toUpperCase()} Verification Report</title>
    <style>
      body {
        font-family: 'Arial', sans-serif;
        padding: 20px;
        color: #333;
        position: relative;
      }
      h1 {
        text-align: center;
        color: #2c3e50;
        font-size: 24px;
        margin-bottom: 20px;
      }
      table {
        width: 100%;
        border-collapse: collapse;
      }
      td {
        padding: 8px 12px;
        vertical-align: top;
        border-bottom: 1px solid #ddd;
      }
      tr:nth-child(even) {
        background-color: #f9f9f9;
      }
      pre {
        margin: 0;
        font-size: 13px;
      }
      .footer {
        position: fixed;
        bottom: 30px;
        width: 100%;
        font-size: 14px;
        color: #000;
      }
    </style>
  </head>
  <body>
    <h1>${type.toUpperCase()} Verification Report</h1>
    <table>
      ${rows}
    </table>
    <div class="footer">
      Digitally Generated • ${userName}
    </div>
  </body>
</html>`;
}
