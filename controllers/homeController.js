const path = require('path');
const fs = require('fs');
const { getModules, countModules, loadModules, printModuleNames, getModuleNames, reloadModules, getModuleByName } = require('../utilities/moduleLoader.js');

(async () => {
    await reloadModules();
    // if (modules['tangthuvien']) {
    //     const novels = await modules['tangthuvien'].crawlAllNovels('nhân sinh');
    //     //console.log(novels);
    //     //console.log('Number of novels: ', novels.length);

    //     if (novels.length > 0) {
    //         const chapters = await modules['tangthuvien'].fetchChapterList(novels[0].detailLink);
    //         //console.log(chapters);
    //         // const chapterContent = await modules['tangthuvien'].crawlChapter(chapters[0].link);
    //         // console.log('Chapter 1');
    //         // console.log(chapterContent);
    //     }
    // }
    // else {
    //     console.error('tangthuvien module not loaded.');
    // }

    // if (modules['thichtruyen']) {
    //     const novels = await modules['thichtruyen'].crawlAllNovels('người');
    //     console.log(novels);

    //     if (novels.length > 0) {
    //         const chapters = await modules['thichtruyen'].fetchChapterList(novels[1].detailLink);
    //         console.log(chapters);
    //     }
    // }
    // else {
    //     console.error('thichtruyen module not loaded.');
    // }
})();


const searchBook = async (keyword) => {
    const modules = getModules();
    if (keyword == '') {
        return [];
    }
    await reloadModules();
    let novels = []
    for (const moduleName in modules) {
        console.log('searchBook in homeController ');
        tempNovels = []
        await reloadModules();

        // if (moduleName!='truyenfull') {//tạm thời chưa xử lí truyện full crawl có keyword
        //     tempNovels = await modules[moduleName].crawlAllNovels(keyword);
        //     tempNovels.forEach(novel => {
        //         novel.origin = moduleName;
        //     });
        // }
        // else {
        //     console.log(`Module ${moduleName} (crawl with keyword) Error.`);
        // }

        tempNovels = await modules[moduleName].crawlAllNovels(keyword);
        tempNovels.forEach(novel => {
            novel.origin = moduleName;
        });

        novels.push(...tempNovels)
    }
    // console.log(novels[0]);
    // fs.writeFileSync('truyen_list.json', JSON.stringify(novels, null, 2));
    // console.log('Data đã được lưu vào truyen_list.json');
    return novels;
};
class HomeController {
    async renderHome(req, res, next) {
        if (req.query.mylist !== undefined) {
            myPriorityList = JSON.parse(req.query.mylist);
        }
        const modules = getModules();
        const moduleNames = await getModuleNames(modules);
        const keywordSearch = req.query.keyword || '';
        let isSearched = true;
        if (keywordSearch === '') {
            //nếu vào trang chủ lần đầu.
            isSearched = false;
        }
        const novels = await searchBook(keywordSearch)
        res.render('home', { novels: novels, srcList: moduleNames, isSearched: isSearched });
    }
}

module.exports = new HomeController;