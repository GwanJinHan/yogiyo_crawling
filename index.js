const axios = require("axios");
const { ProxyAgent } = require("proxy-agent");
const puppeteer = require("puppeteer");
const cheerio = require("cheerio");
const targetURL = "https://www.example.com"; // 크롤링할 대상 URL
/*
const proxyList = [
  'http://proxy1.example.com:8080',
  'http://proxy2.example.com:8080',
  // 추가 프록시 서버 주소...
];

async function fetchDataWithProxy(proxyURL) {
  try {
    const agent = new ProxyAgent(proxyURL);
    const response = await axios.get(targetURL, { httpsAgent: agent });

    // 여기서 데이터 크롤링을 수행하거나 원하는 작업을 수행합니다.
    // response.data를 사용하여 웹 페이지의 데이터를 추출합니다.

    console.log('크롤링 완료:', targetURL);
  } catch (error) {
    console.error('크롤링 실패:', targetURL, error);
  }
}

async function runCrawler() {
  const promises = proxyList.map(fetchDataWithProxy);
  await Promise.all(promises);

  console.log('모든 크롤링 작업 완료');
}

runCrawler();
*/

const [latitude, longitude] = [37.60128, 127.0644736];

const CrawlYogiyo = async () => {
  const browser = await puppeteer.launch({ headless: false }); //headless : "new" 로 나중에 바꿔주자
  const page = await browser.newPage();
  // grant permission
  const context = browser.defaultBrowserContext();
  await context.overridePermissions("https://www.yogiyo.co.kr/mobile/#/", [
    "geolocation",
  ]);
  //set the location
  await page.setGeolocation({ latitude: 37.60128, longitude: 127.0644736 });
  //open url
  await page.goto(
    "https://www.yogiyo.co.kr/mobile/#/서울특별시/000000/1인분주문/"
  );
  await page.reload();

  await page.waitForSelector(".restaurant-name");
  // 무한 스크롤 로직 추가
  let previousHeight;
  while (true) {
    const currentHeight = await page.evaluate(
      "document.documentElement.scrollHeight"
    );
    if (previousHeight && currentHeight === previousHeight) {
      break;
    }

    previousHeight = currentHeight;

    await page.evaluate(
      "window.scrollTo(0, document.documentElement.scrollHeight)"
    );
    await page.waitForTimeout(2000); // 페이지가 추가적인 컨텐츠를 로드할 시간을 기다립니다.
  }
  const menuItems = await page.evaluate(() => {
    const items = Array.from(document.querySelectorAll(".restaurant-name"));
    return items.map((item) => item.innerText);
  });
  console.log(menuItems.length);

  // await browser.close();
};

CrawlYogiyo();

// const pageDown = async (page) => {
//   const scrollHeight = "document.body.scrollHeight";
//   let previousHeight = await page.evaluate(scrollHeight);
//   await page.evaluate(`window.scrollTo(0, ${scrollHeight})`);
//   await page.waitForFunction(`${scrollHeight} > ${previousHeight}`, {
//     timeout: 30000,
//   });
// };

// const goToPostPageAndGetInfo = async (page) => {
//   const result = await page.evaluate(() => {
//     const $ = window.$;
//     const targetPost = $($("._9AhH0:not(.done)")[0]);
//     targetPost.addClass("done");
//     return {
//       date: $("._1o9PC.Nzb55").attr("datetime").substring(0, 10),
//       title: "",
//       user: $(".FPmhX.nJAzx").text(),
//       content: $($(".gElp9")[0]).find("span").text(),
//       click: $(".Nm9Fw").find("span").text(),
//       link: targetPost.closest("a").attr("href"),
//     };
//   });
//   return result;
// };

// const puppeteer = require('puppeteer');

// async function scrapeInfiniteScrollItems(url) {
//   const browser = await puppeteer.launch({
//     args: [
//       '--enable-features=NavigatorContentUtils',
//       '--enable-features=NavigatorContentSettings',
//       '--enable-features=Geolocation',
//     ]
//   });

// const context = await browser.createIncognitoBrowserContext();
// const page = await context.newPage();

// // 위치 정보를 설정합니다.
// await page.setGeolocation({ latitude: 37.123, longitude: -122.456 });

// await page.goto(url);

//   // 나머지 코드를 유지합니다.
// }

// // 크롤링할 페이지의 URL을 전달합니다.
// scrapeInfiniteScrollItems('https://example.com');
