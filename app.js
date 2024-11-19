const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json());
let dbPath = path.join(__dirname, "moviesData.db");
let db = null;
const initializer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });

    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};
initializer();
const convertMovieDbObjectToResponseObject = (dbObject) => {
  return {
    movieId: dbObject.movie_id,
    directorId: dbObject.director_id,
    movieName: dbObject.movie_name,
    leadActor: dbObject.lead_actor,
  };
};

const convertDirectorDbObjectToResponseObject = (dbObject) => {
  return {
    directorId: dbObject.director_id,
    directorName: dbObject.director_name,
  };
};

//to get all the movie names and print them all
app.get("/movies/", async (request, response) => {
  const getMovie = `SELECT movie_name FROM movie;`;
  const movies = await db.all(getMovie);
  response.send(
    movies.map((eachMovie) => ({ movieName: eachMovie.movie_name }))
  );
});

app.post("/movies/", async (request, response) => {
  let requestBody = request.body;
  let { directorId, movieName, leadActor } = requestBody;
  const getMovie = `INSERT INTO
   movie(director_id,movie_name,lead_actor) values ('${directorId}','${movieName}','${leadActor}');`;
  const movies = await db.run(getMovie);
  response.send("Movie Successfully Added");
});
/*
app.get("/movies/:movieId/", async (request, response) => {
  let { movieID } = request.params;

  const getMovie = `
    SELECT 
        * 
    FROM 
     movie 
    WHERE 
        movie_id= ${movieID};`;
  const movie = await db.get(getMovie);

  response.send(convertMovieDbObjectToResponseObject(movie));
});
*/
app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getMovieQuery = `
    SELECT 
      *
    FROM 
      movie 
    WHERE 
      movie_id = ${movieId};`;
  const movie = await db.get(getMovieQuery);
  response.send(convertMovieDbObjectToResponseObject(movie));
});

/*
app.put("/movies/:movieId/", async (request, response) => {
  let { directorId, movieName, leadActor } = request.body;
  //let { directorId, movieName, leadActor } = requestBody;
  let { movieID } = request.params;

  const getMovie = `UPDATE movie SET director_id='${directorId}',movie_name='${movieName}',lead_actor='${leadActor}' WHERE movie_id=${movieID};`;

  const movies = await db.run(getMovie);

  response.send("Movie Details Updated");
});
*/

app.put("/movies/:movieId/", async (request, response) => {
  const { directorId, movieName, leadActor } = request.body;
  const { movieId } = request.params;
  const updateMovieQuery = `
            UPDATE
              movie
            SET
              director_id = ${directorId},
              movie_name = '${movieName}',
              lead_actor = '${leadActor}'
            WHERE
              movie_id = ${movieId};`;

  await db.run(updateMovieQuery);
  response.send("Movie Details Updated");
});
/*
app.delete("/movies/:movieId/", async (request, response) => {
  let { movieID } = request.params;

  const getMovie = `DELETE FROM movie WHERE movie_id=${movieID};`;

  const movies = await db.run(getMovie);

  response.send("Movie Removed");
});
*/

app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deleteMovieQuery = `
  DELETE FROM
    movie
  WHERE
    movie_id = ${movieId};`;
  await db.run(deleteMovieQuery);
  response.send("Movie Removed");
});
/*
app.get("/directors/", async (request, response) => {
  const alldirector = `SELECT * FROM director;`;
  const directors = await db.all(alldirector);
  response.send(
    directors.map((directorsnames) =>
      convertDirectorDbObjectToResponseObject(directorsnames)
    )
  );
});
*/

app.get("/directors/", async (request, response) => {
  const getDirectorsQuery = `
    SELECT
      *
    FROM
      director;`;
  const directorsArray = await db.all(getDirectorsQuery);
  response.send(
    directorsArray.map((eachDirector) =>
      convertDirectorDbObjectToResponseObject(eachDirector)
    )
  );
});

/*
app.get("/directors/:directorId/movies/", async (request, response) => {
  let { directorId } = request.params;

  const getMovie = `SELECT movie_name FROM movie WHERE director_id=${directorId};`;
  const movies = await db.get(getMovie);

  response.send(
    movies.map((eachMovie) => ({ movieName: eachMovie.movie_name }))
  );
});
*/

app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const getDirectorMoviesQuery = `
    SELECT
      movie_name
    FROM
      movie
    WHERE
      director_id='${directorId}';`;
  const moviesArray = await db.all(getDirectorMoviesQuery);
  response.send(
    moviesArray.map((eachMovie) => ({ movieName: eachMovie.movie_name }))
  );
});
module.exports = app;
