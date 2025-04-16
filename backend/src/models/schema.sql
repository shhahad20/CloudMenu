-- ALTER TABLE users
-- ADD COLUMN first_name VARCHAR(255) NOT NULL,
-- ADD COLUMN last_name VARCHAR(255) NOT NULL,
-- ADD COLUMN password VARCHAR(255) NOT NULL,
-- ADD COLUMN phone VARCHAR(255) NOT NULL,
-- ADD COLUMN address VARCHAR(255) NOT NULL,
-- ADD COLUMN country VARCHAR(100) NOT NULL,
-- ADD COLUMN city VARCHAR(100) NOT NULL,
-- MODIFY COLUMN age INT NOT NULL,
-- MODIFY COLUMN email VARCHAR(255) NOT NULL;


-- SHOW TABLES;
-- ALTER TABLE users
--  MODIFY COLUMN role VARCHAR(15) NOT NULL DEFAULT 'User';
--  DROP COLUMN token_expiry ,
--  DROP COLUMN created_at;
-- DROP COLUMN name;

-- UPDATE users SET role = 'superAdmin' WHERE id = 5;


-- SELECT * FROM users;
-- CREATE TABLE pending_users (
--   id INT AUTO_INCREMENT PRIMARY KEY,
--   first_name VARCHAR(255) NOT NULL,
--   last_name VARCHAR(255) NOT NULL,
--   email VARCHAR(255) NOT NULL,
--   password VARCHAR(255) NOT NULL,
--   phone VARCHAR(255),
--   address VARCHAR(255),
--   country VARCHAR(100),
--   city VARCHAR(100),
--   age INT,
--   token VARCHAR(255) NOT NULL, -- Store the verification token
--   token_expiry TIMESTAMP NOT NULL, -- Token expiry time
--   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
-- );

-- CREATE TABLE menus
-- ( id INT AUTO_INCREMENT PRIMARY KEY,
--  name VARCHAR(255) NOT NULL,
--  num_sections INT NOT NULL,
--  num_products INT NOT NULL,
--  description VARCHAR(255) NOT NULL);