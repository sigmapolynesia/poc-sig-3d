import { fastify } from 'fastify'
import { fastifyStatic } from '@fastify/static'
import * as path from 'node:path'

const rootDir = path.resolve('')

// Crée une application Fastify.
const app = fastify({
  logger: true
})

// Expose les fichiers statiques.
// https://github.com/fastify/fastify-static
app.register(fastifyStatic, {
  prefix: '/assets/',
  root: path.join(rootDir, 'public', 'assets'),
  lastModified: true,
  // Retourne la liste des fichiers lorsqu'on accède à /assets/
  list: true,
  index: false,
})

// Démarre l'application sur le port 3000.
app.listen({
  host: '0.0.0.0',
  port: 3000
}).then((result) => {
  console.log(result)
})

