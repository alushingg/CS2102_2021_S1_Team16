DROP TABLE IF EXISTS take_care cascade;
DROP TABLE IF EXISTS period cascade;
DROP TABLE IF EXISTS has cascade;
DROP TABLE IF EXISTS special_requirement cascade;
DROP TABLE IF EXISTS own_pet_belong cascade;
DROP TABLE IF EXISTS pet_owner cascade;
DROP TABLE IF EXISTS can_care cascade;
DROP TABLE IF EXISTS specify_availability cascade;
DROP TABLE IF EXISTS part_time cascade;
DROP TABLE IF EXISTS apply_leave cascade;
DROP TABLE IF EXISTS full_time cascade;
DROP TABLE IF EXISTS care_taker cascade;
DROP TABLE IF EXISTS pcs_admin cascade;
DROP TABLE IF EXISTS users cascade;
DROP TABLE IF EXISTS category cascade;

CREATE TABLE category (
	type VARCHAR
		PRIMARY KEY,
	base_price NUMERIC NOT NULL
);

CREATE TABLE users (
	username VARCHAR 
		PRIMARY KEY,
	password VARCHAR NOT NULL,
	name VARCHAR NOT NULL,
	phone_number INTEGER NOT NULL UNIQUE,
	area VARCHAR NOT NULL
);

CREATE TABLE pcs_admin (
	username VARCHAR
		PRIMARY KEY
		REFERENCES users(username)
		ON DELETE cascade,
	position VARCHAR NOT NULL
);

CREATE TABLE care_taker (
	username VARCHAR
		PRIMARY KEY
		REFERENCES users(username)
		ON DELETE cascade
);

CREATE TABLE full_time (
	username VARCHAR
		PRIMARY KEY
		REFERENCES care_taker(username)
		ON DELETE cascade
);

CREATE TABLE apply_leave (
	username VARCHAR
		REFERENCES full_time(username)
		ON DELETE cascade,
	date DATE,
	reason VARCHAR,
	PRIMARY KEY (username, date)
);

CREATE TABLE part_time (
	username VARCHAR
		PRIMARY KEY
		REFERENCES care_taker(username)
		ON DELETE cascade
);

CREATE TABLE specify_availability (
	username VARCHAR
		REFERENCES part_time(username)
		ON DELETE cascade,
	date DATE,
	PRIMARY KEY (username, date)
);

CREATE TABLE can_care (
	username VARCHAR
		REFERENCES care_taker(username),
	type VARCHAR
		REFERENCES category(type),
	price NUMERIC,
	PRIMARY KEY (username, type)
);

CREATE TABLE pet_owner (
	username VARCHAR
		PRIMARY KEY
		REFERENCES users(username)
		ON DELETE cascade,
	credit_card NUMERIC
);

CREATE TABLE own_pet_belong (
	username VARCHAR
		REFERENCES pet_owner(username)
		ON DELETE cascade,
	name VARCHAR,
	type VARCHAR NOT NULL
		REFERENCES category(type),
	PRIMARY KEY (username, name)
);

CREATE TABLE special_requirement (
	rtype VARCHAR,
	requirement VARCHAR,
	PRIMARY KEY (rtype, requirement)
);

CREATE TABLE has (
 	username VARCHAR,
 	name VARCHAR,
 	rtype VARCHAR,
 	requirement VARCHAR,
 	FOREIGN KEY (username, name) REFERENCES own_pet_belong(username, name),
 	FOREIGN KEY (rtype, requirement) REFERENCES special_requirement(rtype, requirement),
 	PRIMARY KEY (username, name, rtype, requirement)
);

CREATE TABLE period (
	start_date DATE,
	end_date DATE,
	CHECK (start_date <= end_date),
	PRIMARY KEY (start_date, end_date)
);

CREATE TABLE take_care (
	username VARCHAR,
	name VARCHAR,
	start_date DATE,
	end_date DATE,
	ctuname VARCHAR REFERENCES care_taker(username),
	has_paid BOOLEAN,
	daily_price NUMERIC,
	is_successful BOOLEAN NOT NULL DEFAULT FALSE,
	review VARCHAR,
	rating INTEGER CHECK (rating >= 1 AND rating <= 5),
	transfer_method VARCHAR,
	payment_mode VARCHAR,
	FOREIGN KEY (username, name) REFERENCES own_pet_belong(username, name),
	FOREIGN KEY (start_date, end_date) REFERENCES period(start_date, end_date),
	PRIMARY KEY (username, name, start_date, end_date, ctuname)
);
