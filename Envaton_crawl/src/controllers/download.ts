import puppeteer, { Browser, Page } from 'puppeteer';
import { setTimeout } from 'timers/promises';
import fs from "fs";
import path from "path"
import glob from "glob"
import { stringify } from "csv-stringify"
const windowSet = (page, name, value) => {
    page.evaluateOnNewDocument(`
    Object.defineProperty(window, '${name}', {
      get() {
        return '${[...value]}'
      }
    })
  `)
};
const log = (text: string) => console.info(text)
const checkIssetElement = async (page, element: string = '') => {
    try {
        if (!!(await page.$(element))) {
            return true;
        } else {
            return false;
        }
    } catch (error) {
        return false;
    }
}

const check_exist_image = async (images_name: string[], image_name: string) => {
    image_name = await image_name.toLocaleLowerCase();
    for (const image_name_ of images_name) {
        if (await image_name_.toLocaleLowerCase().includes(image_name)) {
            return true;
        }
    }
    return false;
}



const getAllFiles = async function (dirPath, arrayOfFiles) {
    const files = await fs.readdirSync(dirPath)

    arrayOfFiles = arrayOfFiles || []
    for (const file in files) {
        if (await fs.statSync(dirPath + "\\" + files[file]).isDirectory()) {
            arrayOfFiles = await getAllFiles(dirPath + "\\" + files[file], arrayOfFiles)
        } else {
            if (files[file].includes('.jpg') || files[file].includes('.JPG'))
                arrayOfFiles?.push(path.join(dirPath, "\\", files[file]))
        }

    }
    return arrayOfFiles
}


const download = async (browser: Browser, page: Page, download_folder: string, check_exist_images_folder: string, download_link: string) => {
    // await page.exposeFunction("check_exist_image", check_exist_image);
    // await page.exposeFunction("log", log);
    const files = await getAllFiles(check_exist_images_folder, [])
    await windowSet(page, 'images_name', files)
    await download_(browser, page, download_link, files)
}

const download_ = async (browser: Browser, page: Page, link_photo: string, images_name: string[]) => {
    const images_data = [];
    await page.goto(link_photo);
    const imagesButton = await page.$$eval('div.tXwhn5Zg > .iHDq8Zoz', imagesE => {
        return imagesE.map((imageE) => imageE.className.split(" ")[1]);
    });

    for (const imageButton of imagesButton) {
        const image_name = await page.$eval(`.${imageButton}`, async imageE => { return await imageE.querySelector('.LjIVoz0l').textContent })

        if (await check_exist_image(images_name, image_name)) {
            log(`${image_name} is exist in folder`)
        }
        else {
            const link = await page.$eval(`.${imageButton}`, async imageE => await (imageE.querySelector('.SZBxAOrq') as HTMLAnchorElement).href)
            await page.goto(link)
            await page.waitForSelector('.mIe6goMR')
            await page.$eval(`.mIe6goMR`, async imageE => await (imageE as HTMLButtonElement).click())
            await page.waitForSelector('.nEpAyrlb')

            const imageID = await page.url().split('/')[3]
            const image_data = await page.$eval(`.nEpAyrlb`, async imageE => {
                return {
                    image_title: imageE.querySelector('.D9ao138P')?.textContent,
                    image_description: imageE.querySelector('.oypeHRAZ')?.textContent,
                    image_tag: JSON.stringify(Array.from(imageE.querySelectorAll(".d0KA3Wtv")).map(data => data.textContent)).replaceAll('"', "").replaceAll('[', "").replaceAll(']', "")
                }
            })
            image_data['image_id'] = imageID
            console.log(`Download: ${image_data?.image_title}`)
            images_data.push(image_data)
            await stringify(images_data, {
                header: true
            }, async function (err, output) {
                if (err) throw err;
                await fs.writeFile(path.join("", `${link_photo.split('/')[4] ? link_photo.split('/')[4] : "pg-1"}.csv`), output, (err) => { });
            })

            await page.waitForSelector('.ReactModalPortal');
            await setTimeout(5000)
            const ProjectSelect = 'label[class="jiP9Bjx2 C2ngYs9r"]';
            await page.waitForSelector(ProjectSelect);
            if (await checkIssetElement(page, ProjectSelect)) {
                await page.click(ProjectSelect)
            }
            await setTimeout(5000)
            const AddDonwloadE = 'button[data-test-selector="project-add-and-download-button"]';
            await page.waitForSelector(AddDonwloadE);
            if (await checkIssetElement(page, AddDonwloadE)) {
                await page.click(AddDonwloadE)
            }
            let loop_res = true;
            page.on('response', async response => {
                const imageID_ = page.url().split('/')[3]
                const url = response.url();
                const status = response.status()
                const disposition = response.headers()['content-disposition'];
                if (loop_res === true && response.request().resourceType() === "document" && disposition && disposition.indexOf('attachment') !== -1) {
                    var filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
                    var matches = filenameRegex.exec(disposition);
                    if (matches != null && matches[1]) {
                        let filename = matches[1].replace(/['"]/g, '').replaceAll('UTF-8', '');
                        // console.log(path.join(`images/`, filename), 'to', path.join(`images/`, `${imageID_}.jpg`))
                        loop_res = false;
                        await setTimeout(10000)
                        fs.rename(path.join(`images\\`, filename), path.join(`images\\`, `${imageID_}.jpg`), () => { })
                    }
                }
            });
            await setTimeout(10000)
            await page.goBack()
        }
    }

    return imagesButton


}
export default download;