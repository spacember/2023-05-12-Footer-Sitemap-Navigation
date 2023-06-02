const contentful = require("contentful-management");
const config = require('./config/config.json')
const extract = require('./utils/extract')
const log = require("./utils/log");
const fs = require('fs');

const ACCESS_TOKEN = config.accessToken
const SPACEID = config.space.spaceId
const ENVIRONMENTID = config.space.environmentId
const LOCALE = config.space.locale
const FOOTERID = config.footerId
const EXCEL = config.excel
const OUTPUT_FILE = config.outputFile

const getEnvironment = async () => {
    try {
        const client = contentful.createClient({ accessToken: ACCESS_TOKEN })
        const space = await client.getSpace(SPACEID)
        return await space.getEnvironment(ENVIRONMENTID)
    } catch (err) {
        log(`Error occured on connect`)
    }
}

const outputObjectToFile = (path, object) => {
    try {
        fs.writeFileSync(path, JSON.stringify(object, null, 2), 'utf-8');
    } catch (err) {
        log(`Error occured on outputObjectToFile`)
    }
}

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
        log(`Published entry ${type}: name: ${entry.fields.title[LOCALE]} - id: ${entry.sys.id}`)
        return referenceToEntry
    } catch (err) {
        log(`Error occured on createEntry. ${type}: name: ${fields.title[LOCALE]}`)
    }
}

const createLinks = async (env, links) => {
    for (let index = 0; index < links.length; index++) {
        links[index] = await createEntry(env, 'link', links[index])
    }
}

const createCategorie = async (env, categorie) => {
    const links = categorie.links[LOCALE]
    await createLinks(env, links)
    categorie = await createEntry(env, 'categorie', categorie)
    return categorie
}

const createSubCategorie = async (env, subCategorie) => {
    const links = subCategorie.links[LOCALE]
    await createLinks(env, links)
    subCategorie = await createEntry(env, 'subCategorie', subCategorie)
    return subCategorie
}

const createCategorieWithSubCategories = async (env, categorie) => {
    const subCategories = categorie.subCategories[LOCALE]
    for (let index = 0; index < subCategories.length; index++) {
        subCategories[index] = await createSubCategorie(env, subCategories[index])
    }
    categorie = await createEntry(env, 'categorieWithSubCategorie', categorie)
    return categorie
}

const createCategories = async (env, sitemapNav) => {
    const categories = sitemapNav.categories[LOCALE]
    for (let index = 0; index < categories.length; index++) {
        // if categorieWithSubCategories
        if ('subCategories' in categories[index])
            categories[index] = await createCategorieWithSubCategories(env, categories[index])
        else
            categories[index] = await createCategorie(env, categories[index])
    }
}

// updates references (categories || categoriesWithSubCategories) for field sitemap navigation 
const updateFooterSitemapNavigation = async (env, categories) => {
    try {
        const footer = await env.getEntry(FOOTERID)
        footer.fields.sitemapNavigation = categories
        await footer.update()
        const draft = await env.getEntry(FOOTERID)
        await draft.publish()
        log(`Updated footer: ${FOOTERID} field: sitemap navigation`)
    }
    catch (err) {
        log(`Error occured on createFieldSitemapNav. Field name: sitemap navigation`)
    }
}

/**
 * main function
 * extracts the sitemap navigation (which is a field on footer) from excel
 * creates the requested categories (entries) 
 * adds the entries to the specified footer's sitemap navigation field
 */
(async () => {
    try {
        const env = await getEnvironment();
        const sitemapNav = await extract(EXCEL) // should return categories instead
        // outputs sitemapNav to the specified json file
        outputObjectToFile(OUTPUT_FILE, sitemapNav)
        await createCategories(env, sitemapNav)
        await updateFooterSitemapNavigation(env, sitemapNav.categories)
    } catch (err) {
        log(`Error occured on main`)
    }
})()