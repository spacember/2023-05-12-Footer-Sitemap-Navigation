const contentful = require("contentful-management");
const config = require('./config/config.json')
const extract = require('./utils/extract')
const log = require("./utils/log");
const fs = require('fs')

const ACCESS_TOKEN = config.accessToken
const SPACEID = config.space.spaceId
const ENVIRONMENTID = config.space.environmentId
const locale = config.space.locale

const EXCEL = config.excel
const OUTPUT_FILE = config.outputFile

const date = new Date();

/**
 * authenticates with contentful management api
 * @returns the specified environment
 */
const connect = async () => {
    try {
        const client = contentful.createClient({ accessToken: ACCESS_TOKEN })
        const space = await client.getSpace(SPACEID)
        return await space.getEnvironment(ENVIRONMENTID)
    } catch (err) {
        log(`Error occured on connect`)
    }
}

/**
 * outputs the sitemap navigation object to the specified json file
 * @param {the path to the json file} path 
 * @param {the sitemap navigation object} object 
 */
const outputObjectToFile = (path, object) => {
    try {
        fs.writeFileSync(path, JSON.stringify(object, null, 2), 'utf-8');
    } catch (err) { log(`Error occured on outputSitemapNavToFile`) }
}

/**
 * creates and publishes an entry of any type
 * @param {the environment} env 
 * @param {the content type of the entry} type 
 * @param {the entry} fields 
 * @returns the reference to the entry
 */
const createEntry = async (env, type, fields) => {
    try {
        const entry = await env.createEntry(type, { fields: fields })
        await entry.publish()

        const referenceToEntry = {
            sys: {
                type: 'Link',
                linkType: 'Entry',
                id: entry.sys.id
            }
        }
        // log if entry published
        // if (await entry.isPublished())
        log(`DATE: ${date} \nPublished entry:: type: ${type}, name: ${entry.fields.title[locale]}, id: ${entry.sys.id}`)
        return referenceToEntry
    } catch (err) {
        console.log(err);
        log(`Error occured on createEntry`)
    }
}

/**
 * creates the entries for sitemap navigation. 
 * order: link -> categorie || link -> subCategorie -> categorieWithSubCategorie
 * after creating and publishing an entry, it is replaced with its system properties.
 * @param {the environment} env 
 * @param {the sitemap navigation object} sitemapNav 
 */
const createEntries = async (env, sitemapNav) => {
    const categories = sitemapNav.categories[locale]

    for (let catIndex = 0; catIndex < categories.length; catIndex++) {
        const categorie = categories[catIndex]
        // if categorie
        if ('links' in categorie) {
            const links = categorie.links[locale]
            // creates links for current categorie
            for (let linkIndex = 0; linkIndex < links.length; linkIndex++) {
                links[linkIndex] = await createEntry(env, 'link', links[linkIndex])
            }
            categories[catIndex] = createEntry(env, 'categorie', categorie)
        }
        // if categorieWithSubCategorie
        else {
            const subCategories = categorie.subCategories[locale]
            // creates subCategories
            for (let subCatIndex = 0; subCatIndex < subCategories.length; subCatIndex++) {

                const subCategorie = subCategories[subCatIndex]
                const links = subCategorie.links[locale]
                // creates links for current subCategorie
                for (let linkIndex = 0; linkIndex < links.length; linkIndex++) {
                    // create a link entry. Replaces the link by its sys properties
                    links[linkIndex] = await createEntry(env, 'link', links[linkIndex])
                }
                subCategories[subCatIndex] = await createEntry(env, 'subCategorie', subCategorie)
            }
            categories[catIndex] = await createEntry(env, 'categorieWithSubCategorie', categorie)
        }
    }
}

/**
 * creates field sitemap navigation on footer
 * under construction !
 * @param {the environment} env 
 * @param {field sitemap navigation} sitemapNav 
 */
async function createFieldSitemapNav(env, sitemapNav) { }

/**
 * main function
 * this script creates a sitemap navigation field with entries on footer, using an excel as input
 */
(async () => {
    // the environment
    const env = await connect();
    // the sitemapNav object
    const sitemapNav = await extract(EXCEL)
    // outputs sitemapNav to the specified json file
    outputObjectToFile(OUTPUT_FILE, sitemapNav)
    // creates the required entries for sitemap navigation field.
    await createEntries(env, sitemapNav)
    // creates field sitemap navigation on footer
    // await createFieldSitemapNav(env, sitemapNav)
})()