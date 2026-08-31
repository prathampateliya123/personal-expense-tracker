/**
 * controllers/reportController.js
 * Export and summary endpoints for financial reports.
 * Generates Excel (.xlsx) and PDF downloads using exceljs and pdfkit.
 */

import ExcelJS from "exceljs";
import PDFDocument from "pdfkit";
import {
  fetchReportData,
  getMonthlySummary,
  formatReportDate,
} from "../utils/reportHelper.js";

/**
 * Generate an Excel workbook buffer from report data.
 */
const generateExcelBuffer = async (data) => {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Expense Tracker";
  workbook.created = new Date();

  // Summary sheet
  const summarySheet = workbook.addWorksheet("Summary");
  summarySheet.columns = [
    { header: "Metric", key: "metric", width: 25 },
    { header: "Value", key: "value", width: 20 },
  ];
  summarySheet.addRows([
    { metric: "Period Start", value: formatReportDate(data.startDate) },
    { metric: "Period End", value: formatReportDate(data.endDate) },
    { metric: "Total Income", value: data.totalIncome },
    { metric: "Total Expenses", value: data.totalExpense },
    { metric: "Balance", value: data.balance },
    { metric: "Expense Count", value: data.expenses.length },
    { metric: "Income Count", value: data.incomes.length },
  ]);
  summarySheet.getRow(1).font = { bold: true };

  // Expenses sheet
  const expenseSheet = workbook.addWorksheet("Expenses");
  expenseSheet.columns = [
    { header: "Date", key: "date", width: 14 },
    { header: "Title", key: "title", width: 25 },
    { header: "Category", key: "category", width: 15 },
    { header: "Payment Mode", key: "paymentMode", width: 14 },
    { header: "Amount", key: "amount", width: 12 },
    { header: "Description", key: "description", width: 30 },
  ];
  expenseSheet.getRow(1).font = { bold: true };
  data.expenses.forEach((exp) => {
    expenseSheet.addRow({
      date: formatReportDate(exp.date),
      title: exp.title,
      category: exp.category,
      paymentMode: exp.paymentMode,
      amount: exp.amount,
      description: exp.description || "",
    });
  });

  // Incomes sheet
  const incomeSheet = workbook.addWorksheet("Incomes");
  incomeSheet.columns = [
    { header: "Date", key: "date", width: 14 },
    { header: "Source", key: "source", width: 15 },
    { header: "Amount", key: "amount", width: 12 },
    { header: "Description", key: "description", width: 30 },
  ];
  incomeSheet.getRow(1).font = { bold: true };
  data.incomes.forEach((inc) => {
    incomeSheet.addRow({
      date: formatReportDate(inc.date),
      source: inc.source,
      amount: inc.amount,
      description: inc.description || "",
    });
  });

  return workbook.xlsx.writeBuffer();
};

/**
 * Generate a PDF buffer from report data.
 */
const generatePdfBuffer = (data) =>
  new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, size: "A4" });
    const chunks = [];

    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    // Title
    doc.fontSize(20).font("Helvetica-Bold").text("Financial Report", { align: "center" });
    doc.moveDown(0.5);
    doc
      .fontSize(11)
      .font("Helvetica")
      .text(
        `${formatReportDate(data.startDate)} — ${formatReportDate(data.endDate)}`,
        { align: "center" }
      );
    doc.moveDown(1.5);

    // Summary totals
    doc.fontSize(14).font("Helvetica-Bold").text("Summary");
    doc.moveDown(0.5);
    doc.fontSize(11).font("Helvetica");
    doc.text(`Total Income:    ₹${data.totalIncome.toFixed(2)}`);
    doc.text(`Total Expenses:  ₹${data.totalExpense.toFixed(2)}`);
    doc.text(`Balance:         ₹${data.balance.toFixed(2)}`);
    doc.moveDown(1.5);

    // Expenses table
    doc.fontSize(14).font("Helvetica-Bold").text("Expenses");
    doc.moveDown(0.5);
    doc.fontSize(9).font("Helvetica-Bold");
    doc.text("Date          Title                    Category        Amount");
    doc.font("Helvetica");
    doc.moveDown(0.3);

    data.expenses.forEach((exp) => {
      const line = `${formatReportDate(exp.date).padEnd(14)} ${exp.title.substring(0, 22).padEnd(24)} ${exp.category.padEnd(16)} ₹${exp.amount.toFixed(2)}`;
      doc.text(line);
    });

    if (data.expenses.length === 0) {
      doc.text("No expenses in this period.");
    }

    doc.moveDown(1.5);

    // Incomes table
    doc.fontSize(14).font("Helvetica-Bold").text("Income");
    doc.moveDown(0.5);
    doc.fontSize(9).font("Helvetica-Bold");
    doc.text("Date          Source          Amount");
    doc.font("Helvetica");
    doc.moveDown(0.3);

    data.incomes.forEach((inc) => {
      const line = `${formatReportDate(inc.date).padEnd(14)} ${inc.source.padEnd(16)} ₹${inc.amount.toFixed(2)}`;
      doc.text(line);
    });

    if (data.incomes.length === 0) {
      doc.text("No income in this period.");
    }

    doc.end();
  });

/**
 * @route   GET /api/reports/export/excel
 * @desc    Export expenses and incomes as Excel file
 * @access  Private
 */
export const exportExcel = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      res.status(400);
      throw new Error("Please provide startDate and endDate");
    }

    const data = await fetchReportData(req.user._id, startDate, endDate);
    const buffer = await generateExcelBuffer(data);

    const filename = `expense-report-${startDate}-to-${endDate}.xlsx`;
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.send(Buffer.from(buffer));
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/reports/export/pdf
 * @desc    Export expenses and incomes as PDF file
 * @access  Private
 */
export const exportPdf = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      res.status(400);
      throw new Error("Please provide startDate and endDate");
    }

    const data = await fetchReportData(req.user._id, startDate, endDate);
    const buffer = await generatePdfBuffer(data);

    const filename = `expense-report-${startDate}-to-${endDate}.pdf`;
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.send(buffer);
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/reports/monthly-summary
 * @desc    Get structured monthly summary for on-screen report view
 * @access  Private
 */
export const monthlySummary = async (req, res, next) => {
  try {
    const now = new Date();
    const month = parseInt(req.query.month, 10) || now.getMonth() + 1;
    const year = parseInt(req.query.year, 10) || now.getFullYear();

    const summary = await getMonthlySummary(req.user._id, month, year);

    res.status(200).json({
      success: true,
      summary,
    });
  } catch (error) {
    next(error);
  }
};
