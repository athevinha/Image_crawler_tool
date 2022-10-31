// audults_items_crawl() use to crawl galleries info: image galleries, title galleries, link galleries;
import fetch from "node-fetch";
import jsdom from "jsdom";
// get categorys data
import audults_galleries_crawl from "./audults_galleries_crawl.js";

const { JSDOM } = jsdom;

const audults_item_detail_crawl = async (item_link) => {};

const audults_items_crawl = async () => {
  let audults_categorys_data = await audults_galleries_crawl();
  // crawl html for audults & convert to dom
  Array.from(audults_categorys_data).map((audults_category_data, _) => {
    // console.log(audults_category_data.category_title);
    audults_category_data.galleries.map(async (audults_gallery_data, __) => {
      // console.log("-  " + audults_gallery_data.gallery_title);
      // const audults_html = await fetch(audults_gallery_data.gallery_link);
      // const audults_text = await audults_html.text();
      // const audults_dom = new JSDOM(audults_text);
      // const audults_items_dom =
      //   audults_dom.window.document.querySelectorAll(".entry-content");
      // Array.from(audults_items_dom).map((audults_item_dom, ___) => {
      //   let audults_item_navigation_original =
      //     audults_item_dom?.querySelectorAll(".page-numbers");
      //   let audults_item_navigation_handling =
      //     audults_item_navigation_original[
      //       audults_item_navigation_original?.length - 1
      //     ];
      // });
    });
  });

  return audults_categorys_data;
};

export default audults_items_crawl;
