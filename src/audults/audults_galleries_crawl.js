// audults_galleries_crawl() use to crawl galleries info: image galleries, title galleries, link galleries;
import fetch from "node-fetch";
import jsdom from "jsdom";
// get categorys data
import audults_categorys_crawl from "./audults_categorys_crawl.js";

const { JSDOM } = jsdom;
const audults_galleries_crawl = async () => {
  let audults_categorys_data = await audults_categorys_crawl();
  // crawl html for audults & convert to dom
  const audults_html = await fetch("https://www.justcolor.net/our-galleries/");
  const audults_text = await audults_html.text();
  const audults_dom = new JSDOM(audults_text);
  // query category dom
  const audults_category_dom =
    audults_dom.window.document.querySelectorAll(".albumoverview");
  for (let i = 0; i < audults_categorys_data.length; i++) {
    // query all galleries in category

    let audults_galleries_dom =
      audults_category_dom[i].querySelectorAll(".grid-item");
    // query gallerr dom
    // console.log(audults_galleries_dom)[i];
    Array.from(audults_galleries_dom).map((audults_gallery_dom, _) => {
      // push gallery_dom to audults_categorys_data with structer:
      //**=======================================**
      // {
      //   gallery_title: "string",
      //   gallery_image: "string",
      //   gallery_link: "string",
      //   items: []
      // };
      //**=======================================**
      audults_categorys_data[i].galleries.push({
        gallery_title:
          audults_gallery_dom.querySelector(".h2_gal")?.textContent,
        gallery_image: audults_gallery_dom.querySelector(".wp-post-image")?.src,
        gallery_link: audults_gallery_dom.querySelector("a")?.href,
        items: [],
      });
    });
  }
  return audults_categorys_data;
};

export default audults_galleries_crawl;
