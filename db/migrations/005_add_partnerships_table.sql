CREATE TABLE IF NOT EXISTS partnerships (
        id SERIAL PRIMARY KEY,
        company_name VARCHAR(255) NOT NULL,
        contact_name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        project_scope TEXT,
        budget_range VARCHAR(100),
        selected_services TEXT[],
        status VARCHAR(50) DEFAULT 'pending',
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

CREATE INDEX IF NOT EXISTS idx_partnerships_email ON partnerships (email);

CREATE INDEX IF NOT EXISTS idx_partnerships_status ON partnerships (status);

CREATE INDEX IF NOT EXISTS idx_partnerships_created_at ON partnerships (created_at);