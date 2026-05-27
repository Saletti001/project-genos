const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres:IOdnNScusaOiqNr5@db.xoxkapvondvtlftecwcv.supabase.co:5432/postgres'
});

client.connect()
  .then(() => {
    console.log('Connected to DB');
    return client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'market_listings';
    `);
  })
  .then(res => {
    console.log('Columns in market_listings:');
    res.rows.forEach(row => {
      console.log(`- ${row.column_name}: ${row.data_type} (Nullable: ${row.is_nullable})`);
    });
    client.end();
  })
  .catch(err => {
    console.error('Error querying DB:', err);
    client.end();
  });
