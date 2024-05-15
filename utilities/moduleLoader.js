const fs = require('fs');
const path = require('path');

const countModules = (modules) => {
    return Object.keys(modules).length;
};


const loadModules = async (modulesDir, modules) => {
    const files = await fs.promises.readdir(modulesDir);

    for (const file of files) {
        if (file.endsWith('.js')) {
            const modulePath = path.join(modulesDir, file);
            const moduleName = path.basename(file, '.js');
            delete require.cache[require.resolve(modulePath)];
            modules[moduleName] = require(modulePath);
        }
    }
};

module.exports = {
    countModules,
    loadModules,
};