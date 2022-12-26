import puppeteer from 'puppeteer';
import path from "path";
import { stringify } from "csv-stringify"
import PQueue from 'p-queue';
import fs from "fs"
// const nass_dir = "\\\\192.168.5.9\\NAS - Book - Ebook - Sales\\EAA-LOWCONTENT\\Coloring Pages\\Just color\\"
const queue = new PQueue({ concurrency: 100 });
const nass_dir = "";
const _ = "\\";
const posttowns = async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(`https://opengovuk.com/`);
    const search_query = await page.$$eval('.mb-3 > ul > .list-inline-item > a', datas => {
        return datas.map(option => option.getAttribute("href"));
    });
    await browser.close();
    console.log(search_query);
    return search_query;
}
const companys = async (companis_link: string) => {
    let page_navigation = 1, datas = [];
    while (true === true) {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.goto(`${companis_link}&page=${page_navigation}`);
        const NavCount = await page.$$eval('.page-link', divs => divs.length);

        const data_query = await page.$$eval('table > tbody > tr', datas => {
            return datas.map(option => {
                const company_info = option.querySelector("a")
                if (company_info && option.querySelectorAll("td") && company_info.textContent != "Next Page")
                    return {
                        company_number: JSON.stringify(company_info.getAttribute("href").split("/")[4]),
                        company_name: company_info.textContent,
                        company_address: option.querySelectorAll("td")[1]?.textContent,
                    }
            }
            );
        });
        datas.push(...data_query.filter(n => n))
        if (NavCount == 1 && page_navigation != 1) {
            await browser.close();
            return datas;
        }
        ++page_navigation;
        console.log(`${companis_link}&page=${page_navigation}`)
    }
}


const main = async () => {
    const posttowns_link = await posttowns();
    const companys_link = [];
    // const company_links = await companys(posttowns_link[0]);
    let isDebug = false;
    for (const posttown of posttowns_link) {
        (async () => {

            if (posttown.includes("LONDON") || isDebug) {
                isDebug = true;
                const company_links = await companys(posttown);
                companys_link.push(...company_links);
                console.log("----------------------------------------------------")
                console.log(posttown)
                console.log("----------------------------------------------------")
                await stringify(companys_link, {
                    header: true
                }, async function (err, output) {
                    if (err) throw err;
                    await fs.writeFile(path.join(nass_dir, `opengovuk_.csv`), output, (err) => { console.log(err) });
                })
            }
        })()
    }
    return companys_link;
}


export default main;
