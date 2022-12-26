import puppeteer from 'puppeteer';
import path from "path";
import { stringify } from "csv-stringify";
import PQueue from 'p-queue';
import fs from "fs";
import Excel from "exceljs";
import removeVietnameseTones from './removeVN.js';
// const nass_dir = "\\\\192.168.5.9\\NAS - Book - Ebook - Sales\\EAA-LOWCONTENT\\Coloring Pages\\Just color\\"
const queue = new PQueue({ concurrency: 20 });
const nass_dir = "";
const _ = "\\";
// const workbook = new Excel.Workbook();
// const worksheet = await workbook.csv.readFile("src\\3_randomaddress\\search.csv");
const workbook = new Excel.Workbook();
const worksheet = await workbook.csv.readFile("src\\3_randomaddress\\search.csv");
const postal_code = async () => {
    const datas = [];
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(`https://thanhthinhbui.com/zipcode/`);
    const NavCount = await page.$$eval('.page-link', divs => divs.length);
    const data_query = await page.$$eval('table > tbody > tr', datas => {
        return datas.map(option => {
            const postal_information = option.querySelectorAll("td");
            return {
                id: postal_information[0].querySelector("p").textContent,
                province: postal_information[1].querySelector("p").textContent,
                code: JSON.stringify(postal_information[2].querySelector("p").textContent),
            };
        });
    });
    datas.push(...data_query.filter(n => n));
    await stringify(datas, {
        header: true
    }, async function (err, output) {
        if (err)
            throw err;
        await fs.writeFile(path.join(nass_dir, `src\\3_randomaddress\\search.csv`), output, (err) => { console.log(err); });
    });
    await browser.close();
    return datas;
};
function check_code(province) {
    const postal_code = worksheet.getSheetValues();
    const code = postal_code.filter((data, _) => {
        return removeVietnameseTones(data[2].trim()).includes(province);
    });
    return code[0]?.[3];
}
const main = async () => {
    const address_details = [];
    while (address_details.length <= 50000) {
        // (async () => {
        const browser = await puppeteer.launch();
        await queue.add(async () => {
            const page = await browser.newPage();
            await page.goto("https://www.bestrandoms.com/random-address-in-vn");
            const data_query = await page.$$eval('.content > .list-unstyled > li', datas => {
                return datas.map((option, _) => {
                    const infomation_EL = option.querySelectorAll("p");
                    // const postal_code = worksheet.getSheetValues()
                    // const code = postal_code.filter((data, _) => {
                    //     return removeVietnameseTones((data[2] as string).trim()).includes(infomation_EL[1]?.textContent)
                    // })
                    return {
                        address: `${infomation_EL[0]?.textContent},  ${infomation_EL[1]?.textContent}`?.replaceAll("Street:", "").replaceAll("City:", "").trim(),
                        province: `${infomation_EL[2]?.textContent}`?.replaceAll('State/province/area:', "").trim(),
                    };
                });
            });
            console.log(data_query);
            address_details.push(...data_query.filter(n => n));
        });
        await browser.close();
        console.log(`data STT: ${address_details.length}`);
        if (address_details.length % 100 === 0) {
            await stringify(address_details, {
                header: true
            }, async function (err, output) {
                if (err)
                    throw err;
                await fs.writeFile(path.join(nass_dir, `randomaddress_.csv`), output, (err) => { console.log(err); });
            });
        }
        // })()
    }
    return address_details;
};
export default main;
//# sourceMappingURL=main.js.map