# polar

A remake of SBU's Solar to have a cleaner looking site and also provide extra tools for students during class registration

### Requirements

- [Go](http://golang.org) 1.17 or newer
- MongoDB
- npm

## Installation

### Cloning the Repo

```
git clone https://github.com/pak-plau/polar.git
```

### Installing Dependencies (Assuming that you are starting in the root directory of the repo)

```
cd client
npm install
```

### Running the project (Each entry is its own separate terminal)

```
mongod
```

```
cd server
go run .
```

```
cd client
npm start
```
If client is ran on a different machine than the server, edit the ip address of the go server (will be printed in the console running the go server) in `polar/client/src/config.js` and then run npm start

### Login information (Here are some accounts that have been set up)

```
polar id: 114640750
password: password
```

```
polar id: 123456789
password: password
```

Feel free to add to the .csv files in /server
