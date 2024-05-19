const { forever } = require('request-promise');
const tangthuvien = require('../modules/thichtruyen.js');
const stringUtil = require('../utils/stringUtil.js')

class NovelPageController {
    renderNovelPage(req, res) {
        const novel = req.params.name;

<<<<<<< HEAD
        console.log(req.params.name + " book accessed");

        tangthuvien.crawlAllNovels().then(
            results => {
                results.forEach(item => {
                    console.log(item + " Searched");

                    const itemName = stringUtil.reformatForUrlHandling(item.title);

                    if (novel.localeCompare(itemName) == 0) {
                    
                        const cover = item.cover;
                        const title = item.title;
                        console.log(item);
        
                        let chapColList = "";
        
                        tangthuvien.fetchChapterList(item.detailLink).then(
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
=======
        console.log(req.params.name);

        tangthuvien.crawlAllNovels().then(
            results => {
                const item = stringUtil.reformatForUrlHandling(results[0].title);

                if (novel == item) {
                    
                const cover = results[0].cover;
                const name = results[0].title;
                console.log(results[0]);

                let chapColList = "";

                tangthuvien.fetchChapterList(results[0].detailLink).then(
                    results => {
                        let count = 1;
                        results.forEach(element => {
                            chapColList += "<option> <a href=" + element + "> Chương " + count + "</a> </option>";
                            count++;
                        })

                        const renderItems = {
                            cover: cover, 
                            name: name,
                            author: results[0].chapters,
                            chapColOne: chapColList,
                        };
        
                        res.render('novelPage', renderItems);
                    }
                );
            }
>>>>>>> 55cd9bf (reformat name utils)
        });

        console.log('Rendering novel page!');
    }
};

<<<<<<< HEAD
module.exports = new NovelPageController
=======
module.exports = new NovelPageController
>>>>>>> 55cd9bf (reformat name utils)
