const { forever } = require('request-promise');
const thichtruyen = require('../modules/thichtruyen.js');
const tangthuvien = require('../modules/tangthuvien.js');
const truyenfull = require('../modules/truyenfull.js');
const stringUtil = require('../utilities/stringUtil.js');

class ChapterPageController {
    renderChapterPage(req, res) {
        const novel = req.params.name;
        console.log(novel);
        const src = req.params.src;

        let chapter = 0;

        if (src === "truyenfull" ) {
            chapter = (~~req.params.chap);
        } else {
            chapter = (~~req.params.chap) - 1;
        }
        

        console.log(req.params.name + " Chapter " + chapter);
        res.cookie('chapter',chapter)
        res.cookie('novel',novel);
        res.cookie('src',src)
        console.log(" YESSSSSSSSSSSSSSS",req.cookies.novel);

        let module = tangthuvien;

        if (src == "tangthuvien") {
            module = tangthuvien;
        }

        if (src == "thichtruyen") {
            module = thichtruyen;
        }

        if (src == "truyenfull") {
            module = truyenfull;
        }

        module.crawlAllNovels(novel).then(
            results => {
                results.forEach(item => {
                    console.log(item + " Searched");

                    const itemName = item.title;

                    if (novel.localeCompare(itemName) == 0) {
                    
                        const cover = item.cover;
                        const title = item.title;
                        // console.log(item);    
                        
                        if (module == thichtruyen || module == tangthuvien) {
                            module.fetchChapterList(item.detailLink).then(
                                result => {
                                    console.log(result[chapter]);
                                    module.crawlChapter(result[chapter]).then(
                                        chap => {
                                            res.render('chapterPage', {
                                                previousPage: `document.location='chapter=${chapter}'`,
                                                nextPage: `document.location='chapter=${chapter + 2}'`,
                                                title: title, chapter: chapter + 1, content: chap});
                                        }
                                    );
                                }
                            );
                        } else {
                            module.getChapterDetails(chapter).then(
                                result => {
                                    console.log(result);
                                    let content = result.content;

                                    res.render('chapterPage', {
                                        previousPage: `document.location='chapter=${result.chapter_prev}'`,
                                        nextPage: `document.location='chapter=${result.chapter_next}'`,
                                        title: title, chapter: result.position, content: content});
                                    }
                            );
                        }
                        
                    }
                });
        });

        console.log('Rendering novel page!');
    }
};

module.exports = new ChapterPageController