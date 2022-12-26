import puppeteer, { Browser, Page } from 'puppeteer';
import UserAgent from 'user-agents';
import { setTimeout } from 'timers/promises';
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
const login = async (browser: Browser, page: Page, username: string, password: string) => {
    await page.setUserAgent(UserAgent.random().toString())
    console.log("config...")
    await page.goto("https://elements.envato.com/photos");
    await page.setViewport({ height: 1080, width: 1920 });
    try {
        await page.waitForSelector('.jWBnUxSm');
        const isLogin = await page.$eval('.jWBnUxSm', async data => "sa");
        return { status: 200, detail: 'Login successfully!' }
    } catch (error) {

        await page.goto("https://elements.envato.com/sign-in");

        console.log("login config...")

        await page.waitForSelector('input#signInUsername');
        if (await checkIssetElement(page, 'input#signInUsername')) {
            await page.type('input#signInUsername', username);
        }

        console.log("type usename...")

        await page.waitForSelector('input#signInPassword');
        if (await checkIssetElement(page, 'input#signInPassword')) {
            await page.type('input#signInPassword', password);
        }

        console.log("type password...")

        if (await checkIssetElement(page, 'button[class="signin-submit iY0q_PcK XRaktsFq dp4yRDc1"]')) {
            await page.click('button[class="signin-submit iY0q_PcK XRaktsFq dp4yRDc1"]');
        }
        console.log("submit login...")
        try {
            await page.waitForSelector('li[class="HX7R7vvl"]');
            if (await checkIssetElement(page, 'li[class="HX7R7vvl"]')) {
                return { status: 200, detail: 'Login successfully!' }
            }
        } catch (error) {
            return { status: 500, detail: error }
        }
    }



}
export default login;