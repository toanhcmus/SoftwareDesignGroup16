const { forever } = require('request-promise');
const thichtruyen = require('../modules/thichtruyen.js');
const stringUtil = require('../utilities/stringUtil.js')

class NovelPageController {
    renderNovelPage(req, res) {
        const novel = req.params.name;

        console.log(req.params.name + " book accessed");

        thichtruyen.crawlAllNovels().then(
            results => {
                results.forEach(item => {
                    console.log(item + " Searched");

                    const itemName = stringUtil.reformatForUrlHandling(item.title);

                    if (novel.localeCompare(itemName) == 0) {
                    
                        const cover = item.cover;
                        const title = item.title;
                        console.log(item);
        
                        let chapColList = "";
        
                        thichtruyen.fetchChapterList(item.detailLink).then(
                            results => {
                                let count = 1;
                                results.forEach(element => {
                                    chapColList += "<li> <a href=" + element + "> Chương " + count + "</a> </li>";
                                    count++;
                                })
        
                                const renderItems = {
                                    cover: cover, 
                                    title: title,
                                    author: item.chapters,
                                    chapterList: chapColList
                                };
                
                                res.render('novelPage', renderItems);                            
                            }
                        );
                    }
                });
        });

        console.log('Rendering novel page!');
    }
};

module.exports = new NovelPageController