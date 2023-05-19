const ExcelJS = require('exceljs')
const log = require('./log')
const fs = require('fs')

// regex
const regexLevelTitle = /^Level Title/i
const regexCategorie = /^Categorie/i
const regexSubCategorie = /^Sub categorie/i
const regexTopic = /^Topic/i
const regexLink = /^Links to/i

// output file path, relative to index.js
const outputFile = 'output/fk-data.json';

// retrieves all rows
async function getRows(path, sheet) {
  try {
    const workBook = new ExcelJS.Workbook()
    await workBook.xlsx.readFile(path)
    return workBook.getWorksheet(sheet).getSheetValues()
  } catch (err) {
    log(`Error occured on getData.js function getSheet`)
  }
}

// level 1: level title
function getLevelTitle(rows, regex) {
  for (let index = 1; index < rows.length; index++) {

    const [, , location, content] = rows[index]

    // adds title if found
    if (regex.test(location)) {
      // initial object - main contentType
      const sitemapNav = {
        name: content,
        categories: [],
        childStartingIndex: index + 2
      }
      return sitemapNav
    }
  }
}

// level 2: categories
function getCategories(rows, sitemapNav, regex) {

  let { childStartingIndex: index } = sitemapNav

  for (index; index < rows.length; index++) {

    const [, , location, content] = rows[index]

    // adds categorie if found
    if (regex.test(location)) {
      const categorie = {
        name: content,
        links: [],
        childStartingIndex: index + 1
      }
      sitemapNav.categories.push(categorie)
    }
  }
}

// level 3: subCategories
function getSubCategories(rows, categories, regexSubCategorie) {
  for (let index = 0; index < categories.length; index++) {

    const categorie = categories[index]
    const subCategorieStartingIndex = categorie.childStartingIndex

    // breaks if no subCategorie found
    if (!regexSubCategorie.test(rows[subCategorieStartingIndex][2]))
      continue

    delete categorie.links
    const subCategories = []

    // looks for subCategories
    for (let j = subCategorieStartingIndex; j < rows.length; j++) {
      // current row
      const [, , location, content] = rows[j]
      // breaks if next category encountered
      if (regexCategorie.test(location))
        break

      // if subCategory found
      if (regexSubCategorie.test(location)) {
        const url = rows[j + 1][3]

        const subCategorie = {
          name: content,
          url: url,
          links: [],
          childStartingIndex: j + 2
        }
        subCategories.push(subCategorie)
      }
    }
    categorie.subCategories = subCategories
  }
}

// level 4: links
// param 'container' can either be a categorie or a subCategorie
function getLinks(rows, container, regex) {

  let index = container.childStartingIndex

  for (index; index < rows.length; index += 2) {
    // topic
    const currentRow = rows[index]
    const [, , currentRowLocation, currentRowContent] = currentRow
    // url
    const nextRow = rows[index + 1] // out of bounds?
    const [, , nextRowLocation, nextRowContent] = nextRow

    // breaks if current row is empty or a categorie or subCategorie
    if (currentRow.length == 0 || regex.test(currentRowLocation))
      break

    // if topic and link
    if (regexTopic.test(currentRowLocation) && regexLink.test(nextRowLocation)) {

      const link = {
        topic: currentRowContent,
        url: nextRowContent
      }
      container.links.push(link);
    }
  }
}

//  returns an object of the excel data 
//  higher order function
async function getData(path, sheetName, locale) {

  const rows = await getRows(path, sheetName)

  // level 1: level title
  const sitemapNav = getLevelTitle(rows, regexLevelTitle)
  // level 2: categories
  getCategories(rows, sitemapNav, regexCategorie)
  const { categories } = sitemapNav
  // level 3: subCategories (if any)
  getSubCategories(rows, categories, regexSubCategorie)
  // level 4: links
  // links can be added to categorie or subCategorie
  categories.forEach(categorie => {
    if ('subCategories' in categorie) {
      const subCategories = categorie.subCategories

      subCategories.forEach(subCategorie => {
        getLinks(rows, subCategorie, regexSubCategorie)
      })
    }
    else
      getLinks(rows, categorie, regexCategorie)
  })

  // outputs the object to the specified json file
  fs.writeFileSync(outputFile, JSON.stringify(sitemapNav, null, 2), 'utf-8');

  return sitemapNav
}

module.exports = getData