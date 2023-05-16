const ExcelJS = require('exceljs')
const workBook = new ExcelJS.Workbook()

// retrieves the sheet
async function getSheet(path, sheet) {
  try {
    await workBook.xlsx.readFile(path)
    return workBook.getWorksheet(sheet)
  } catch (err) {
    log(`Error occured on getData.js function getSheet`)
  }
}

// returns a hardcoded field
function getField() {
  return {
    id: "pregnancyTopics",
    name: "Pregnancy Topics",
    type: "Array"
  }
}

// returns an array of links
function getLinks(sheet, locale) {
  const rows = sheet.getRows(8, 18)
  const links = [];

  // 2 rows make 1 link
  for (let index = 0; index < rows.length; index += 2) {

    // topic
    const title = rows[index].values[3]
    // url
    const url = rows[index + 1].values[3].text

    const link = {
      title: { [locale]: title },
      url: { [locale]: url }
    }

    links.push(link)
  }
  return links;
}

//  returns an object of the excel data 
//  higher order function
async function getData(path, sheetName, locale) {

  const sheet = await getSheet(path, sheetName)
  const field = getField()
  const links = getLinks(sheet, locale)

  return {
    field: field,
    links: links
  }
}

module.exports = getData