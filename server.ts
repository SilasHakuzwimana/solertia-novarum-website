import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import type { Application, Request, Response } from "express";

// Import routes
import authRoutes from "./src/routes/auth.routes";
import partnershipRoutes from "./src/routes/partnership.routes";
import applicationRoutes from "./src/routes/application.routes";
import statsRoutes from "./src/routes/stats.routes";
import announcementRoutes from "./src/routes/announcement.routes";

// Import database service
import { initDatabase } from "./src/services/database.service";

dotenv.config();

const app: Application = express();
const PORT: number = 3004;

// Middleware
app.use(express.json());

// CORS for development
if (process.env.NODE_ENV === "development") {
  app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, DELETE, OPTIONS",
    );
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
    if (req.method === "OPTIONS") {
      return res.sendStatus(200);
    }
    next();
  });
}

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
  });
});

// API Routes - these must be defined BEFORE Vite middleware
app.use("/api/auth", authRoutes);
app.use("/api/partnerships", partnershipRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/stats", statsRoutes);
app.use("/api/announcements", announcementRoutes);

console.log("✅ Announcement routes registered:");
console.log("   - POST /api/announcements");
console.log("   - GET /api/announcements/active");
console.log("   - GET /api/announcements");
console.log("   - DELETE /api/announcements");

app._router.stack.forEach((layer: any) => {
  if (layer.route) {
    const methods = Object.keys(layer.route.methods).join(", ").toUpperCase();
    console.log(`${methods} ${layer.route.path}`);
  }
});

app.post("/api/announcements-test", (req, res) => {
  console.log("✅ Test route hit!");
  res.json({
    success: true,
    message: "Test route is working!",
    body: req.body,
  });
});

// Email report endpoint - must be defined BEFORE Vite middleware
app.post("/api/email/send-report", async (req: Request, res: Response) => {
  try {
    const { to, subject, message, reportData, format } = req.body;

    if (!to || !reportData) {
      return res.status(400).json({
        success: false,
        error: "Email recipient and report data are required",
      });
    }

    // Import email service
    const { default: EmailService } =
      await import("./src/services/email.service");

    // Generate the report based on format
    let reportContent: string | Buffer = "";
    let contentType = "";
    let filename = "";

    const reportOptions = {
      title: reportData.title || "Solvertia Novarum Report",
      filename:
        reportData.filename ||
        `report_${new Date().toISOString().split("T")[0]}`,
      columns: reportData.columns || [],
      data: reportData.data || [],
      dateRange: reportData.dateRange,
      includeMetadata: true,
    };

    // Helper function to format dates
    const formatDate = (date: string | Date): string => {
      if (!date) return "-";
      const d = new Date(date);
      return d.toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      });
    };

    // Helper function to format display dates
    const formatDisplayDate = (date: string | Date): string => {
      if (!date) return "";
      const d = new Date(date);
      return d.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    };

    // Helper function to get value from nested object
    const getNestedValue = (obj: any, path: string): any => {
      return path.split(".").reduce((current, key) => current?.[key], obj);
    };

    // Helper function to format cell value
    const formatCellValue = (value: any, col: string): string => {
      if (value === undefined || value === null) return "-";

      if (
        col === "created_at" ||
        col === "updated_at" ||
        col.includes("date")
      ) {
        return formatDate(value);
      }

      if (Array.isArray(value)) {
        return value.join(", ");
      }

      return String(value);
    };

    // Generate the report based on format
    switch (format?.toLowerCase()) {
      case "pdf": {
        const { jsPDF } = await import("jspdf");
        const { default: autoTable } = await import("jspdf-autotable");

        const doc = new jsPDF("landscape", "mm", "a4");
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();

        doc.setFontSize(20);
        doc.setTextColor(0, 122, 255);
        doc.text(reportOptions.title, pageWidth / 2, 20, { align: "center" });
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(
          `Generated: ${new Date().toLocaleString()}`,
          pageWidth / 2,
          28,
          { align: "center" },
        );

        if (reportOptions.dateRange) {
          const startFormatted = formatDisplayDate(
            reportOptions.dateRange.start,
          );
          const endFormatted = formatDisplayDate(reportOptions.dateRange.end);
          doc.text(
            `Period: ${startFormatted} to ${endFormatted}`,
            pageWidth / 2,
            34,
            { align: "center" },
          );
        }

        const tableData = reportOptions.data.map((item: any) =>
          reportOptions.columns.map((col: string) => {
            const value = getNestedValue(item, col);
            return formatCellValue(value, col);
          }),
        );

        autoTable(doc, {
          head: [
            reportOptions.columns.map((col: string) => {
              const name = col.split(".").pop() || col;
              return name.replace(/_/g, " ").toUpperCase();
            }),
          ],
          body: tableData,
          startY: 44,
          theme: "striped",
          headStyles: {
            fillColor: [0, 122, 255],
            textColor: [255, 255, 255],
            fontStyle: "bold",
            fontSize: 9,
          },
          bodyStyles: { fontSize: 8 },
          alternateRowStyles: { fillColor: [240, 248, 255] },
          margin: { top: 10, left: 14, right: 14 },
          didDrawPage: (data: any) => {
            const pageCount = doc.getNumberOfPages();
            const currentPage = doc.getCurrentPageInfo().pageNumber;
            doc.setFontSize(8);
            doc.setTextColor(150);
            doc.text(
              `Page ${currentPage} of ${pageCount}`,
              pageWidth / 2,
              pageHeight - 10,
              { align: "center" },
            );
            doc.text(
              `Confidential - Solvertia Novarum Ltd`,
              pageWidth - 20,
              pageHeight - 10,
              { align: "right" },
            );
          },
        });

        const pdfOutput = doc.output("arraybuffer");
        reportContent = Buffer.from(pdfOutput);
        contentType = "application/pdf";
        filename = `${reportOptions.filename}.pdf`;
        break;
      }

      case "excel": {
        const XLSX = await import("xlsx");
        const data = reportOptions.data.map((item: any) => {
          const row: any = {};
          reportOptions.columns.forEach((col: string) => {
            const value = getNestedValue(item, col);
            const colName = col.split(".").pop() || col;
            row[colName] = formatCellValue(value, col);
          });
          return row;
        });

        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(data);

        const colWidths: number[] = [];
        reportOptions.columns.forEach((col: string, index: number) => {
          const colName = col.split(".").pop() || col;
          const maxLength = Math.max(
            colName.length,
            ...data.map((row: any) => String(row[colName] || "-").length),
          );
          colWidths[index] = Math.min(Math.max(maxLength + 2, 15), 50);
        });
        ws["!cols"] = colWidths.map((w: number) => ({ wch: w }));

        XLSX.utils.book_append_sheet(wb, ws, reportOptions.title);
        const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });

        reportContent = Buffer.from(wbout);
        contentType =
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
        filename = `${reportOptions.filename}.xlsx`;
        break;
      }

      case "csv": {
        const headers = reportOptions.columns.map((col: string) => {
          const name = col.split(".").pop() || col;
          return name.replace(/_/g, " ").toUpperCase();
        });

        const rows = reportOptions.data.map((item: any) =>
          reportOptions.columns.map((col: string) => {
            const value = getNestedValue(item, col);
            return formatCellValue(value, col);
          }),
        );

        let csvContent = headers.join(",") + "\n";
        rows.forEach((row: any[]) => {
          const escapedRow = row.map((cell: string) => {
            if (
              typeof cell === "string" &&
              (cell.includes(",") || cell.includes('"') || cell.includes("\n"))
            ) {
              return `"${cell.replace(/"/g, '""')}"`;
            }
            return cell;
          });
          csvContent += escapedRow.join(",") + "\n";
        });

        reportContent = csvContent;
        contentType = "text/csv";
        filename = `${reportOptions.filename}.csv`;
        break;
      }

      case "word": {
        const wordColumns = reportOptions.columns.map((col: string) => {
          const name = col.split(".").pop() || col;
          return name.replace(/_/g, " ").toUpperCase();
        });

        const wordHtml = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="UTF-8">
            <title>${reportOptions.title}</title>
            <style>
              body { font-family: 'Times New Roman', Times, serif; margin: 40px; color: #333; }
              .header { text-align: center; border-bottom: 2px solid #007aff; padding-bottom: 20px; margin-bottom: 30px; }
              .header h1 { color: #007aff; font-size: 24px; margin: 0; }
              .header .subtitle { color: #666; font-size: 12px; margin-top: 5px; }
              table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 12px; }
              th { background-color: #007aff; color: white; padding: 10px; text-align: left; border: 1px solid #007aff; }
              td { padding: 8px 10px; border: 1px solid #ddd; }
              tr:nth-child(even) { background-color: #f8f9fa; }
              .footer { margin-top: 30px; text-align: center; font-size: 10px; color: #999; border-top: 1px solid #ddd; padding-top: 20px; }
              .metadata { font-size: 10px; color: #666; margin: 10px 0; text-align: center; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>${reportOptions.title}</h1>
              <div class="subtitle">Generated: ${new Date().toLocaleString()}</div>
              ${reportOptions.dateRange ? `<div class="subtitle">Period: ${formatDisplayDate(reportOptions.dateRange.start)} to ${formatDisplayDate(reportOptions.dateRange.end)}</div>` : ""}
              ${reportOptions.includeMetadata ? `<div class="metadata">Total Records: ${reportOptions.data.length} | Solvertia Novarum Ltd</div>` : ""}
            </div>
            <table>
              <thead>
                <tr>${wordColumns.map((col: string) => `<th>${col}</th>`).join("")}</tr>
              </thead>
              <tbody>
                ${reportOptions.data
                  .map(
                    (item: any) => `
                  <tr>
                    ${reportOptions.columns
                      .map((col: string) => {
                        const value = getNestedValue(item, col);
                        const displayValue = formatCellValue(value, col);
                        return `<td>${displayValue}</td>`;
                      })
                      .join("")}
                  </tr>
                `,
                  )
                  .join("")}
              </tbody>
            </table>
            <div class="footer">
              <p>Confidential - Solvertia Novarum Ltd</p>
              <p>Generated on ${new Date().toISOString()}</p>
            </div>
          </body>
          </html>
        `;

        reportContent = wordHtml;
        contentType = "application/msword";
        filename = `${reportOptions.filename}.doc`;
        break;
      }

      default:
        return res.status(400).json({
          success: false,
          error: "Unsupported format. Use pdf, excel, csv, or word.",
        });
    }

    // Send email with attachment
    const emailSent = await EmailService.sendReport(
      to,
      subject ||
        `📊 Solvertia Novarum Report - ${new Date().toISOString().split("T")[0]}`,
      message ||
        "Please find the attached report from the Solvertia Novarum Admin Dashboard.",
      [
        {
          filename: filename,
          content: reportContent,
          contentType: contentType,
        },
      ],
    );

    if (emailSent) {
      return res.json({
        success: true,
        message: `Report sent successfully to ${to}`,
      });
    } else {
      return res.status(500).json({
        success: false,
        error: "Failed to send email. Please check your email configuration.",
      });
    }
  } catch (error) {
    console.error("Failed to send report:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to send report: " + (error as Error).message,
    });
  }
});

// Email reply endpoint
app.post("/api/email/send-reply", async (req: Request, res: Response) => {
  try {
    const {
      to,
      subject,
      message,
      recipientName,
      recipientType,
      includeAttachments,
    } = req.body;

    if (!to || !subject || !message) {
      return res.status(400).json({
        success: false,
        error: "Email recipient, subject, and message are required",
      });
    }

    // Import email service
    const { default: EmailService } =
      await import("./src/services/email.service");

    // Generate HTML email
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; background: #f4f4f4; margin: 0; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); overflow: hidden; }
          .header { background: linear-gradient(135deg, #007aff 0%, #0d9488 100%); padding: 30px; text-align: center; }
          .header h1 { color: white; margin: 0; font-size: 24px; }
          .content { padding: 30px; }
          .message-box { background: #f8f9fa; padding: 20px; border-radius: 8px; border-left: 4px solid #007aff; margin: 20px 0; }
          .message-box p { margin: 0; color: #333; line-height: 1.6; white-space: pre-wrap; }
          .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #999; font-size: 12px; border-top: 1px solid #eee; }
          .badge { display: inline-block; background: #007aff; color: white; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: bold; }
          .divider { height: 1px; background: #eee; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📧 Solvertia Novarum</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 5px 0 0;">${recipientType === "partnership" ? "Partnership" : "Application"} Response</p>
          </div>
          <div class="content">
            <p style="font-size: 16px; color: #333; margin-bottom: 20px;">
              <strong>Dear ${recipientName},</strong>
            </p>
            <div class="message-box">
              <p>${message.replace(/\n/g, "<br>")}</p>
            </div>
            <div class="divider"></div>
            <p style="color: #666; font-size: 14px;">
              This message was sent from the Solvertia Novarum Admin Dashboard.
            </p>
            ${includeAttachments ? '<p style="color: #666; font-size: 14px;">📎 This email includes an attachment.</p>' : ""}
            <p style="color: #999; font-size: 12px; margin-top: 20px;">
              This is an automated response from the admin system. Please do not reply directly to this email.
            </p>
          </div>
          <div class="footer">
            <p>
              <span class="badge">SECURE</span>
              <span class="badge" style="background: #0d9488;">REPLY</span>
            </p>
            <p>© ${new Date().getFullYear()} Solvertia Novarum Ltd. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Send email
    const emailSent = await EmailService.sendReply(
      to,
      subject,
      htmlContent,
      includeAttachments,
    );

    if (emailSent) {
      return res.json({
        success: true,
        message: `Reply sent successfully to ${to}`,
      });
    } else {
      return res.status(500).json({
        success: false,
        error: "Failed to send email. Please check your email configuration.",
      });
    }
  } catch (error) {
    console.error("Failed to send reply:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to send reply: " + (error as Error).message,
    });
  }
});

// Setup Vite development middleware or static asset serving
async function startServer() {
  // Initialize Database in background
  initDatabase();

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Server] Active & running on http://localhost:${PORT}`);
    console.log(
      `[Admin] Dashboard available at http://localhost:${PORT}/admin`,
    );
  });
}

startServer();
