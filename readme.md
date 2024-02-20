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