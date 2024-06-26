import fs from 'fs';

const getDependencies = () => {
    if (fs.existsSync('./package.json')) {
        return JSON.parse(fs.readFileSync('./package.json', 'utf8')).dependencies;
    }
    return null;
};

const getOnlyVideoPackageNames = () => {
    const dep = getDependencies();
    if (!dep) {
        return null;
    }
    const obj = {};
    Object.keys(dep).forEach(key => {
        if (key.includes('video')) {
            obj[key] = dep[key];
        }
    });
    return obj;
};

const getPackageLock = () => {
    if (fs.existsSync('./package-lock.json')) {
        return JSON.parse(fs.readFileSync('./package-lock.json', 'utf8')).packages;
    }
    return null;
};

const getVideoDependencyVersions = () => {
    const depNames = Object.keys(getOnlyVideoPackageNames());
    const dep = getPackageLock();
    if (!dep) {
        return null;
    }
    const obj = {};
    Object.keys(dep).forEach(key => {
        const packageName = key.replace(/node_modules\//, '');
        if (depNames.includes(packageName)) {
            obj[packageName] = dep[key].version;
        }
    });
    return obj;
};

export {
    getVideoDependencyVersions,
};
