"use strict"

const config = require('./config/config.json')

const getData = require('./utils/getData')
const PATH = config.excel.path
const SHEET_NAME = config.excel.sheetName

const ACCESS_TOKEN = config.accessToken
const SPACEID = config.space.spaceId
const ENVIRONMENTID = config.space.environmentId
const LOCALE = config.space.locale
const CONTENT_TYPE = config.contentType
const ENTRY_CONTENT_TYPE = config.entryContentType

const contentful = require("contentful-management");

async function connectToCMA() {
  try {
    const client = contentful.createClient({ accessToken: ACCESS_TOKEN })
    const space = await client.getSpace(SPACEID)
    return await space.getEnvironment(ENVIRONMENTID)
  } catch (err) {
    log(`Error occured on connect`)
  }
}

async function createLinkEntries(env, contentType, links) {
  links.forEach(async link => {
    try {
      let entry = await env.createEntry(contentType, { fields: link })
      entry = await env.getEntry(entry.sys.id)
      await entry.publish()
    } catch (err) { }
  })
}

// err 422
// allowedResources
// Supported field properties: localized, required, omitted and disabled.
async function createField(env, contentType, field, entryContentType) {
  try {
    const footer = await env.getContentType(contentType)
    const fields = footer.fields

    // validations
    const validations = [{ linkContentType: [entryContentType] }]
    field.items = { type: 'Link', validations: validations, linkType: 'Entry' }

    fields.push(field)
    await footer.update()
    footer = await env.getContentType(contentType)
    await footer.publish()
  }
  catch (err) {
    console.log(err);
  }
}

async function main() {

  const env = await connectToCMA();

  // gets data from excel file
  const { field, links } = await getData(PATH, SHEET_NAME)

  // creates an array of entries of 'link': 
  createLinkEntries(env, ENTRY_CONTENT_TYPE, links)

  // creates a field of type references to many, accepts only specific entry type 'link'
  createField(env, CONTENT_TYPE, field, ENTRY_CONTENT_TYPE)

}

main()