const ExcelJS = require('exceljs')
const workBook = new ExcelJS.Workbook()

async function getSheet(path, sheet) {
  try {
    await workBook.xlsx.readFile(path)
    return workBook.getWorksheet(sheet)
  } catch (err) {
    console.log(err);
  }
}

function getField() {
  return {
    id: "pregnancyTopics",
    name: "Pregnancy Topics",
    type: "Array"
  }
}

function getLinks(sheet) {
  const rows = sheet.getRows(8, 18)
  const links = [];

  // 2 rows make 1 link
  for (let index = 0; index < rows.length; index += 2) {

    // topic
    const title = rows[index].values[3]
    // url
    const url = rows[index + 1].values[3].text

    const link = {
      title: { 'en-US': title },
      url: { 'en-US': url }
    }

    links.push(link)
  }
  return links;
}

// 'getData' returns excel data converted into an object
//  higher order function 
async function getData(path, sheetName) {

  const sheet = await getSheet(path, sheetName)
  const field = getField()
  const links = getLinks(sheet)

  return {
    field: field,
    links: links
  }
}

module.exports = getData