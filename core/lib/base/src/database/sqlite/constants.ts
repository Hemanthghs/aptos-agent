export const DB_SCHEMA = `
CREATE TABLE IF NOT EXISTS documents (
    id TEXT PRIMARY KEY NOT NULL,     -- Unique ID, auto-incremented
    content TEXT NOT NULL,                    -- Text content of the document
    embedding BLOB NOT NULL,                  -- Embedding vector stored as a binary blob
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Timestamp when the document was created
    parent_id INTEGER,                        -- Optional parent ID for chunked documents
    is_full_text BOOLEAN DEFAULT false,       -- Flag to differentiate full-text from chunked documents
    FOREIGN KEY (parent_id) REFERENCES documents(id) ON DELETE CASCADE
);


-- Index on content for faster text searches
CREATE INDEX IF NOT EXISTS idx_content ON documents(content);

-- Index on parent_id for hierarchical searches
CREATE INDEX IF NOT EXISTS idx_parent_id ON documents(parent_id);
`;
