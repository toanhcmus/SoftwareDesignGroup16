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

    if (modules['thichtruyen']) {
        const novels = await modules['thichtruyen'].crawlAllNovels('người');
        //console.log(novels);

        if (novels.length > 0) {
            const chapters = await modules['thichtruyen'].fetchChapterList(novels[1].detailLink);
            //console.log(chapters);
        }
    }
    else {
        console.error('thichtruyen module not loaded.');
    }
})();


const searchBook = async (keyword) => {
    if (keyword == '') {
        return [];
    }
    await reloadModules();
    let novels = []
    for (const moduleName in modules) {
        console.log('searchBook in homeController ');
        tempNovels = []
        await reloadModules();

        if (moduleName != 'truyenfull') {//tạm thời chưa xử lí truyện full crawl có keyword
            tempNovels = await modules[moduleName].crawlAllNovels(keyword);
            tempNovels.forEach(novel => {
                novel.origin = moduleName;
            });
        }
        else {
            console.log(`Module ${moduleName} (crawl with keyword) Error.`);
        }
        novels.push(...tempNovels)
    }

    return novels;
};
class HomeController {
    async renderHome(req, res, next) {
        const keywordSearch = req.query.keyword || '';
        let isSearched = true;
        if (keywordSearch === '') {
            //nếu vào trang chủ lần đầu.
            isSearched = false;
        }
        const novels = await searchBook(keywordSearch)
        res.render('home', { novels: novels, isSearched:isSearched });
        // res.render('chapterPage', {
        //     previousPage: `document.location='chapter=1'`,
        //     nextPage: `document.location='chapter=2'`,
        //     title: "Truyện của tôi", chapter: 1,
        //     content: "Một cơn gió ào qua. Gió làm cây run rẩy. Cây run rẩy không phải vì sợ đâu nhé! Chúng đang vui mừng đón nhận sự mát lành mà cơn mưa rào vừa đem tới đấy. Nếu lắng tai nghe, chắc chắn ta sẽ nghe được thanh âm vi vu, rì rào của vòm lá. Mấy chùm vải đu đưa theo gió. Hàng cau cao vút vẫn cứ sừng sững như những cột cờ, phấp phới từng tàu lá. Chùm khế được tắm mưa nên giờ vàng óng, gọi người tới hái. Dưới mặt đất có vô vàn chiếc lá vừa rơi gió trận mưa bất chợt ban nãy. Mấy chiếc lá khô khẽ bay xào xạc. Tôi chợt thấy một chú chim ướt lướt thướt. Chẳng biết chú làm gì mà không tìm chỗ trú mưa. Chú nhảy khắp nơi tìm mồi. Như đã bắt được chú sâu non. Chim vút bay lên cành xoài. Thì ra tổ của chú ở trên đó. Tôi nghe thấy mấy tiếng kêu chít chít nho nhỏ. Một đàn chim con đang vui mừng chờ mẹ về. Chắc hẳn, lúc nãy mưa lớn, chim mẹ đã xòe cánh bảo vệ đàn con nên mới bị ướt đến vậy. Dù ướt, nhưng khi nhìn đàn con mình líu lo, đôi mắt chim mẹ vẻ hạnh phúc lạ kì."
        // });
    }
}

module.exports = new HomeController;