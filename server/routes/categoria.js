const express = require('express');
const _ = require('underscore');

let { verificarToken, verifica_AdminRole } = require('../middlewares/autenticacion');

let app = express();

let Categoria = require('../models/categoria');


/**
 * Obtener todas las categorias /categoria
 * Obtener una categoria por id de la categoria /categoria/id
 * Crear nueva categoria
 * Modificar la categoria
 * Borrar categoria
 */


/*====================================
Obtener todas las categorias                                 
======================================*/
app.get('/categoria', [verificarToken], (request, response) => {

    Categoria.find()
        .sort('descripcion')
        .populate('usuario', 'nombre email')
        .exec((error, listaCategorias) => {

            if (error) {
                return response.status(400).json({
                    ok: false,
                    mensaje: 'No se pudo listar las categorias',
                    error
                });
            }

            response.json({
                ok: true,
                listaCategorias
            });
        });
});

/*====================================
Obtener una categoria específica por id                                 
======================================*/

app.get('/categoria/:id', [verificarToken], (request, response) => {

    let id = request.params.id;

    Categoria.findById(id, (error, categoriaDB) => {


        if (error) {
            return response.status(400).json({
                ok: false,
                mensaje: 'No existe categoria',
                error
            });
        }

        if (!categoriaDB) {
            return response.status(400).json({
                ok: false,
                mensaje: 'No se pudo encontrar la categoria',
                error
            });
        }

        response.json({
            ok: true,
            categoriaDB
        });
    });
});


/*====================================
Ingresar una nueva categoria                                 
======================================*/

app.post('/categoria', [verificarToken], (request, response) => {


    let body = request.body;

    let categoria = new Categoria({
        descripcion: body.descripcion,
        usuario: request.usuario._id
    });

    categoria.save((error, categoriaDB) => {

        if (error) {
            return response.status(500).json({
                ok: false,
                error
            });
        }

        if (!categoriaDB) {
            return response.status(400).json({
                ok: false,
                mensaje: 'No se pudo guardar la categoria',
                error
            });
        }

        return response.json({
            ok: true,
            categoria: categoriaDB

        });
    });
});


/*====================================
Actualizar                                  
======================================*/
app.put('/categoria/:id', [verificarToken], (request, response) => {

    let id = request.params.id;

    let body = _.pick(request.body, ['descripcion']);

    Categoria.findByIdAndUpdate(id, body, { new: true, runValidators: true }, (error, categoriaEncontrada) => {

        if (error) {
            return response.status(500).json({
                ok: false,
                mensaje: 'No se pudo modificar la categoria',
                error
            });
        }

        if (!categoriaEncontrada) {
            return response.status(400).json({
                ok: false,
                mensaje: 'No se pudo encontrar la categoria',
                error
            });
        }

        response.json({
            ok: true,
            categoria: categoriaEncontrada
        });
    });
});


/*====================================
Eliminar fisicamente la categoria                                 
======================================*/
app.delete('/categoria/:id', [verificarToken, verifica_AdminRole], (request, response) => {

    let id = request.params.id;

    Categoria.findByIdAndRemove(id, (error, categoriaEliminada) => {

        if (error) {
            return response.status(400).json({
                ok: false,
                mensaje: 'No se pudo eliminar la categoria',
                error
            });
        }

        if (!categoriaEliminada) {

            return res.status(400).json({
                ok: false,
                error: {
                    message: 'Categoria no encontrada'
                }
            });
        }

        response.json({
            ok: true,
            mensaje: 'Categoria borrada',
            categoria: categoriaEliminada
        });
    });
});





module.exports = app;