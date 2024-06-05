const { forever } = require('request-promise');
const thichtruyen = require('../modules/thichtruyen.js');
const tangthuvien = require('../modules/tangthuvien.js');
const truyenfull = require('../modules/truyenfull.js');
const stringUtil = require('../utilities/stringUtil.js');


class NovelPageController {
    // /:name/page=:page/src:=src
    renderNovelPageSrc(req, res) {
        const novel = req.params.name;
        const page = (~~req.params.page) - 1;
        const src = req.params.src;

        const firstColumnItemSize = 10;
        const secondColumnItemSize = 10;

        console.log(req.params.name + " book accessed");
        res.cookie('novel',novel);
        res.cookie('page',page);
        res.cookie('src',src)
        res.cookie('chapter',0);
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

                    const itemName = stringUtil.reformatForUrlHandling(item.title);
                    console.log(`itemName: ${itemName}`);
                    console.log(novel);

                    if (novel.localeCompare(itemName) == 0) {
                    
                        const cover = item.cover;
                        const title = item.title;
                        console.log(item.title);
        
                        let chapColList1 = "";
                        let chapColList2 = "";
                        let pagignationSection = "";

                        if (module == thichtruyen || module == tangthuvien) {
                            module.fetchChapterList(item.detailLink).then(
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
                                        if (pageCount == page + 1) {
                                            continue;
                                        }

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
                                    
                                    return;
                                }
                            );
                        } else {
                            module.getChapters(item.detailLink).then(
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
                                            chapColList1 += "<li> <a href=chapter=" + results[firstColChapterCount-1].id + "> Chương " + firstColChapterCount + "</a> </li>";
                                        if (secondColChapterCount <= chapterNumber)
                                            chapColList2 += "<li> <a href=chapter=" + results[secondColChapterCount-1].id + "> Chương " + secondColChapterCount + "</a> </li>";
                                    }
    
                                    for (let pageCount = 1; pageCount <= totalPage; pageCount++) {
                                        if (pageCount == page + 1) {
                                            continue;
                                        }

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
                                    
                                    return;
                                }
                            );
                        }
        
                        
                    }
                });
        });

        console.log('Rendering novel page!');

    }

    renderNovelPage(req, res) {
        const novel = req.params.name;
        const page = (~~req.params.page) - 1;
        const firstColumnItemSize = 10;
        const secondColumnItemSize = 10;

        console.log(req.params.name + " book accessed");
        res.cookie('novel',novel);
        res.cookie('page',page)
        res.cookie('src','')
        res.cookie('chapter',0);
        res.cookie('setting', {})
        console.log(" YESSSSSSSSSSSSSSS",req.cookies.novel);

        thichtruyen.crawlAllNovels("xin chào").then(
            results => {
                results.forEach(item => {
                    console.log(item + " Searched");

                    const itemName = stringUtil.reformatForUrlHandling(item.title);
                    console.log(itemName);

                    if (novel.localeCompare(itemName) == 0) {
                    
                        const cover = item.cover;
                        const title = item.title;
                        console.log(item);
        
                        let chapColList1 = "";
                        let chapColList2 = "";
                        let pagignationSection = "";
        
                        thichtruyen.fetchChapterList(item.detailLink).then(
                            results => { let count = 1;
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
                                    if (pageCount == page + 1) {
                                        continue;
                                    }

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
    saveStates (req,res, next){
        console.log('SAVESTATES',req.cookies);

        if (req.cookies.novel) {
            if (req.cookies.chapter==0)
                res.json({ redirect: `/novel/name=${req.cookies.novel}/src=${req.cookies.src}/page=1` });
            else 
                res.json({ redirect: `/novel/name=${req.cookies.novel}/src=${req.cookies.src}/chapter=${req.cookies.chapter}` });

        } else {
            res.json({ message: 'renderItems not found in cookies' });
        }
        
    }
};

module.exports = new NovelPageController