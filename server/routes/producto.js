const express = require('express');

const _ = require('underscore');

const { verificarToken } = require('../middlewares/autenticacion');

let app = express();

let Producto = require('../models/producto');


/*====================================
Obtener todos los productos

======================================*/
app.get('/productos', [verificarToken], (request, response) => {

    let desde = request.query.desde || 0;
    desde = Number(desde);

    let limite = request.query.limite || 5;
    limite = Number(limite);

    Producto.find({ disponible: true })
        .skip(desde)
        .limit(limite)
        .populate('categoria', 'descripcion')
        .populate('usuario', 'nombre email')
        .exec((error, listaProductos) => {

            if (error) {
                return response.status(500).json({
                    ok: false,
                    mensaje: 'Ocurrió un problema en el servidor',
                    error
                });
            }

            Producto.count({ disponible: true }, (error, conteoRegistros) => {

                response.json({
                    ok: true,
                    listaProductos,
                    conteo: conteoRegistros
                });

            });

        });

});

app.get('/producto/:id', [verificarToken], (request, response) => {

    let id = request.params.id;

    Producto.findOne({ disponible: true, _id: id })
        .populate('categoria', 'descripcion')
        .populate('usuario', 'nombre email')
        .exec((error, productoDB) => {

            if (error) {
                return response.status(400).json({
                    ok: false,
                    mensaje: 'No existe categoria',
                    error
                });
            }

            if (!productoDB) {
                return response.status(400).json({
                    ok: false,
                    mensaje: 'No se pudo encontrar el producto',
                    error
                });
            }

            response.json({
                ok: true,
                productoDB: productoDB
            });

        });

});


/*====================================
Agregar producto                                 
======================================*/
app.post('/producto', [verificarToken], (request, response) => {

    let body = request.body;

    let producto = new Producto({
        nombre: body.nombre,
        precioUni: body.precioUni,
        descripcion: body.descripcion,
        categoria: body.categoria,
        usuario: request.usuario._id
    });

    producto.save((error, productoDB) => {

        if (error) {
            return response.status(500).json({
                ok: false,
                error
            });
        }



        return response.status(201).json({
            ok: true,
            producto: productoDB

        });
    });
});

app.put('/producto/:id', [verificarToken], (request, response) => {

    let id = request.params.id;

    let body = _.pick(request.body, ['nombre', 'precioUni', 'descripcion']);

    Producto.findByIdAndUpdate(id, body, { new: true, runValidators: true }, (error, productoActualizado) => {

        if (error) {
            return response.status(500).json({
                ok: false,
                mensaje: 'No se pudo modificar el producto',
                error
            });
        }

        if (!productoActualizado) {
            return response.status(400).json({
                ok: false,
                mensaje: 'No se pudo encontrar el producto',
                error
            });
        }

        response.json({
            ok: true,
            producto: productoActualizado
        });
    });
});

app.delete('/producto/:id', [verificarToken], (request, response) => {

    let id = request.params.id;

    Producto.findByIdAndUpdate(id, { disponible: false }, { new: true }, (error, productoEliminado) => {

        if (error) {
            return response.status(400).json({
                ok: false,
                mensaje: 'No se pudo borrar el producto',
                error
            });
        }

        response.json({
            ok: true,
            producto: productoEliminado
        });
    });
});


/*====================================
Buscar productos                                 
======================================*/
app.get('/productos/buscar/:termino', [verificarToken], (request, response) => {


    let termino = request.params.termino;

    /**
     * Expresion regular
     */

    let regex = new RegExp(termino, 'i');

    Producto.find({ nombre: regex })
        .populate('categoria', 'descripcion')
        .exec((error, productos) => {

            if (error) {
                return response.status(400).json({
                    ok: false,
                    mensaje: 'Ocurrió un error',
                    error
                });
            }

            response.json({
                ok: true,
                productos
            });
        });
});










module.exports = app;