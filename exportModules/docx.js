const { Document, Packer, Paragraph, TextRun } = require('docx');
module.exports = {
    exportChapterNovel: async (res, dataNovel) => {
        try {
            // thay <br> hoặc <br/> bằng \n
            const convertedContent = dataNovel.content.replace(/<br\s*\/?>/gi, '\n');

            // gộp nội dung lại
            const dataSendToClient = `${dataNovel.title}\n${dataNovel.titleChapter}\n${convertedContent}`;

            // Chia chuỗi thành các dòng và tạo các đoạn văn
            const paragraphs = dataSendToClient.split('\n').map(text => new Paragraph({
                children: [
                    new TextRun({ text, size: 36 }),
                ],
            }));

            // Tạo tài liệu DOCX
            const doc = new Document({
                sections: [
                    {
                        children: paragraphs,
                    },
                ],
            });

            // Tạo buffer từ tài liệu DOCX
            const buffer = await Packer.toBuffer(doc);

            // Đặt các header để tải xuống tệp DOCX
            res.setHeader('Content-Disposition', 'attachment;');
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');


            // Gửi buffer
            res.send(buffer);
        } catch (err) {
            console.error('Error creating DOCX file:', err);
            res.status(500).send('Error generating DOCX');
        }
    },
    getNameFileExport: async function getNameFileExport() {
        return 'docx';
    }
}
