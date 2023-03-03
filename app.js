const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "moviesData.db");

let db = null;
const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, (request, response) => {
      console.log("server is http://localhost:3000/");
    });
  } catch (e) {
    console.log(`error is ${e.message}`);
    process.exit(1);
  }
};

initializeDbAndServer();

// list of all movie names

const convertDbObjectToResponseObject = (dbObject) => {
  return {
    movieId: dbObject.movie_id,
    directorId: dbObject.director_id,
    movieName: dbObject.movie_name,
    leadActor: dbObject.lead_actor,
  };
};
app.get("/movies/", async (request, response) => {
  const getMovieList = `
    SELECT *
    FROM movie
    ORDER BY movie_id`;
  const movieList = await db.all(getMovieList);
  //   response.send(movieList);

  response.send(
    movieList.map((eachPlayer) => convertDbObjectToResponseObject(eachPlayer))
  );
});

//a movie based on the movie ID
app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getMovie = `
    SELECT *
    FROM movie
    WHERE movie_id = ${movieId}`;
  const movie = await db.get(getMovie);
  response.send(
    movie.map((eachPlayer) => convertDbObjectToResponseObject(eachPlayer))
  );
});

// Creates a new movie
app.post("/movies/", async (request, response) => {
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;

  const getNewMovie = `
   INSERT INTO movie (director_id,movie_name,lead_actor)
   VALUES (${directorId},'${movieName}','${leadActor}')`;
  console.log(getNewMovie); // moviename and leadactor is string char nut directorid id not
  const newMovie = await db.run(getNewMovie);
  response.send("Movie Successfully Added");
});

// Updates the details of a movie
app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;

  const getUpdateMovie = `
   UPDATE movie
   SET director_id = ${directorId},
        movie_name = '${movieName}',
        lead_actor = '${leadActor}'
   WHERE movie_id = ${movieId} `;
  //   console.log(getUpdateMovie); // moviename and leadactor is string char nut directorid id not
  await db.run(getUpdateMovie);
  response.send("Movie Details Updated");
});

// Deletes a movie from the movie
app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;

  const getDeletesMovie = `
   DELETE FROM movie
   WHERE movie_id = ${movieId}`;

  console.log(getDeletesMovie); // moviename and leadactor is string char nut directorid id not
  await db.run(getDeletesMovie);
  response.send("Movie Removed");
});

// list of all directors

app.get("/directors/", async (request, response) => {
  const getdirectorList = `
    SELECT *
    FROM director`;
  const directorList = await db.all(getdirectorList);
  //   response.send(directorList);
  const convertDbObjectToResponseObject = (dbObject) => {
    return {
      directorId: dbObject.director_id,
      directorName: dbObject.director_name,
    };
  };

  response.send(
    directorList.map((eachPlayer) =>
      convertDbObjectToResponseObject(eachPlayer)
    )
  );
});

module.exports = app;

// a list of all movie names directed by a specific director

// app.get("/directors/:directorId/movies/", async (request, response) => {
//   const getdirectorAndMovieList = `
//     SELECT *
//     FROM director`;
//   const directorList = await db.all(getdirectorAndMovieList);
//   response.send();
// });
