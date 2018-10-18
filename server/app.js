// Requires
var express = require('express');
var mysql = require('mysql');
var bodyParser = require('body-parser');
const c_connection = require('../config/config').connection;

// Inicializaciones
var connection = mysql.createConnection(c_connection);

var app = express();

// CORS
app.use(function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.header('Access-Control-Allow-Methods', 'POST, GET, PUT, DELETE, OPTIONS');
    next();
});

// Body parser
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


// Importar rutas
var librosRoutes = require('../routes/libros');
var autoresRoutes = require('../routes/autores');
var tematicasRoutes = require('../routes/tematicas');
var comentariosRoutes = require('../routes/comentarios');


// Conexión a la BBDD
connection.connect((err) => {
    if (!err) {
        console.log('BBDD en puerto 3306: \x1b[32m%s\x1b[0m', 'online');
    } else {
        console.log('Error conectando a Mysql Server ...');
        throw err;
    }
});


// Rutas
app.use('/libro', librosRoutes);
app.use('/autor', autoresRoutes);
app.use('/tematica', tematicasRoutes);
app.use('/comentario', comentariosRoutes);

// Escuchar peticiones
app.listen(3000, () => {
    console.log('Express server en puerto 3000: \x1b[32m%s\x1b[0m', 'online');
});