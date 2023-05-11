const fs = require('fs');
const resemble = require('resemblejs');

const image1Path = 'imagenes/eliminar_post_p3_before.png'; // Ruta a la primera imagen
const image2Path = 'imagenes/eliminar_post_p3.png'; // Ruta a la segunda imagen

// Lee las imágenes
const image1 = fs.readFileSync(image1Path);
const image2 = fs.readFileSync(image2Path);

// Configuración de Resemble.js
const resembleConfig = {
  output: {
    errorColor: {
      red: 255,
      green: 0,
      blue: 255
    },
    errorType: 'movement',
    transparency: 0.3,
    largeImageThreshold: 1200
  },
  scaleToSameSize: true,
  ignore: 'antialiasing'
};

// Compara las imágenes utilizando Resemble.js
resemble(image1)
  .compareTo(image2)
  .ignoreColors()
  .onComplete(function(data) {
    console.log(data); // Imprime los resultados de la comparación
  });
