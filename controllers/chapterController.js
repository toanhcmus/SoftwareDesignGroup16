const { forever } = require('request-promise');
const path = require('path');
const fs=require('fs')
const thichtruyen = require('../modules/tangthuvien.js');
const stringUtil = require('../utilities/stringUtil.js');

const { countModuleExports, loadModuleExports } = require('../utilities/exportLoader.js');
const modulesDir = path.join(__dirname, '..', 'exportModuels');
let moduleExports = {};

let debounceTimeout;
const DEBOUNCE_DELAY = 500;

fs.watch(modulesDir, (eventType, filename) => {
    if (filename && filename.endsWith('.js')) {
        console.log(`Detected changes in ${filename}, scheduling reload...`);
        clearTimeout(debounceTimeout);
        debounceTimeout = setTimeout(async () => {
            await loadModuleExports(modulesDir, moduleExports);
        }, DEBOUNCE_DELAY);
    }
});



class ChapterPageController {
    renderChapterPage(req, res) {
        const novel = req.params.name;

        const chapter = (~~req.params.chap) - 1;

        //console.log(req.params.name + " Chapter " + chapter);

        thichtruyen.crawlAllNovels("Tiên hiệp").then(
            results => {
                results.forEach(item => {
                    //console.log(item + " Searched");

                    const itemName = stringUtil.reformatForUrlHandling(item.title);

                    if (novel.localeCompare(itemName) == 0) {

                        const cover = item.cover;
                        const title = item.title;
                        //console.log(item);    

                        thichtruyen.fetchChapterList(item.detailLink).then(
                            result => {
                                //console.log(result[chapter]);
                                thichtruyen.crawlChapter(result[chapter]).then(
                                    chap => {
                                        res.render('chapterPage', {
                                            previousPage: `document.location='chapter=${chapter}'`,
                                            nextPage: `document.location='chapter=${chapter + 2}'`,
                                            title: title, chapter: chapter + 1, content: chap
                                        });
                                    }
                                );
                            }
                        );
                    }
                });
            });

        //console.log('Rendering novel page!');
    }

    async sendFileExportToClient(req, res) {
        console.log('Reloading modules Exports...');
        moduleExports = {};
        await loadModuleExports(modulesDir, moduleExports);
        console.log(`Number of modules Exports: ${countModuleExports(moduleExports)}`);
        const dataReceive = req.body;
        await moduleExports[dataReceive.typeFile].exportChapterNovel(res,dataReceive);
    }
};

module.exports = new ChapterPageController