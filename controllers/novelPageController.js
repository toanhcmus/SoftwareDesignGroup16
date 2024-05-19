const { forever } = require('request-promise');
const tangthuvien = require('../modules/thichtruyen.js');
const stringUtil = require('../utilities/stringUtil.js')

class NovelPageController {
    renderNovelPage(req, res) {
        const novel = req.params.name;

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
        });

        console.log('Rendering novel page!');
    }
};

module.exports = new NovelPageController