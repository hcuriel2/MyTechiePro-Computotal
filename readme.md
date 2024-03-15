# Computer Guy 
## COMP 3800 Practicum project
### Team Members
- Tristan Engen
- Benjamin Lui
- Maikol Chow Wang 
- Timmy Lau
- Michael Lin



## Build

### Install Node, angular-cli

1. Download and install Node 
    https://nodejs.org/en/download/
2. Install Angluar cli `npm install -g @angular/cli`
3. Install dependencies for frontend and backend. 

We have "ClientFront", "AdminFront", and "Backend" directories and you will need to install all the dependencies for each of the directories seperately. 

### General
```
$ In order to run this project you'll need:
    $ Node version: Node Versions less than or equal to 16.*  (We're using 16.20.2)
    $ Node Version Manager - This will allow you to configure the required Node version for this project

$ Use the following command to set the correct Node version: nvm use 16.20.2
```

### Backend 

```shell
$ cd /Backend
$ npm install
```

### Frontend

```shell
$ cd ../ClientFront        // or AdminFront
$ npm install
```

### Run the server using node

```shell
$ cd ../Backend
$ npm start
```

### Run the front end app

```shell
$ cd ../ClientFront        // or AdminFront
$ ng serve                 // or npm start
```

### Run the front end app (Launching locally)

```shell
$ cd ../ClientFront
$ ng serve --port <specified port>

$ Example: ng serve --port 8080
```