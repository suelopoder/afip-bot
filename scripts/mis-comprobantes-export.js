const puppeteer = require('puppeteer')
require('dotenv').config()
require('./common-validations').run()

const waitSeconds = (milliseconds) => new Promise(r => setTimeout(r, milliseconds))

function getLastDayOfMonthYear(month, year) {
  return new Date(year, month, 0).getDate()
}

var args = process.argv.slice(2);
if (args.length === 0) {
  console.error('Uso: npm run mis-comprobantes MM-YYYY')
  process.exit(1)
}

const values = args[0].split('-')
const mm = values[0]
const lastDay = getLastDayOfMonthYear(mm, values[1])
const rango = `01/${mm}/2023 - ${lastDay}/${mm}/2023`

async function main() {
  console.log('== Bajando mis comprobantes en el rango', rango, '==')

  // FIXME: doens't work headlessly. Some problem with file download
  // const browser = await puppeteer.launch({ headless: !process.env.DEBUG }); 
  const browser = await puppeteer.launch({ headless: false });
  let page = await browser.newPage();
  await page.goto('https://auth.afip.gob.ar/contribuyente_/login.xhtml');
  
  // wait for page to load
  const nextBtn = '#F1\\:btnSiguiente';
  await page.waitForSelector(nextBtn);
  
  // CUIT
  console.log('Ingresando CUIT')
  await page.type('#F1\\:username', process.env.CUIT);
  await page.click(nextBtn);
  
  // pass
  console.log('Ingresando password')
  const sendBtn = '#F1\\:btnIngresar'
  await page.waitForSelector(sendBtn);
  await page.type('#F1\\:password', process.env.PASS);
  await page.click(sendBtn);

  // Find Service and click it
  console.log('Buscando Mis Comprobantes')
  const servicioInput = '#buscadorInput'
  await page.waitForSelector(servicioInput)
  await page.type(servicioInput, 'Mis Comprobantes')
  await waitSeconds(500)
  const serviciosRes = '#resBusqueda > li > a'
  await page.$eval(serviciosRes, el => el.click())

  // Change to new tab
  console.log('Eligiendo nuevo tab')
  await waitSeconds(2 * 1000)
  const pages = await browser.pages()
  page = pages[2]

  // Click "Emitidos"
  console.log('Eligiendo emitidos')
  const emitidosBtn = '#btnEmitidos'
  await page.waitForSelector(emitidosBtn)
  await page.click(emitidosBtn)

  console.log('Ingresando rango', rango)
  const fecha = '#fechaEmision'
  await page.waitForSelector(fecha)
  await page.$eval(fecha, (el, r) => el.value = r, rango)

  const submit = '#buscarComprobantes'
  await page.waitForSelector(submit)
  await page.click(submit)

  console.log('Click en download')
  const excelBtn = '.buttons-excel'
  await page.waitForSelector(excelBtn)
  await page.$eval(excelBtn, node => node.click())
  await waitSeconds(2000) // wait for download

  await browser.close();
};

main()