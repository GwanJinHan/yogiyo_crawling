const puppeteer = require("puppeteer");
const fs = require("fs");

const locationjson = fs.readFileSync("./SeoulRatLon.json", "utf8");
const locationdata = JSON.parse(locationjson);

const CrawlYogiyo = async (i = 0, locationIdx, items = []) => {
  const browser = await puppeteer.launch({
    headless: "new",
    defaultViewport: null,
  });
  const page = await browser.newPage();

  const context = browser.defaultBrowserContext();
  await context.overridePermissions("https://www.yogiyo.co.kr/mobile/#/", [
    "geolocation",
  ]);
  const { locationalCode, latitude, longitude } = locationdata[locationIdx];
  await page.setGeolocation({ latitude, longitude });

  await page.goto(`https://www.yogiyo.co.kr/mobile/#/서울특별시/000000/`);

  await page.waitForTimeout(1000);
  await page.click("#button_search_address > button.btn.btn-default.ico-pick");
  await page.waitForTimeout(1000);
  await page.goto(`https://www.yogiyo.co.kr/mobile/#/서울특별시/000000/`);
  await page.waitForTimeout(2000);

  // 위치, 이름, 배달료, 이미지 URL, 카테고리, 리뷰 수를 크롤링합니다.
  while (true) {
    if (i > 30) {
      const jsonString = JSON.stringify(items);
      fs.writeFileSync(`${locationIdx}.json`, jsonString, "utf-8");
      locationIdx += 1;
      return CrawlYogiyo(0, locationIdx, []);
    }
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
      fs.writeFileSync(`${locationIdx}.json`, jsonString, "utf-8");
      locationIdx += 1;
      return CrawlYogiyo(0, locationIdx, []);
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
      return CrawlYogiyo(i, locationIdx, items);
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

    const deliveryFee = await page.evaluate(() => {
      const text = document.querySelector(
        "#content > div.restaurant-detail.row.ng-scope > div.col-sm-4.hidden-xs.restaurant-cart > ng-include > div > div.cart > div:nth-child(5) > span.list-group-item.clearfix.text-right.ng-binding"
      ).innerText;
      return Number(text.split(" ")[1].replace(",", "").replace("원", ""));
    });
    const restaurant = {
      locationalCode,
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
      return CrawlYogiyo(i, locationIdx, items);
    }
    await page.goBack();
    await page.waitForTimeout(2000);
  }
};

CrawlYogiyo(0, 210);
