const express = require('express');
const router = express.Router();
const { CosmosClient } = require('@azure/cosmos');
require('dotenv').config();

// CosmosDB Settings
const endpoint = process.env.COSMOSDB_URI;
const key = process.env.COSMOSDB_KEY;
const client = new CosmosClient({ endpoint, key });

const databaseId = process.env.COSMOSDB_DATABASE;
const containerId = process.env.COSMOSDB_CONTAINER;

async function initCosmos() {
    // Set throughput at the database level (e.g. 400 RU/s)
    const { database } = await client.databases.createIfNotExists(
        { id: databaseId },
        { offerThroughput: 400 } // Ajuste esse valor conforme necessário
    );

    // Create container without specifying throughput (will inherit throughput from database)
    const { container } = await database.containers.createIfNotExists({ id: containerId });

    return container;
}

const containerPromise = initCosmos();

// Endpoint to register a new quiz
router.post('/register', async (req, res) => {
    try {
        const newQuiz = req.body;

        // Validate the quiz format
        if (!newQuiz.quizName || !newQuiz.questions) {
            return res.status(400).json({ error: 'Invalid quiz format' });
        }

        const container = await containerPromise;

        // Add a unique ID to the quiz
        newQuiz.id = Date.now().toString();

        // Embed the quiz in CosmosDB
        await container.items.create(newQuiz);

        res.status(201).json({ message: 'Quiz registered successfully!', quizId: newQuiz.id });
    } catch (error) {
        console.error('Error registering quiz:', error);
        res.status(500).json({ error: 'Error registering quiz' });
    }
});

// Endpoint para obter todos os quizzes registrados
router.get('/all', async (req, res) => {
    try {
        const container = await containerPromise;

        const querySpec = {
            query: 'SELECT * FROM c'
        };

        const { resources: quizzes } = await container.items.query(querySpec).fetchAll();

        res.json(quizzes);
    } catch (error) {
        console.error('Error getting quizzes:', error);
        res.status(500).json({ error: 'Error getting quizzes' });
    }
});

// Endpoint para obter um quiz pelo nome ou ID
router.get('/search', async (req, res) => {
    try {
        const { id, name } = req.query;

        if (!id && !name) {
            return res.status(400).json({ error: 'Please provide the quiz ID or name for search.' });
        }

        const container = await containerPromise;

        let querySpec;

        if (id) {
            // Buscar pelo ID
            querySpec = {
                query: 'SELECT * FROM c WHERE c.id = @id',
                parameters: [
                    { name: '@id', value: id }
                ]
            };
        } else if (name) {
            // Buscar pelo nome (case-insensitive)
            querySpec = {
                query: 'SELECT * FROM c WHERE LOWER(c.quizName) = @name',
                parameters: [
                    { name: '@name', value: name.toLowerCase() }
                ]
            };
        }

        const { resources: quizzes } = await container.items.query(querySpec).fetchAll();

        if (quizzes.length === 0) {
            return res.status(404).json({ message: 'Quiz not found.' });
        }

        res.json(quizzes[0]);
    } catch (error) {
        console.error('Error fetching quiz:', error);
        res.status(500).json({ error: 'Error fetching quiz' });
    }
});

router.put('/edit/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updatedQuiz = req.body;

        // Validar o formato do quiz atualizado
        if (!updatedQuiz.quizName || !updatedQuiz.questions) {
            return res.status(400).json({ error: 'Invalid quiz format' });
        }

        const container = await containerPromise;

        // Obter o quiz existente
        const { resource: existingQuiz } = await container.item(id).read();

        if (!existingQuiz) {
            return res.status(404).json({ message: 'Quiz not found.' });
        }

        // Manter o mesmo ID e outras propriedades do sistema
        updatedQuiz.id = id;
        updatedQuiz._etag = existingQuiz._etag;

        // Atualizar o quiz no CosmosDB
        const { resource: replacedQuiz } = await container.item(id).replace(updatedQuiz);

        res.json({ message: 'Quiz updated successfully!', quiz: replacedQuiz });
    } catch (error) {
        console.error('Error editing quiz:', error);
        res.status(500).json({ error: 'Error editing quiz' });
    }
});

router.delete('/delete/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const container = await containerPromise;

        // Tentar ler o item para verificar se existe
        const { resource: quiz } = await container.item(id).read();

        if (!quiz) {
            return res.status(404).json({ message: 'Quiz not found.' });
        }

        // Deletar o item
        await container.item(id).delete();

        res.json({ message: 'Quiz deleted successfully!' });
    } catch (error) {
        console.error('Error deleting quiz:', error);
        res.status(500).json({ error: 'Error deleting quiz' });
    }
});

module.exports = router;
