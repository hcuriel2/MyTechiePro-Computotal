# MongoDB Commands

## mongodump command

### Ask for username & password to the db manager.
``` bash
mongodump --uri="mongodb+srv://<username>:<password>@cluster0.r8wd4.mongodb.net" --db=<dbname>
```

## used to dump 'test' db into /dump (default) folder.
``` bash
mongodump --uri="mongodb+srv://<username>:<password>@cluster0.r8wd4.mongodb.net" --db=test
```



## mongorestore commands

### restore command will restore the dump data into your local db as a default

``` bash
mongorestore dump/
```

### command to restore a database from a dump file you made.
``` bash
mongorestore --uri="mongodb+srv://<username>:<password>@cluster0.r8wd4.mongodb.net" --db=dev <directory path you want to restore>
```

### command we used to restore test database to dev 
``` bash
mongorestore --uri="mongodb+srv://<username>:<password>@cluster0.r8wd4.mongodb.net" --db=dev ~/dump/test
```