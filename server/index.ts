import MongoConnection from './src/config/mongoConnection.ts';
import createExpressApp from './src/config/createExpressApp.ts';
import 'dotenv/config';

const main = async () => {
  // Listen for termination
  process.on('SIGTERM', () => process.exit());

  // Set up the datbase connection
  const dbConnection = await MongoConnection.getInstance();
  dbConnection.open();

  // Instantiate express app with configured routes and middleware
  const app = createExpressApp(dbConnection.createSessionStore());

  // Log the port before starting the server
  const port = app.get('port');
  console.log('Configured port:', port);

  // Instantiate a server to listen on a specified port
  app.listen(port, () => {
    console.log(`Listening on port ${port} 🚀`);
    console.log('  Press Control-C to stop\n');
  });
};

// Run the server
main();
