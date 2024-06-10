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
            const des = $(element).find('.intro').text().trim();
            const detailLink = $(element).find('.book-right-info .blue-btn.add-book').attr('href');

            novels.push({
                title,
                cover,
                author,
                genres,
                chapters,
                des,
                detailLink: detailLink ? detailLink.trim() : ''
            });
        });

        return novels;
    } catch (error) {
        console.error('Error:', error);
        return [];
    }
}

async function crawlAllNovels(keyword) {
    try {
        console.log(`Crawling tangthuvien... (keyword: ${keyword})`);
        const baseUrl = `https://truyen.tangthuvien.vn/ket-qua-tim-kiem?term=${encodeURIComponent(keyword)}&page=`;
        let currentPage = 1;
        let maxPage = 1;
        const allNovels = [];

        const firstPageResponse = await axios.get(baseUrl + currentPage);
        const $ = cheerio.load(firstPageResponse.data);

        const novelListContainer = $('.book-img-text ul');
        if (novelListContainer.find('li').length === 1 && novelListContainer.find('li p').text().trim() === 'Không tìm thấy truyện nào theo yêu cầu') {
            return await fetchNovelsByAuthor(keyword);
        }

        $('.pagination a').each((index, element) => {
            const pageText = $(element).text().trim();
            if (!isNaN(pageText)) {
                const pageNumber = parseInt(pageText);
                if (pageNumber > maxPage) {
                    maxPage = pageNumber;
                }
            }
        });

        while (currentPage <= maxPage) {
            const pageNovels = await crawlNovelsFromPage(baseUrl + currentPage);
            allNovels.push(...pageNovels);
            currentPage++;
        }

        const extraNovels = await fetchNovelsByAuthor(keyword);
        allNovels.push(...extraNovels);

        const resultNovels = allNovels.filter((novel, index, self) => index === self.findIndex((t) => (
                t.title === novel.title && t.author === novel.author
            ))
        );

        return resultNovels;
    } catch (error) {
        console.error('Error:', error);
        return [];
    }
}

async function fetchNovelsByAuthor(keyword) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    try {
        const searchUrl = `https://truyen.tangthuvien.vn/`;
        await page.goto(searchUrl);

        await page.type('#inset-autocomplete-input', keyword);

        await page.waitForSelector('.ui-autocomplete', { visible: true });

        const results = await page.evaluate(() => {
            const items = [];
            document.querySelectorAll('.ui-autocomplete.ui-front.ui-menu.ui-widget.ui-widget-content.ui-corner-all li.ui-menu-item a').forEach(el => {
                items.push({
                    text: el.innerText.trim(),
                    href: el.href
                });
            });
            return items;
        });

        const keywordLowerCase = keyword.toLowerCase();

        let matchingName = results.find(item => item.text.toLowerCase() === keywordLowerCase);

        if (matchingName == null) {
            matchingName = results.find(item => item.text.toLowerCase().includes(keywordLowerCase));
        }

        if (matchingName) {
            const linkUrl = matchingName.href;
            const extraNovels = [];

            await page.goto(linkUrl);

            let currentPage = 1;
            let maxPage = 1;

            const hasPagination = await page.evaluate(() => {
                return document.querySelector('.pagination') !== null;
            });

            if (hasPagination) {
                maxPage = await page.evaluate(() => {
                    let maxPage = 1;
                    document.querySelectorAll('.pagination a').forEach(el => {
                        const pageText = el.innerText.trim();
                        if (!isNaN(pageText)) {
                            const pageNumber = parseInt(pageText);
                            if (pageNumber > maxPage) {
                                maxPage = pageNumber;
                            }
                        }
                    });
                    return maxPage;
                });
            }

            while (currentPage <= maxPage) {
                const pageUrl = `${linkUrl}?page=${currentPage}`;
                const pageNovels = await crawlNovelsFromPage(pageUrl);
                extraNovels.push(...pageNovels);
                currentPage++;
            }

            await browser.close();
            return extraNovels;
        } else {
            await browser.close();
            return [];
        }
    } catch (error) {
        console.error('Error:', error);
        await browser.close();
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
        // let currentpage = 1;
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
            await delay(20);
            const currentChapterListHTML = await page.evaluate(() => document.querySelector('#max-volume ul.cf').innerHTML);

            if (currentChapterListHTML === previousChapterListHTML) {
                continue;
            }

            // console.log('page = ', currentpage);
            // currentpage++;

            const $ = cheerio.load(currentChapterListHTML);
            const currentChapters = $('li').toArray();
            currentChapters.forEach((element) => {
                const chapterLink = $(element).find('a').attr('href');
                chapters.push(chapterLink);
            });

            console.log(chapters.length);

            previousChapterListHTML = currentChapterListHTML;

            try {
                const nextPageButton = await page.$('.pagination a[aria-label="Next"], .pagination a[title="Trang sau"]');
                if (nextPageButton) {
                    await nextPageButton.click();
                    await page.waitForSelector('#max-volume ul.cf li');
                } else {
                    await browser.close();
                    chapters.shift();
                    return chapters;
                }
            } catch (error) {
                console.error('Error clicking on next page button:', error);
                await browser.close();
                chapters.shift();
                return chapters;
            }
        }
    } catch (error) {
        console.error('Error fetching chapter list:', error);
        return [];
    }
}

async function crawlChapter(chapterLink) {
    try {
        const chapterResponse = await axios.get(chapterLink);
        if (chapterResponse.status !== 200) {
            console.error(`Failed to fetch chapter`);
            return;
        }

        const chapterHtml = chapterResponse.data;
        const chapter$ = cheerio.load(chapterHtml);

        const chapterContent = chapter$('.chapter-c-content');

        const firstBoxChapText = chapterContent.find('.box-chap').first().text().trim();
        
        return firstBoxChapText;
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