const path = require('path');
const fs = require('fs');
const { countModules, loadModules } = require('../utilities/moduleLoader.js');

const modulesDir = path.join(__dirname, '..', 'modules');
let modules = {};

let debounceTimeout;
const DEBOUNCE_DELAY = 500;

const printModuleNames = async (modules) => {
    for (const moduleName in modules) {
        if (modules[moduleName].getName) {
            const name = await modules[moduleName].getName();
            console.log(`Module Name: ${name}`);
        } else {
            console.log(`Module ${moduleName} does not have a getName function.`);
        }
    }
};

const reloadModules = async () => {
    console.log('Reloading modules...');
    modules = {};
    await loadModules(modulesDir, modules);
    console.log(`Number of modules: ${countModules(modules)}`);
    await printModuleNames(modules);
};

fs.watch(modulesDir, (eventType, filename) => {
    if (filename && filename.endsWith('.js')) {
        console.log(`Detected changes in ${filename}, scheduling reload...`);
        clearTimeout(debounceTimeout);
        debounceTimeout = setTimeout(async () => {
            await reloadModules();
        }, DEBOUNCE_DELAY);
    }
});

// (async () => {
//     await reloadModules();
//     // if (modules['tangthuvien']) {
//     //     const novels = await modules['tangthuvien'].crawlAllNovels('nhân sinh');
//     //     //console.log(novels);
//     //     //console.log('Number of novels: ', novels.length);

//     //     if (novels.length > 0) {
//     //         const chapters = await modules['tangthuvien'].fetchChapterList(novels[0].detailLink);
//     //         //console.log(chapters);
//     //         // const chapterContent = await modules['tangthuvien'].crawlChapter(chapters[0].link);
//     //         // console.log('Chapter 1');
//     //         // console.log(chapterContent);
//     //     }
//     // }
//     // else {
//     //     console.error('tangthuvien module not loaded.');
//     // }

//     if (modules['thichtruyen']) {
//         const novels = await modules['thichtruyen'].crawlAllNovels('người');
//         console.log(novels);

//         if (novels.length > 0) {
//             const chapters = await modules['thichtruyen'].fetchChapterList(novels[1].detailLink);
//             console.log(chapters);
//         }
//     }
//     else {
//         console.error('thichtruyen module not loaded.');
//     }
// })();


const searchBook = async (keyword) => {
    if (keyword==''){
        return [];
    }
    await reloadModules();
    let novels = []
    for (const moduleName in modules) {
        console.log('searchBook in homeController ');
        tempNovels=[]
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
    fs.writeFileSync('truyen_list.json', JSON.stringify(novels, null, 2));
    console.log('Data đã được lưu vào truyen_list.json');
    return novels;
};
class HomeController {
    async renderHome(req, res, next) {
        
        const keywordSearch = req.query.keyword || '';
        let isSearched=true;
        if(keywordSearch===''){
            //nếu vào trang chủ lần đầu.
            isSearched=false;
        }
        const novels = await searchBook(keywordSearch)
        res.render('home', { novels: novels, isSearched:isSearched });
    }
}

module.exports = new HomeController;