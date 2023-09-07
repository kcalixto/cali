import qrcode from 'qrcode-terminal';
import wpp from 'whatsapp-web.js';

export class WppClient {
    client;

    constructor() { }

    async run(browser, event, callback) {
        console.log('Creating whatsapp client...');

        const clientConfig = {
            authStrategy: new wpp.LocalAuth({
                dataPath: "./s3/wpp_user_data",
            }),
            puppeteer: {
                args: ['--no-sandbox'],
            }
        }

        const client = new wpp.Client(clientConfig);
        // client.pupBrowser = browser

        // todo qr code nao funciona em debug mode
        client.on('qr', qr => {
            qrcode.generate(qr, { small: true });
        });

        client.once('ready', () => {
            console.log('Client is ready!');
            this.send(event, callback)
        });

        client.on('message', msg => {
            if (msg.body == '!ping') {
                msg.reply('pong');
            }
        });

        client.initialize();
        this.client = client;
    }

    async send(event = {
        target_phone_number: "",
        message: ""
    }, callback) {
        const res = await this.client.sendMessage(`${event.target_phone_number}@c.us`, event.message)
        console.log(`message sent successfully: {target: "${event.target_phone_number}", message: "${event.message}"}`);
        callback()
    }
}

