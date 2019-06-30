-- CREATE DATABASE sbd WITH OWNER postgres;

DROP TABLE IF EXISTS role;
DROP TABLE IF EXISTS review;
DROP TABLE IF EXISTS actor;
DROP TABLE IF EXISTS movie;


CREATE TABLE IF NOT EXISTS movie
(
    id           SERIAL NOT NULL CONSTRAINT movie_pk PRIMARY KEY,
    title        VARCHAR(100),
    runtime      INTEGER,
    release_date INTEGER,
    country      VARCHAR(100)
);

ALTER TABLE movie OWNER TO postgres;
CREATE UNIQUE INDEX IF NOT EXISTS movie_id_uindex ON movie (id);


CREATE TABLE IF NOT EXISTS review
(
    id          SERIAL NOT NULL CONSTRAINT review_pk PRIMARY KEY,
    rating      INTEGER,
    description text,
    movie_id    INTEGER CONSTRAINT review_movie_id_fk REFERENCES movie
);

ALTER TABLE review OWNER TO postgres;
CREATE UNIQUE INDEX IF NOT EXISTS review_id_uindex ON review (id);


CREATE TABLE IF NOT EXISTS actor
(
    id         SERIAL NOT NULL CONSTRAINT actor_pk PRIMARY KEY,
    first_name VARCHAR(50),
    last_name  VARCHAR(50),
    birth_year INTEGER
);

ALTER TABLE actor OWNER TO postgres;
CREATE UNIQUE INDEX IF NOT EXISTS actor_id_uindex ON actor (id);


CREATE TABLE IF NOT EXISTS role
(
    id        SERIAL NOT NULL CONSTRAINT role_pk PRIMARY KEY,
    role_name VARCHAR(50),
    actor_id  INTEGER CONSTRAINT actor_id REFERENCES actor,
    movie_id  INTEGER CONSTRAINT role_movie_id_fk REFERENCES movie
);

ALTER TABLE role OWNER TO postgres;
CREATE UNIQUE INDEX IF NOT EXISTS role_id_uindex ON role (id);
