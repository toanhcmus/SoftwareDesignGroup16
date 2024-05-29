const PDFDocument = require('pdfkit');
const path = require('path');
module.exports = {
  exportFile: (res, data) => {
    const doc = new PDFDocument();

    res.setHeader('Content-disposition', 'attachment; filename=output.pdf');
    res.setHeader('Content-type', 'application/pdf');

    doc.pipe(res);

    // Add a custom font that supports UTF-8 characters
    const fontPath = path.join(__dirname, '..', 'public', 'fonts', 'DejaVuSans.ttf'); // Ensure the font file is in this path
    doc.registerFont('DejaVuSans', fontPath);

    // Use the custom font
    doc.font('DejaVuSans');

    doc.text("Đây là nội dung file tải dề với duôi là epub nhưng chưa hoàn thành");

    doc.end();
  }
}
