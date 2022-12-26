// kids_galleries_crawl() use to crawl galleries info: image galleries, title galleries, link galleries;
import fetch from "node-fetch";
import jsdom from "jsdom";
// get categorys data
import kids_categorys_crawl from "./kids_categorys_crawl.js";
const { JSDOM } = jsdom;
const kids_galleries_crawl = async () => {
    let kids_categorys_data = await kids_categorys_crawl();
    // crawl html for kids & convert to dom
    const kids_html = await fetch("https://www.justcolor.net/kids/");
    const kids_text = await kids_html.text();
    const kids_dom = new JSDOM(kids_text);
    // query category dom
    const kids_category_dom = kids_dom.window.document.querySelector(".inside-left-sidebar").querySelectorAll("dd.level1.parent");
    const validPath = (path) => {
        return path.replace(/[\\/?:*""><|\.]+/g, '');
    };
    for (let i = 0; i < kids_categorys_data.length; i++) {
        const kids_galleries_dom = kids_category_dom[i]?.querySelectorAll("dt.level2");
        Array.from(kids_galleries_dom).forEach((kids_gallery_dom) => {
            // push gallery_dom to kids_categorys_data with structer:
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
            if (kids_gallery_dom.className.includes("notparent"))
                kids_categorys_data[i].galleries.push({
                    gallery_title: kids_gallery_dom.querySelector("a").textContent,
                    gallery_link: kids_gallery_dom.querySelector("a").href,
                    items: [],
                });
            else {
                const kids_gallery_parents_dom = kids_category_dom[i].querySelectorAll("dt.level3.notparent");
                Array.from(kids_gallery_parents_dom).forEach((kids_gallery_parent_dom) => {
                    // console.log(kids_gallery_parent_dom)
                    kids_categorys_data[i].galleries.push({
                        gallery_title: kids_gallery_parent_dom.querySelector("a").textContent,
                        gallery_link: kids_gallery_parent_dom.querySelector("a").href,
                        gallery_parent: kids_gallery_dom.querySelector("a").textContent,
                        items: [],
                    });
                });
            }
        });
    }
    return kids_categorys_data;
};
export default kids_galleries_crawl;
//# sourceMappingURL=kids_galleries_crawl.js.map