# Tracking System

A vehicle basic tracking system web api! you can find the web app of this app on [Link](https://github.com/LuPeBreak/tracking-system-web)

## Local Setup
- On root run `pnpm i`
- On root change .env.local.example file to .env.local`
- On root run `docker compose up -d` to create the database.
- On root run `pnpm run db:migrate`
- On root run `pnpm run db:seed` (you can skip this, this is just to seed the database)
- On root run `pnpm run dev`
- Open http://localhost:3333/

## Features

### Authentication

- [x] It should be able to authenticate using e-mail & password;
- [x] It should be able to create an account (e-mail, name and password);

### Vehicles

- [x] It should be able to get vehicles within a organization;
- [x] It should be able to create a new vehicle (name, type, localization, description);
- [x] It should be able to update a vehicle (name, type, localization, description);
- [x] It should be able to delete a vehicle;

