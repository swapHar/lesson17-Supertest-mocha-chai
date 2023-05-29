import supertest from 'supertest';
import { expect } from 'chai';
import dotenv from 'dotenv';
import { createRandomUser } from '../helpers/user_help';
import { buildExternalHelpers } from '@babel/core';

// Configuration
dotenv.config();

// Request
const request = supertest ('https://gorest.co.in/public-api/');
const token = process.env.USER_TOKEN;

// Mocha test cases
describe('/users route', () => {
    let userID = null;

    it('GET /users',async () => {
        const res = await request.get('users');
        //console.log(res.body.data);
        expect(res.body.data).to.not.be.empty;
    });

    it('GET /users | query parameters - get females', async () => {
        const url = `users?access-token=${token}&gender=female&status=active`;
        const res = await request.get(url);
        //console.log(res.body.data);
        // Loop over each result
        res.body.data.forEach((user) => {
            expect(user.gender).to.eq('female');
            expect(user.status).to.eq('active');
        });
    });

    it('POST /users', async () => {
        const data = createRandomUser();
        const res = await request
            .post('users')
            .set('Authorization', `Bearer ${token}`)
            .send(data);

        //console.log(res.body.data);
        expect(res.body.data).to.include(data);
        expect(res.body.data).to.have.property('id');
        expect(res.body.data).to.have.property('email');
        userID = res.body.data.id;
    });

    it('POST /users | Negative', async () => {
        const data = {};
        const res = await request
            .post('users')
            .set('Authorization', `Bearer ${token}`)
            .send(data);
        
        //console.log(res.body.data);
        expect(res.body.code).to.eq(422);
    });

    it('GET /users/:id | User we just created', async () => {
        const res = await request.get(`users/${userID}?access-token=${token}`);
        //console.log(res.body.data);
        expect(res.body.data.id).to.eq(userID);
    });

    it('PUT /users/:id', async () => {
        const data = {
            name: 'Test user updated'
        };

        const res = await request.put(`users/${userID}`)
            .set('Authorization', `Bearer ${token}`)
            .send(data);

        //console.log(data);
        expect(res.body.data.name).to.equal(data.name);
        expect(res.body.data).to.include(data);
    });

    it('DELETE /users/:id | User we just created',async () => {
        const res = await request.delete(`users/${userID}`)
            .set('Authorization', `Bearer ${token}`);

        expect(res.body.data).to.be.null;
    });

    it('GET /users/:id | Negative', async () =>{
        const res = await request.get(`users/${userID}`);
        expect (res.body.data.message).to.eq('Resource not found');
    });

    it('DELETE /users/:id | Negative', async () => {
        const res = await request.delete(`users/${userID}`)
            .set('Authorization', `Bearer ${token}`);

        expect(res.body.data.message).to.equal('Resource not found');
    });
});