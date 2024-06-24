import ejs from 'ejs';
import fs from 'fs';
import md5 from 'md5';
import path from 'path';

const ignoreFiles = [
    'index.html',
    'asset-hashes.json',
    '.DS_Store',
];

const getMd5sForFilesInDir = (dirPath) => {
    const files = [];
    fs.readdirSync(dirPath, { recursive: true })
        .filter(file => {
            const filePath = path.join(dirPath, file);
            const isDir = fs.lstatSync(filePath).isDirectory();
            if (isDir) {
                const children = getMd5sForFilesInDir(filePath);
                const parentDirAdded = children.map(file => {
                    const parentDir = filePath.split('/').pop();
                    file.file = path.join(parentDir, file.file);
                    return file;
                });
                files.push(...parentDirAdded);
            }
            return !isDir && !ignoreFiles.includes(file);
        }).forEach(file => {
            const fullFilePath = path.join(dirPath, file);
            files.push({
                file,
                hash: md5(fs.readFileSync(fullFilePath)).substring(0, 7)
            });
        });
    return files.sort((a, b) => {
        return a.file > b.file ? 1 : -1;
    });
};

const convertToObject = (array) => {
    const obj = {};
    array.forEach(file => {
        obj[file.file] = file.hash;
    });
    return obj;
};

const writeAssetHashes = () => {
    const result = convertToObject( getMd5sForFilesInDir('public') );
    fs.writeFileSync('asset-hashes.json', JSON.stringify( result, null, 2 ));
};


const getFrontendAssetHashes = () => {
    return JSON.stringify(JSON.parse(fs.readFileSync('./asset-hashes.json').toString()));
};

const getAssetUrlWithHash = (path) => {
    const frontendAssetHashes = getFrontendAssetHashes();

    const sep = path.indexOf('?') === -1 ? '?' : '&';
    const hash = JSON.parse(frontendAssetHashes)[path];
    if (!hash) {
        return `./${path}`;
    }
    return `./${path}${sep}hash=${hash}`;
};

const generateIndexHtml = () => {
    const result = ejs.compile(fs.readFileSync('./src/index.ejs').toString())( {
        frontendAssetHashes: getFrontendAssetHashes(),
        getAssetUrlWithHash,
    });

    fs.writeFileSync('./public/index.html', result);
};

export {
    writeAssetHashes,
    generateIndexHtml,
};
