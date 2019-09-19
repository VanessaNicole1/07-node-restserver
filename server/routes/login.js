const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.CLIENT_ID);

const Usuario = require('../models/usuario');


const app = express();

app.post('/login', (req, res) => {

    let body = req.body;

    Usuario.findOne({ email: body.email }, (error, usuarioDB) => {

        if (error) {
            return res.status(500).json({
                ok: false,
                error
            });
        }

        if (!usuarioDB) {

            return res.status(400).json({
                ok: false,
                error: {
                    message: "(Usuario) o contrasena incorrectos"
                }
            });
        }

        if (!bcrypt.compareSync(body.password, usuarioDB.password)) {

            return res.status(400).json({
                ok: false,
                error: {
                    message: "Usuario o (contrasena) incorrectos"
                }
            });
        }

        /**
         * Función para generar el token
         */

        let token = jwt.sign({
            usuario: usuarioDB
        }, process.env.SEED, { expiresIn: process.env.CADUCIDAD_TOKEN })

        res.json({
            ok: true,
            usuario: usuarioDB,
            token
        });
    });
});


/*====================================
Configuraciones de Google  
NOTA: Una función async retorna una promesa                               
======================================*/

async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });
    const payload = ticket.getPayload();
    // console.log(payload.name);
    // console.log(payload.email);
    // console.log(payload.picture);

    return {
        nombre: payload.name,
        email: payload.email,
        img: payload.picture,
        google: true
    }


}



/*====================================
Verify es una función async que devuelve una promesa,
para eso utilizamos el awit para esperar esa respuesta pero
se debe determinar que la funcion que está dentro del POST sea async para utilizar el await.                                 
======================================*/

app.post('/google', async(req, res) => {

    let token = req.body.idtoken;

    let googleUser = await verify(token)
        .catch(error => {
            return res.status(403).json({
                ok: false,
                error

            });
        });

    Usuario.findOne({ email: googleUser.email }, (error, usuarioDB) => {

        if (error) {
            return res.status(500).json({
                ok: false,
                error
            });
        }

        if (usuarioDB) {

            if (!usuarioDB.google) {

                return res.status(400).json({
                    ok: false,
                    error: {
                        message: 'Debe de usar su autenticación normal'
                    }
                });
            } else {

                let token = jwt.sign({
                    usuario: usuarioDB
                }, process.env.SEED, { expiresIn: process.env.CADUCIDAD_TOKEN });

                return res.json({
                    ok: true,
                    usuario: usuarioDB,
                    token
                });

            }
        } else {
            /**
             * Si el usuario no existe en la base de datos
             */

            let usuario = new Usuario();

            usuario.nombre = googleUser.nombre;
            usuario.email = googleUser.email;
            usuario.img = googleUser.img;
            usuario.google = true;
            usuario.password = ':)';

            usuario.save((error, usuarioDB) => {

                if (error) {
                    return res.status(500).json({
                        ok: false,
                        error
                    });
                }

                let token = jwt.sign({
                    usuario: usuarioDB
                }, process.env.SEED, { expiresIn: process.env.CADUCIDAD_TOKEN });

                return res.json({
                    ok: true,
                    usuario: usuarioDB,
                    token
                });
            });
        }
    });
});












module.exports = app;