const { promisify } = require('util');
const { resolve } = require('path');
const fs = require('fs');
const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);
const readFile = promisify(fs.readFile);

const reMd = /\.md$/;

async function getFiles(dir) {
    const subdirs = await readdir(dir);
    const files = await Promise.all(subdirs.map(async (subdir) => {
        const res = resolve(dir, subdir);
        return (await stat(res)).isDirectory() ? getFiles(res) : res;
    }));
    return files.reduce((a, f) => a.concat(f), []);
}

async function getCards(file) {
    return await readFile(file, 'utf8');
}

function parseCards(text) {
    console.log("BURR", text);
}

const files = process.argv[2];
if (!files) {
    console.log('Pass the directory with markdown as parameter');
    process.exit(-1);
}

getFiles(files)
    .then(async (list) => {
        const mdList = list.filter(i => i && reMd.exec(i));
        console.log(mdList)
        const cards = await Promise.all(mdList.map(async (file) => {
            return parseCards(await getCards(file));
        }));
        console.log("S");
    })
    .catch(e => console.error(e));
