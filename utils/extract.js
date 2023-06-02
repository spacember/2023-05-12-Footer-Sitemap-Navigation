const ExcelJS = require('exceljs')
const locale = 'en-US'

// regexen
const regexSitemap = /^Level Title/i
const regexCategorie = /^Categorie/i
const regexSubCategorie = /^Sub categorie/i
const regexLink = /^Topic/i

// global common parent
let sitemapNav = {}

// returns the excel sheet as an array of rows
const getRows = async (excel) => {
    try {
        const { path, sheetName } = excel
        const workBook = new ExcelJS.Workbook()
        await workBook.xlsx.readFile(path)
        return workBook.getWorksheet(sheetName).getSheetValues()
    }
    catch (err) {
        console.log('Error occured on getRows: ' + err)
    }
}

// adds the name of the sitemap navigation to sitemapNav
const addSitemap = (name) => {
    sitemapNav = {
        name: { [locale]: name },
        categories: { [locale]: [] },
    }
}

/**
 * adds a categorie || categorieWithSubCategories to sitemapNav
 * @param {the type of the next row} nextRowType (link || subCategorie)
 */
const addCategorie = (name, nextRowType) => {
    // if categorieWithSubCategories
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

// adds a subCategorie to lastCategorie
const addSubCategorie = (name, url) => {
    const subCategorie = {
        title: { [locale]: name },
        url: { [locale]: typeof url === 'object' ? url.text : url },
        links: { [locale]: [] },
    }
    sitemapNav.categories[locale].at(-1).subCategories[locale].push(subCategorie)
}

// adds a link to lastCategorie || lastCategorie's lastSubCategorie
const addLink = (title, url) => {
    const link = {
        title: { [locale]: title },
        url: { [locale]: typeof url === 'object' ? url.text : url }
    }
    const lastCategorie = sitemapNav.categories[locale].at(-1)
    // if subCategorie
    if ('subCategories' in lastCategorie) {
        const lastSubCategorie = lastCategorie.subCategories[locale].at(-1)
        lastSubCategorie.links[locale].push(link)
    } else
        lastCategorie.links[locale].push(link)
}

/**
 * adds children to sitemapNav
 * children: [sitemapNav, categorie, categorieWithSubCategorie, subCategorie, link]
 * each row is compared to children and a subsequent child is added to sitemapNav
 */
const createSitemapNav = rows => {
    rows.forEach((row, index, rows) => {
        // current row
        const [, , type, name] = row
        // if sitemap
        if (regexSitemap.test(type))
            addSitemap(name)
        // if categorie || categorieWithSubCategorie
        if (regexCategorie.test(type)) {
            const nextRowType = rows[index + 1][2]
            addCategorie(name, nextRowType)
        }
        // if subCategorie
        if (regexSubCategorie.test(type)) {
            const url = rows[index + 1][3]
            addSubCategorie(name, url)
        }
        // if link
        if (regexLink.test(type)) {
            const url = rows[index + 1][3]
            addLink(name, url)
        }
    })
}

// module entry point, returns an object of sitemap navigation field
async function extract(excel) {
    try {
        // the excel sheet as an array
        const rows = await getRows(excel)
        // creates the sitemap navigation
        createSitemapNav(rows)

        return sitemapNav
    } catch (err) {
        log(`Error occured on extract`)
    }
}

module.exports = extract