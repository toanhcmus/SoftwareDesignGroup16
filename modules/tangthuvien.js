const axios = require('axios');
const cheerio = require('cheerio');
const puppeteer = require('puppeteer');

async function getName() {
    return 'tangthuvien';
}

async function crawlNovelsFromPage(url) {
    try {
        const response = await axios.get(url);
        const $ = cheerio.load(response.data);
        const novels = [];

        $('.book-img-text ul li').each((index, element) => {
            const title = $(element).find('h4 a').text().trim();
            const cover = $(element).find('img').attr('src');
            const author = $(element).find('.book-mid-info .author .name').text().trim();
            const genres = $(element).find('.book-mid-info .author a[href*="the-loai"]').map((i, el) => $(el).text().trim()).get();
            const chapters = $(element).find('.author span').last().text().trim();
            const detailLink = $(element).find('.book-right-info .blue-btn.add-book').attr('href');

            novels.push({
                title,
                cover,
                author,
                genres,
                chapters,
                detailLink: detailLink ? detailLink.trim() : ''
            });
        });

        return novels;
    } catch (error) {
        console.error('Error:', error);
        return [];
    }
}

async function crawlAllNovels() {
    try {
        const baseUrl = 'https://truyen.tangthuvien.vn/ket-qua-tim-kiem?page=';
        let currentPage = 1;
        let maxPage = 1;
        const allNovels = [];

        const firstPageResponse = await axios.get(baseUrl + currentPage);
        const $ = cheerio.load(firstPageResponse.data);

        $('.pagination a').each((index, element) => {
            const pageText = $(element).text().trim();
            if (!isNaN(pageText)) {
                const pageNumber = parseInt(pageText);
                if (pageNumber > maxPage) {
                    maxPage = pageNumber;
                }
            }
        });

        maxPage = 1;

        while (currentPage <= maxPage) {
            const pageNovels = await crawlNovelsFromPage(baseUrl + currentPage);
            allNovels.push(...pageNovels);
            console.log(allNovels.length);
            currentPage++;
        }

        return allNovels;
    } catch (error) {
        console.error('Error:', error);
        return [];
    }
}

function delay(time) {
    return new Promise(function(resolve) { 
        setTimeout(resolve, time);
    });
}

async function fetchChapterList(novelUrl) {
    try {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.goto(novelUrl);

        await page.evaluate(() => {
            document.querySelector('#j-bookCatalogPage').click();
        });
        await page.waitForSelector('#max-volume ul.cf li');

        const chapters = [];

        let previousChapterListHTML = '';

        while (true) {
            const currentChapterListHTML = await page.evaluate(() => document.querySelector('#max-volume ul.cf').innerHTML);

            if (currentChapterListHTML === previousChapterListHTML) {
                break;
            }

            const $ = cheerio.load(currentChapterListHTML);
            const currentChapters = $('li').toArray();
            currentChapters.forEach((element) => {
                const chapterLink = $(element).find('a').attr('href');
                const chapterTitle = $(element).find('a').text().trim();
                chapters.push({ title: chapterTitle, link: chapterLink });
            });

            console.log(chapters.length);

            try {
                const nextPageButton = await page.$('.pagination li:last-child a[aria-label="Next"]');
                if (nextPageButton) {
                    await nextPageButton.click();
                    await delay(1000);
                    await page.waitForSelector('#max-volume ul.cf li');
                } else {
                    break;
                }
            } catch (error) {
                console.error('Error clicking on next page button:', error);
                chapters.shift();
                return chapters;
            }

            previousChapterListHTML = currentChapterListHTML;
        }

        await browser.close();
        chapters.shift();
        return chapters;
    } catch (error) {
        console.error('Error fetching chapter list:', error);
        return [];
    }
}

async function crawlChapter(keyword, chapter) {
    try {
        const filteredNovels = listNovels.filter(novel => novel.title.toLowerCase().includes(keyword.toLowerCase()));

        if (filteredNovels.length === 0) {
            console.log('No novels found matching the keyword.');
            return;
        }

        const novel = filteredNovels[0];

        const chapterLink = `${novel.detailLink}/chuong-${chapter}`;

        const chapterResponse = await axios.get(chapterLink);
        if (chapterResponse.status !== 200) {
            console.error(`Failed to fetch chapter ${chapter} for ${novel.title}`);
            return;
        }

        const chapterHtml = chapterResponse.data;
        const chapter$ = cheerio.load(chapterHtml);

        const chapterContent = chapter$('.chapter-c-content');

        const firstBoxChapText = chapterContent.find('.box-chap').first().text().trim();
        
        console.log(`Chapter ${chapter} of "${novel.title}"`);
        console.log(firstBoxChapText);
    } catch (error) {
        console.error('Error:', error);
    }
}

module.exports = {
    getName,
    crawlAllNovels,
    fetchChapterList,
    crawlChapter,
};