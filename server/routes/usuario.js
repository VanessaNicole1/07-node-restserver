const express = require('express');
const bcrypt = require('bcrypt');
const _ = require('underscore');
const Usuario = require('../models/usuario');


const app = express();


app.get('/usuario', function(req, res) {

    let desde = req.query.desde || 0;
    desde = Number(desde);

    let limite = req.query.limite || 5;
    limite = Number(limite);

    Usuario.find({ estado: true }, 'nombre email role estado google img')
        .skip(desde)
        .limit(limite)
        .exec((err, listaUsuarios) => {

            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'No se pudo guardar el usuario',
                    error
                });
            }

            Usuario.count({ estado: true }, (error, conteoRegistros) => {

                res.json({
                    ok: true,
                    listaUsuarios,
                    conteo: conteoRegistros
                });

            });

        });

});

app.post('/usuario', function(req, res) {

    let body = req.body;

    let usuario = new Usuario({
        nombre: body.nombre,
        email: body.correo,
        password: bcrypt.hashSync(body.clave, 10),
        role: body.role
    });


    usuario.save((error, usuarioDB) => {

        if (error) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No se pudo guardar el usuario',
                error
            });
        }

        // usuarioDB.password = null;

        return res.json({
            ok: true,
            usuario: usuarioDB

        });
    });

});

app.put('/usuario/:id', function(req, res) {

    let id = req.params.id;

    let body = _.pick(req.body, ['nombre', 'email', 'img', 'role', 'estado']);

    Usuario.findByIdAndUpdate(id, body, { new: true, runValidators: true }, (error, usuarioEncontrado) => {

        if (error) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No se pudo guardar el usuario',
                error
            });
        }

        res.json({
            ok: true,
            usuario: usuarioEncontrado
        });

    });

});

/*====================================
Eliminado fisicamente                                 
======================================*/
// app.delete('/usuario/:id', function(req, res) {

//     let id = req.params.id;

//     Usuario.findByIdAndRemove(id, (error, usuarioEliminado) => {

//         if (error) {
//             return res.status(400).json({
//                 ok: false,
//                 mensaje: 'No se pudo borrar el usuario',
//                 error
//             });
//         }

//         if (!usuarioEliminado) {

//             return res.status(400).json({
//                 ok: false,
//                 error: {
//                     message: 'Usuario no encontrado'
//                 }
//             });

//         }

//         res.json({
//             ok: true,
//             usuario: usuarioEliminado
//         });
//     });
// });


/*====================================
Eliminar logicamente                                 
======================================*/
app.delete('/usuario/:id', function(req, res) {

    let id = req.params.id;

    Usuario.findByIdAndUpdate(id, { estado: false }, { new: true }, (error, usuarioEliminado) => {

        if (error) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No se pudo borrar el usuario',
                error
            });
        }

        res.json({
            ok: true,
            usuario: usuarioEliminado
        });

    });

});


module.exports = app;