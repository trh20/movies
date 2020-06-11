import React, { useState, useEffect } from 'react';
import LinearProgress from '@material-ui/core/LinearProgress'

import Table from './Table';

function App() {
  const [movies, setMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function getMovies() {
      setIsLoading(true);
      const movies = await fetchMovies();
      setMovies(movies)
      setIsLoading(false);
    }  
    getMovies();
  }, []);

  const fetchMovies = async () => {
    const response = await fetch('/movies');
    const responseBody = await response.json();
    return responseBody.movies;
  }

  const createMovie = async ({ movie }) => {
    const defaultMovie = {
      directors: null,
      cast: null,
      plot: null,
    }
    const newMovie = {...defaultMovie, ...movie};
    const response = await fetch(`/movies`, {
      method: 'POST',
      body: JSON.stringify(newMovie),
      headers: {
        'content-type': 'application/json'
      }
    });
    const responseBody = await response.json();
    return responseBody;
  }

  const updateMovie = async ({ id, movie }) => {
    const response = await fetch(`/movies/${id}`, {
      method: 'PUT',
      body: JSON.stringify(movie),
      headers: {
        'content-type': 'application/json'
      }
    });
    const responseBody = await response.json();
    return responseBody;
  }

  const deleteMovie = async ({ id }) => {
    const response = await fetch(`/movies/${id}`, {
      method: 'DELETE'
    });
    const responseBody = await response.json();
    return responseBody;
  }

  const columns = [
    { title: 'Year', field: 'year' },
    { title: 'Title', field: 'title' },
    { title: 'Origin/Ethnicity', field: 'origin_ethnicity' },
    { title: 'Directors', field: 'directors' },
    { title: 'Cast', field: 'cast' },
    { title: 'Genre', field: 'genre' },
    {
      title: 'Wiki URL',
      field: 'wiki_url',
      render: rowData => 
        <a href={rowData.wiki_url} target={'_blank'} rel={'noopener noreferrer'}>
          <img
            alt='WikiPedia Logo'
            src={'https://upload.wikimedia.org/wikipedia/en/thumb/8/80/Wikipedia-logo-v2.svg/440px-Wikipedia-logo-v2.svg.png'}
            width={30}
          />
        </a>
    }
  ];

  return (
    <div>
      { isLoading && <LinearProgress /> }
      <div style={{ 
        margin: '16px',
        borderRadius: '2px',
        boxShadow: '3px 3px 5px 6px rgba(0, 0, 0, 0,2)'
        }}>
        <Table
          columns={columns}
          data={movies}
          title='Movies'
          options={{
            filtering: true,
            pageSize: 25,
            emptyRowsWhenPaging: false,
            addRowPosition: 'first'
          }}
          detailPanel={rowData => {
            return (
              <div style={{
                margin: '16px',
                padding: '16px',
                backgroundColor: 'white',
                color: 'black',
                borderRadius: '2px',
                boxShadow: '3px 3px 5px 6px rgba(0, 0, 0, 0,2)',
                letterSpacing: '.03em'
              }}>{rowData.plot}</div>
            )
          }}
          editable={{
            onRowAdd: newMovie =>
              new Promise((async (resolve, reject) => {
                debugger;
                const response = await createMovie({ movie: newMovie });
                if (!response.success) {
                  return reject('Error adding movie');
                }
                setMovies([...movies, newMovie]);
                
                resolve();
            })),
            onRowUpdate: (newMovie, oldMovie) =>
              new Promise((async (resolve, reject) => {
                debugger;
                const response = await updateMovie({ id: oldMovie.id, movie: newMovie });
                if (!response.success) {
                  return reject('Error updating movie');
                }
                const dataUpdate = [...movies];
                const index = oldMovie.tableData.id;
                dataUpdate[index] = newMovie;
                setMovies([...dataUpdate]);
                
                resolve();
            })),
            onRowDelete: oldMovie =>
              new Promise((async (resolve, reject) => {
                  const response = await deleteMovie({ id: oldMovie.id });
                  if (!response.success) {
                    return reject('Error deleting movie');
                  }
                  const dataDelete = [...movies];
                  const index = oldMovie.tableData.id;
                  dataDelete.splice(index, 1);
                  setMovies([...dataDelete]);
                  
                  resolve();
              })),
          }}
        />
      </div>
    </div>
  );
}

export default App;



