// add tools and tool_choice to the chat object
const tools = [
  {
    type: 'function',
    function: {
      name: 'get_time',
      description: 'Get the current time.',
      parameters: {
        type: 'object',
        properties: {},
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'add_new_memory',
      description:
        'Add a new note or piece of information to your memory via a DB.',
      parameters: {
        type: 'object',
        properties: {
          memory: {
            type: 'string',
            description:
              'The note or piece of information about the user to add to the memory.',
          },
        },
        required: ['memory'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_memory',
      description:
        'Retrieve all notes or pieces of information about the user from memory.',
      parameters: {
        type: 'object',
        properties: {},
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'delete_memory',
      description:
        'Delete all notes or pieces of information about the user from memory.',
      parameters: {
        type: 'object',
        properties: {},
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'add_to_profile',
      description: 'Add or change information about the user in their profile.',
      parameters: {
        type: 'object',
        properties: {
          name: {
            type: 'string',
            description: 'The name of the user.',
          },
          nickname: {
            type: 'string',
            description: 'The nickname of the user.',
          },
          s: {
            type: 'string',
          },
          pronouns: {
            type: 'string',
            description: 'The pronouns of the user.',
          },
          age: {
            type: 'number',
            description: 'The age of the user.',
          },
          location: {
            type: 'string',
            description: 'The location of the user.',
          },
        },
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_profile',
      description:
        'Retrieve all information about the user from their profile.',
      parameters: {
        type: 'object',
        properties: {},
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'delete_profile',
      description: 'Delete all information about the user from their profile.',
      parameters: {
        type: 'object',
        properties: {},
      },
    },
  },
]

export default tools
