//npm init
//npm install express body-parser axios ejs pg

import express from 'express';
import bodyParser from 'body-parser';
import pg from 'pg';
import ejs from 'ejs';

const app = express();
const port = 3000;

//to serve static css from public folder:
app.use(express.static('public'));

//for body parser
app.use(bodyParser.urlencoded({ extended: true }));

const db = new pg.Client({
    user: 'postgres',
    host: 'localhost',
    database: 'todo',      //my db is named 'todo'
    password: 'password',   //my password
    port: 5432
});

db.connect();   //start connection to db

// CREATE TABLE items(
// 	id SERIAL PRIMARY KEY,
// 	title VARCHAR(10),
// 	user_id INT REFERENCES users(id)
// );
// INSERT INTO items(title) VALUES('Learn DSA')
// INSERT INTO items(title) VALUES('Go to gym')

let items = []
let usersList = []
let currentUserId = 0;

async function getUsers() {
    const result = await db.query("SELECT * FROM users");
    usersList = result.rows;

    //find user having currentUserId
    if (currentUserId === 0) {
        return null;
    }
    else {
        return usersList.find((user) => user.id == currentUserId);
    }

}

app.get('/', async (req, res) => {
    const currentUser = await getUsers();
    console.log("Current user is: " + currentUser);

    const result = await db.query("SELECT * FROM items WHERE user_id=$1 ORDER BY id", [currentUserId]);
    items = result.rows;

    if (currentUserId === 0) {
        res.render("index.ejs", {
            errorMsg: 'Please choose a user first!',
            todolist: items,
            users: usersList,
            IDcurrentUser:currentUserId,
        });
    } else {
        res.render("index.ejs", {
            todolist: items,
            users: usersList,
            IDcurrentUser:currentUserId,
        });
    }
})

// "/new" to enter new to do
app.post('/new', async (req, res) => {
    const currentUser = await getUsers();

    if (currentUserId === 0) {
        items = [];
        res.render("index.ejs", {
            errorMsg: 'Cannot enter new todo. Please create a user first!',
            todolist: items,
            users: usersList,
            IDcurrentUser:currentUserId,
        });
        return;
    }

    // console.log(req.body["userInput"]); returns whatever user has written to add
    console.log(`User has written new to do: ${req.body["userInput"]}`);
    //insert this in db & redirect to home page
    const result = await db.query("INSERT INTO items(title,user_id) VALUES($1,$2)", [req.body["userInput"], currentUserId]);
    res.redirect('/');

})

// "/edit" to edit existing to do & update it
app.post('/edit', async (req, res) => {
    const currentUser = await getUsers();

    //get id of which todo has to be edited
    console.log(`User has to edit to do with id: ${req.body.editBtn}`);

    //edit it in db & redirect to home page
    const getTitle = await db.query("SELECT title FROM items WHERE id=$1 AND user_id=$2", [req.body.editBtn, currentUserId]);

    console.log(`User-${currentUserId} has to edit to do with name: "${getTitle.rows[0].title}"`);

    //highlight that text & allow user to modify it
})

app.post('/tick', async (req, res) => {
    const currentUser = await getUsers();

    //to save updated changes in db
    // console.log(req.body);       op:{ doneBtn: '9' }
    console.log(`User:${currentUserId} has to edited to do with id: ${req.body.doneBtn} as: "${req.body.updatedText}"`);

    //update this modified text in db also
    const result = await db.query("UPDATE items SET title=$1 WHERE id=$2 AND user_id=$3", [req.body.updatedText, req.body.idTask, currentUserId]);
    res.redirect('/');
});

// "/delete" to delete that task
app.post('/delete', async (req, res) => {
    //get id of which todo has to be deleted
    // console.log(req.body.deleteBtn); //returns whatever user has written to add
    console.log(`User:${currentUserId} has to delete to do with id: ${req.body.deleteBtn}`);

    //delete from db & redirect to home page
    const result = await db.query("DELETE FROM items WHERE id=$1 AND user_id=$2", [req.body.deleteBtn, currentUserId]);
    res.redirect('/');
})

//to add new family member
app.post('/member', async (req, res) => {
    const currentUser = await getUsers();
    // console.log(req.body);
    //name=value (html pairs)
    if (req.body.newMem === "create") {
        res.render("newmem.ejs", {
            users: usersList,
        });
    }
    else {
        //else show todos of current user jispe click kiya hai
        currentUserId = req.body.userDeetail; //returns id as value

        console.log("\nUser clicked on a family member button with id= " + req.body.userDeetail);
        res.redirect("/");
    }
})

//to create new memeber profile
app.post('/newMem', async (req, res) => {
    try {
        //store name n color choice in user database
        // CREATE TABLE users(
        //     id SERIAL,
        //     name VARCHAR(20),
        //     color VARCHAR(20)
        // );
        // INSERT INTO users(name,color) VALUES('Akshita','Red')
        console.log(req.body);

        //USE RETURNING KEYWORD :
        const result = await db.query("INSERT INTO users(name,color) VALUES ($1,$2) RETURNING *", [req.body.name, req.body.color])

        //get id of this user
        currentUserId = result.rows[0].id;

        console.log(`\nNew record inserted in users table here with id: ${result.rows[0].id}`);

        res.redirect("/");

    } catch (err) {
        console.error("Some error occurred: ", err.stack);
    }
})

app.listen(port, () => {
    console.log(`Server running on  http://localhost:${port}/`)
})

// in items table :
// delete from items;
// ALTER SEQUENCE public.items_id_seq RESTART WITH 1;
// select * from items;

//view:
// SELECT items.id,items.title,items.user_id,users.name,users.color FROM items
// JOIN users
// ON items.user_id=users.id