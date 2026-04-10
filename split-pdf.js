const fs = require("fs");
const path = require("path");
const { PDFDocument } = require("pdf-lib");

async function splitPdf(inputPath) {
  const resolvedInputPath = path.resolve(inputPath);

  if (!fs.existsSync(resolvedInputPath)) {
    throw new Error(`Input file not found: ${resolvedInputPath}`);
  }

  if (path.extname(resolvedInputPath).toLowerCase() !== ".pdf") {
    throw new Error("Input file must be a PDF.");
  }

  const inputBytes = fs.readFileSync(resolvedInputPath);
  const sourcePdf = await PDFDocument.load(inputBytes);
  const pageCount = sourcePdf.getPageCount();

  if (pageCount === 0) {
    throw new Error("The PDF has no pages.");
  }

  const outputDir = path.join(path.dirname(resolvedInputPath), "output");
  fs.mkdirSync(outputDir, { recursive: true });

  const baseName = path.basename(resolvedInputPath, ".pdf");

  for (let index = 0; index < pageCount; index += 1) {
    const newPdf = await PDFDocument.create();
    const [copiedPage] = await newPdf.copyPages(sourcePdf, [index]);
    newPdf.addPage(copiedPage);

    const outputBytes = await newPdf.save();
    const outputFileName = `${baseName}-page-${index + 1}.pdf`;
    const outputPath = path.join(outputDir, outputFileName);

    fs.writeFileSync(outputPath, outputBytes);
    console.log(`Created: ${outputPath}`);
  }
}

async function main() {
  const inputPaths = process.argv.slice(2);

  if (inputPaths.length === 0) {
    console.error("Usage: node split-pdf.js <input1.pdf> [input2.pdf ...]");
    process.exit(1);
  }

  try {
    for (const inputPath of inputPaths) {
      await splitPdf(inputPath);
    }
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
}

main();
