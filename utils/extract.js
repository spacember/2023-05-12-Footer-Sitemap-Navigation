const ExcelJS = require('exceljs')
const log = require("./log");
const locale = 'en-US'

// regexen
const regexCategorie = /^Categorie/i
const regexSubCategorie = /^Sub categorie/i
const regexLink = /^Topic/i

let categories = {
    [locale]: []
}

// returns the excel sheet as an array of rows
const getRows = async (excel) => {
    try {
        const { path, sheetName } = excel
        const workBook = new ExcelJS.Workbook()
        await workBook.xlsx.readFile(path)
        return workBook.getWorksheet(sheetName).getSheetValues()
    }
    catch (err) {
        log(`Error occured on getRows:`)
    }
}

/**
 * adds a categorie || categorieWithSubCategories to categories
 * @param {the type of the next row} nextRowType (link || subCategorie)
 */
const addCategorie = (name, nextRowType) => {
    // if categorieWithSubCategories
    if (regexSubCategorie.test(nextRowType)) {
        const categorieWithSubCategories = {
            title: { [locale]: name },
            subCategories: { [locale]: [] },
        }
        categories[locale].push(categorieWithSubCategories)
    }
    else {
        const categorie = {
            title: { [locale]: name },
            links: { [locale]: [] },
        }
        categories[locale].push(categorie)
    }
}

// adds a subCategorie to lastCategorie
const addSubCategorie = (name, url) => {
    const subCategorie = {
        title: { [locale]: name },
        url: { [locale]: typeof url === 'object' ? url.text : url },
        links: { [locale]: [] },
    }
    categories[locale].at(-1).subCategories[locale].push(subCategorie)
}

// adds a link to lastCategorie || lastCategorie's lastSubCategorie
const addLink = (title, url) => {
    const link = {
        title: { [locale]: title },
        url: { [locale]: typeof url === 'object' ? url.text : url }
    }
    const lastCategorie = categories[locale].at(-1)
    // if subCategorie
    if ('subCategories' in lastCategorie) {
        const lastSubCategorie = lastCategorie.subCategories[locale].at(-1)
        lastSubCategorie.links[locale].push(link)
    } else
        lastCategorie.links[locale].push(link)
}

/**
 * evaluates current row type
 * adds an object of that type to categories
 */
const createCategories = rows => {
    rows.forEach((row, index, rows) => {
        // current row
        const [, , type, name] = row
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

// module entry point: returns an array of categories
async function extract(excel) {
    try {
        const rows = await getRows(excel)
        createCategories(rows)

        return categories
    } catch (err) {
        log(`Error occured on extract`)
    }
}

module.exports = extract