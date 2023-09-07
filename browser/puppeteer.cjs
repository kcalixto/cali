const dotenv = require("dotenv")

dotenv.config()

const END_EXECUTION = "should_end_execution"

exports.buildBrowser = async () => {
    return newBrowser
}

exports.buildPage = async (headless = true) => {
    try {
        const browser = await newBrowser(headless)

        console.log("building page");

        const page = await browser.newPage()

        page.setViewport({
            width: 1280,
            height: 720,
        })

        console.log("page built successfully");
        return {
            page, close: async () => {
                await page.close()
                await browser.close()
            }
        }
    } catch (error) {
        console.log("error building page: ", error)
        throw END_EXECUTION
    }
}

async function newBrowser(headless = false) {
    async function local() {
        console.log("running local");
        try {
            const puppeteer = require("puppeteer")

            const browser = await puppeteer.launch({
                headless: headless,
                timeout: 0,
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox'
                ],
                // userDataDir: "./s3/user_data"
            })

            return browser
        } catch (error) {
            console.log(`error building browser: ${error.message}\n\n${error}`)
            throw END_EXECUTION
        }
    }

    async function remote() {
        console.log("running remote");
        try {
            const chromium = require("@sparticuz/chrome-aws-lambda")

            const browser = await chromium.puppeteer.launch({
                args: chromium.args,
                defaultViewport: chromium.defaultViewport,
                executablePath: await chromium.executablePath,
                headless: chromium.headless,
                ignoreHTTPSErrors: true,
            });

            return browser
        } catch (error) {
            console.log(`error building browser: ${error.message}\n\n${error}`)
            throw END_EXECUTION
        }
    }

    try {
        if (process.env.NODE_ENV === "local") {
            return local()
        }

        return remote()
    } catch (error) {
        throw error
    }
}