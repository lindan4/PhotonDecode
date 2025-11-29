import request from 'supertest';
import path from 'path';
import app from '../index.js';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

describe('Full Upload Integration Test (Photon Decode)', () => {

  afterAll(async () => {
    await pool.end();
  });

  it('should handle complete upload flow from image to database', async () => {
    const imagePath = path.resolve(__dirname, '__fixtures__/valid-1.jpg');

    // 1. Upload
    const uploadResponse = await request(app)
      .post('/api/submissions/upload')
      .attach('image', imagePath);

    expect(uploadResponse.status).toBe(200);
    expect(uploadResponse.body.id).toBeDefined();

    const submissionId = uploadResponse.body.id;

    expect(uploadResponse.body.status).toBe('processed');
    expect(uploadResponse.body.extractionSuccess).toBe(true);
    expect(typeof uploadResponse.body.extractedText).toBe('string');

    // 2. GET list
    const listResponse = await request(app)
      .get('/api/submissions')
      .query({ page: 1, limit: 10 });

    expect(listResponse.status).toBe(200);
    expect(Array.isArray(listResponse.body.submissions)).toBe(true);

    const found = listResponse.body.submissions.find((s: any) => s.id === submissionId);

    expect(found).toBeDefined();
    expect(found.extractionSuccess).toBe(true);

    // 3. GET detail
    const detailResponse = await request(app).get(`/api/submissions/${submissionId}`);

    expect(detailResponse.status).toBe(200);
    expect(detailResponse.body.id).toBe(submissionId);
    expect(detailResponse.body.status).toBe('processed');
    expect(detailResponse.body.extractionSuccess).toBe(true);

    // 4. DB check
    const dbResult = await pool.query(
      'SELECT * FROM image_submissions WHERE id = $1',
      [submissionId]
    );

    expect(dbResult.rows.length).toBe(1);
    const row = dbResult.rows[0];

    expect(row.status).toBe('processed');
    expect(typeof row.extracted_text).toBe('string');
  });
});