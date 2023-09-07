import { WppClient } from "./libs/wpp.js"
import { buildPage } from './browser/puppeteer.cjs'

const validate = (event) => {
    if (!event.body) {
        throw new Error("event body is required")
    }

    const { target_phone_number, message } = JSON.parse(event.body)

    if (!target_phone_number) {
        throw new Error("'target_phone_number' is required")
    }

    if (!message) {
        throw new Error("'message' is required")
    }

    return {
        target_phone_number,
        message
    }
}

export const sender = async (event) => {
    try {
        const { target_phone_number, message } = validate(event)

        console.log("starting...")
        const wpp = new WppClient()

        const { page, close } = await buildPage()
        await page.goto('https://web.whatsapp.com', { waitUntil: 'load' })
        // await page.waitForSelector('._2QgSC', { timeout: 0 })

        const callback = () => {
            console.log("callback called")
            process.exit(0)
        }

        await wpp.run(page, {
            target_phone_number,
            message
        }, callback)
        
        // [ ] save user_data in s3
        // [ ] remove user_data on lambda deploy
        // [ ] find out how to refresh token
        // [ ] find out how to send message to group
        // [ ] make scheduled message feature
        // [ ] workflow messaging feature (cron job)

    } catch (err) {
        console.log("ERROR: ", err)
    }
}

if (process.env.NODE_ENV === "local") {
    const testnum = process.env.TEST
    sender({
        body: JSON.stringify({
            "target_phone_number": "5511933938090",
            "message": `test#${testnum}`
        })
    })
}
