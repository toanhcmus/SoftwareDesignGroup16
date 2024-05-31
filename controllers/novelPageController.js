const { forever } = require('request-promise');
const thichtruyen = require('../modules/tangthuvien.js');
const stringUtil = require('../utilities/stringUtil.js')

class NovelPageController {
    renderNovelPage(req, res) {
        const novel = req.params.name;
        const page = (~~req.params.page) - 1;
        const firstColumnItemSize = 10;
        const secondColumnItemSize = 10;

        console.log(req.params.name + " book accessed");
        res.cookie('novel',novel);
        res.cookie('page',page)
        res.cookie('chapter',0);
        console.log(" YESSSSSSSSSSSSSSS",req.cookies.novel);



        thichtruyen.crawlAllNovels("Tiên hiệp").then(
            results => {
                results.forEach(item => {
                    console.log(item + " Searched");

                    const itemName = stringUtil.reformatForUrlHandling(item.title);

                    if (novel.localeCompare(itemName) == 0) {
                    
                        const cover = item.cover;
                        const title = item.title;
                        console.log(item);
        
                        let chapColList1 = "";
                        let chapColList2 = "";
                        let pagignationSection = "";
        
                        thichtruyen.fetchChapterList(item.detailLink).then(
                            results => {
                                let count = 1;
                                let chapterNumber = results.length;
                                let totalItem = firstColumnItemSize + secondColumnItemSize;
                                let totalPage = (chapterNumber + totalItem - 1) / totalItem;

                                if (chapterNumber < page * 20) {
                                    return;
                                }

                                for (let chaptercount = 0; chaptercount < 10; chaptercount++) {
                                    let firstColChapterCount = (page * (totalItem) + chaptercount + 1);
                                    let secondColChapterCount = firstColChapterCount + secondColumnItemSize;

                                    if (firstColChapterCount <= chapterNumber)
                                        chapColList1 += "<li> <a href=chapter=" + firstColChapterCount + "> Chương " + firstColChapterCount + "</a> </li>";
                                    if (secondColChapterCount <= chapterNumber)
                                        chapColList2 += "<li> <a href=chapter=" + secondColChapterCount + "> Chương " + secondColChapterCount + "</a> </li>";
                                }

                                for (let pageCount = 1; pageCount <= totalPage; pageCount++) {
                                    pagignationSection += "<a href=page=" + pageCount + ">" + pageCount + "</a>";
                                }

        
                                const renderItems = {
                                    cover: cover, 
                                    title: title,
                                    author: item.chapters,
                                    chapterList1: chapColList1,
                                    chapterList2: chapColList2,
                                    pagination: pagignationSection
                                };
                                res.cookie('renderItems',renderItems);
                                res.render('novelPage', renderItems);                            
                            }
                        );
                    }
                });
        });

        console.log('Rendering novel page!');
    }
    saveStates (req,res,next){
        console.log('SAVESTATES');
        if (req.cookies.novel) {
            if (req.cookies.chapter==0)
                res.json({ redirect: `/novel/${req.cookies.novel}/page=1` });
            else 
                res.json({ redirect: `/novel/${req.cookies.novel}/chapter=${req.cookies.chapter}` });

        } else {
            res.json({ message: 'renderItems not found in cookies' });
        }
        
    }
};

module.exports = new NovelPageController