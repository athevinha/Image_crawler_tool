// kids_categorys_crawl() use to crawl categorys info: categorys titles
import fetch from "node-fetch";
import jsdom from "jsdom";
const { JSDOM } = jsdom;
const kids_categorys_crawl = async () => {
    // crawl html for kids & convert to dom
    const kids_html = await fetch("https://www.justcolor.net/kids/");
    const kids_text = await kids_html.text();
    const kids_dom = new JSDOM(kids_text);
    // filter title from kids dom
    const kids_categorys_titles_original = kids_dom.window.document.querySelector(".inside-left-sidebar").querySelectorAll("dt.level1.parent");
    ;
    // handling kids_categorys_titles_original query to [{category_title:string}]
    const kids_categorys_images_handling = [];
    for (let i = 0; i < kids_categorys_titles_original.length; i++) {
        // handling kids_categorys_titles_original with structer:
        //**=======================================**
        //**=======================================**
        // {
        //   category_title: "string",
        //   galleries: [],
        // };
        //**=======================================**
        //**=======================================**
        kids_categorys_images_handling.push({
            category_title: (kids_categorys_titles_original[i]?.querySelector('span')?.textContent).replaceAll("\n", ""),
            galleries: [],
        });
    }
    return kids_categorys_images_handling;
};
export default kids_categorys_crawl;
// task
// lấy 7 mục lớn theo folder
// craw theo tên, catatorsi, description, from gallery, artist, ảnh.
//# sourceMappingURL=kids_categorys_crawl.js.map