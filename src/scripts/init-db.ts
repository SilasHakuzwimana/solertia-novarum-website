import { initDatabase, getTableStats, isDatabaseConnected } from '../services/database.service';

async function initializeDatabase() {
  console.log('🚀 Starting database initialization...');
  
  await initDatabase();
  
  if (isDatabaseConnected()) {
    console.log('✅ Database connected successfully!');
    
    // Get table statistics
    const stats = await getTableStats();
    if (stats) {
      console.log('\n📊 Database Tables:');
      stats.forEach((table: any) => {
        console.log(`  - ${table.table_name}: ${table.column_count} columns, ${table.constraint_count} constraints`);
      });
    }
    
    console.log('\n✅ Database initialization complete!');
  } else {
    console.log('⚠️ Database running in memory-fallback mode');
  }
}

// Run the initialization
initializeDatabase().catch(console.error);
