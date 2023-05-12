// Requie packages
const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const path = require('path');
const multer = require('multer');
const hbs = require('hbs');

// Create connection
const connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "foodappmob402"
});

// Connect to database
connection.connect(function (err) {
    if (err) throw err;
    console.log('Connected to MySQL database!');
});

// Create Express app
const app = express();
const port = 3000;

// Use body-parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
// View Engine Setup
app.set('view engine', 'hbs');
// Public forder
app.use(express.static('./public'));
// init storage upload image
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/uploads')
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});
// inti upload image
const upload = multer({
    storage: storage,
});
// ---------------- WEB CLIENT ---------------------
app.get('/', function (req, res) {
    connection.query("SELECT * FROM bill", function (err, resultBill, fields) {
        if (err) {
            console.log(err);
            return console.log("Web Client ==> Get list bill error");
        }
        // Get list bill
        const myListBill = JSON.parse(JSON.stringify(resultBill));

        connection.query("SELECT * FROM product", function (err, resultProduct, fields) {
            if (err) {
                console.log(err);
                return console.log("Web Client ==> Get list product error");
            }
            // Get list product
            const myListProduct = JSON.parse(JSON.stringify(resultProduct));
            const data = {
                listBills: myListBill,
                listProducts: myListProduct,
            };
            console.log("Web Client ==> List size bill: " + resultBill.length);
            console.log("Web Client ==> List size product: " + resultProduct.length);
            res.render('index', { data: data });
        });
    });
});
// Add product and load list product
app.post('/insertProduct', upload.single('image'), (req, res, next) => {
    const { name, price } = req.body;
    // Check data input
    if (!name || !price) {
        console.log("Web Client ==> Product name and product price are empty");
        res.redirect('/?status=name-and-price-empty');
        return;
    }
    // Check file image upload
    if (!req.file || !req.file.filename) {
        console.log("Web Client ==> Product image is empty");
        res.redirect('/?status=image-empty');
        return;
    }
    // Check if price is a valid integer
    const parsedPrice = parseInt(price);
    if (isNaN(parsedPrice) || !Number.isInteger(parsedPrice)) {
        console.log("Web Client ==> Product price is not a valid integer");
        res.redirect('/?status=price-not-integer');
        return;
    }
    // Inssert product
    const image = `uploads/${req.file.filename}`;
    const sql = "INSERT INTO product (Image, Name, Price) VALUES (?, ?, ?)";
    connection.query(sql, [image, name, price], (err, result) => {
        if (err) {
            console.log("Web Client ==> Insert product error");
            console.log(err);
            next(err);
        } else {
            console.log("Web Client ==> Insert product successful");
            res.redirect('/?status=insert-success');
        }
    });
});

app.post('/deleteProduct', (req, res) => {
    const { valueBtnDelete } = req.body;
    var sql = "DELETE FROM product WHERE Id = ?";
    connection.query(sql, [valueBtnDelete], function (err, result) {
        if (err) {
            console.log("Web Client ==> Delete product error");
            console.log(err);
            res.redirect('/?status=delete-product-failed');
            return;
        }
        console.log("Web Client ==> Delete product successful");
        res.redirect('/?status=delete-product-success');
    });
});

app.post('/navigatePageUpdate', (req, res) => {
    const { valueBtnUpadte } = req.body;
    connection.query("SELECT * FROM product WHERE Id = ?", [valueBtnUpadte], function (err, result, fields) {
        if (err) {
            console.log("Web Client ==> Update product error");
            console.log(err);
            return;
        }
        if (result.length === 0) {
            console.log("Web Client ==> Object product null");
            return;
        }
        // Parser result to Object Product
        const objectProduct = {
            Id: result[0].Id,
            Name: result[0].Name,
            Image: result[0].Image,
            Price: result[0].Price,
        };
        // Pass data page upadteProduct
        res.render('updateProduct', { object: objectProduct });
    });
});

app.post('/updateProduct', upload.single('image'), (req, res, next) => {
    const { id, name, price } = req.body;
    // Check data input
    if (!name || !price) {
        console.log("Web Client ==> Product name and product price are empty");
        res.redirect('/?status=name-and-price-empty');
        return;
    }
    // Check if price is a valid integer
    const parsedPrice = parseInt(price);
    if (isNaN(parsedPrice) || !Number.isInteger(parsedPrice)) {
        console.log("Web Client ==> Product price is not a valid integer");
        res.redirect('/?status=price-not-integer');
        return;
    }
    if (!req.file || !req.file.filename) {
         // Nếu người dùng không chọn image thì sẽ update tên và giá
        var sql = "UPDATE product SET Name = ?, Price = ? WHERE Id = ?";
        connection.query(sql, [name, price, id], function (err, result) {
            if (err) {
                console.log("Web Client ==> Update product error");
                console.log(err);
                return;
            }
            console.log("Web Client ==> Update product successful");
            res.redirect('/');
        });
        return;
    }
    // nếu người dùng chọn image thì sẽ cập nhật tên , giá , hình ảnh
    const image = `uploads/${req.file.filename}`;
    var sql = "UPDATE product SET Name = ?, Price = ?, Image=? WHERE Id = ?";
    connection.query(sql, [name, price, image, id], function (err, result) {
        if (err) {
            console.log("Web Client ==> Update product error");
            console.log(err);
            return;
        }
        console.log("Web Client ==> Update product successful");
        res.redirect('/');
    });
});
/// End web server  

// --------------------MOBILE CLIENT------------------------------
// LOGIN SYSTEM -- CLEAN DONE
app.post('/login', (req, res) => {
    const { email, password } = req.body;
    const sql = "SELECT * FROM user  WHERE Email=? AND Password=?";
    connection.query(sql, [email, password], function (err, result) {
        if (err) {
            console.log(err);
            console.log("Mobile client => Login system error");
            return res.send("Error");
        }

        if (result.length === 0) {
            console.log("Mobile client => Login system failed");
            return res.send("Failed");
        }

        console.log("Mobile client => Login system successfull with Email: " + email + " and Password: " + password);
        return res.send("Successfully");
    });
});
// REGISTER ACCOUNT -- LEAN-DONE
app.post('/registerAccounts', (req, res) => {
    const { email, fullname, password } = req.body;
    const sql_check_email_exists = "SELECT * FROM user WHERE Email=?";

    connection.query(sql_check_email_exists, [email], function (err, result) {
        if (err) {
            console.log(err);
            return res.send("Error");
        }

        if (result.length > 0) {
            console.log("Mobile client => User aready exists");
            return res.send("User exists");
        }

        const sql_register = "INSERT INTO user (Email, FullName, Password) VALUES (?, ?, ?)";
        connection.query(sql_register, [email, fullname, password], function (err, result) {
            if (err) {
                console.log(err);
                return res.send("Error");
            }
            console.log("Mobile client => Register accounts successful");
            return res.send("Successfully");
        });
    });
});

// GET USER BY EMAIL-DONE
app.post('/getUserByEmail', (req, res) => {
    console.log("Mobile clinet => Get user by email");
    var email = req.body.email;
    var sql = "SELECT * FROM user  WHERE Email='" + email + "'";
    connection.query(sql, function (err, result) {
        if (err) {
            console.log(err);
            return res.send("Error");
        }
        if (result.length > 0) {
            console.log(result);
            return res.json(result);
        }
        console.log("Mobile clinet => User not exists");
        res.send("User Not Exists");
    });
});
// UPDATE FULLNAME USER
app.post('/updateFullName', (req, res) => {
    var email = req.body.email;
    var fullname = req.body.fullname;

    var sql = "SELECT * FROM user  WHERE Email='" + email + "'";
    connection.query(sql, function (err, result) {
        if (err) {
            console.log(err);
            res.send("ERROR");
        } else {
            if (result.length != 0) {
                var sql = "UPDATE user SET FullName = '" + fullname + "' WHERE Email = '" + email + "'";
                connection.query(sql, function (err, result) {
                    if (err) {
                        console.log(err);
                        res.send("ERROR");
                    } else {
                        console.log("Mobile clinet => Update fullname user successful with email: " + email);
                        res.send("Successful");
                    }
                });
            } else {
                console.log("Mobile clinet => User not exists");
                res.send("User Not Exists");
            }
        }
    });
});
// UPDATE PASSWORD USER
app.post('/updatePassword', (req, res) => {
    var email = req.body.email;
    var password = req.body.password;
    console.log("//============================//");
    console.log("CLIENT CHANGE PASSWORD USER: " + email);
    var sql = "SELECT * FROM user  WHERE Email='" + email + "'";
    connection.query(sql, function (err, result) {
        if (err) {
            console.log(err);
            res.send("ERROR");
        } else {
            if (result.length != 0) {
                var sql = "UPDATE user SET Password = '" + password + "' WHERE Email = '" + email + "'";
                connection.query(sql, function (err, result) {
                    if (err) {
                        console.log(err);
                        res.send("ERROR");
                    } else {
                        console.log("UPDATE PASSWORD SUCCESSFUL");
                        res.send("Successful");
                    }
                });
            } else {
                console.log("USER NOT EXISTS");
                res.send("User Not Exists");
            }
        }
    });
});

// GET LIST PRODUCT-DONE
app.post('/listProduct', (req, res) => {
    const sql = "SELECT * FROM product";
    connection.query(sql, function (err, result, fields) {
        if (err) {
            console.log(err);
            return res.send("Error");
        }

        if (result.length > 0) {
            console.log("Mobile client => List prodcut size: " + result.length);
            return res.json(result);
        }

        console.log('Mobile client => List product is null');
        return res.send("List product null");
    });
});
// GET LIST CART BY USER
app.post('/listCart', (req, res) => {
    console.log("-Server: Client get list cart");
    const { email } = req.body;
    const sql = "SELECT cart.Id, product.Name, product.Image,cart.Quantity, product.Price, product.Price * cart.Quantity as 'SumPrice' FROM cart INNER JOIN product ON cart.IdProduct = product.id WHERE cart.IdUser = ?";
    connection.query(sql, email, function (err, result) {
        if (err) {
            console.log(err);
            return res.send("Error");
        }
        if (result.length != 0) {
            console.log("Quatity cart user's :" + email + ": " + result.length);
            return res.json(result);
        } else {
            console.log("Quatity cart user's :" + email + ": 0");
            return res.send("List cart null");
        }
    });
});
// ADD CART-DONE
app.post('/addCart', (req, res) => {
    const { idUser, idProduct, quantity } = req.body;
    const sql = "INSERT INTO cart (IdUser, IdProduct, Quantity) VALUES (?, ?, ?)";
    connection.query(sql, [idUser, idProduct, quantity], function (err, result, fields) {
        if (err) {
            console.log(err);
            return res.send("Error");
        }

        console.log("Mobile client => Add cart successfull");
        return res.send("Successfully");
    });
});

// UPDATE QUANTITY CART
app.post('/updateQuantityCart', (req, res) => {
    console.log("-Server: Client update quantity cart");
    const { id, quantityNew } = req.body;

    sqlCheckIdCart = "SELECT * FROM cart WHERE Id = ?";
    connection.query(sqlCheckIdCart, [id], (err, results) => {
        if (err) {
            console.error(err);
            res.send("Error");
            return;
        }

        if (results.length === 0) {
            res.send("Cart with specified id not found");
            console.log("Cart with specified id not found");
            return;
        }

        const sqlUpdate = "UPDATE cart SET Quantity = ? WHERE cart.Id = ?";
        connection.query(sqlUpdate, [quantityNew, id], (err, result) => {
            if (err) {
                console.error(err);
                res.send("Error");
                return;
            }

            console.log("Update quantity cart successful");
            res.send("Successful");
        });
    });
});
// DELETE CART
app.post('/deleteCart', (req, res) => {
    console.log("-Server: Client deletecart cart");
    const { id } = req.body;
    const sqlDelete = "DELETE FROM cart WHERE Id = ?";
    connection.query(sqlDelete, [id], (err, result) => {
        if (err) {
            console.error(err);
            res.send("Error");
            return;
        }

        if (!result.affectedRows && !result.length) {
            console.log("Cart with specified id not found");
            res.send("Cart with specified id not found");
            return;
        }
        console.log("Delete cart successful");
        res.send("Successful");
    });
});

// DELETE CART BY EMAIL
app.post('/deleteCartByEmail', (req, res) => {
    const { email } = req.body;
    const sqlDelete = "DELETE FROM cart WHERE IdUser = ?";
    connection.query(sqlDelete, [email], (err, result) => {
        if (err) {
            console.error(err);
            res.send("Error");
            return;
        }

        if (!result.affectedRows && !result.length) {
            console.log("Cart with specified id not found");
            res.send("Cart with specified id not found");
            return;
        }
        console.log("Delete cart successful");
        res.send("Successful");
    });
});
// add bill
app.post('/insertBill', (req, res) => {
    const { customerName, dateBuy, total } = req.body
    const sqlInsert = "INSERT INTO bill (CustomerName, DateBuy, Total) VALUES (?, ?, ?)"
    connection.query(sqlInsert, [customerName, dateBuy, total], function (err, result) {
        if (err) {
            console.log("Mobile client => Insert bill error");
            return res.send("Error");
        }
        return res.send("Successful");
    });
});
app.listen(port, () => {
    console.log('Sever is running  http://localhost:' + port);
});