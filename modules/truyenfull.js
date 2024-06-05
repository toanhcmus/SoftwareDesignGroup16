const request = require('request-promise');

const axios = require('axios');
const fs = require('fs');

const baseUrl = 'https://api.truyenfull.vn/v1/story/all';
const chapterDetailUrl = 'https://api.truyenfull.vn/v1/chapter/detail';
const storyUrl = 'https://api.truyenfull.vn/v1/story';
const type = 'story_update';

async function getName() {
    return 'truyenfull';
}

const searchUrl = `https://api.truyenfull.vn/v1/tim-kiem`;

async function crawlAllNovels(keyword) {

  const truyenList = [];

  try {
    let page = 1;
    let totalPages = 1;

    while (page <= totalPages) {
      const url = `${searchUrl}?title=${encodeURIComponent(keyword)}&page=${page}`;
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36'
        }
      });

      const data = response.data;

      data.data.forEach(item => {
        const data_push = {
          detailLink: item.id,
          title: item.title,
          cover: item.image,
          author: item.author,
          genres: item.categories,
          chapters: item.total_chapters
        };
        truyenList.push(data_push);
      });

      if (page === 1) {
        totalPages = data.meta.pagination.total_pages;
      }
      console.log(totalPages);

      page++;
    }

    // Lưu danh sách truyện vào file JSON
    // fs.writeFileSync('truyen_details.json', JSON.stringify(truyenList, null, 2));
    // console.log('Data đã được lưu vào truyen_list.json');
  } catch (error) {
    console.error('Lỗi:', error);
  }
  return truyenList;
}

// async function crawlAllNovels() {
//     try {
//         let page = 1;
//         let totalPages = 5;
//         const truyenList = [];
    
//         while (page <= totalPages) {
//           const url = `${baseUrl}?type=${type}&page=${page}`;
//           const response = await axios.get(url, {
//             headers: {
//               'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36'
//             }
//           });
//           const data = response.data;
//           const data_push  = {
//             detailLink: data.data.id,
//             title: data.data.title,
//             cover: data.data.image,
//             author: data.data.author,
//             genres: data.data.categories,
//             chapters: data.data.total_chapters
//           }
//           truyenList.push(...data_push);
    
//           // totalPages = data.meta.pagination.total_pages;
//           console.log(totalPages);
    
//           page++;
//         }
    
//         // Lưu danh sách truyện vào file JSON
//         // fs.writeFileSync('truyen_list.json', JSON.stringify(truyenList, null, 2));
//         // console.log('Data đã được lưu vào truyen_list.json');
//     } catch (error) {
//     console.error('Lỗi:', error);
//     }

//     console.log(truyenList);
//     return truyenList;
// }

function delay(time) {
    return new Promise(function(resolve) { 
        setTimeout(resolve, time);
    });
}

// lay danh sach chapter
async function getChapters(storyId) {
    try {
      let page = 1;
      let totalPages = 1;
      const chapterList = [];
  
      while (page <= totalPages) {
        const url = `${storyUrl}/detail/${storyId}/chapters?page=${page}`;
        const response = await axios.get(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36'
          }
        });
        const data = response.data;
        chapterList.push(...data.data);
  
        // totalPages should be updated based on the response metadata
        totalPages = data.meta.pagination.total_pages;
  
        page++;
      }

      const formatChaptersList = [];

      for (let i = 0; i < chapterList.length; i++) {
        console.log(i);
        if (i === 0) {
          const item = {
            id: chapterList[i].id,
            title: chapterList[i].title,
            previous: 0,
            next: chapterList[i+1].id
          }
          formatChaptersList.push(item);
        } else {
          if (i === chapterList.length - 1) {
            const item = {
              id: chapterList[i].id,
              title: chapterList[i].title,
              previous: chapterList[i-1].id,
              next: 0
            }
            formatChaptersList.push(item);
          } else {
            const item = {
              id: chapterList[i].id,
              title: chapterList[i].title,
              previous: chapterList[i-1].id,
              next: chapterList[i+1].id,
            }
            formatChaptersList.push(item);
          }
        }
      }
  
      return formatChaptersList;
    } catch (error) {
      console.error(`Lỗi khi lấy danh sách chương của truyện ${storyId}:`, error);
      return [];
    }
}

// lay content trong nay luon
async function getChapterDetails(chapterId) {
    try {
      const url = `${chapterDetailUrl}/${chapterId}`;
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36'
        }
      });
      return response.data.data;
    } catch (error) {
      console.error(`Lỗi khi lấy chi tiết chương ${chapterId}:`, error);
      return null;
    }
  }

module.exports = {
    getName,
    crawlAllNovels,
    getChapters,
    getChapterDetails,
};