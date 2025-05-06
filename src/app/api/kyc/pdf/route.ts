import { NextRequest, NextResponse } from "next/server";
import puppeteer from "puppeteer";
import { getCurrentUser } from "@/lib/current-user";
import fs from "fs";
import path from "path";
export async function POST(req: NextRequest) {
  try {
    const { type, data, certificateText } = await req.json();

    if (!type || !data) {
      return new NextResponse(
        JSON.stringify({ error: "Missing type or data" }),
        { status: 400 },
      );
    }

    // ✅ Fetch user from session
    const currentUser = await getCurrentUser();
    const userName = currentUser?.name || "Unknown User";

    const logoPath = path.resolve("public/images/logo/namcobank-logo.svg");
    const logoBuffer = fs.readFileSync(logoPath);
    const logoBase64 = `data:image/svg+xml;base64,${logoBuffer.toString("base64")}`;

    const htmlContent = generateHTML(type, data, userName, certificateText, logoBase64);

    const browser = await puppeteer.launch({
      headless: true,
      executablePath: "/usr/bin/chromium-browser",
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();
    // await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
    await page.setContent(htmlContent, { waitUntil: "domcontentloaded" });
    await page.emulateMediaType("screen");
    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
    });

    await browser.close();

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename=kyc_report_${type}.pdf`,
      },
    });
  } catch (error) {
    console.error("PDF generation error:", error);
    return new NextResponse("Failed to generate PDF", { status: 500 });
  }
}

function generateHTML(
  type: string,
  data: any,
  userName: string,
  certificateText: string,
  logoBase64: string
): string {
  const resultData = data?.data || data || {}; //  extract it safely
  const rows = Object.entries(resultData)
    .map(([key, value]) => {
      const formattedKey = key
        .replace(/_/g, " ")
        .replace(/\b\w/g, (l) => l.toUpperCase());

      let formattedValue;

      if (typeof value === "string" && value.startsWith("data:image")) {
        formattedValue = `<img src="${value}" alt="${formattedKey}" style="max-height: 120px; border-radius: 8px; border: 1px solid #ccc; padding: 4px;" />`;
      } else if (typeof value === "object") {
        formattedValue = `<pre>${JSON.stringify(value, null, 2)}</pre>`;
      } else {
        formattedValue = value || "N/A";
      }

      return `
        <tr>
          <td class="label">${formattedKey}</td>
          <td class="value">${formattedValue}</td>
        </tr>`;
    })
    .join("");

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>${type.toUpperCase()} Report</title>
    <style>
      * { box-sizing: border-box; }
      html, body {
        height: 100%;
        margin: 0;
        padding: 0;
      }
      body {
        display: flex;
        flex-direction: column;
        font-family: 'Segoe UI', sans-serif;
        background: #ffffff;
        color: #333;
		    padding: 40px;
      }
      .content {
        flex: 1 0 auto;
        
      }
      .container {
        margin: auto;
        padding: 0 30px 30px 30px;
        border-radius: 12px;
        min-height: 950px; /* Roughly A4 height minus margins */
        display: flex;
        flex-direction: column;
      }
      h1 { text-align: center; color: #2c3e50; font-size: 26px; border-bottom: 2px solid #eee; padding-bottom: 10px; }
      h3 { text-align: center; }
      table { width: 100%; border: 2px solid black; }
      td { padding: 12px 16px; vertical-align: top; font-size: 14px; }
      td.label {  font-weight: 600; width: 30%; color: #333; }
      tr:last-child td { border-bottom: none; }
      pre { background: #f0f4f8; padding: 10px; border-radius: 6px; font-size: 13px; margin: 0; white-space: pre-wrap; word-break: break-word; }
      img { max-width: 100%; border-radius: 6px; }
      .signature-section {
        margin-top: 50px;
        display: flex;
        justify-content: space-between;
      }
      .signature-block {
        width: 45%;
        text-align: center;
      }
      footer {
        flex-shrink: 0;
        margin-top: auto;
        background: transparent;
        padding: 20px;
        font-size: 14px;
        color: #000;
        border-top: 2px solid #eee;
      }
      .certificate-text {
        margin-top: 10px;
        padding: 20px;
        font-size: 16px;
        line-height: 1.6;
		    word-spacing:1px;
        font-weight: 500;
        margin-bottom:10px;
      }
     .bank-logo {
        display: block;
        margin: 0 auto 0 auto;
        max-width: 100px;
        height: auto;
      }

    </style>
  </head>
  <body>
    <div class="content">
      <div class="container">
      <img src="${logoBase64}" alt="Bank Logo" class="bank-logo" />
        <h1>The Nashik Merchants Co-operative Bank Ltd, Nashik</h1>
        <h3>${type.toUpperCase()} Verification Report</h3>
        ${
          certificateText
            ? `<div class="certificate-text">${certificateText}</div>` //  Insert this if available
            : ""
        }
        <table>
          ${rows}
        </table>

        <div class="signature-section">
          <div class="signature-block">
            <div style="font-weight: bold; margin-top: 50px;">(Signature of the Authorised Signatory)</div>
          </div>
          <div class="signature-block">
            <div style="font-weight: bold; margin-top: 50px;">(Signature of the Branch Manager)</div>
          </div>
        </div> 

        <div class="signature-section">
            <div class="signature-block">
                <div style="margin-top: 40px;">
                    Name: ________________________<br/><br/>
                    Designation: __________________
                  </div>
            </div>
            <div class="signature-block">
                <div style="margin-top: 45px;">
                    Name: ________________________<br/><br/>
                    Designation: __________________
                  </div>
            </div>
          </div>

      </div>
    </div>
  </body>
      <footer>
      Digitally Generated by <strong>${userName}</strong>
    </footer>
</html>`;
}
