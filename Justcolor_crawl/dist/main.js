import audults_items_crawl from "./audults/audults_items_crawl.js";
import kids_items_crawl from "./kids/kids_items_crawl.js";
import fs from "fs";
import path from "path";
import { stringify } from "csv-stringify";
let crawl_type = 2; // 0: audults crawl, 1: kids, 2: all
const export_csv = (type = "audults") => {
    fs.readFile(`${type}_data.json`, (err, data) => {
        if (err)
            throw err;
        let audults = JSON.parse(data.toString());
        for (const category of audults) {
            for (const gallery of category.galleries) {
                stringify(gallery.items, {
                    header: true
                }, function (err, output) {
                    fs.mkdir(path.join(`data/${type}/${type}_csv/${category.category_title}`.replaceAll(" ", ""), ""), { recursive: true }, (err) => {
                        if (err)
                            throw err;
                        fs.writeFile(path.join(`data/${type}/${type}_csv/${category.category_title}/${gallery.gallery_title}.csv`.replaceAll(" ", "")), output, (err) => { console.log(err); });
                    });
                });
            }
        }
    });
};
(async () => {
    if (crawl_type === 0 || crawl_type === 2) {
        const audults_data = await audults_items_crawl();
        console.log(audults_data);
        fs.writeFileSync('audults_data.json', JSON.stringify(audults_data));
        export_csv("audults");
    }
    if (crawl_type === 1 || crawl_type === 2) {
        const kids_data = await kids_items_crawl();
        console.log(kids_data);
        fs.writeFileSync('kids_data.json', JSON.stringify(kids_data));
        export_csv("kids");
    }
})();
// const app = express();
// app.set("json spaces", 2);
// app.get("/", async (req, res) => {
//   const kids_data = await kids_galleries_crawl()
//   return JSON.stringify(kids_data)
// });
// app.get("/export/audults", async (req, res) => {
// fs.readFile('audults_data.json', (err, data) => {
//   if (err) throw err;
//   let audults = JSON.parse(data.toString());
//   console.log(audults)
//   for (const category of audults) {
//     for (const gallery of category.galleries) {
//       stringify(gallery.items, {
//         header: true
//       }, function (err, output) {
//         fs.mkdir(`data/audults/audults_csv/${category.category_title}`.replaceAll(" ", ""), { recursive: true }, (err) => {
//           if (err) throw err;
//           fs.writeFile(`data/audults/audults_csv/${category.category_title}/${gallery.gallery_title}.csv`.replaceAll(" ", ""), output, (err) => { console.log(err) });
//         });
//       })
//     }
//   }
// });
//   return "ok";
// });
// app.get("/galleries", async (req, res) => {
//   return res.json(await audults_galleries_crawl())
// });
// app.get("/categories", async (req, res) => {
//   return res.json(await audults_categorys_crawl())
// });
// app.get("/", async (req, res) => {
//   const audults_data = await audults_items_crawl()
//   fs.writeFileSync('audults_data.json', JSON.stringify(audults_data));
//   return res.json(audults_data)
// });
// app.listen(3000, () => console.log("run server on port 3000"));
//# sourceMappingURL=main.js.map