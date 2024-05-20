const { forever } = require('request-promise');
const thichtruyen = require('../modules/thichtruyen.js');
const stringUtil = require('../utilities/stringUtil.js')

class ChapterPageController {
    renderChapterPage(req, res) {
        const novel = req.params.name;

        const chapter = (~~req.params.chap) - 1;

        console.log(req.params.name + " Chapter " + chapter);

        thichtruyen.crawlAllNovels().then(
            results => {
                results.forEach(item => {
                    console.log(item + " Searched");

                    const itemName = stringUtil.reformatForUrlHandling(item.title);

                    if (novel.localeCompare(itemName) == 0) {
                    
                        const cover = item.cover;
                        const title = item.title;
                        console.log(item);    
                        
                        thichtruyen.fetchChapterList(item.detailLink).then(
                            result => {
                                console.log(result[chapter]);
                                thichtruyen.crawlChapter(result[chapter]).then(
                                    chap => {
                                        res.render('chapterPage', {chapter: chap});
                                    }
                                );
                            }
                        );
                    }
                });
        });

        console.log('Rendering novel page!');
    }
};

module.exports = new ChapterPageController