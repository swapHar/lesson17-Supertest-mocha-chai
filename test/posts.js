import supertest from 'supertest';
import { expect } from 'chai';
import dotenv from 'dotenv';
import { createRandomPost } from '../helpers/post_helper';

// Configuration
dotenv.config();


// Mocha test cases
describe.only(' /post route', () => {
    // Request
    const request = supertest ('https://gorest.co.in/public-api/');
    const token = process.env.USER_TOKEN;

    // Setup
    let userId = null;
    let postId = null;

    // Test
    it('GET /posts', async () => {
        const res = await request.get('posts');
        expect(res.body.data).to.not.be.empty;
        userId = res.body.data[0].user_id;
    });

    it('POST /posts', async function() {
        this.retries(4); // this will try to run test 4 times if it fails but to use this.retries 
                        //we need to explicitely write function() in it(.....) if we decleare function
                        // like arrow function () =>  , then this.retries() does not work
        const data = createRandomPost(userId);
        //console.log(data); 
        const res = await request.post('posts')
            .set('Authorization', `Bearer ${token}`)
            .send(data);
        expect(res.body.data).to.include(data);
        expect(res.body.data).to.have.property('id');

        // Get back the id of the post we just created
        postId = res.body.data.id;
    });

    it('GET /posts/:id', async () => {
        const res = request.get(`posts/${postId}?access-token=${token}`);
        expect((await res).body.data.id).to.eq(postId);
    });

    it('PUT /posts/:id', async () => {
        const data = {
            title: 'This post has changed',
            body: 'This post has new body'
        };

        const res = await request.put(`posts/${postId}`)
            .set('Authorization', `Bearer ${token}`)
            .send(data);

        expect(res.body.data.title).to.eq(data.title);
        expect(res.body.data.body).to.eq(data.body);
    });

    it('DELETE /posts/:id', async () => {
        const res = await request.delete(`posts/${postId}`)
            .set('Authorization', `Bearer ${token}`);
        
        expect (res.body.data).to.eq(null);
    });

});