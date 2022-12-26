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
    audults_dom.window.document.querySelector(".inside-left-sidebar").querySelectorAll("dd.level1.parent");

  for (let i = 0; i < audults_categorys_data.length; i++) {
    const audults_galleries_dom = (audults_category_dom[i] as HTMLElement).querySelectorAll("dt.level2")
    Array.from(audults_galleries_dom).forEach((audults_gallery_dom: HTMLElement) => {
      // push gallery_dom to audults_categorys_data with structer:
      //**=======================================**
      //**=======================================**
      // {
      //   gallery_title: "string",
      //   gallery_link: "string",
      //   gallery_paremt?: "string",
      //   items: []
      // };
      //**=======================================**
      //**=======================================**
      if (audults_gallery_dom.className.includes("notparent"))
        audults_categorys_data[i].galleries.push({
          gallery_title:
            audults_gallery_dom.querySelector("a").textContent,
          gallery_link: audults_gallery_dom.querySelector("a").href,
          items: [],
        });
      else {
        const audults_gallery_parents_dom = audults_category_dom[i].querySelectorAll("dt.level3.notparent")
        Array.from(audults_gallery_parents_dom).forEach((audults_gallery_parent_dom: Element) => {
          // console.log(audults_gallery_parent_dom)
          audults_categorys_data[i].galleries.push({
            gallery_title:
              audults_gallery_parent_dom.querySelector("a").textContent,
            gallery_link: audults_gallery_parent_dom.querySelector("a").href,
            gallery_parent: audults_gallery_dom.querySelector("a").textContent,
            items: [],
          });
        })
      }
    });

  }
  return audults_categorys_data;
};

export default audults_galleries_crawl;
