const compareImages = require("resemblejs/compareImages")
const fs = require('fs');
class Compare {
  resultInfo = []
  images_3_41_1 = []
  images_4_44 = []
  constructor(fromRootFolder, escenaryName, browsers, options, V3_41_1Folder, V4_44Folder) {
    this.fromRootFolder = fromRootFolder; // screenshotsRoot
    this.escenaryName = escenaryName; // folderName
    this.browsers = browsers;
    this.options = options;
    this.V3_41_1Folder = V3_41_1Folder;
    this.V4_44Folder = V4_44Folder;
  }

  checkBrowsers() {
    return this.browsers.length > 0;
  }

  async compareImages() {
    for (let b of this.browsers) {
      if (!['chromium', 'webkit', 'firefox'].includes(b)) {
        return false;
      }
      if (!fs.existsSync(`./results/${this.escenaryName}`)) {
        fs.mkdirSync(`./results/${this.escenaryName}`, { recursive: true });
      }

      fs.readdirSync(`${this.fromRootFolder}/${this.escenaryName}/${this.V3_41_1Folder}`).forEach(file => {
        const newName = file.replace('.png', '');
        this.images_3_41_1.push({
          nombre: `before-${newName}`,
          value: fs.readFileSync(`${this.fromRootFolder}/${this.escenaryName}/${this.V3_41_1Folder}/${file}`),
          path: `${this.fromRootFolder}/${this.escenaryName}/${this.V3_41_1Folder}/${file}`
        });
        this.images_4_44.push({
          nombre: `after-${newName}`,
          value: fs.readFileSync(`${this.fromRootFolder}/${this.escenaryName}/${this.V4_44Folder}/${file}`),
          path: `${this.fromRootFolder}/${this.escenaryName}/${this.V4_44Folder}/${file}`
        })
      });

      let data;
      for (let i = 0; i < this.images_3_41_1.length; i++) {
        data = await compareImages(
          this.images_3_41_1[i].value,
          this.images_4_44[i].value,
          this.options
        );
        this.resultInfo.push({
          [b]: {
            compareFile: `${this.images_3_41_1[i].nombre}-${this.images_4_44[i].nombre}`,
            compareFilePath: `./compare-${b}-${this.images_3_41_1[i].nombre}-${this.images_4_44[i].nombre}.png`,
            isSameDimensions: data.isSameDimensions,
            dimensionDifference: data.dimensionDifference,
            rawMisMatchPercentage: data.rawMisMatchPercentage,
            misMatchPercentage: data.misMatchPercentage,
            diffBounds: data.diffBounds,
            analysisTime: data.analysisTime
          }
        });
        fs.writeFileSync(`./results/${this.escenaryName}/compare-${b}-${this.images_3_41_1[i].nombre}-${this.images_4_44[i].nombre}.png`, data.getBuffer());
      }
      fs.writeFileSync(`./results/${this.escenaryName}/report.html`, this.createReport(this.escenaryName, this.resultInfo, this.images_3_41_1, this.images_4_44));
    }
    fs.copyFileSync('./index.css', `./results/${this.escenaryName}/index.css`);
    console.log('------------------------------------------------------------------------------------')
    console.log("Execution finished. Check the report under the results folder")
    return this.resultInfo;
  }

  createReport(folderName, resultInfo, images_3_41_1, images_4_44) {
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

  browser(b, resultInfo, images_3_41_1, images_4_44) {
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
}


module.exports = new Compare();