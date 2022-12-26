// audults_items_crawl() use to crawl galleries info: image galleries, title galleries, link galleries;
import fetch from "node-fetch";
import jsdom from "jsdom";
import PQueue from 'p-queue';
// get categorys data
import audults_galleries_crawl from "./audults_galleries_crawl.js";
import fs from "fs"
import { stringify } from "csv-stringify"
import path from "path";
import HttpsProxyAgent from 'https-proxy-agent';
const { JSDOM } = jsdom;
const queue = new PQueue({ concurrency: 100 });
// var proxy = process.env.http_proxy || 'http://168.63.76.32:3128';
// const proxyAgent = HttpsProxyAgent(proxy);

const navigation_string = "nggallery/page/";
// const nass_dir = "\\\\192.168.5.9\\NAS - Book - Ebook - Sales\\EAA-LOWCONTENT\\Coloring Pages\\Just color\\"
const nass_dir = "";
const _ = "/";
// const download = function (uri, filename, callback) {
//   request.head(uri, function (err, res, body) {
//     console.log('content-type:', res.headers['content-type']);
//     console.log('content-length:', res.headers['content-length']);

//     request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
//   });
// };
const audults_item_detail_crawl = async (item_link: string) => {
  try {
    const item_res = await fetch(item_link);
    const item_html = await item_res.text();
    const item_dom = new JSDOM(item_html);

    const audults_item_dom =
      item_dom.window.document.querySelector(".inside-article") as HTMLElement;

    return {
      item_title: audults_item_dom?.querySelector(".h1_bread")?.textContent?.replace("Coloring page : ", ""),
      item_link,
      item_image: (audults_item_dom?.querySelector("#zoomcolor")?.querySelector("#zoomcolorimg") as HTMLImageElement)?.src,
      item_description: audults_item_dom?.querySelector("#zoomcolor")?.querySelectorAll("div")[1]?.querySelectorAll("p")[1]?.textContent,
      item_category: audults_item_dom?.querySelector("#breadcrumbs")?.querySelectorAll("a")[1]?.textContent,
      item_gallery: audults_item_dom?.querySelector("#zoomcolor")?.querySelectorAll("div")[1]?.querySelectorAll("p")[2]?.querySelector("a")?.textContent,
      item_artist: audults_item_dom?.querySelector("#zoomcolor")?.querySelectorAll("div")[1]?.querySelectorAll("p")[3]?.querySelector("a")?.textContent,
    }
  } catch (error) {
    console.log(error)
    return {}
  }


}

const validPath = (path: string) => {
  return path?.replace(/[\\/?:*""><|\.]+/g, '');
}
const audults_items_crawl = async () => {
  const audults_categorys_data = await audults_galleries_crawl();
  // (async () => {
  //   await queue.add(async () => {
  for (const category of Array.from(audults_categorys_data)) {
    // const category = audults_categorys_data[0]
    for (const audults_gallery_data of category.galleries) {
      // const audults_gallery_data = category.galleries[0]
      const audults_res = await fetch(audults_gallery_data.gallery_link);
      const audults_html = await audults_res.text();
      const audults_dom = new JSDOM(audults_html);
      const audults_gallery_dom =
        audults_dom.window.document.querySelectorAll(".entry-content");
      for (const audults_item_dom of audults_gallery_dom) {
        // const audults_item_dom = audults_gallery_dom[0]
        const folder = path.join(nass_dir, `data${_}audults${_}audults_image${_}${validPath(category.category_title)}${_}${validPath(audults_gallery_data.gallery_title)}`.replaceAll(" ", ""));
        // fs.mkdirSync(folder, { recursive: true });
        fs.mkdir(folder, { recursive: true }, (err) => {
          if (err) throw err;
        });

        const audults_item_navigation_handling =
          audults_item_dom?.querySelectorAll(".page-numbers")[
            audults_item_dom?.querySelectorAll(".page-numbers")?.length - 1
          ]?.textContent || 1;

        for (let navigation = 1; navigation <= audults_item_navigation_handling; navigation++) {
          const items_res = await fetch(audults_gallery_data.gallery_link + navigation_string + navigation);
          const items_html = await items_res.text();
          const items_dom = new JSDOM(items_html);
          const audults_items_dom =
            items_dom.window.document.querySelectorAll(".grid-item");
          for (const audults_item_dom of audults_items_dom as Array<HTMLElement>) {
            //**=======================================**
            //**=======================================**
            // {
            //   item_title: "string",
            //   item_link: "string",2
            //   item_description: "string",
            //   item_gallery: "string(gallery_title)",
            //   item_artist: "string",
            //   item_image: "string",
            // },
            //**=======================================**
            //**=======================================**
            if (audults_item_dom.querySelector('a')?.href) {
              (async () => {
                await queue.add(async () => {
                  const item_details_data = await audults_item_detail_crawl(audults_item_dom.querySelector('a')?.href);
                  // debugger;
                  (async () => {
                    if (item_details_data.item_image) {
                      audults_gallery_data.items.push({ ...item_details_data })
                      await fetch(item_details_data.item_image)
                        .then(res => {
                          const file_ = path.join(nass_dir, `data${_}audults${_}audults_image${_}${validPath(category?.category_title)}${_}${validPath(audults_gallery_data?.gallery_title)}`?.replaceAll(" ", "")
                            + `${_}${validPath(item_details_data.item_title)}.jpg`);
                          res.body.pipe(fs.createWriteStream(file_))

                        }
                        ).catch(err => console.log(err))
                    }
                  })();
                  console.log(path.join(nass_dir, `data${_}audults${_}audults_image${_}${category?.category_title}${_}${audults_gallery_data?.gallery_title}`?.replaceAll(" ", "")
                    + `${_}${validPath(item_details_data.item_title)}.jpg`))
                });
              })();
            }
          }
        }
      }
      console.log(category.category_title + "-" + audults_gallery_data.gallery_title);
    }
  }
  return audults_categorys_data;
  // })();  
};

export default audults_items_crawl;
