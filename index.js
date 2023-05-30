const contentful = require("contentful-management");
const config = require('./config/config.json')
const extract = require('./utils/extract')
const log = require("./utils/log");

const ACCESS_TOKEN = config.accessToken
const SPACEID = config.space.spaceId
const ENVIRONMENTID = config.space.environmentId
const LOCALE = config.space.locale

const EXCEL = config.excel
const OUTPUT_FILE = config.outputFile

const fs = require('fs')

// authenticates with CMA and returns the environment
const connect = async () => {
    try {
        const client = contentful.createClient({ accessToken: ACCESS_TOKEN })
        const space = await client.getSpace(SPACEID)
        return await space.getEnvironment(ENVIRONMENTID)
    } catch (err) {
        log(`Error occured on connect`)
    }
}

// creates an entry of any type
const createEntry = async (env, type, fields) => {

    // const entry = await env.createEntry(type, { fields: fields })
    // await entry.publish()
    // object value is now an id
    // fields.sys.id

    fields.id = '1234'
    fields.title = {}
}

// creates entries in this order: link, subCategorie, categorie 
const createEntries = async (env, sitemapNav) => {
    const { categories } = sitemapNav

    categories.forEach(async categorie => {
        // if categorie without subCategorie
        if ('links' in categorie) {
            const { links } = categorie
            // creates an array of link entries
            links.forEach(async link => await createEntry(env, 'link', link))
            // create a categorie entry, using the array of links
            // under construction
            console.log(links);
        }
        // if categorie with subCategories
        else {
            const { subCategories } = categorie

            subCategories.forEach(subCategorie => {
                const { links } = subCategorie
                // creates link entries
                links.forEach(async link => createEntry(env, 'link', link))
                // create a subCategorie entry with the link entries
                // under construction
            })
            // creates a categorie entry with subCategorie entries
            // under construction
        }
    })
}

// creates a sitemap navigation field on 'footer' after creating the required entries
async function createFieldSitemapNav(env, sitemapNav) { }

// main function
(async () => {
    // the environment
    const env = await connect();
    // the sitemapNav object
    const sitemapNav = await extract(EXCEL, LOCALE)
    // outputs the sitemapNav object to the specified file
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(sitemapNav, null, 2), 'utf-8');
    // creates sitemapNav entries. Order: link, subCategorie, categorie 
    await createEntries(env, sitemapNav)
    // creates a sitemap navigation field on 'footer' after creating the required entries
    // await createFieldSitemapNav(env, sitemapNav)
})()