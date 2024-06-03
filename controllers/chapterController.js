const { forever } = require('request-promise');
const thichtruyen = require('../modules/tangthuvien.js');
const stringUtil = require('../utilities/stringUtil.js')

class ChapterPageController {
    renderChapterPage(req, res) {
        const novel = req.params.name;
        const keyword = req.params.keyword.replace('-', ' ');

        const chapter = (~~req.params.chap) - 1;

        if (chapter < 1) {
            res.render('notFound');

            return;
        }

        console.log(req.params.name + " Chapter " + chapter);

        thichtruyen.crawlAllNovels(keyword).then(
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
                                if (result.length < chapter + 1) {
                                    res.render('notFound');
                            
                                    return;
                                } 

                                console.log(result[chapter]);
                                thichtruyen.crawlChapter(result[chapter]).then(
                                    chap => {
                                        res.render('chapterPage', {
                                            novelPage: "document.location='page=1'",
                                            previousPage: `document.location='chapter=${chapter}'`,
                                            nextPage: `document.location='chapter=${chapter + 2}'`,
                                            title: title, chapter: chapter + 1, content: chap});

                                        return;
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