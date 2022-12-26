import puppeteer from 'puppeteer';
import path from "path";
import { stringify } from "csv-stringify";
import PQueue from 'p-queue';
import fs from "fs";
// const nass_dir = "\\\\192.168.5.9\\NAS - Book - Ebook - Sales\\EAA-LOWCONTENT\\Coloring Pages\\Just color\\"
const queue = new PQueue({ concurrency: 20 });
const nass_dir = "";
const _ = "\\";
const companies = async (companis_link) => {
    let page_navigation = 1, datas = [];
    let stop = false;
    while (stop === false) {
        const browser = await puppeteer.launch();
        await queue.add(async () => {
            const page = await browser.newPage();
            await page.goto(`${companis_link}&page=${page_navigation}`);
            const NavCount = await page.$$eval('.govuk-pagination__link', divs => divs.length);
            const data_query = await page.$$eval('#results > li', datas => {
                return datas.map(option => {
                    return {
                        company_number: JSON.stringify(option.querySelector(".govuk-link").getAttribute("href").split("/")[2].replaceAll(" ", "")),
                        company_name: option.querySelector(".govuk-link")?.textContent.replace(/[\\/?:*"">©<|\.\n]+/g, '').trim(),
                        company_address: option.querySelectorAll("p")[1]?.textContent,
                    };
                });
            });
            datas.push(...data_query.filter(n => n));
            if (NavCount == 1 && page_navigation != 1) {
                stop = true;
            }
        });
        await browser.close();
        console.log(`${companis_link}&page=${page_navigation}`);
        ++page_navigation;
    }
    return datas;
};
const main = async () => {
    const companies_link = [];
    let isDeBug = false;
    fs.readFile(`src\\2_servicegovuk\\search.json`, 'utf8', async function (err, aphas) {
        if (err)
            throw err;
        for (const apha of JSON.parse(aphas)) {
            if (apha === "MA" || isDeBug === true) {
                isDeBug = true;
                const company = await companies(`https://find-and-update.company-information.service.gov.uk/search/companies?q=${apha}`);
                console.log("----------------------------------------------------");
                console.log(`https://find-and-update.company-information.service.gov.uk/search/companies?q=${apha}`);
                console.log("----------------------------------------------------");
                companies_link.push(...company);
                await stringify(companies_link, {
                    header: true
                }, async function (err, output) {
                    if (err)
                        throw err;
                    await fs.writeFile(path.join(nass_dir, `servicegovuk.csv`), output, (err) => { console.log(err); });
                });
            }
        }
    });
    return companies_link;
};
export default main;
//# sourceMappingURL=main.js.map