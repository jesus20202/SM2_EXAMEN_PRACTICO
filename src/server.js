
process.on('uncaughtException', err => {
  console.log('EVENT : uncaughtException');
  console.log(err.name, err.message,err);
  process.exit(1);
});

require('dotenv').config({path:"./config.env"})
const databaseConnect = require('./config/databaseConnect')
const admin = require('./config/certificateFCM')

async function init(){
  
  await databaseConnect.createConnection(process.env.MONGO_USER_01,process.env.MONGO_PASSWORD_01,process.env.MONGO_NAMEDATABASE_01,process.env.MONGO_USER_CLUSTER_01)


  const {app} = require('./app')
  const getIntanceSocketHandle= require('./controllers/socketController')
  const http = require('http');
  const server = http.createServer(app);
  const port = process.env.PORT || 3000

  getIntanceSocketHandle(server)

  server.listen(port, () => {
    console.log(`App running on port ${port}...`);
  });

  process.on('unhandledRejection', err => {
    console.log('EVENT : unhandledRejection');
    console.log(err.name, err.message);
    console.log(err);
    server.close(() => {
      process.exit(1);
    });
  });

}

init()

