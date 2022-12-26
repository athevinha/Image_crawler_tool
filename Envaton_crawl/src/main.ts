import puppeteer from 'puppeteer';
import login from './controllers/login.js'
import download from './controllers/download.js'
import * as dotenv from 'dotenv'

import fs from "fs"; // Or `import fs from "fs";` with ESM
import path from "path"
import * as url from 'url';
let __dirname = url.fileURLToPath(new URL('.', import.meta.url));
__dirname = __dirname.slice(0, __dirname.length - 5) + '\images';
dotenv.config()
console.log(__dirname)
const download_folder = "../images";
const check_exist_images_folder = "\\\\192.168.5.9\\NAS - Book - Ebook - Sales\\DIGITAL\\Data";
// const check_exist_images_folder = ""; 
const user_data_dir = "\\login";
const username = process.env.username_;
const password = process.env.password_;
const donwload_link = process.env.download_link;

(async () => {
  const browser = await puppeteer.launch({
    headless: false,
    userDataDir: user_data_dir,
  });
  const page = await browser.newPage();
  await page.setViewport({
    height: 1080,
    width: 1920
  });
  const client = await page.target().createCDPSession()

  await client.send('Page.setDownloadBehavior', { behavior: 'allow', downloadPath: __dirname });

  const login_ = await login(browser, page, username, password);
  const donwload_ = await download(browser, page, download_folder, check_exist_images_folder, process.env.download_link)
  // browser.close()


})();