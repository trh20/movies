[https://trh20-movies.herokuapp.com](https://trh20-movies.herokuapp.com)

## React App
### `cd react_app`
Install front-end dependencies
### `yarn install`
Build front-end
### `yarn build`

## Flask Service
Setup virtual environment
### `virtualenv env`
### `source env/bin/activate`
Run service
### `python3 app.py`
Running the service will initialize a SQLite file with the rows from `movie_plots.csv`

## Browser
### `http://localhost:5000`

## API 
### `GET /movies`
### `GET /movies/:id`
### `GET /movies/search/:field/:value`
### `POST /movies`
### `PUT /movies/:id`
### `DELETE /movies/:id`

## Heroku
Procfile is for deploying to Heroku