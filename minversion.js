// const puppeteer = require("puppeteer");
// const fs = require("fs");

// const sections = [
//   "1인분주문",
//   "프랜차이즈",
//   "치킨",
//   "피자양식",
//   "중식",
//   "한식",
//   "일식돈까스",
//   "족발보쌈",
//   "야식",
//   "분식",
//   "카페디저트",
//   "편의점",
// ];

// const result = []
// const CrawlYogiyo = async (i = 0, section, items) => {
//   const browser = await puppeteer.launch({
//     headless: false,
//     defaultViewport: null,
//   }); //headless : "new" 로 나중에 바꿔주자
//   const page = await browser.newPage();

//   const context = browser.defaultBrowserContext();
//   await context.overridePermissions("https://www.yogiyo.co.kr/mobile/#/", [
//     "geolocation",
//   ]);

//   await page.setGeolocation({ latitude: 37.60128, longitude: 127.0644736 });

//   await page.goto(
//     `https://www.yogiyo.co.kr/mobile/#/서울특별시/000000/`
//   );

//   await page.waitForTimeout(1000);
//   await page.click("#button_search_address > button.btn.btn-default.ico-pick");
//   await page.waitForTimeout(1000);
//   await page.goto(
//     `https://www.yogiyo.co.kr/mobile/#/서울특별시/000000/`
//   );
//   await page.waitForTimeout(2000);
//   //위치, 이름, 배달료, 이미지 URL, 카테고리, 리뷰 별수

//     if (i % 8 === 0) {
//       await browser.close();
//       return CrawlYogiyo(i + 1, section, items);
//     }
//     i += 1;
//     await page.click(
//       `#content > div > div:nth-child(4) > div > div.restaurant-list > div:nth-child(${i})`
//     );
//     await page.waitForTimeout(2000);
//     let name;
//     try {
//       name = await page.evaluate(
//         `document.querySelector(
//           "#content > div.restaurant-detail.row.ng-scope > div.col-sm-8 > div.restaurant-info > div.restaurant-title > span"
//         ).innerText`
//       );
//     } catch {
//       /* const index = sections.indexOf(section);
//       if (index !== sections.length - 1) {
//         console.log(result);
//         const jsonString = JSON.stringify(result);
//         fs.writeFileSync(`${section}.json`, jsonString, "utf-8");
//         return CrawlYogiyo(0, sections[index + 1]);
//       } else {
//         const jsonString = JSON.stringify(result);
//         return fs.writeFileSync("data.json", jsonString, "utf-8");
//       } */

//     const titleImgUrl = await page.evaluate(
//       `document
//         .querySelector(
//           "#content > div.restaurant-detail.row.ng-scope > div.col-sm-8 > div.restaurant-info > div.restaurant-content > div:nth-child(1)"
//         )
//         .style.backgroundImage.split('"')[1]`
//     );
//     const score = await page.evaluate(() => {
//       const text = document.querySelector(
//         "#content > div.restaurant-detail.row.ng-scope > div.col-sm-8 > div.restaurant-info > div.restaurant-content > ul > li:nth-child(1) > span"
//       ).innerText;
//       return text.split(" ")[1];
//     });
//     const minimumOrderedPrice = await page.evaluate(
//       `document.querySelector(
//         "#content > div.restaurant-detail.row.ng-scope > div.col-sm-8 > div.restaurant-info > div.restaurant-content > ul > li:nth-child(3) > span"
//       ).innerText`
//     );
//     await page.waitForTimeout(2000);
//     // 작동 완
//     const deliveryFee = await page.evaluate(() => {
//       const text = document.querySelector(
//         "#content > div.restaurant-detail.row.ng-scope > div.col-sm-4.hidden-xs.restaurant-cart > ng-include > div > div.cart > div:nth-child(5) > span.list-group-item.clearfix.text-right.ng-binding"
//       ).innerText;
//       return text.split(" ")[1];
//     });

//     const restaurant = {
//       locationalCode: 1123011000,
//       name,
//       titleImgUrl,
//       score,
//       deliveryFee,
//     };
//     await page.goBack();
//     await page.waitForTimeout(2000);
//     if (i >= 58) {
//       for (let j = 1; j <= i / 58; i++) {
//         await page.evaluate(
//           "window.scrollTo(0, document.documentElement.scrollHeight)"
//         );
//         await page.waitForTimeout(1000);
//       }
//     }

// };

// CrawlYogiyo(0, sections[0]);

const puppeteer = require("puppeteer");
const fs = require("fs");

const sections = [
  "1인분주문",
  "프랜차이즈",
  "치킨",
  "피자양식",
  "중식",
  "한식",
  "일식돈까스",
  "족발보쌈",
  "야식",
  "분식",
  "카페디저트",
  "편의점",
];

const result = [];
const CrawlYogiyo = async (i = 0, section = sections[0], items = []) => {
  const browser = await puppeteer.launch({
    headless: "new",
    defaultViewport: null,
  });
  const page = await browser.newPage();

  const context = browser.defaultBrowserContext();
  await context.overridePermissions("https://www.yogiyo.co.kr/mobile/#/", [
    "geolocation",
  ]);

  await page.setGeolocation({ latitude: 37.60128, longitude: 127.0644736 });

  await page.goto(`https://www.yogiyo.co.kr/mobile/#/서울특별시/000000/`);

  await page.waitForTimeout(1000);
  await page.click("#button_search_address > button.btn.btn-default.ico-pick");
  await page.waitForTimeout(1000);
  await page.goto(`https://www.yogiyo.co.kr/mobile/#/서울특별시/000000/`);
  await page.waitForTimeout(2000);

  // 위치, 이름, 배달료, 이미지 URL, 카테고리, 리뷰 수를 크롤링합니다.
  while (true) {
    for (let j = 1; j <= Math.floor(i / 50); j++) {
      await page.evaluate(
        "window.scrollTo(0, document.documentElement.scrollHeight)"
      );
      await page.waitForTimeout(1000);
    }
    i += 1;
    console.log(i);
    try {
      try {
        await page.click(
          `#content > div > div:nth-child(4) > div > div.restaurant-list > div:nth-child(${i})`
        );
      } catch (err) {
        await page.evaluate(
          "window.scrollTo(0, document.documentElement.scrollHeight)"
        );
        await page.waitForTimeout(1000);
        await page.click(
          `#content > div > div:nth-child(4) > div > div.restaurant-list > div:nth-child(${i})`
        );
      }
    } catch (err) {
      const jsonString = JSON.stringify(items);
      return fs.writeFileSync("data.json", jsonString, "utf-8");
    }
    await page.waitForTimeout(2000);
    let name;

    try {
      name = await page.evaluate(
        () =>
          document.querySelector(
            "#content > div.restaurant-detail.row.ng-scope > div.col-sm-8 > div.restaurant-info > div.restaurant-title > span"
          ).innerText
      );
    } catch (err) {
      await browser.close();
      return CrawlYogiyo(i - 1, section, items);
    }
    const titleImgUrl = await page.evaluate(() => {
      return document
        .querySelector(
          "#content > div.restaurant-detail.row.ng-scope > div.col-sm-8 > div.restaurant-info > div.restaurant-content > div:nth-child(1)"
        )
        .style.backgroundImage.split('"')[1];
    });

    const score = await page.evaluate(() => {
      const text = document.querySelector(
        "#content > div.restaurant-detail.row.ng-scope > div.col-sm-8 > div.restaurant-info > div.restaurant-content > ul > li:nth-child(1) > span"
      ).innerText;
      return Number(text.split(" ")[1]);
    });

    const minimumOrderedPrice = await page.evaluate(() => {
      const text = document.querySelector(
        "#content > div.restaurant-detail.row.ng-scope > div.col-sm-8 > div.restaurant-info > div.restaurant-content > ul > li:nth-child(3) > span"
      ).innerText;
      return Number(text.replace(",", "").replace("원", ""));
    });

    await page.waitForTimeout(2000);

    const deliveryFee = await page.evaluate(() => {
      const text = document.querySelector(
        "#content > div.restaurant-detail.row.ng-scope > div.col-sm-4.hidden-xs.restaurant-cart > ng-include > div > div.cart > div:nth-child(5) > span.list-group-item.clearfix.text-right.ng-binding"
      ).innerText;
      return Number(text.split(" ")[1].replace(",", "").replace("원", ""));
    });
    const restaurant = {
      locationalCode: 1123011000,
      name,
      titleImgUrl,
      minimumOrderedPrice,
      score,
      deliveryFee,
    };
    console.log(restaurant);
    items.push(restaurant);
    if (i % 8 === 0) {
      await browser.close();
      return CrawlYogiyo(i, section, items);
    }
    await page.goBack();
    await page.waitForTimeout(2000);
  }
};

CrawlYogiyo(0, sections[0]);
