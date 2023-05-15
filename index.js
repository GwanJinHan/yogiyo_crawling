const puppeteer = require("puppeteer");

const result = {};
const CrawlYogiyo = async (i = 1) => {
  const browser = await puppeteer.launch({ headless: false }); //headless : "new" 로 나중에 바꿔주자
  const page = await browser.newPage();

  const context = browser.defaultBrowserContext();
  await context.overridePermissions("https://www.yogiyo.co.kr/mobile/#/", [
    "geolocation",
  ]);

  await page.setGeolocation({ latitude: 37.60128, longitude: 127.0644736 });

  await page.goto(
    "https://www.yogiyo.co.kr/mobile/#/서울특별시/000000/1인분주문/"
  );

  await page.waitForTimeout(1000);
  await page.click("#button_search_address > button.btn.btn-default.ico-pick");
  await page.waitForTimeout(1000);
  await page.waitForSelector(".restaurant-name");

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
    await page.waitForTimeout(1000);
  }

  await page.evaluate("window.scrollTo(0, 0)");

  const itemsLength = await page.evaluate(() => {
    const items = Array.from(
      document.querySelectorAll(
        "#content > div > div:nth-child(4) > div > div.restaurant-list > .col-sm-6"
      )
    );
    return items.length;
  });
  console.log(itemsLength);

  while (i < itemsLength + 1) {
    if (i % 8 === 0) {
      await browser.close();
      return CrawlYogiyo(i);
    }
    await page.click(
      `#content > div > div:nth-child(4) > div > div.restaurant-list > div:nth-child(${i})`
    );
    await page.waitForTimeout(2000);
    const name = await page.evaluate(
      `document.querySelector(
        "#content > div.restaurant-detail.row.ng-scope > div.col-sm-8 > div.restaurant-info > div.restaurant-title > span"
      ).innerText`
    );
    const titleIimgUrl = await page.evaluate(
      `document
        .querySelector(
          "#content > div.restaurant-detail.row.ng-scope > div.col-sm-8 > div.restaurant-info > div.restaurant-content > div:nth-child(1)"
        )
        .style.backgroundImage.split('"')[1]`
    );
    const score = await page.evaluate(
      `document.querySelector(
        "#content > div.restaurant-detail.row.ng-scope > div.col-sm-8 > div.restaurant-info > div.restaurant-content > ul > li:nth-child(1) > span"
      ).innerText`
    );
    const minimumOrderedPrice = await page.evaluate(
      `document.querySelector(
        "#content > div.restaurant-detail.row.ng-scope > div.col-sm-8 > div.restaurant-info > div.restaurant-content > ul > li:nth-child(3) > span"
      ).innerText`
    );
    const menus = {};
    const menusCategoryLength = await page.evaluate(
      `document.querySelectorAll("#menu > .panel").length - 2`
    );
    /*  for (i = 2; i < menusCategoryLength; i ++) {
      document.querySelector(`#menu > div > div:nth-child(${i})`)
      const categoryName = 
    } */
    console.log(name, i);
    await page.goBack();
    i += 1;
    await page.waitForTimeout(2000);
  }

  // await browser.close();
};

CrawlYogiyo();
