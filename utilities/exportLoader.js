const fs = require('fs');
const path = require('path');

const countModuleExports = (moduleExports) => {
    return Object.keys(moduleExports).length;
};


const loadModuleExports = async (moduleExportsDir, moduleExports) => {
    console.log("Load Module Exports in folder utilities")
    const files = await fs.promises.readdir(moduleExportsDir);

    for (const file of files) {
        if (file.endsWith('.js')) {
            const modulePath = path.join(moduleExportsDir, file);
            const moduleName = path.basename(file, '.js');
            delete require.cache[require.resolve(modulePath)];
            moduleExports[moduleName] = require(modulePath);
        }
    }
};

module.exports = {
    countModuleExports,
    loadModuleExports,
};