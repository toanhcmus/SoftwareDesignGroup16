const fs = require('fs');
const path = require('path');

const modulesDir = path.join(__dirname, '..', 'modules');
let modules = {};

let debounceTimeout;
const DEBOUNCE_DELAY = 500;

fs.watch(modulesDir, (eventType, filename) => {
    if (filename && filename.endsWith('.js')) {
        console.log(`Detected changes in ${filename}, scheduling reload...`);
        clearTimeout(debounceTimeout);
        debounceTimeout = setTimeout(async () => {
            modules = {};
            await loadModules(modulesDir, modules);
            await printModuleNames(modules);
        }, DEBOUNCE_DELAY);
    }
});

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

const getModuleNames = async (modules) => {
    let names = [];
    for (const moduleName in modules) {
        if (modules[moduleName].getName) {
            const name = await modules[moduleName].getName();
            names.push(name);
        }
    }
    return names;
};

const reloadModules = async () => {
    console.log('Reloading modules...');
    modules = {};
    await loadModules(modulesDir, modules);
    console.log(`Number of modules: ${countModules(modules)}`);
    await printModuleNames(modules);
};

const getModuleByName = async (modules, name) => {
    for (const moduleName in modules) {
        if (modules[moduleName].getName) {
            const moduleNameValue = await modules[moduleName].getName();
            if (moduleNameValue === name) {
                return modules[moduleName];
            }
        }
    }
    return null;
};

const getModules = () => modules;

module.exports = {
    getModules,
    countModules,
    loadModules,
    printModuleNames,
    getModuleNames,
    reloadModules,
    getModuleByName
};