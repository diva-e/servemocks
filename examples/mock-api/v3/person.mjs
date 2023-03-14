/**
 * This example shows how to create a custom api response that can react to given
 * query parameters (example: `/persons?amount=10`)
 */
export default function ({ query }) {
// Define a function to create a person with some random parameters
  const person = () => {
    return {
      id: Math.floor(Math.random() * 100000),
      hobbies: ['Gardening', 'Skiing', 'Eating'],
      name: `User ${Math.floor(Math.random() * 1200)}`,
    }
  }
  const persons = []
// push as many persons to the persons[] as given by the "amount" query parameter in url
  for (let i = 0; i < query.amount; i++) {
    persons.push(person())
  }
// create a return object
  return {
    meta: {
      title: 'Person object',
      description: 'Some random persons',
    },
    items: persons,
  }
}
