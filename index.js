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
// 	title VARCHAR(100)
// );
// INSERT INTO items(title) VALUES('Learn DSA')
// INSERT INTO items(title) VALUES('Go to gym')

let items = []

app.get('/', async (req, res) => {
    const result = await db.query("SELECT * FROM items");
    items = result.rows;
    res.render("index.ejs", {
        todolist: items,
    });
})

// "/new" to enter new to do
app.post('/new', async (req, res) => {
    // console.log(req.body["userInput"]); returns whatever user has written to add
    console.log(`User has written new to do: ${req.body["userInput"]}`);
    //insert this in db & redirect to home page
    const result = await db.query("INSERT INTO items(title) VALUES($1)", [req.body["userInput"]]);
    res.redirect('/');

})

// "/edit" to edit existing to do & update it
app.post('/edit', async (req, res) => {
    //get id of which todo has to be edited
    console.log(`User has to edit to do with id: ${req.body.editBtn}`);

    //edit it in db & redirect to home page
    const getTitle = await db.query("SELECT title FROM items WHERE id=$1", [req.body.editBtn]);

    console.log(`User has to edit to do with name: "${getTitle.rows[0].title}"`);

    //highlight that text & allow user to modify it
})

app.post('/tick', async (req, res) => {
    //to save updated changes in db
    // console.log(req.body);       op:{ doneBtn: '9' }
    console.log(`User has to edited to do with id: ${req.body.doneBtn} as: "${req.body.updatedText}"`);

    //update this modified text in db also
    const result=await db.query("UPDATE items SET title=$1 WHERE id=$2",[req.body.updatedText,req.body.idTask]);
    res.redirect('/');
});

// "/delete" to delete that task
app.post('/delete', async (req, res) => {
    //get id of which todo has to be deleted
    // console.log(req.body.deleteBtn); //returns whatever user has written to add
    console.log(`User has to delete to do with id: ${req.body.deleteBtn}`);

    //delete from db & redirect to home page
    const result = await db.query("DELETE FROM items WHERE id=$1", [req.body.deleteBtn]);
    res.redirect('/');
})

app.listen(port, () => {
    console.log(`Server running on  http://localhost:${port}/`)
})

// in items table :
// delete from items;
// ALTER SEQUENCE public.items_id_seq RESTART WITH 1;
// select * from items;