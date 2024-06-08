const { forever } = require('request-promise');
const Fuse = require('fuse.js');
const stringUtil = require('../utilities/stringUtil.js');
const { getModules, countModules, loadModules, printModuleNames, getModuleNames, reloadModules, getModuleByName } = require('../utilities/moduleLoader.js');
const path = require('path');
const fs = require('fs')

const { countModuleExports, loadModuleExports,getModuleExportsNames,getModuleExportByName } = require('../utilities/exportLoader.js');
(async () => {
    await loadModuleExports();
})();

const fuseOptions = {
    keys: ['title'],
    threshold: 2,
};

class ChapterPageController {
    async renderChapterPage(req, res) {
        const modules = getModules();
        const listFileExports= await getModuleExportsNames();
        const novel = req.params.name;
        console.log(novel);
        const src = req.params.src;
        const srcList = await getModuleNames(modules);

        let chapter = (~~req.params.chap) - 1;

        // if (src === "truyenfull") {
        //     chapter = (~~req.params.chap);
        // } else {
        //     chapter = (~~req.params.chap) - 1;
        // }



        console.log(req.params.name + " Chapter " + chapter);
        res.cookie('chapter', chapter)
        res.cookie('novel', novel);
        res.cookie('src', src)
        console.log(" YESSSSSSSSSSSSSSS", req.cookies.novel);

        let module = await getModuleByName(modules, src);
        let moduleName = await module.getName();

        // if (src == "tangthuvien") {
        //     module = tangthuvien;
        // }

        // if (src == "thichtruyen") {
        //     module = thichtruyen;
        // }

        // if (src == "truyenfull") {
        //     module = truyenfull;
        // }

        module.crawlAllNovels(novel).then(
            results => {
                let item = results.find(item => item.title === novel);

                // kiểm tra có novel nào có tên gần giống không
                if (item == null) {
                    const fuse = new Fuse(results, fuseOptions);
                    const fuzzyResult = fuse.search(novel);

                    if (fuzzyResult.length > 0) {
                        item = fuzzyResult[0].item;
                    }
                }

                // Không tìm thấy truyện ở server muốn chuyển đến
                if (item == null) {
                    return res.render('notFound');
                }

                console.log(item + " Searched");

                const itemName = item.title;

                // if (novel.localeCompare(itemName) == 0) {

                    const cover = item.cover;
                    const title = item.title;
                    // console.log(item);    
                    module.fetchChapterList(item.detailLink).then(
                        result => {
                            console.log(result[chapter]);
                            var chapterNumber = result.length;
                            var chapterList = "";

                            for (let chaptercount = 1; chaptercount <= chapterNumber; chaptercount++) {
                                chapterList += "<li> <a href=chapter=" + chaptercount + "> Chương " + chaptercount + "</a> </li>";
                            }

                            module.crawlChapter(result[chapter]).then(
                                chap => {
                                    // console.log(chap);
                                    res.render('chapterPage', {
                                        chapterList: chapterList,
                                        previousPage: `document.location='chapter=${chapter}'`,
                                        nextPage: `document.location='chapter=${chapter + 2}'`,
                                        title: title, chapter: chapter + 1, content: chap,
                                        fileExports: listFileExports,
                                        src: src,
                                        srcList: srcList
                                    });
                                }
                            );
                        }
                    );
                // }
            });

        console.log('Rendering novel page!');
    }

    //console.log('Rendering novel page!');

    async sendFileExportToClient(req, res) {
        console.log('Reloading modules Exports...');
        console.log(`Number of modules Exports: ${countModuleExports()}`);
        const names= await getModuleExportsNames();
        names.forEach((name)=>{
            console.log(`Modules exports là: ${name}`);
        })
        const dataReceive = req.body;
        const module=await getModuleExportByName(dataReceive.typeFile);
        module.exportChapterNovel(res, dataReceive);
    }
};

module.exports = new ChapterPageController