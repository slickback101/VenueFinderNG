const request = require('supertest');
const app = require('../app');
const { User } = require('../models');

describe('Auth Endpoints', () => {
    beforeEach(async () => {
    await User.destroy({ where: {} });
});

describe('POST /api/v1/auth/register', () => {
    it('should register a new user', async () => {
        const userData = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe'
    };
    
    const response = await request(app)
        .post('/api/v1/auth/register')
        .send(userData)
        .expect(201);
        
        expect(response.body.success).toBe(true);
        expect(response.body.message).toContain('registered successfully');
    });

    it('should not register user with invalid email', async () => {
        const userData = {
        email: 'invalid-email',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe'
    };
        const response = await request(app)
        .post('/api/v1/auth/register')
        .send(userData)
        .expect(400);
        
        expect(response.body.success).toBe(false);
    });
});
});