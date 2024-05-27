
const cheerio = require('cheerio');
const request = require('request-promise');

async function getName() {
    return 'thichtruyen';
}

async function crawlAllNovels() {
    const novels = [];
    var count = 0;
    for (let num_page = 1; num_page <= 10; num_page++) {
        try {
            console.log(count);
            const url = `https://thichtruyen.vn/tim-kiem?page=${num_page}`;
            const html = await makeRequest(url);
            const $ = cheerio.load(html);
            $('div.view-category-item').each((index, element) => {
                const title = $(element).find('a').attr('title');
                const detailLink = $(element).find('a').attr('href');
                const chapters = $(element).find('.view-category-item-infor p:last-child').text().trim();
                const cover = `https://thichtruyen.vn/` + $(element).find('img').attr('src');
                novels.push({ title, detailLink: detailLink, chapters, cover: cover });
                count++;
            });
        } catch (error) {
            console.log(error);
        }
        console.log(count);
    }
    console.log(novels);
    return (novels)
}

function delay(time) {
    return new Promise(function(resolve) { 
        setTimeout(resolve, time);
    });
}

async function fetchChapterList(novelUrl) {
    const chapters = [];
    var count = 0;
    try {
        const url = `https://thichtruyen.vn/` + novelUrl;
        console.log(url)
        const html = await makeRequest(url);
        const $ = cheerio.load(html);
        $('div.tab-text ul li a').each((index, element) => {
            const chapterLink = $(element).attr('href');
            chapters.push(chapterLink);
            count++;

        });
    } catch (error) {
        console.log(error);
    }
    // so chap phai lay bang so cuoi cua chuoi
    console.log(count)
    console.log(chapters)
    return (chapters)
}

async function crawlChapter(link) {
    var content='';
    try {
        const url = `https://thichtruyen.vn/` + link;
        console.log(url)
        const html = await makeRequest(url);
        const $ = cheerio.load(html);
        content=$('div.story-detail-content').text().trim();
        
    } catch (error) {
        console.log(error);
    }
    console.log(content)
    return (content)
}
function makeRequest(url) {
    return new Promise((resolve, reject) => {
        request(url, (error, response, html) => {
            if (!error && response.statusCode == 200) {
                resolve(html);
            } else {
                reject(error);
            }
        });
    });
}
module.exports = {
    getName,
    crawlAllNovels,
    fetchChapterList,
    crawlChapter,
};