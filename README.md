# PlanPilot

This project is a to-do list web application implemented using the Express.js framework for the backend, PostgreSQL for the database, and EJS (Embedded JavaScript) for the front-end templating.

### Project Structure
1. **Express.js Setup**:
   - **Dependencies**: The project uses `express`, `body-parser`, `pg` (PostgreSQL client), and `ejs`.
   - **Server Initialization**: An Express server is initialized to run on port 3000.

2. **Middleware**:
   - **Static Files**: `express.static('public')` serves static CSS files from the 'public' folder.
   - **Body Parser**: `bodyParser.urlencoded({ extended: true })` is used to parse incoming request bodies.

3. **Database Connection**:
   - A PostgreSQL client is created and connected using credentials defined in the project (`user`, `host`, `database`, `password`, `port`).

4. **Database Schema**:
   - The database contains a table named `items` with columns `id` (primary key) and `title` (task description).

5. **Routes**:
   - **GET `/`**: Fetches all to-do items from the database and renders them on the main page using `index.ejs`.
   - **POST `/new`**: Adds a new to-do item to the database and redirects to the main page.
   - **POST `/edit`**: Retrieves the task to be edited by its `id`, allowing modifications.
   - **POST `/tick`**: Updates an existing to-do item's title in the database based on user input.
   - **POST `/delete`**: Deletes a specified to-do item from the database and redirects to the main page.

### Implementation Details
1. **Initialization**:
   ```javascript
   import express from 'express';
   import bodyParser from 'body-parser';
   import pg from 'pg';
   import ejs from 'ejs';

   const app = express();
   const port = 3000;

   app.use(express.static('public'));
   app.use(bodyParser.urlencoded({ extended: true }));
   ```

2. **Database Connection**:
   ```javascript
   const db = new pg.Client({
       user: 'postgres',
       host: 'localhost',
       database: 'todo',
       password: 'password',
       port: 5432
   });

   db.connect();
   ```

3. **CRUD Operations**:
   - **Fetching Items**:
     ```javascript
     app.get('/', async (req, res) => {
         const result = await db.query("SELECT * FROM items");
         items = result.rows;
         res.render("index.ejs", {
             todolist: items,
         });
     });
     ```
   - **Adding New Item**:
     ```javascript
     app.post('/new', async (req, res) => {
         const result = await db.query("INSERT INTO items(title) VALUES($1)", [req.body["userInput"]]);
         res.redirect('/');
     });
     ```
   - **Editing Item**:
     ```javascript
     app.post('/edit', async (req, res) => {
         const getTitle = await db.query("SELECT title FROM items WHERE id=$1", [req.body.editBtn]);
         console.log(`User has to edit to do with name: "${getTitle.rows[0].title}"`);
     });
     ```
   - **Updating Item**:
     ```javascript
     app.post('/tick', async (req, res) => {
         const result = await db.query("UPDATE items SET title=$1 WHERE id=$2", [req.body.updatedText, req.body.idTask]);
         res.redirect('/');
     });
     ```
   - **Deleting Item**:
     ```javascript
     app.post('/delete', async (req, res) => {
         const result = await db.query("DELETE FROM items WHERE id=$1", [req.body.deleteBtn]);
         res.redirect('/');
     });
     ```

4. **Starting the Server**:
   ```javascript
   app.listen(port, () => {
       console.log(`Server running on http://localhost:${port}/`)
   });
   ```

### EJS Templates
- **index.ejs**:
  - This template renders the list of to-do items dynamically and includes forms for adding, editing, and deleting tasks.

### Summary
This to-do list application allows users to manage tasks efficiently with a simple and intuitive interface. The backend is robust, using Express.js for routing and PostgreSQL for persistent data storage, while EJS enables dynamic content rendering on the front end.
