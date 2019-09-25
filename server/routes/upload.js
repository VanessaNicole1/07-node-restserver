const express = require('express');
const fileUpload = require('express-fileupload');
const app = express();
const Usuario = require('../models/usuario');
const Producto = require('../models/producto');

const fs = require('fs');
const path = require('path');

//default options
app.use(fileUpload({ useTempFiles: true }));

app.put('/upload/:tipo/:id', (request, response) => {

    let tipo = request.params.tipo;
    let id = request.params.id;

    if (!request.files) {

        return response.status(400).json({
            ok: false,
            error: {
                message: 'No se ha seleccionado ningún archivo'
            }
        });
    }

    /**
     * Tipos válidos
     */

    let tiposValidos = ['productos', 'usuarios'];

    if (tiposValidos.indexOf(tipo) < 0) {

        return response.status(400).json({
            ok: false,
            error: {
                message: 'Los tipos permitidos son: ' + tiposValidos.join(',')
            }
        });

    }

    let archivo = request.files.archivo;
    let nombreCortado = archivo.name.split('.');
    let extension = nombreCortado[nombreCortado.length - 1];


    /**
     * Extensiones permitidas
     */

    let extensionesValidas = ['png', 'jpg', 'gif', 'jpeg'];

    if (extensionesValidas.indexOf(extension) < 0) {

        return response.status(400).json({
            ok: false,
            error: {
                message: 'Las extensiones permitidas son: ' + extensionesValidas.join(',')
            }
        });
    }

    /**
     * Cambiar nombre al archivo
     */

    let nombreArchivo = `${id}-${new Date().getMilliseconds()}.${extension}`;


    archivo.mv(`uploads/${ tipo }/${ nombreArchivo }`, (error) => {

        if (error) {
            return response.status(500).json({
                ok: false,
                error
            });
        }

        /**
         * En este punto, la imagen está en el fileSystem
         */

        if (tipo === 'usuarios') {

            imagenUsuario(id, response, nombreArchivo);
        } else {
            imagenProducto(id, response, nombreArchivo);
        }

    });
});



function imagenUsuario(id, response, nombreArchivo) {

    Usuario.findById(id, (error, usuarioDB) => {

        if (error) {
            borrarArchivo(nombreArchivo, 'usuarios');
            return response.status(500).json({
                ok: false,
                error
            });
        }

        if (!usuarioDB) {
            borrarArchivo(nombreArchivo, 'usuarios');
            return response.status(400).json({
                ok: false,
                error: {
                    message: 'El usuario no existe'
                }
            });
        }

        borrarArchivo(usuarioDB.img, 'usuarios');


        usuarioDB.img = nombreArchivo;

        usuarioDB.save((error, usuarioGuardado) => {

            response.json({
                ok: true,
                usuario: usuarioGuardado,
                img: nombreArchivo
            });

        });
    });

}

function imagenProducto(id, response, nombreArchivo) {

    Producto.findById(id, (error, productoDB) => {

        if (error) {
            borrarArchivo(nombreArchivo, 'productos');
            return response.status(500).json({
                ok: false,
                error
            });
        }

        if (!productoDB) {
            borrarArchivo(nombreArchivo, 'productos');
            return response.status(400).json({
                ok: false,
                error: {
                    message: 'El producto no existe'
                }
            });
        }

        borrarArchivo(productoDB.img, 'productos');
        productoDB.img = nombreArchivo;
        productoDB.save((error, productoGuardado) => {

            response.json({
                ok: true,
                producto: productoGuardado,
                img: nombreArchivo
            });

        });
    });
}

function borrarArchivo(nombreImagen, tipo) {

    let pathImagen = path.resolve(__dirname, `../../uploads/${tipo}/${ nombreImagen }`);

    if (fs.existsSync(pathImagen)) {
        fs.unlinkSync(pathImagen);
    }


}

module.exports = app;