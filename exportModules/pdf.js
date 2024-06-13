const PDFDocument = require('pdfkit');
const path = require('path');
const cheerio = require('cheerio');
module.exports = {
  exportChapterNovel: async (res, dataNovel) => {
    const doc = new PDFDocument();

    res.setHeader('Content-disposition', 'attachment');
    res.setHeader('Content-type', 'application/pdf');

    doc.pipe(res);

    // Add định dạng để không bị lôi font
    const fontPath = path.join(__dirname, '..', 'public', 'fonts', 'DejaVuSans.ttf'); // Ensure the font file is in this path
    doc.registerFont('DejaVuSans', fontPath);

    // Add cái font vào
    doc.font('DejaVuSans');

    //Loại bỏ các thẻ br
    const $ = cheerio.load(dataNovel.content);
    $('br').replaceWith('\n');  
    dataNovel.content= $.text(); 

    // Add nội dung vào
    doc.text(dataNovel.title+ "\n"+ dataNovel.titleChapter + "\n" + dataNovel.content);

    doc.end();
  },
  getNameFileExport: async function getNameFileExport() {
    return 'pdf';
  }
}
