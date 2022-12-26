// kids_items_crawl() use to crawl galleries info: image galleries, title galleries, link galleries;
import fetch from "node-fetch";
import jsdom from "jsdom";
import PQueue from 'p-queue';
// get categorys data
import kids_galleries_crawl from "./kids_galleries_crawl.js";
import fs from "fs";
import path from "path";
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
const kids_item_detail_crawl = async (item_link) => {
    try {
        const item_res = await fetch(item_link);
        const item_html = await item_res.text();
        const item_dom = new JSDOM(item_html);
        const kids_item_dom = item_dom.window.document.querySelector(".inside-article");
        return {
            item_title: kids_item_dom?.querySelector(".h1_bread")?.textContent?.replace("Coloring page : ", ""),
            item_link,
            item_image: kids_item_dom?.querySelector("#zoomcolor")?.querySelector("#zoomcolorimg")?.src,
            item_description: kids_item_dom?.querySelector("#zoomcolor")?.querySelectorAll("div")[1]?.querySelectorAll("p")[1]?.textContent,
            item_category: kids_item_dom?.querySelector("#breadcrumbs")?.querySelectorAll("a")[1]?.textContent,
            item_gallery: kids_item_dom?.querySelector("#zoomcolor")?.querySelectorAll("div")[1]?.querySelectorAll("p")[2]?.querySelector("a")?.textContent,
            item_artist: kids_item_dom?.querySelector("#zoomcolor")?.querySelectorAll("div")[1]?.querySelectorAll("p")[3]?.querySelector("a")?.textContent,
        };
    }
    catch (error) {
        console.log(error);
        return {};
    }
};
const validPath = (path) => {
    return path?.replace(/[\\/?:*""><|\.]+/g, '');
};
const kids_items_crawl = async () => {
    const kids_categorys_data = await kids_galleries_crawl();
    // (async () => {
    //   await queue.add(async () => {
    // for (const category of Array.from(kids_categorys_data)) {
    const category = kids_categorys_data[0];
    // for (const kids_gallery_data of category.galleries) {
    const kids_gallery_data = category.galleries[0];
    const kids_res = await fetch(kids_gallery_data.gallery_link);
    const kids_html = await kids_res.text();
    const kids_dom = new JSDOM(kids_html);
    const kids_gallery_dom = kids_dom.window.document.querySelectorAll(".entry-content");
    // for (const kids_item_dom of kids_gallery_dom) {
    const kids_item_dom = kids_gallery_dom[0];
    const folder = path.join(nass_dir, `data${_}kids${_}kids_image${_}${validPath(category.category_title)}${_}${validPath(kids_gallery_data.gallery_title)}`.replaceAll(" ", ""));
    // fs.mkdirSync(folder, { recursive: true });
    fs.mkdir(folder, { recursive: true }, (err) => {
        if (err)
            throw err;
    });
    const kids_item_navigation_handling = kids_item_dom?.querySelectorAll(".page-numbers")[kids_item_dom?.querySelectorAll(".page-numbers")?.length - 1]?.textContent || 1;
    for (let navigation = 1; navigation <= kids_item_navigation_handling; navigation++) {
        const items_res = await fetch(kids_gallery_data.gallery_link + navigation_string + navigation);
        const items_html = await items_res.text();
        const items_dom = new JSDOM(items_html);
        const kids_items_dom = items_dom.window.document.querySelectorAll(".grid-item");
        for (const kids_item_dom of kids_items_dom) {
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
            if (kids_item_dom.querySelector('a')?.href) {
                (async () => {
                    await queue.add(async () => {
                        const item_details_data = await kids_item_detail_crawl(kids_item_dom.querySelector('a')?.href);
                        // debugger;
                        (async () => {
                            if (item_details_data.item_image) {
                                kids_gallery_data.items.push({ ...item_details_data });
                                await fetch(item_details_data.item_image)
                                    .then(res => {
                                    const file_ = path.join(nass_dir, `data${_}kids${_}kids_image${_}${validPath(category?.category_title)}${_}${validPath(kids_gallery_data?.gallery_title)}`?.replaceAll(" ", "")
                                        + `${_}${validPath(item_details_data.item_title)}.jpg`);
                                    res.body.pipe(fs.createWriteStream(file_));
                                }).catch(err => console.log(err));
                            }
                        })();
                        console.log(path.join(nass_dir, `data${_}kids${_}kids_image${_}${category?.category_title}${_}${kids_gallery_data?.gallery_title}`?.replaceAll(" ", "")
                            + `${_}${validPath(item_details_data.item_title)}.jpg`));
                    });
                })();
            }
        }
    }
    // }
    console.log(category.category_title + "-" + kids_gallery_data.gallery_title);
    // }
    // }
    return kids_categorys_data;
    // })();  
};
export default kids_items_crawl;
//# sourceMappingURL=kids_items_crawl.js.map