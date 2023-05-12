const compareImages = require("resemblejs/compareImages")
const config = require("./config.json");
const fs = require('fs');


const { browsers, options, V3_41_1, V4_44 } = config;

let folderName = 'eliminar-page';
let screenshotsRoot = 'imagenes';

async function executeTest() {
  if (browsers.length === 0) {
    return;
  }
  const resultInfo = []
  const images_3_41_1 = []
  const images_4_44 = []

  for (let b of browsers) {
    if (!['chromium', 'webkit', 'firefox'].includes(b)) {
      return;
    }
    if (!fs.existsSync(`./results/${folderName}`)) {
      fs.mkdirSync(`./results/${folderName}`, { recursive: true });
    }

    fs.readdirSync(`${screenshotsRoot}/${folderName}/${V3_41_1}`).forEach(file => {
      const newName = file.replace('.png', '');
      images_3_41_1.push({
        nombre: `before-${newName}`,
        value: fs.readFileSync(`${screenshotsRoot}/${folderName}/${V3_41_1}/${file}`),
        path: `${screenshotsRoot}/${folderName}/${V3_41_1}/${file}`
      });
      images_4_44.push({
        nombre: `after-${newName}`,
        value: fs.readFileSync(`${screenshotsRoot}/${folderName}/${V4_44}/${file}`),
        path: `${screenshotsRoot}/${folderName}/${V4_44}/${file}`
      })
    });

    let data;
    for (let i = 0; i < images_3_41_1.length; i++) {
      data = await compareImages(
        images_3_41_1[i].value,
        images_4_44[i].value,
        options
      );
      resultInfo.push({
        [b]: {
          compareFile: `${images_3_41_1[i].nombre}-${images_4_44[i].nombre}`,
          compareFilePath: `./compare-${b}-${images_3_41_1[i].nombre}-${images_4_44[i].nombre}.png`,
          isSameDimensions: data.isSameDimensions,
          dimensionDifference: data.dimensionDifference,
          rawMisMatchPercentage: data.rawMisMatchPercentage,
          misMatchPercentage: data.misMatchPercentage,
          diffBounds: data.diffBounds,
          analysisTime: data.analysisTime
        }
      });
      fs.writeFileSync(`./results/${folderName}/compare-${b}-${images_3_41_1[i].nombre}-${images_4_44[i].nombre}.png`, data.getBuffer());
    }
    fs.writeFileSync(`./results/${folderName}/report.html`, createReport(folderName, resultInfo, images_3_41_1, images_4_44));
  }
  fs.copyFileSync('./index.css', `./results/${folderName}/index.css`);
  console.log('------------------------------------------------------------------------------------')
  console.log("Execution finished. Check the report under the results folder")
  return resultInfo;
}
(async () => console.log(await executeTest()))();


function browser(b, resultInfo, images_3_41_1, images_4_44) {
  return `<div class=" browser" id="test0">
    <div class=" btitle">
        <h2>Browser: ${b}</h2>
    </div>
    ${resultInfo.map((dataInfo, index) => {
    return `
              <div class=" btitle">
                <p>Data: ${JSON.stringify(dataInfo)}</p>
              </div>
              <div class="imgline">
                <div class="imgcontainer">
                  <span class="imgname">Reference</span>
                  <img class="img2" src="../../${images_3_41_1[index].path}" id="refImage" label="Reference">
                </div>
                <div class="imgcontainer">
                  <span class="imgname">Test</span>
                  <img class="img2" src="../../${images_4_44[index].path}" id="testImage" label="Test">
                </div>
              </div>
              <div class="imgline">
                <div class="imgcontainer">
                  <span class="imgname">Diff</span>
                  <img class="imgfull" src="${dataInfo[b].compareFilePath}" id="diffImage" label="Diff">
                </div>
              </div>`

  })
    }
  </div>`
}

function createReport(folderName, resultInfo, images_3_41_1, images_4_44) {
  return `
    <html>
        <head>
            <title> VRT Report for ${folderName} </title>
            <link href="index.css" type="text/css" rel="stylesheet">
        </head>
        <body>
            <h1>Report for 
              ${folderName}
            </h1>
            <div id="visualizer">
                ${config.browsers.map(b => browser(b, resultInfo, images_3_41_1, images_4_44))}
            </div>
        </body>
    </html>`
}