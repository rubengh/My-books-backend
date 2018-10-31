var express = require('express');
var routeValidator = require('express-route-validator');
var mysql = require('mysql');

const c_limit = require('../config/config').limit;
const c_offset = require('../config/config').offset;
const c_connection = require('../config/config').connection;

// Inicializaciones
var connection = mysql.createConnection(c_connection);
var app = express();

var tabla  = 'comentarios';
var tabla2 = 'mst_usuarios';

var query = {
    lim:      { isRequired: false },
    offset:   { isRequired: false },
    page:     { isRequired: false },
    lang:     { isRequired: false },
    id_libro: { isRequired: false}
};

var body = {
    comentario: { isRequired: false },
    id_libro  : { isRequired: false },
    id_usuario: { isRequired: false },
};

// =============================
// Obtener todos los comentarios
// =============================
app.get('/', routeValidator.validate({

    'query' : query,
    'body'  : body

}), function(req, resp) {

    var query = '';
    var attr = [];

    console.log('req.query.id_libro : ', req.query.id_libro);

    if (req.query.id_libro) {
        query = "SELECT COUNT(*) AS TotalRows FROM ?? a WHERE a.id_libro = ?";
        attr = [tabla, req.body.id_libro];
    }
    else {
        query = "SELECT COUNT(*) AS TotalRows FROM ?? a";
        attr = [tabla];
    }


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

        if (req.query.id_libro) {
            query = "SELECT a.*, concat(b.nombre, ' ' , b.apellidos) as nombre_usuario FROM ?? a JOIN ?? b ON a.id_usuario = b.id WHERE a.id_libro = ? limit ? OFFSET ?";
            attr = [tabla, tabla2, req.query.id_libro, v_lim, v_offset];
        }
        else {
            query = "SELECT * FROM ?? a limit ? OFFSET ?";
            attr = [tabla, v_lim, v_offset];
        }        

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
// Actualizar un Comentario
// =============================
app.put('/:id', routeValidator.validate({

    'params': {
        id: { isRequired: true }
    },
    'body': body

}), function(req, resp) {

    var query = "UPDATE ?? SET comentario = ? WHERE id = ?";
    var attr = [tabla, req.body.comentario, req.params.id];
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
// Obtén un comentario
// =============================
app.get('/:id', routeValidator.validate({
    //
    // Sin validator
    //
}), function(req, resp) {

    var query = "SELECT * FROM ?? WHERE id = ?";
    var attr = [tabla, req.params.id];
    
    // var query = "SELECT *  FROM ?? c, ?? lc  WHERE c.id = lc.id_comentario AND lc.id_libro = ?";
    // var attr = [tabla, tabla2, req.params.id];

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
// Crea un Comentario
// =============================
app.post('/', routeValidator.validate({

    'body': body

}), function(req, resp) {

    var query = "INSERT INTO ?? (comentario, id_usuario, id_libro) VALUES(?,?,?)";
    var attr = [tabla, req.body.comentario, req.body.id_usuario, req.body.id_libro];
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
// Borrar un Comentario
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