import { serveMocks } from './serve-mocks' // Link to your server file
import supertest from 'supertest'

describe('serve-mocks', () => {
  let request

  beforeAll(() => {
    const app = serveMocks('examples/mock-api', undefined, undefined, {
      requestDelay_ms: 0,
    }) // init without port and hostname
    request = supertest(app)
  })

  it('should serve user 1 json from test data', async () => {
    expect.assertions(3) // number of expect calls in this test

    const response = await request.get('/v1/user/1')
    const expectedUser = {
      id: 1,
      firstName: 'Max',
      lastName: 'Mustermann',
    }

    expect(response.status).toBe(200)
    expect(response.headers['content-type']).toBe('application/json')
    expect(response.body).toEqual(expectedUser)
  })

  it('should respond with specified data when posting valid user', async () => {
    expect.assertions(3) // number of expect calls in this test

    const response = await request.post('/v1/user').send({ foo: 'bar' })

    const expectedResponse = {
      id: 20320,
      firstName: 'Lord',
      lastName: 'Bar',
    }

    expect(response.status).toBe(201)
    expect(response.headers['content-type']).toBe('application/json; charset=utf-8')
    expect(response.body).toEqual(expectedResponse)
  })

  it('should respond with 200 when deleting user', async () => {
    expect.assertions(1) // number of expect calls in this test

    const response = await request.delete('/v1/user')

    expect(response.status).toBe(200)
  })

  it('should respond with 201 when posting valid user', async () => {
    expect.assertions(3) // number of expect calls in this test

    const response = await request.post('/v2/user').send({
      id: 42,
      firstName: 'Valid first name',
      lastName: 'Valid last name',
    })

    const expectedResponse = {
      id: 20320,
      firstName: 'Lord',
      lastName: 'Bar',
    }

    expect(response.status).toBe(201)
    expect(response.headers['content-type']).toBe('application/json; charset=utf-8')
    expect(response.body).toEqual(expectedResponse)
  })

  it('should respond with 201 when putting valid user', async () => {
    expect.assertions(3) // number of expect calls in this test

    const response = await request.put('/v2/user').send({
      id: 42,
      firstName: 'Valid first name',
      lastName: 'Valid last name',
    })

    const expectedResponse = {
      id: 20320,
      firstName: 'Lord',
      lastName: 'Bar',
    }

    expect(response.status).toBe(201)
    expect(response.headers['content-type']).toBe('application/json; charset=utf-8')
    expect(response.body).toEqual(expectedResponse)
  })

  it('should respond with 200 when patching valid user', async () => {
    expect.assertions(3) // number of expect calls in this test

    const response = await request.patch('/v2/user').send({
      id: 42,
      firstName: 'Valid first name',
      lastName: 'Valid last name',
    })

    const expectedResponse = {
      id: 20320,
      firstName: 'Lord',
      lastName: 'Bar',
    }

    expect(response.status).toBe(200)
    expect(response.headers['content-type']).toBe('application/json; charset=utf-8')
    expect(response.body).toEqual(expectedResponse)
  })

  it('should respond with request body if option is set', async () => {
    expect.assertions(3) // number of expect calls in this test

    const randomId = Math.floor(Math.random() * 100)
    const requestBody = {
      id: randomId,
      author: 'Lorem Ipsum',
    }

    const response = await request.post('/v2/book').send(requestBody)

    expect(response.status).toBe(201)
    expect(response.headers['content-type']).toBe('application/json; charset=utf-8')
    expect(response.body).toEqual(requestBody)
  })

  it('should respond with 422 unprocessable entity when posting invalid user', async () => {
    expect.assertions(1) // number of expect calls in this test

    const response = await request.post('/v2/user').send({
      id: 2332,
      firstName: 3232, // numeric value is incorrect
    })

    expect(response.status).toBe(422)
  })

  it('should delay response to post requests for 2 seconds', async () => {
    expect.assertions(3) // number of expect calls in this test

    const timeBefore = Date.now()
    const response = await request.post('/v1/user')
    const msEllapsed = Date.now() - timeBefore

    expect(response.status).toBe(201)
    expect(msEllapsed > 1900).toBe(true)
    expect(msEllapsed < 2100).toBe(true)
  })

  it('should serve xml data', async () => {
    expect.assertions(3) // number of expect calls in this test

    const response = await request.get('/v2/sitemap')

    expect(response.status).toBe(200)
    expect(response.headers['content-type']).toBe('application/xml')
    expect(response.text).toContain('<?xml version="1.0" encoding="utf-8"?>')
  })

  it('should respond with 404 if endpoint does not exist', async () => {
    expect.assertions(1) // number of expect calls in this test

    const response = await request.get('/v2/some/undefined/endpoint')

    expect(response.status).toBe(404)
  })

  it('should serve image binary (png) and preserve file extension', async () => {
    expect.assertions(2) // number of expect calls in this test

    const response = await request.get('/image/logo.png')

    expect(response.status).toBe(200)
    expect(response.headers['content-type']).toBe('image/png')
  })

  it('should accept xml on post endpoint', async () => {
    expect.assertions(3) // number of expect calls in this test

    const response = await request.post('/v2/sitemap')
      .set('Content-Type', 'application/xml')
      .send('<?xml version="1.0" encoding="utf-8"?>')

    expect(response.status).toBe(201)
    expect(response.headers['content-type']).toContain('application/xml')
    expect(response.text).toContain('<?xml version="1.0" encoding="utf-8"?>')
  })

  it('should serve html files', async () => {
    expect.assertions(3) // number of expect calls in this test

    const response = await request.get('/info')

    expect(response.status).toBe(200)
    expect(response.headers['content-type']).toBe('text/html')
    expect(response.text).toContain('<title>Servemocks</title>')
  })

  it('should serve javascript files', async () => {
    expect.assertions(3) // number of expect calls in this test

    const response = await request.get('/assets/bundle.js')

    expect(response.status).toBe(200)
    expect(response.headers['content-type']).toBe('text/javascript')
    expect(response.text).toContain('console.log(\'Hello World\')')
  })

  it('should serve css files and keep file extension', async () => {
    expect.assertions(3) // number of expect calls in this test

    const response = await request.get('/style.css')

    expect(response.status).toBe(200)
    expect(response.headers['content-type']).toBe('text/css')
    expect(response.text).toContain('background-color: beige;')
  })

  it('should create dynamic response (loading as es module / dynamic import)', async () => {
    expect.assertions(4) // number of expect calls in this test

    const response = await request.get('/v3/person?amount=42')

    expect(response.status).toBe(200)
    expect(response.headers['content-type']).toBe('application/json')
    expect(response.body.items).toBeDefined()
    expect(response.body.items.length).toBe(42)
  })

  it('should create error response if dynamic module execution failed', async () => {
    expect.assertions(3) // number of expect calls in this test

    const response = await request.get('/v3/invalid-script')

    expect(response.status).toBe(500)
    expect(response.headers['content-type']).toBe('application/json')
    expect(response.body.error).toBeDefined()
  })

  it('should create dynamic response (loading as eval-like script)', async () => {
    const app = serveMocks('examples/mock-api', undefined, undefined, {
      dynamicMockResponsesMode: 'eval',
    }) // init without port and hostname
    request = supertest(app)

    expect.assertions(4) // number of expect calls in this test

    const response = await request.get('/v3/person?amount=42')

    expect(response.status).toBe(200)
    expect(response.headers['content-type']).toBe('application/json')
    expect(response.body.items).toBeDefined()
    expect(response.body.items.length).toBe(42)
  })

  it('should create error response if script execution failed', async () => {
    const app = serveMocks('examples/mock-api', undefined, undefined, {
      dynamicMockResponsesMode: 'eval',
    }) // init without port and hostname
    request = supertest(app)

    expect.assertions(3) // number of expect calls in this test

    const response = await request.get('/v3/invalid-script')

    expect(response.status).toBe(500)
    expect(response.headers['content-type']).toBe('application/json')
    expect(response.body.error).toBeDefined()
  })
})
