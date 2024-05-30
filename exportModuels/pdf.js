const PDFDocument = require('pdfkit');
const path = require('path');
module.exports = {
  exportChapterNovel: async (res, dataNovel) => {
    const doc = new PDFDocument();

    res.setHeader('Content-disposition', 'attachment');
    res.setHeader('Content-type', 'application/pdf');

    doc.pipe(res);

    // Add a custom font that supports UTF-8 characters
    const fontPath = path.join(__dirname, '..', 'public', 'fonts', 'DejaVuSans.ttf'); // Ensure the font file is in this path
    doc.registerFont('DejaVuSans', fontPath);

    // Use the custom font
    doc.font('DejaVuSans');

    // Add content to the PDF
    doc.text(dataNovel.title+ "\n"+ dataNovel.titleChapter + "\n" + dataNovel.content);

    doc.end();
  }
}
