const puppeteer = require('puppeteer');
const sessionFactory = require('../factories/sessionFactory');
const userFactory = require('../factories/userFactory');

class CustomPage {
    static async build() {
        const broweser = await puppeteer.launch({
            headless: true,//no GUI for web browser 
            args: ['--no-sandbox']//makes tests much faster in CI server
        });

        const page = await broweser.newPage();
        const customPage = new CustomPage(page);

        return new Proxy(customPage, {
            get: function(target, property) {
                return customPage[property] || broweser[property] || page[property];
            }
        });
    }

    constructor(page) {
        this.page = page;
    }

    async login() {
        const user = await userFactory();
        const { session, sig } = sessionFactory(user);
    
        await this.page.setCookie({name: 'session', value: session}, {name: 'session.sig', value: sig});
        await this.page.goto('http://localhost:3000/blogs');
        await this.page.waitFor('a[href="/auth/logout"]');//wait for selector to load as everything is asyn and fast
    }

    async getContentsOf(selector) {
        return this.page.$eval(selector, el => el.innerHTML);
    }

    get(path) {
        return this.page.evaluate((_path) => {
            return fetch(_path, {
                method: 'GET',
                credentials: 'same-origin',
                headers: {
                    'Content-Type': 'application/json'
                }
            })
            .then(res => res.json());
        }, path);
    }

    post(path, data) {
        return this.page.evaluate((_path, _data) => {
            return fetch(_path, {
                method: 'POST',
                credentials: 'same-origin',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(_data)
            })
            .then(res => res.json());
        }, path, data);
    }

    execRequests(actions) {
        return Promise.all(// waits and resolves all the promises
            actions.map(({ method, path, data }) => {
                return this[method](path, data);
            })
        );
    }
}

module.exports = CustomPage;