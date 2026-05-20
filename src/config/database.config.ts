console.log('Loading database configuration...');
console.log(process.env.MONGODB_URI);

export const databaseConfig = {
  uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/ecom',
};
