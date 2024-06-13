const fs = require('fs');
const path = require('path');
const modulesDir = path.join(__dirname, '..', 'exportModules');
let moduleExports = {};

let debounceTimeout;
const DEBOUNCE_DELAY = 500;

fs.watch(modulesDir, (eventType, filename) => {
    console.log("fwatch in exportModules");
    if (filename && filename.endsWith('.js')) {
        console.log(`Detected changes in ${filename}, scheduling reload...`);
        clearTimeout(debounceTimeout);
        debounceTimeout = setTimeout(async () => {
            moduleExports = {};
            await loadModuleExports();
        }, DEBOUNCE_DELAY);
    }
});

const countModuleExports = () => {
    return Object.keys(moduleExports).length;
};


const loadModuleExports = async () => {
    console.log("Load Module Exports in folder utilities")
    const files = await fs.promises.readdir(modulesDir);
    for (const file of files) {
        if (file.endsWith('.js')) {
            const modulePath = path.join(modulesDir, file);
            const moduleName = path.basename(file, '.js');
            delete require.cache[require.resolve(modulePath)];
            moduleExports[moduleName] = require(modulePath);
        }
    }
};

const getModuleExportsNames = async () => {
    let names = [];
    for (const moduleName in moduleExports) {
        if (moduleExports[moduleName].getNameFileExport) {
            const name = await moduleExports[moduleName].getNameFileExport();
            names.push(name);
        }
    }
    return names;
};
const getModuleExportByName = async (name) => {
    for (const moduleName in moduleExports) {
        if (moduleExports[moduleName].getNameFileExport) {
            const moduleNameValue = await moduleExports[moduleName].getNameFileExport();
            if (moduleNameValue === name) {
                return moduleExports[moduleName];
            }
        }
    }
    return null;
};

module.exports = {
    countModuleExports,
    loadModuleExports,
    getModuleExportsNames,
    getModuleExportByName
};