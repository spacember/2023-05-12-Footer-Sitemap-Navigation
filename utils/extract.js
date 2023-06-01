const ExcelJS = require('exceljs')
const locale = 'en-US'

// regexen
const regexLevelTitle = /^Level Title/i
const regexCategorie = /^Categorie/i
const regexSubCategorie = /^Sub categorie/i
const regexTopic = /^Topic/i

/**
 * returns the excel file as an array of rows
 * @param {contains the path to excel and the required sheet} excel 
 * @returns a 2d array of rows
 */
const getRows = async (excel) => {
    try {
        const { path, sheetName } = excel
        const workBook = new ExcelJS.Workbook()
        await workBook.xlsx.readFile(path)
        return workBook.getWorksheet(sheetName).getSheetValues()
    }
    catch (err) {
        log(`Error occured ongetRows`)
    }
}

/**
 * adds the name of the sitemap navigation to sitemapNav
 * @param {the name of the sitemapNav} name 
 */
const addTitle = (name) => {
    sitemapNav = {
        name: { [locale]: name },
        categories: { [locale]: [] },
    }
}

/**
 * adds a categorie to sitemapNav. categories can have subCategories
 * @param {the name of the categorie} name 
 * @param {the type of the next row} nextRowType (link || subCategorie)
 */
const addCategorie = (name, nextRowType) => {
    // if  subCategorie
    if (regexSubCategorie.test(nextRowType)) {
        const categorieWithSubCategories = {
            title: { [locale]: name },
            subCategories: { [locale]: [] },
        }
        sitemapNav.categories[locale].push(categorieWithSubCategories)
    }
    else {
        const categorie = {
            title: { [locale]: name },
            links: { [locale]: [] },
        }
        sitemapNav.categories[locale].push(categorie)
    }
}

/**
 * adds a subCategorie to lastCategorie
 * @param {the name of the subCategorie} name 
 * @param {the url of the subCategorie} url 
 */
const addSubCategorie = (name, url) => {
    const subCategorie = {
        title: { [locale]: name },
        url: { [locale]: typeof url === 'object' ? url.text : url },
        links: { [locale]: [] },
    }
    const lastCategorieIndex = sitemapNav.categories[locale].length - 1
    sitemapNav.categories[locale][lastCategorieIndex].subCategories[locale].push(subCategorie)
}

/**
 * adds a link object to lastCategorie or lastCategorie's lastSubCategorie
 * @param {the title of the link} title 
 * @param {the url of the link} url 
 */
const addLink = (title, url) => {
    const link = {
        title: { [locale]: title },
        url: { [locale]: typeof url === 'object' ? url.text : url }
    }
    const lastIndexCategorie = sitemapNav.categories[locale].length - 1
    const lastCategorie = sitemapNav.categories[locale][lastIndexCategorie]
    // if subCategorie
    if ('subCategories' in lastCategorie) {
        const lastIndexSubCategorie = lastCategorie.subCategories[locale].length - 1
        const lastSubCategorie = lastCategorie.subCategories[locale][lastIndexSubCategorie]
        lastSubCategorie.links[locale].push(link)
    } else
        lastCategorie.links[locale].push(link)
}

/**
 * adds children objects to sitemapNav object. Empty at start
 * children: [sitemapNav, categorie, categorieWithSubCategorie, subCategorie, link]
 * each row is compared to children and a subsequent child is added to sitemapNav
 * @param {the excel sheet as an array of rows} rows 
 */
const createSitemapNav = rows => {
    rows.forEach((row, index, rows) => {
        // current row
        const [, , type, name] = row

        // if title
        if (regexLevelTitle.test(type))
            addTitle(name)
        // if categorie
        if (regexCategorie.test(type)) {
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

// sole global common parent
let sitemapNav = {}
//  main function, returns an object of sitemap navigation field
async function extract(excel) {
    try {
        // the sheet as an array
        const rows = await getRows(excel)
        // creates the sitemap navigation
        createSitemapNav(rows)

        return sitemapNav
    } catch (err) {
        log(`Error occured on extract`)
    }
}

module.exports = extract