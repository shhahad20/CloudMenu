CREATE SCHEMA IF NOT EXISTS {{schema_name}};

CREATE TABLE {{schema_name}}.menu(
    id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    description TEXT
);

CREATE TABLE {{schema_name}}.items (
  id SERIAL PRIMARY KEY,
  menu_id INT REFERENCES {{schema_name}}.menus(id),
  name VARCHAR(255),
  price DECIMAL
);
