/**
 * PUERTO
 */
process.env.PORT = process.env.PORT || 3000;


/*====================================
ENTORNO                                 
======================================*/

process.env.NODE_ENV = process.env.NODE_ENV || 'dev';

/*====================================
Fecha de expiración del token
60 segundos
60 minutos
24 horas
30 dias                                 
======================================*/
process.env.CADUCIDAD_TOKEN = '48h';


/*====================================
SEED de autenticación para el token                                 
======================================*/
process.env.SEED = process.env.SEED || 'este-es-es-seed-desarrollo';

/*====================================
BASE DE DATOS                                 
======================================*/

let urlDB;

if (process.env.NODE_ENV === 'dev') {

    urlDB = 'mongodb://localhost:27017/cafe'

} else {

    urlDB = process.env.MONGO_URI
}
process.env.URLDB = urlDB;



/*====================================
GOOGLE CLIENT ID                                 
======================================*/

process.env.CLIENT_ID = process.env.CLIENT_ID || '753276074797-2r9t9d4d5tbha4tkviaj38n303maf1j2.apps.googleusercontent.com'