const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API de Artículos',
      version: '1.0.0',
      description: 'API REST para gestión de artículos y listas',
      contact: {
        name: 'Soporte API',
        email: 'soporte@example.com'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Servidor de desarrollo'
      }
    ],
    components: {
      schemas: {
        Articulo: {
          type: 'object',
          required: ['codart'],
          properties: {
            codart: {
              type: 'number',
              description: 'Código del artículo',
              example: 1
            },
            npm: {
              type: 'string',
              description: 'Nombre del artículo',
              example: 'LEVETIRACETAM 500 MG COMPRIMIDO CAJA X60'
            },
            stock: {
              type: 'number',
              description: 'Stock disponible',
              example: 0
            },
            pcosto: {
              type: 'number',
              description: 'Precio de costo',
              example: 1589.57
            },
            pordif: {
              type: 'number',
              description: 'Porcentaje de diferencia',
              example: 0.00
            }
          }
        },
        Lista: {
          type: 'object',
          required: ['codlis'],
          properties: {
            codlis: {
              type: 'number',
              description: 'Código de la lista',
              example: 1
            },
            nomlis: {
              type: 'string',
              description: 'Nombre de la lista',
              example: 'ENTIDADES PUBLICAS'
            },
            porlis: {
              type: 'number',
              description: 'Porcentaje de la lista',
              example: 45.00
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              description: 'Mensaje de error'
            }
          }
        }
      }
    }
  },
  apis: ['./routes/*.js']
};

const specs = swaggerJsdoc(options);
module.exports = specs;