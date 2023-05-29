const ExcelJS = require('exceljs')
const log = require('./log')

// regexen
const regexLevelTitle = /^Level Title/i
const regexCategorie = /^Categorie/i
const regexSubCategorie = /^Sub categorie/i
const regexTopic = /^Topic/i

const getRows = async (path, sheet) => {
    const workBook = new ExcelJS.Workbook()
    await workBook.xlsx.readFile(path)
    return workBook.getWorksheet(sheet).getSheetValues()
}

// the full-kit contains a single common parent (sitemap navigation)
const addTitle = (name) => {
    sitemapNav = {
        name: { [locale]: name },
        categories: [],
    }
}

const addCategorie = (name, nextRowType) => {
    // if next row is a subCategorie
    if (regexSubCategorie.test(nextRowType)) {
        const categorieWithSubCategories = {
            name: { [locale]: name },
            subCategories: [],
        }
        sitemapNav.categories.push(categorieWithSubCategories)
    }
    else {
        const categorie = {
            name: { [locale]: name },
            links: [],
        }
        sitemapNav.categories.push(categorie)
    }
}

const addSubCategorie = (name, url) => {
    const subCategorie = {
        name: { [locale]: name },
        url: { [locale]: typeof url === 'object' ? url.text : url },
        links: [],
    }
    // adds subCategorie to last categorie
    const lastIndex = sitemapNav.categories.length - 1
    sitemapNav.categories[lastIndex].subCategories.push(subCategorie)
}

const addLink = (title, url) => {
    const link = {
        title: { [locale]: title },
        url: { [locale]: typeof url === 'object' ? url.text : url }
    }
    // link can be added to either lastCategorie or lastSubCategorie
    const lastIndexCategorie = sitemapNav.categories.length - 1
    const lastCategorie = sitemapNav.categories[lastIndexCategorie]
    // if subCategorie
    if ('subCategories' in lastCategorie) {
        const lastIndexSubCategorie = lastCategorie.subCategories.length - 1
        const lastSubCategorie = lastCategorie.subCategories[lastIndexSubCategorie]
        lastSubCategorie.links.push(link)
    } else
        lastCategorie.links.push(link)
}

const createSitemapNav = rows => {
    rows.forEach((row, index, rows) => {
        // current row
        const [, , type, name] = row

        // if title
        if (regexLevelTitle.test(type))
            addTitle(name)
        // if categorie
        if (regexCategorie.test(type)) {
            // used to evaluate if categorie contains subCategories
            const nextRowType = rows[index + 1][2]
            addCategorie(name, nextRowType)
        }
        // if subCategorie
        if (regexSubCategorie.test(type)) {
            const url = rows[index + 1][3]
            addSubCategorie(name, url)
        }
        // if topic
        if (regexTopic.test(type)) {
            const url = rows[index + 1][3]
            addLink(name, url)
        }
    })
}

const locale = 'en-US'
let sitemapNav = {}

//  main function
async function extract({ path, sheetName }) {
    // the sheet as an array
    const rows = await getRows(path, sheetName)
    // creates the sitemap navigation
    createSitemapNav(rows)

    return sitemapNav
}

module.exports = extract