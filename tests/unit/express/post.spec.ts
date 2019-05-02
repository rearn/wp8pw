/**
 * @jest-environment node
 */

import request from 'supertest';
import app from '../../../srv/test';
import mongoose from 'mongoose';

const removeCollection = () => {
  const connection = mongoose.connection;
  const collections = connection.collections;
  const removeList = [];
  for (const i in collections) {
    if (collections.hasOwnProperty(i)) {
      removeList.push(collections[i].deleteMany({}));
    }
  }
  return Promise.all(removeList);
};

beforeAll(removeCollection);

beforeEach(async () => {
  const connection = mongoose.connection;
  const collections = connection.collections;
  const uri = connection.createCollection('test');
  const counters = connection.createCollection('counters');
  await Promise.all([uri, counters]);
  const uriInsert = collections.test.insertMany([
    {id: 0, addId: 0, uri: 'http://example.com/', type: 0},
    {id: 1, addId: 0, uri: 'http://example.org/test.html', type: 1},
  ]);
  const countersInsert = collections.counters.insertMany([
    {id: 'uri_id', seq: 2},
    {id: 'uri_add_id', seq: 0},
  ]);
  return Promise.all([uriInsert, countersInsert]);
});

afterEach(removeCollection);

afterAll(async () => {
  await mongoose.connection.close();
});

describe('POST', () => {
  it('400', () => {
    return request(app).post('/api/v1/accept/post').expect(400);
  });
});
describe('GET', () => {
  it('path_redirect_long', () => {
    return request(app).get('/hv2zlkml76aj2')
      .then((res) => {
        expect(res.status).toBe(301);
        expect(res.header.location).toBe('http://example.com/');
      });
  });
  it('path_antenna_long', () => {
    return request(app).get('/hjgk26lm7v6qg')
      .then((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toMatch('http://example.org/test.html');
      });
  });
  it('path_redirect_short', () => {
    return request(app).get('/PXWVqYv_gJ0')
      .then((res) => {
        expect(res.status).toBe(301);
        expect(res.header.location).toBe('http://example.com/');
      });
  });
  it('path_antenna_short', () => {
    return request(app).get('/OkyteWz9fQM')
      .then((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toMatch('http://example.org/test.html');
      });
  });
  it('path_error_uri_none', () => {
    return request(app).get('/5LuLnX4l1Ok').expect(404);
  });
  it('path_error_different_path', () => {
    return request(app).get('/1234567890ab').expect(404);
  });
  it('path_error_code_none', () => {
    return request(app).get('/1234567890ab_').expect(404);
  });
  it('path_error_over_52bit', () => {
    return request(app).get('/1234567890a').expect(404);
  });
});
