const { forever } = require('request-promise');
const Fuse = require('fuse.js');
const stringUtil = require('../utilities/stringUtil.js');
const { getModules, countModules, loadModules, printModuleNames, getModuleNames, reloadModules, getModuleByName } = require('../utilities/moduleLoader.js');

const fuseOptions = {
    keys: ['title'],
    threshold: 2,
};

class NovelPageController {
    // /:name/page=:page/src:=src
    async renderNovelPageSrc(req, res) {
        const modules = getModules();
        const novel = req.params.name;
        const page = (~~req.params.page) - 1;
        const src = req.params.src;
        const srcList = await getModuleNames(modules);

        const firstColumnItemSize = 10;
        const secondColumnItemSize = 10;

        console.log(req.params.name + " book accessed");
        let novels = req.cookies.history ? JSON.parse(req.cookies.history) : [];
        const novelExists = novels.some(n => n.novel === novel && n.src === src && n.chapter==0);
        
        res.cookie('novel',novel);
        res.cookie('page',page);
        res.cookie('src',src)
        res.cookie('chapter',0);
        console.log(" YESSSSSSSSSSSSSSS",req.cookies.novel);

        let module = await getModuleByName(modules, src);
        let moduleName = await module.getName();
        
        module.crawlAllNovels(novel).then(
            results => {
                let item = results.find(item => item.title.toLowerCase() === novel.toLowerCase());

                if (item == null) {
                    item = results.find(item => item.title.toLowerCase().includes(novel.toLowerCase()));
                }

                if (item == null) {
                    item = results.find(item => novel.toLowerCase().includes(item.title.toLowerCase()));
                }

                // kiểm tra có novel nào có tên gần giống không
                if (item == null) {
                    const fuse = new Fuse(results, fuseOptions);
                    const fuzzyResult = fuse.search(novel);
            
                    if (fuzzyResult.length > 0) {
                        item = fuzzyResult[0].item;
                    }
                }

                if (item == null) {
                    return res.render('notFound');   
                }

                console.log(item + " Searched");

                const itemName = item.title;
                console.log(`itemName: ${itemName}`);

                // if (novel.localeCompare(itemName) == 0) {

                    const cover = item.cover;
                    const title = item.title;
                    console.log(item);

                    let chapColList1 = "";
                    let chapColList2 = "";
                    let pagignationSection = "";

                    module.fetchChapterList(item.detailLink).then(
                        results => {
                            let count = 1;
                            let chapterNumber = results.length;
                            console.log(results);
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
                                author: item.author,
                                chapterList1: chapColList1,
                                chapterList2: chapColList2,
                                pagination: pagignationSection,
                                src: src,
                                srcList: srcList,
                                novel:novel,
                                category: item.genres
                            };
                            if (!novelExists) {
                                novels.push({ novel, page, src, chapter: 0 ,cover});
                            }
                            res.cookie('history', JSON.stringify(novels));
                            res.render('novelPage', renderItems);
                        }
                    );
                // }
            });

        console.log('Rendering novel page!');

    }

    saveStates (req,res, next){
        console.log('SAVESTATES',req.cookies);

        if (req.cookies.novel) {
            if (req.cookies.chapter==0)
                res.json({ redirect: `/name=${req.cookies.novel}/src=${req.cookies.src}/page=1` });
            else 
                res.json({ redirect: `/name=${req.cookies.novel}/src=${req.cookies.src}/chapter=${parseInt(req.cookies.chapter)+ 1}` });

        } else {
            res.json({ message: 'renderItems not found in cookies' });
        }
        
    }
};

module.exports = new NovelPageController