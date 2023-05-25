const ExcelJS = require('exceljs')
const log = require('./log')
const fs = require('fs')

// regex
const regexLevelTitle = /^Level Title/i
const regexCategorie = /^Categorie/i
const regexSubCategorie = /^Sub categorie/i
const regexTopic = /^Topic/i
const regexLink = /^Links to/i // optional

// contentTypes
const contentTypes = {
    sitemapNav: {
        name: '',
        categories: [],
    },
    categorie: {
        name: '',
        links: [],
    },
    categorieWithSubCategories: {
        name: '',
        subCategories: [],
    },
    subCategorie: {
        name: '',
        url: '',
        links: [],
    },
    link: {
        topic: '',
        url: ''
    }
}

// output file path, relative to index.js
const outputFile = 'output/fk-data.json';

// retrieves all rows
async function getRows(path, sheet) {
    try {
        const workBook = new ExcelJS.Workbook()
        await workBook.xlsx.readFile(path)
        return workBook.getWorksheet(sheet).getSheetValues()
    } catch (err) {
        log(`Error occured on getData.js function getRows`)
    }
}

const getSitemapNav = (rows, contentTypes) => {

    let sitemapNav = {}

    for (let index = 1; index < rows.length - 1; index++) {

        // current row
        const [, , location, content] = rows[index]
        // next row
        const [, , nextLocation, nextContent] = rows[index + 1]

        // if title
        if (regexLevelTitle.test(location)) {
            sitemapNav = contentTypes.sitemapNav
            sitemapNav.name = content
            continue
        }

        // if categorie
        if (regexCategorie.test(location)) {

            // if categorie with subCategories 
            if (regexSubCategorie.test(nextLocation)) {
                const categorie = Object.assign({}, contentTypes.categorieWithSubCategories)
                categorie.name = content
                sitemapNav.categories.push(categorie)
            }
            // if categorie with no subCategorie
            else {
                const categorie = Object.assign({}, contentTypes.categorie)
                categorie.name = content
                sitemapNav.categories.push(categorie)
            }
            continue
        };

        // if subCategorie
        if (regexSubCategorie.test(location)) {

            const subCategorie = Object.assign({}, contentTypes.subCategorie)
            subCategorie.name = content
            subCategorie.url = nextContent

            // add subCategorie to last categorie
            const lastIndex = sitemapNav.categories.length - 1
            sitemapNav.categories[lastIndex].subCategories.push(subCategorie)

            continue
        }

        // if topic
        if (regexTopic.test(location)) {

            const link = Object.assign({}, contentTypes.link)
            link.topic = content
            link.url = nextContent

            // link can be added to last categorie or last subCategorie
            const lastIndexCategorie = sitemapNav.categories.length - 1
            const lastCategorie = sitemapNav.categories[lastIndexCategorie]

            // adds link to last subCategorie
            if ('subCategories' in lastCategorie) {
                const lastIndexSubCategorie = lastCategorie.subCategories.length - 1
                const lastSubCategorie = lastCategorie.subCategories[lastIndexSubCategorie]

                lastSubCategorie.links.push(link)
            }
            // adds link to last categorie
            else {
                lastCategorie.links.push(link)
            }
            continue
        }
    }
    return sitemapNav
}

//  main function
(async () => {

    const rows = await getRows('../assets/FK_Footer Redesign Final.xlsx', '3rd Level')

    const sitemapNav = getSitemapNav(rows, contentTypes)

    // outputs the object to the specified json file
    fs.writeFileSync('../output/fk-data.json', JSON.stringify(sitemapNav, null, 2), 'utf-8');
})()


// todo: Object.create() vs Object.assign()