const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const app = express();

const dbPath = path.join(__dirname, "todoApplication.db");

let db = null;

const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("sever running at http://localhost:3000/");
    });
  } catch (error) {
    console.log(`DB error:${error.message}`);
    process.exit(1);
  }
};
initializeDbAndServer();

app.use(express.json());

//Path: /todos/
//Method: GET

app.get("/todos/", async (request, response) => {
  const { status = "", priority = "", search_q = "" } = request.query;

  const getTodosQuery = `
    SELECT
    *
    FROM
    todo
    WHERE
    status LIKE "%${status}%" AND
    priority LIKE "%${priority}%" AND 
    todo LIKE "%${search_q}%";
    `;
  const dbTodos = await db.all(getTodosQuery);
  response.send(dbTodos);
});

//Path: /todos/:todoId/
//Method: GET

app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;

  const getTodoByIdQuery = `
    SELECT
    *
    FROM 
    todo
    WHERE
    id=${todoId};
    `;
  const dbTodo = await db.get(getTodoByIdQuery);
  response.send(dbTodo);
});

//Path: /todos/
//Method: POST

app.post("/todos/", async (request, response) => {
  const { id, todo, priority, status } = request.body;

  const createTodoQuery = `
    INSERT INTO
    todo(id,todo,priority,status)
    VALUES
    (${id},'${todo}','${priority}','${status}');
    `;
  await db.run(createTodoQuery);
  response.send("Todo Successfully Added");
});

//Path: /todos/:todoId/
//Method: PUT

app.put("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const requestBody = request.body;
  let updatedColumn = "";
  switch (true) {
    case requestBody.status !== undefined:
      updatedColumn = "Status";
      break;
    case requestBody.priority !== undefined:
      updatedColumn = "Priority";
      break;
    case requestBody.todo !== undefined:
      updatedColumn = "Todo";
      break;
  }

  const previousTodoQuery = `
  SELECT
  *
  FROM
  todo
  WHERE
  id=${todoId};
  `;
  const dbPreviousTodo = await db.get(previousTodoQuery);

  const {
    status = dbPreviousTodo.status,
    priority = dbPreviousTodo.priority,
    todo = dbPreviousTodo.todo,
  } = request.body;

  const updateTodoQuery = `
  UPDATE todo
  SET
  todo='${todo}',
  priority='${priority}',
  status='${status}'
  WHERE
  id=${todoId};
  `;
  await db.run(updateTodoQuery);
  response.send(`${updatedColumn} Updated`);
});

//Path: /todos/:todoId/
//Method: DELETE

app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;

  const deleteTodoQuery = `
    DELETE FROM
    todo
    WHERE
    id=${todoId};
    `;
  await db.run(deleteTodoQuery);
  response.send("Todo Deleted");
});
module.exports = app;
