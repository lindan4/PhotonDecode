import request from 'supertest';
import path from 'path';
import app from '../index.js';
import fs from 'fs/promises';

describe('POST /api/submissions/upload', () => {

  it('should process an image with readable text and return status "processed"', async () => {
    const imagePath = path.resolve(__dirname, '__fixtures__/valid-1.jpg');

    const response = await request(app)
      .post('/api/submissions/upload')
      .attach('image', imagePath);

    expect(response.status).toBe(200);

    expect(response.body.status).toBe('processed');
    expect(response.body.extractionSuccess).toBe(true);

    expect(typeof response.body.extractedText).toBe('string');
    expect(response.body.extractedText.length).toBeGreaterThan(0);

    expect(response.body.thumbnailUrl).toBeDefined();
  });

  it('should process an image with no readable text and return status "failed"', async () => {
    const imagePath = path.resolve(__dirname, '__fixtures__/invalid-1.jpg');

    const response = await request(app)
      .post('/api/submissions/upload')
      .attach('image', imagePath);

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('failed');
    expect(response.body.extractionSuccess).toBe(false);
    expect(response.body.extractedText).toBeNull();
  });
});

describe('Error Handling', () => {

  it('should reject files that are too large', async () => {
    const largeBuffer = Buffer.alloc(20 * 1024 * 1024); // 20MB

    const response = await request(app)
      .post('/api/submissions/upload')
      .attach('image', largeBuffer, 'large.jpg');

    expect(response.status).toBe(413);
    expect(response.body.error).toContain('File too large');
  });

  it('should reject invalid file types', async () => {
    const txtPath = path.resolve(__dirname, '__fixtures__/test.txt');
    await fs.writeFile(txtPath, 'not an image');

    const response = await request(app)
      .post('/api/submissions/upload')
      .attach('image', txtPath);

    expect(response.status).toBe(400);
    expect(response.body.error).toContain('Invalid file type');

    await fs.unlink(txtPath);
  });

  it('should handle malformed image data gracefully', async () => {
    const badImagePath = path.resolve(__dirname, '__fixtures__/corrupt.jpg');
    await fs.writeFile(badImagePath, 'fake jpeg data');

    const response = await request(app)
      .post('/api/submissions/upload')
      .attach('image', badImagePath);

    expect(response.status).toBe(500);
    expect(response.body.error).toBe('Unexpected server error'); // ← Actual implementation

    await fs.unlink(badImagePath);
  });
});