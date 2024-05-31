const path = require('path');
const fs = require('fs');
const Epub = require('epub-gen');
module.exports = {
  exportChapterNovel: async (res, dataNovel) => {
    const myContent = dataNovel.content;

    const options = {
      title: `${dataNovel.title}`,
      author: "Author Name",
      content: [
        {
          title: `${dataNovel.titleChapter}`,
          data: myContent
        }
        // ,{
        //   title: "Chương 2",
        //   data: myContent
        // }
      ]
    };

    const outputPath = path.join(__dirname, 'temporaryNovel.epub');

    try {
      await new Epub(options, outputPath).promise;
      console.log("-----------abc")
      // Set header cho response
      res.setHeader('Content-disposition', 'attachment');
      res.setHeader('Content-type', 'application/epub+zip');

      // Send the EPUB file to the client
      // res.download(outputPath, 'temporaryNovel.epub', (err) => {
      //   if (err) {
      //     console.error('Error sending the EPUB file:', err);
      //     res.status(500).send('Error generating EPUB');
      //   }

      //   // Delete the EPUB file after sending
      //   fs.unlinkSync(outputPath);
      // });
      res.download(outputPath, (err) => {
        if (err) {
          console.error('Error sending the EPUB file:', err);
          res.status(500).send('Error generating EPUB');
        }

        // Xóa file epub tạm thời tạo ra
        fs.unlinkSync(outputPath);
      });
    } catch (error) {
      console.error('Error generating the EPUB:', error);
      res.status(500).send('Error generating EPUB');
    }

  }
}
