const jwt = require('jsonwebtoken');

/*====================================
Verificar token                                 
======================================*/

let verificarToken = (request, response, next) => {

    let token = request.get('token');

    /**
     * En el decoded está todo el payload que es toda la información del usuario.
     */

    jwt.verify(token, process.env.SEED, (err, decoded) => {

        if (err) {
            return response.status(401).json({
                ok: false,
                err: {
                    message: 'Token no válido'
                }
            });
        }

        request.usuario = decoded.usuario;
        next();
    });
};


/*====================================
Verificar admin_role                                 
======================================*/

let verifica_AdminRole = (request, response, next) => {

    let usuario = request.usuario;

    if (usuario.role === "ADMIN_ROLE") {
        next();
    } else {

        return response.json({
            ok: false,
            err: {
                message: 'El usuario no es administrador'
            }
        });
    }
}



module.exports = { verificarToken, verifica_AdminRole };