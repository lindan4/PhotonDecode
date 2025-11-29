CREATE TABLE image_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    extracted_text VARCHAR(255),
    extraction_success BOOLEAN,
    quality VARCHAR(50),
    original_image_path TEXT NOT NULL,
    thumbnail_path TEXT,
    image_size INTEGER,
    image_dimensions VARCHAR(50),
    status VARCHAR(50) NOT NULL,  -- e.g., "processed", "failed"
    error_message TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_extracted_text ON image_submissions(extracted_text);
CREATE INDEX idx_created_at ON image_submissions(created_at DESC);