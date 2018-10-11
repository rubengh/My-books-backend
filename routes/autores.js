var express = require('express');
var routeValidator = require('express-route-validator');
var mysql = require('mysql');

const c_limit = require('../config/config').limit;
const c_offset = require('../config/config').offset;
const c_connection = require('../config/config').connection;

// Inicializaciones
var connection = mysql.createConnection(c_connection);
var app = express();

var tabla = 'mst_autores';

var query = {
    lim:    { isRequired: false },
    offset: { isRequired: false },
    page:   { isRequired: false },
    lang:   { isRequired: false, }
};

var body = {
    nombre:    { isRequired: true }
};

// =============================
// Obtener todos los autores
// =============================
app.get('/', routeValidator.validate({

    'query' : query

}), function(req, resp) {

    var query = '';
    var attr = [];

    query = "SELECT COUNT(*) AS TotalRows FROM ??";
    attr = [tabla];


    query = mysql.format(query, attr);

    console.log(query);
    connection.query(query, function(err, rows) {

        let v_totalRows = rows[0].TotalRows;
        let v_lim = parseInt(c_limit);
        let v_offset = parseInt(c_offset);

        if (err) {
            return err;
        } else {
            if (req.query.lim) {
                v_lim = parseInt(req.query.lim);
            }
            if (req.query.offset) {
                v_offset = parseInt(req.query.offset);
            }
        }

        // v_offset = v_offset + (v_lim * req.query.page);

        var query = '';
        var attr = [];
        
        query = "SELECT * FROM ?? a limit ? OFFSET ?";
        attr = [tabla, v_lim, v_offset];

        query = mysql.format(query, attr);
        console.log(query);
        connection.query(query, function(error, results) {
            if (error) {
                resp.status(400).json({
                    error: error
                });
            }

            resp.status(200).json({
                results: results,
                total_rows: v_totalRows,
                num_pages: ~~(v_totalRows / v_lim)
            });
        });
    });
});

// =============================
// Actualizar un Autor
// =============================
app.put('/:id', routeValidator.validate({

    'params': {
        id: { isRequired: true }
    },
    'body': body

}), function(req, resp) {

    var query = "UPDATE ?? SET nombre = ? WHERE id = ?";
    var attr = [tabla, req.body.nombre, req.params.id];
    query = mysql.format(query, attr);

    console.log(query);

    connection.query(query, function(error, results) {
        if (error) {
            resp.status(400).json({
                error: error
            });
        }

        resp.status(200).json({
            results: results,
        });
    });
});


// =============================
// Obtén un autor
// =============================
app.get('/:id', routeValidator.validate({
    //
    // Sin validator
    //
}), function(req, resp) {

    var query = "SELECT * FROM ?? WHERE id = ?";
    var attr = [tabla, req.params.id];

    query = mysql.format(query, attr);

    console.log(query);

    connection.query(query, function(error, results) {
        if (error) {
            resp.status(400).json({
                error: error
            });
        }

        resp.status(200).json({
            results: results,
        });
    });
});


// =============================
// Crea un autor
// =============================
app.post('/', routeValidator.validate({

    'body': body

}), function(req, resp) {

    var query = "INSERT INTO ?? (nombre) VALUES(?)";
    var attr = [tabla, req.body.nombre];
    query = mysql.format(query, attr);

    console.log(query);

    connection.query(query, function(error, results) {
        if (error) {
            resp.status(400).json({
                error: error
            });
        }

        resp.status(200).json({
            id: results.insertId,
        });
    });
});

// =============================
// Borrar un autor
// =============================
app.delete('/:id', routeValidator.validate({
    //
    // Sin validator
    //
}), function(req, resp) {

    var query = "DELETE FROM ?? WHERE id = ?";
    var table = [tabla, req.params.id];
    query = mysql.format(query, table);

    console.log(query);

    connection.query(query, function(error, results) {
        if (error) {
            resp.status(400).json({
                error: error
            });
        }

        resp.status(200).json({
            deleted: results.affectedRows > 0,
        });
    });
});

module.exports = app;
