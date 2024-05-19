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
    if (modules['tangthuvien']) {
        const novels = await modules['tangthuvien'].crawlAllNovels('nhân sinh');
        // console.log(novels);
        // console.log('Number of novels: ', novels.length);

        if (novels.length > 0) {
            const chapters = await modules['tangthuvien'].fetchChapterList(novels[0].detailLink);
            // console.log(chapters);
            const chapterContent = await modules['tangthuvien'].crawlChapter(chapters[0].detailLink);
            // console.log('Chapter 1');
            // console.log(chapterContent);
        }
    }
    else {
        console.error('tangthuvien module not loaded.');
    }
    
    // if (modules['thichtruyen']) {
    //     const novels = await modules['thichtruyen'].crawlAllNovels();
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

module.exports = {
    renderHome: async (req, res, next) => {
        res.render('home');
    }
}