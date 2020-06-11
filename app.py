import sys, logging, csv, os, pandas
from dataclasses import dataclass
from flask import Flask, render_template, url_for, request, redirect, jsonify, send_from_directory
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

# Overriding static_folder to point to the react build
app = Flask(__name__, static_folder='react_app/build')
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///movies.db'
# Using an ORM for development speed and safety
db = SQLAlchemy(app)

# Using dataclass for jsonify
@dataclass
class Movie(db.Model):
    id: int
    year: int
    title: str
    origin_ethnicity: str
    directors: str
    cast: str
    genre: str
    wiki_url: str
    plot: str
    date_created: datetime

    id = db.Column(db.Integer, primary_key=True)
    year = db.Column(db.Integer)
    title = db.Column(db.String(200), nullable=False)
    origin_ethnicity = db.Column(db.String(200), nullable=False)
    directors = db.Column(db.Text(1000), nullable=True)
    cast = db.Column(db.Text(1000), nullable=True)
    genre = db.Column(db.String(200), nullable=False)
    wiki_url = db.Column(db.String(200), nullable=False)
    plot = db.Column(db.Text(1000), nullable=True)
    date_created = db.Column(db.DateTime, default=datetime.utcnow)

    def __repr__(self):
        return '<Movie %r>' % self.id

db.create_all()

# Initialize the database with rows from the provided CSV
columns = ['year', 'title', 'origin_ethnicity', 'directors', 'cast', 'genre', 'wiki_url', 'plot']
chunks = pandas.read_csv('movie_plots.csv', chunksize=1000, names=columns, skiprows=1)
for chunk in chunks:
    chunk.to_sql(name='movie', if_exists='append', index=False, con=db.engine)

# Routes for serving up the React app
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    if path != "" and os.path.exists(app.static_folder + '/' + path):
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.static_folder, 'index.html')

# API Routes
@app.route('/movies', methods=['GET'])
def get_all():
    movies = Movie.query.order_by(Movie.year.desc()).all()
    return jsonify(movies=movies), 200

@app.route('/movies/<int:id>')
def get(id):
    movie = Movie.query.get_or_404(id)
    return jsonify(movie), 200

@app.route('/movies/search/<string:field>/<string:term>')
def search(field, term):
    column = getattr(Movie, field)
    movies = Movie.query.filter(column.like('%' + term + '%')).all()
    return jsonify(movies=movies), 200

@app.route('/movies', methods=['POST'])
def create():
    request_body = request.get_json()
    new_movie = Movie(
        title=request_body['title'],
        year=request_body['year'],
        origin_ethnicity=request_body['origin_ethnicity'],
        directors=request_body['directors'],
        cast=request_body['cast'],
        genre=request_body['genre'],
        wiki_url=request_body['wiki_url'],
        plot=request_body['plot'],
    )

    try:
        db.session.add(new_movie)
        db.session.commit()
        return {"success": True}, 200
    except:
        app.logger.info('Database error: %s', sys.exc_info()[0])
        return {"success": False}, 500

@app.route('/movies/<int:id>', methods=['PUT'])
def update(id):
    request_body = request.get_json()
    movie = Movie.query.get_or_404(id)
    movie.year=request_body['year']
    movie.title=request_body['title']
    movie.origin_ethnicity=request_body['origin_ethnicity']
    movie.directors=request_body['directors']
    movie.cast=request_body['cast']
    movie.genre=request_body['genre']
    movie.wiki_url=request_body['wiki_url']
    movie.plot=request_body['plot']
    
    try:
        db.session.commit()
        return {"success": True}, 200
    except:
        app.logger.info('Database error: %s', sys.exc_info()[0])
        return {"success": False}, 500

@app.route('/movies/<int:id>', methods=['DELETE'])
def delete(id):
    task_to_delete = Movie.query.get_or_404(id)

    try:
        db.session.delete(task_to_delete)
        db.session.commit()
        return {"success": True}, 200
    except:
        app.logger.info('Database error: %s', sys.exc_info()[0])
        return {"success": False}, 500

if (__name__ == "__main__"):
    app.run(debug=True)