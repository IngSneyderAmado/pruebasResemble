const config = require("./config.json");
const Compare = require('./compare');

const { browsers, options, V3_41_1, V4_44 } = config;

let screenshotsRoot = 'imagenes';

async function executeTest() {
  const eliminar_page = new Compare(screenshotsRoot, 'eliminar-page', browsers, options, V3_41_1, V4_44)
  if (!eliminar_page.checkBrowsers()) return;
  return await eliminar_page.compareImages();;
}
(async () => console.log(await executeTest()))();