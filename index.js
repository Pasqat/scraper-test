const fs = require("fs");
const puppeteer = require("puppeteer");

// NOTE: for infinte scrolling see https://intoli.com/blog/scrape-infinite-scroll/

puppeteer
  .launch()
  .then(async (browser) => {
    // opening a new page and navigating to bidoo closed auction
    const page = await browser.newPage();
    await page.goto("https://it.bidoo.com/closed_auctions.php");
    await page.waitForSelector("body");

    // manipulating the page content
    let grabItem = await page.evaluate(() => {
      const wordsToFilter = [
        "Bidoo",
        "Carrefour",
        "Buono",
        "Ricarica",
        "Puntate",
        "Carburante",
        "Deliveroo",
      ];

      let allItems = document.body.querySelectorAll(".data_offset");
      // storing the items in an array then selecting for retrieving content
      let scrapeItems = [];
      allItems.forEach((item) => {
        let itemTitle = item.querySelector(".media-heading a").innerText;

        // try to filter the list
        for (let word of wordsToFilter) {
          if (itemTitle.indexOf(word) !== -1) return;
        }

        let itemClosedPriceRow = item.querySelector(".price").innerText;
        let itemValoreRow = item.querySelector(".valore").innerText;

        // parsing to have number not string
        let itemClosedPrice = +itemClosedPriceRow
          .split(" ")[0]
          .replace(",", ".");
        let itemValore = Number(
          /[0-9]+,[0-9]+/.exec(itemValoreRow)[0].replace(",", ".")
        );

        console.log(/[0-9]/.exec(itemClosedPrice));

        scrapeItems.push({
          itemTitle,
          itemClosedPrice,
          itemValore,
          itemValRate: +(itemClosedPrice / itemValore).toFixed(4),
        });
      });

      let listLength = scrapeItems.length;
      let itemRateAVG =
        scrapeItems.reduce((acc, { itemValRate }) => {
          return (acc += itemValRate);
        }, 0) / listLength;

      let items = {
        bidooItems: scrapeItems,
        scrapedItemsCount: listLength,
        allItemsAVG: +itemRateAVG.toFixed(4),
      };
      return items;
    });
    //outputting the scraped data
    console.log(grabItem);
    //colsing the browser
    await browser.close();
  })
  .catch(function (err) {
    console.log(err);
  });
