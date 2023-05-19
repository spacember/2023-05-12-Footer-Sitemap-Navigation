"use strict"

const contentful = require("contentful-management");
const config = require('./config/config.json')
const getData = require('./utils/getData')
const log = require("./utils/log");

const PATH = config.excel.path
const SHEET_NAME = config.excel.sheetName

const ACCESS_TOKEN = config.accessToken
const SPACEID = config.space.spaceId
const ENVIRONMENTID = config.space.environmentId
const LOCALE = config.space.locale
const CONTENT_TYPE = config.contentType
const ENTRY_CONTENT_TYPE = config.entryContentType

const date = new Date();

// authenticates with CMA and returns the environment
async function connect() {
  try {
    const client = contentful.createClient({ accessToken: ACCESS_TOKEN })
    const space = await client.getSpace(SPACEID)
    return await space.getEnvironment(ENVIRONMENTID)
  } catch (err) {
    log(`Error occured on connect`)
  }
}

// creates a list of entries of contentType 'link'
async function createEntries(env, contentType, links) {
  links.forEach(async link => {
    try {
      let entry = await env.createEntry(contentType, { fields: link })
      entry = await env.getEntry(entry.sys.id)

      if (await entry.isPublished())
        await entry.publish()

      log(`DATE: ${date} \nPublished entry: id: ${entry.sys.id}`)
    } catch (err) {
      log(`Error occured on createEntries: id: ${entry.sys.id}`)
    }
  })
}

// creates a field which accepts an array of contentType 'link'
async function createField(env, contentType, field, entryContentType) {
  try {
    let footer = await env.getContentType(contentType)
    const fields = footer.fields

    // validation : should accept only contentType 'link'
    const validations = [{ linkContentType: [entryContentType] }]
    field.items = { type: 'Link', validations: validations, linkType: 'Entry' }

    fields.push(field)
    await footer.update()
    footer = await env.getContentType(contentType)

    if (await footer.isPublished())
      await footer.publish()

    log(`DATE: ${date} \nPublished field: ${field.name} - id: ${field.id}`)
  }
  catch (err) {
    log(`Error occured on createField: ${field.name} - id: ${field.id}`)
  }
}

// main function
(async function () {

  // authenticates with CMA and returns the environment
  const environment = await connect();

  // gets data from excel file
  // works but not great, should try graph
  const sitemapNav = await getData(PATH, SHEET_NAME, LOCALE)

  // // creates a list of entries of contentType 'link'
  // createEntries(environment, ENTRY_CONTENT_TYPE, links)

  // // creates a field which accepts an array of contentType 'link'
  // createField(environment, CONTENT_TYPE, field, ENTRY_CONTENT_TYPE)

})()