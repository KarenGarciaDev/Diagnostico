export default ({ env }) => ({
  connection: {
    client: env('DATABASE_CLIENT', 'postgres'),
    connection: {
      connectionString: env('DATABASE_URL'),
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
    pool: {
      min: 0,
      max: 10,
    },
  },
});
