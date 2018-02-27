const PouchDB = require('pouchdb-core')
const httpAdapter = require('pouchdb-adapter-http')
const replication = require('pouchdb-replication')
const memoryAdapter = require('pouchdb-adapter-memory')
const { deepEqual } = require('assert')

PouchDB
  .plugin(httpAdapter)
  .plugin(replication)
  .plugin(memoryAdapter)

const opts = {
  skip_setup: true
}

const localDb = new PouchDB('local', opts)

const initRemote = async () => {
  const url = 'http://admin:admin@localhost:5984/sync-test'
  await PouchDB(url, opts).destroy()
  const remoteDb = new PouchDB(url)
  const docs = Array.from(new Array(100), (_, i) => ({ _id: `${i + 1}`} ))
  await remoteDb.bulkDocs(docs)
  return remoteDb
}

;(async () => {
  const remoteDb = await initRemote()

  const opts = {
    batch_size: 1,
    doc_ids: [
      '1',
      '2',
      '3'
    ]
  }

  await localDb.replicate.from(remoteDb, opts)
  const info = await localDb.info()

  try {
    deepEqual(info.doc_count, opts.doc_ids.length)
  } catch (e) {
    console.error(e)
  }
})()
