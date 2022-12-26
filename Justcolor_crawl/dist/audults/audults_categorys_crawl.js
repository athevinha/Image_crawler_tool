// audults_categorys_crawl() use to crawl categorys info: categorys titles
import fetch from "node-fetch";
import jsdom from "jsdom";
const { JSDOM } = jsdom;
const audults_categorys_crawl = async () => {
    // crawl html for audults & convert to dom
    const audults_html = await fetch("https://www.justcolor.net/our-galleries/");
    const audults_text = await audults_html.text();
    const audults_dom = new JSDOM(audults_text);
    // filter title from audults dom
    const audults_categorys_titles_original = audults_dom.window.document.querySelector(".inside-left-sidebar").querySelectorAll("dt.level1.parent");
    ;
    // handling audults_categorys_titles_original query to [{category_title:string}]
    const audults_categorys_images_handling = [];
    for (let i = 0; i < audults_categorys_titles_original.length; i++) {
        // handling audults_categorys_titles_original with structer:
        //**=======================================**
        //**=======================================**
        // {
        //   category_title: "string",
        //   galleries: [],
        // };
        //**=======================================**
        //**=======================================**
        audults_categorys_images_handling.push({
            category_title: (audults_categorys_titles_original[i]?.querySelector('span')?.textContent).replaceAll("\n", ""),
            galleries: [],
        });
    }
    return audults_categorys_images_handling;
};
export default audults_categorys_crawl;
// task
// lấy 7 mục lớn theo folder
// craw theo tên, catatorsi, description, from gallery, artist, ảnh.
//# sourceMappingURL=audults_categorys_crawl.js.map