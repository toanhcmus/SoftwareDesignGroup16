
const cheerio = require('cheerio');

const request = require('request-promise');

async function getName() {
    return 'thichtruyen';
}


// async function crawlAllNovels() {
//     const novels = [];
//     var count = 0;

//     for (let num_page = 1; num_page <= 1; num_page++) {
//         try {
//             const url = `https://thichtruyen.vn/tim-kiem?page=${num_page}`;
//             const html = await makeRequest(url);
//             const $ = cheerio.load(html);

//             const promises = $('div.view-category-item').map(async (index, element) => {
//                 const title = $(element).find('a').attr('title');
//                 const detailLink = $(element).find('a').attr('href');
//                 const chapters = $(element).find('.view-category-item-infor p:last-child').text().trim();
//                 const author = $(element).find('.view-category-item-infor a:last-child').text().trim();
//                 const cover = `https://thichtruyen.vn/` + $(element).find('img').attr('src');

//                 const url1 = `https://thichtruyen.vn/` + detailLink;
//                 console.log(url1);

//                 try {
//                     const html1 = await makeRequest(url1);
//                     const detail$ = cheerio.load(html1);
//                     let genres = '';
//                     detail$('div.lst-tag').each((i, el) => {
//                         genres = detail$(el).find('a').text().trim();
//                     });
//                     novels.push({ title, detailLink, chapters, cover, author, genres });
//                 } catch (error) {
//                     console.error(`error:`, url1);
//                 }

//                 count++;
//             }).get();

//             await Promise.all(promises);

//         } catch (error) {
//             console.error(`Error processing page: ${num_page}`);
//         }

//     }

//     //  console.log(novels);
//     return novels;
// }

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
    var content = '';
    try {
        const url = `https://thichtruyen.vn/` + link;
        console.log(url)
        const html = await makeRequest(url);
        const $ = cheerio.load(html);
        content = $('div.story-detail-content').text().trim();

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

async function crawlAllNovels(keyword) {
    console.log(`Crawling thichtruyen... (keyword: ${keyword})`);
    const baseUrl = `https://thichtruyen.vn/tim-kiem?q=${encodeURIComponent(keyword)}&page=`;
    let currentPage = 1;
    const novels = [];
    console.log("Base=",baseUrl)
    const firstPageResponse = await makeRequest(baseUrl+currentPage);
    const $ = cheerio.load(firstPageResponse);
    const novelListContainer=$('#content-home')
    if (novelListContainer.find('.view-category-item').length===0){
        console.log("Không có truyện nào tìm thấy với keyword trên cả")
        return [];
    }

    const maxPage=novelListContainer.find('.jum-box').attr('data-lastpage') || 1;
    //console.log("Maxpage là",maxPage)
    for (let numPage = 1; numPage <= maxPage; numPage++) {
        try {
            const url = `https://thichtruyen.vn/tim-kiem?q=${encodeURIComponent(keyword)}&page=${numPage}`;
            const html = await makeRequest(url);
            const $ = cheerio.load(html);

            const promises = $('div.view-category-item').map(async (index, element) => {
                const title = $(element).find('a').attr('title');
                const detailLink = $(element).find('a').attr('href');
                const chapters = $(element).find('.view-category-item-infor p:last-child').text().trim();
                const author = $(element).find('.view-category-item-infor a:last-child').text().trim();
                const cover = `https://thichtruyen.vn/` + $(element).find('img').attr('src');

                const url1 = `https://thichtruyen.vn/` + detailLink;

                try {
                    const html1 = await makeRequest(url1);
                    const detail$ = cheerio.load(html1);
                    let genres = '';
                    detail$('div.lst-tag').each((i, el) => {
                        genres = detail$(el).find('a').text().trim();
                    });
                    novels.push({ title, detailLink, chapters, cover, author, genres });
                } catch (error) {
                    console.error(`error:`, url1);
                }
            }).get();

            await Promise.all(promises);

        } catch (error) {
            console.error(`Error processing page: ${num_page}`);
        }

    }

    console.log(novels);
    return novels;
}





module.exports = {
    getName,
    crawlAllNovels,
    fetchChapterList,
    crawlChapter,
};