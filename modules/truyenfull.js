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


async function crawlAllNovels() {
    try {
        let page = 1;
        let totalPages = 5;
        const truyenList = [];
    
        while (page <= totalPages) {
          const url = `${baseUrl}?type=${type}&page=${page}`;
          const response = await axios.get(url, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36'
            }
          });
          const data = response.data;
          const data_push  = {
            id: data.data.id,
            title: data.data.title,
            image: data.data.image,
            author: data.data.author,
            genres: data.data.categories,
            chapters: data.data.total_chapters
          }
          truyenList.push(...data_push);
    
          // totalPages = data.meta.pagination.total_pages;
          console.log(totalPages);
    
          page++;
        }
    
        // Lưu danh sách truyện vào file JSON
        // fs.writeFileSync('truyen_list.json', JSON.stringify(truyenList, null, 2));
        // console.log('Data đã được lưu vào truyen_list.json');
    } catch (error) {
    console.error('Lỗi:', error);
    }

    console.log(truyenList);
    return truyenList;
}

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
  
      return chapterList;
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
      return response.data;
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