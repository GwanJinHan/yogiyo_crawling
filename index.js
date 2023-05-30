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

const result = {
  "1인분주문": {},
  프랜차이즈: {},
  치킨: {},
  피자양식: {},
  중식: {},
  한식: {},
  일식돈까스: {},
  족발보쌈: {},
  야식: {},
  분식: {},
  카페디저트: {},
  편의점: {},
};
const CrawlYogiyo = async (i = 0, section, items) => {
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
  }); //headless : "new" 로 나중에 바꿔주자
  const page = await browser.newPage();

  const context = browser.defaultBrowserContext();
  await context.overridePermissions("https://www.yogiyo.co.kr/mobile/#/", [
    "geolocation",
  ]);

  await page.setGeolocation({ latitude: 37.60128, longitude: 127.0644736 });

  await page.goto(
    `https://www.yogiyo.co.kr/mobile/#/서울특별시/000000/${section}/`
  );

  await page.waitForTimeout(1000);
  await page.click("#button_search_address > button.btn.btn-default.ico-pick");
  await page.waitForTimeout(1000);
  await page.goto(
    `https://www.yogiyo.co.kr/mobile/#/서울특별시/000000/${section}/`
  );
  await page.waitForTimeout(2000);

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

  const items = await page.evaluate(() => {
    const items = [
      ...document.querySelectorAll(
        "#content > div > div:nth-child(4) > div > div.restaurant-list > div > div > table > tbody > tr > td:nth-child(2) > div > div.restaurant-name.ng-binding"
      ),
    ];
    return items.map((el) => el.innerText);
  });

  //위치, 이름, 배달료, 이미지 URL, 카테고리, 리뷰 별수
  while (i < itemsLength + 1) {
    if (i % 8 === 0) {
      await browser.close();
      return CrawlYogiyo(i + 1, section, items);
    }
    i += 1;
    await page.click(
      `#content > div > div:nth-child(4) > div > div.restaurant-list > div:nth-child(${i})`
    );
    await page.waitForTimeout(2000);
    let name;
    try {
      name = await page.evaluate(
        `document.querySelector(
          "#content > div.restaurant-detail.row.ng-scope > div.col-sm-8 > div.restaurant-info > div.restaurant-title > span"
        ).innerText`
      );
    } catch {
      /* const index = sections.indexOf(section);
      if (index !== sections.length - 1) {
        console.log(result);
        const jsonString = JSON.stringify(result);
        fs.writeFileSync(`${section}.json`, jsonString, "utf-8");
        return CrawlYogiyo(0, sections[index + 1]);
      } else {
        const jsonString = JSON.stringify(result);
        return fs.writeFileSync("data.json", jsonString, "utf-8");
      } */
    }
    const yogiyoQuery = await page.evaluate(`location.href.split("/")[5]`);

    const titleImgUrl = await page.evaluate(
      `document
        .querySelector(
          "#content > div.restaurant-detail.row.ng-scope > div.col-sm-8 > div.restaurant-info > div.restaurant-content > div:nth-child(1)"
        )
        .style.backgroundImage.split('"')[1]`
    );
    const score = await page.evaluate(() => {
      const text = document.querySelector(
        "#content > div.restaurant-detail.row.ng-scope > div.col-sm-8 > div.restaurant-info > div.restaurant-content > ul > li:nth-child(1) > span"
      ).innerText;
      return text.split(" ")[1];
    });
    const minimumOrderedPrice = await page.evaluate(
      `document.querySelector(
        "#content > div.restaurant-detail.row.ng-scope > div.col-sm-8 > div.restaurant-info > div.restaurant-content > ul > li:nth-child(3) > span"
      ).innerText`
    );
    await page.waitForTimeout(2000);
    const review_ids = await page.evaluate(() => {
      const review_ids = [...document.querySelectorAll("#review .review-id")];
      return review_ids.map((el) => el.innerText.replace("님", ""));
    });

    const review_score = await page.evaluate(() => {
      let arr_score = [];
      let arr_detail = [];
      const score = [...document.querySelectorAll(".total")];
      arr_score = score.map((el) => el.innerText.replace("\n", "").trim());

      const score_detail = [
        ...document.querySelectorAll(".category > .points"),
      ];
      arr_detail = score_detail.map((el) => el.innerText);
      let temp_arr = [];
      for (let i = 0; i < arr_detail.length; i += 3) {
        const chunk = arr_detail.slice(i, i + 3);
        temp_arr.push(chunk);
      }

      return arr_score.map((el, i) => [el, ...temp_arr[i]]);
    });

    const review_menu = await page.evaluate(() => {
      const review_menu = [...document.querySelectorAll(".order-items")];
      return review_menu.map((el) => el.innerText.replace("\n", "").trim());
    });
    const review_imgUrl = await page.evaluate(() => {
      const review_imgUrl = [...document.querySelectorAll(".info-images img")];
      return review_imgUrl.map((el) => el.dataset.url);
    });
    const review_contents = await page.evaluate(() => {
      const review_contents = [
        ...document.querySelectorAll("#review > li:not(.ng-hide) > p"),
      ];
      return review_contents.map((el) => el.innerText);
    });
    const review = [];
    for (let j = 0; j < review_ids.length; j++) {
      review.push({
        id: review_ids[j],
        score: review_score[j],
        menu: review_menu[j],
        imgUrl: review_imgUrl[j],
        content: review_contents[j],
      });
    }
    // 작동 완
    const menus = {};
    const categoris = await page.evaluate(() => {
      const arr = [
        ...document.querySelectorAll(".panel-title .menu-name"),
      ].slice(1);

      return arr.map((el) => el.innerText);
    });
    for (let k = 2; k <= categoris.length + 1; k++) {
      const menu_names = await page.evaluate((k) => {
        const menu_names = [
          ...document.querySelectorAll(
            `#menu > div > div:nth-child(${k}) > div.panel-collapse.collapse.in.btn-scroll-container > div > ul > li > table > tbody > tr > td.menu-text > div.menu-name.ng-binding`
          ),
        ];
        return menu_names.map((el) => el.innerText);
      }, k);

      const menu_discriptions = await page.evaluate((k) => {
        const menu_discriptions = [
          ...document.querySelectorAll(
            `#menu > div > div:nth-child(${k}) > div.panel-collapse.collapse.in.btn-scroll-container > div > ul > li > table > tbody > tr > td.menu-text > div.menu-desc.ng-binding`
          ),
        ];
        return menu_discriptions.map((el) => el.innerText);
      }, k);
      const menu_imgUrl = await page.evaluate((k) => {
        const menu_imgUrl = [
          ...document.querySelectorAll(
            `#menu > div > div:nth-child(${k}) > div.panel-collapse.collapse.in.btn-scroll-container > div > ul > li > table > tbody > tr > td.photo-area > div`
          ),
        ];
        return menu_imgUrl.map((el) => el.style.backgroundImage.split('"')[1]);
      }, k);

      const menu_price = await page.evaluate((k) => {
        const menu_price = [
          ...document.querySelectorAll(
            `#menu > div > div:nth-child(${k}) > div.panel-collapse.collapse.in.btn-scroll-container > div > ul > li > table > tbody > tr > td.menu-text > div.menu-price> span:nth-child(1)`
          ),
        ];
        return menu_price.map((el) => el.innerText);
      }, k);
      const menu_list = menu_names.map((el, i) => {
        return {
          name: el,
          discription: menu_discriptions[i],
          imgUrl: menu_imgUrl[i],
          price: menu_price[i],
        };
      });
      menus[categoris[k - 2]] = menu_list;
    }
    const deliveryFee = await page.evaluate(() => {
      const text = document.querySelector(
        "#content > div.restaurant-detail.row.ng-scope > div.col-sm-4.hidden-xs.restaurant-cart > ng-include > div > div.cart > div:nth-child(5) > span.list-group-item.clearfix.text-right.ng-binding"
      ).innerText;
      return text.split(" ")[1];
    });

    const notification = await page.evaluate(
      `document.querySelector("#info > div:nth-child(1) > div.info-text.ng-binding").innerText`
    );
    const businessHours = await page.evaluate(
      `document.querySelector("#info > div:nth-child(2) > p:nth-child(2) > span").innerText`
    );
    const telephone = await page.evaluate(
      `document.querySelector("#info > div:nth-child(2) > p:nth-child(3) > span").innerText.split(" ")[0]`
    );
    const address = await page.evaluate(
      `document.querySelector("#info > div:nth-child(2) > p:nth-child(4) > span").innerText`
    );

    const restaurant = {
      yogiyoQuery,
      titleImgUrl,
      score,
      minimumOrderedPrice,
      review,
      menus,
      deliveryFee,
      notification,
      businessHours,
      telephone,
      address,
    };
    result[section][name] = restaurant;
    await page.goBack();
    await page.waitForTimeout(2000);
    if (i >= 58) {
      for (let j = 1; j <= i / 58; i++) {
        await page.evaluate(
          "window.scrollTo(0, document.documentElement.scrollHeight)"
        );
        await page.waitForTimeout(1000);
      }
    }
  }
};

CrawlYogiyo(0, sections[0]);
