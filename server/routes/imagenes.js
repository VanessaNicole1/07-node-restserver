const express = require('express');
const fs = require('fs');
const path = require('path');
const { verificaTokenImg } = require('../middlewares/autenticacion');

let app = express();

app.get('/imagen/:tipo/:img', [verificaTokenImg], (request, response) => {

    let tipo = request.params.tipo;
    let img = request.params.img;


    let pathImagen = path.resolve(__dirname, `../../uploads/${tipo}/${img}`);

    if (fs.existsSync(pathImagen)) {
        response.sendFile(pathImagen);
    } else {

        let noImagePath = path.resolve(__dirname, '../assets/no-image.jpg');
        response.sendFile(noImagePath);
    }


});


module.exports = app;