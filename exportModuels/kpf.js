const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');
const Epub = require('epub-gen');
module.exports = {
  exportChapterNovel: async (res, dataNovel) => {
    const epubPath = path.join(__dirname, 'output.epub');
    const kpfPath = path.join(__dirname, 'KPF', 'output.kpf');

    // Tạo file ePub từ nội dung
    const epubOptions = {
      title: dataNovel.title,
      content: [
        {
          title: dataNovel.titleChapter,
          data: dataNovel.content
        }
      ]
    };

    //Tạo file Epub tạm thời để chuyển sang kdf
    try {
      await new Epub(epubOptions, epubPath).promise;
      console.log('Tạo file ePub ở kpf thành công');
    } catch (err) {
      console.error('Lỗi tạo file ePub ở kpf.js:', err);
      res.status(500).send('Error while creating ePub');
      return;
    }


    // Chạy lệnh Kindle Previewer để chuyển đổi file ePub thành kpf
    exec(`kindlepreviewer "${epubPath}" -convert -output "${__dirname}"`, (error, stdout, stderr) => {
      if (error) {
        console.error(`Lỗi thực thi kindepreviewer: ${error.message}`);
        res.status(500).send('Error executing Kindle Previewer');
        return;
      }
      if (stderr) {
        console.error(`Kindle Previewer stderr: ${stderr}`);
      }
      // console.log(`Kindle Previewer stdout: ${stdout}`);
      console.log('kpf file created successfully!');

      // Gửi file PRC tới client
      res.setHeader('Content-disposition', 'attachment');
      res.setHeader('Content-type', 'application/x-mobipocket-ebook');
      // const fileStream = fs.createReadStream(prcPath);
      // fileStream.pipe(res);
      res.download(kpfPath, (err) => {
        if (err) {
          console.error('Error sending the file kpf:', err);
          res.status(500).send('Error generating kpf');
        }
        try {
          fs.rmSync(path.join(__dirname, 'KPF'), { recursive: true, force: true });
          fs.rmSync(path.join(__dirname, 'Logs'), { recursive: true, force: true });
          fs.unlinkSync(epubPath);
          fs.unlinkSync(path.join(__dirname, 'Summary_Log.csv'));
        } catch (err) {
          console.error(`Lỗi xóa thư mục`, err);
        }
      });

    });
  }
}
