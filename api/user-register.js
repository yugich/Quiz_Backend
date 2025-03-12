const express = require('express');
const router = express.Router();
const { CosmosClient } = require('@azure/cosmos');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const endpoint = process.env.COSMOSDB_URI;
const key = process.env.COSMOSDB_KEY;
const client = new CosmosClient({ endpoint, key });

const databaseId = process.env.COSMOSDB_DATABASE;
const containerId = process.env.COSMOSDB_USER_CONTAINER;

async function initCosmos() {
    // Configura o throughput no nível do banco de dados (e.g. 400 RU/s)
    const { database } = await client.databases.createIfNotExists(
        { id: databaseId },
        { offerThroughput: 400 }
    );

    // Cria o container sem especificar o throughput (herdará do banco de dados)
    const { container } = await database.containers.createIfNotExists({ id: containerId });

    return container;
}

const containerPromise = initCosmos();

// Endpoint para registrar um novo usuário
router.post('/', async (req, res) => {
    try {
        const container = await containerPromise;
        const { name, email, extrasInformation, score } = req.body;

        // Validação dos campos obrigatórios
        if (!name || !email || score === undefined) {
            return res.status(400).send({ error: 'Name, Email, and Score are required.' });
        }

        // Obter o início e fim do dia atual em UTC
        const startOfDay = new Date();
        startOfDay.setUTCHours(0, 0, 0, 0);
        const endOfDay = new Date();
        endOfDay.setUTCHours(23, 59, 59, 999);

        const startOfDayISO = startOfDay.toISOString();
        const endOfDayISO = endOfDay.toISOString();

        // Consultar números da sorte já atribuídos hoje
        const querySpec = {
            query: 'SELECT c.luckyNumber FROM c WHERE c.timeStamp >= @startOfDay AND c.timeStamp <= @endOfDay',
            parameters: [
                { name: '@startOfDay', value: startOfDayISO },
                { name: '@endOfDay', value: endOfDayISO }
            ]
        };
        const { resources: existingNumbers } = await container.items.query(querySpec).fetchAll();

        // Obter uma lista de números da sorte já usados hoje
        const usedNumbers = existingNumbers.map(item => item.luckyNumber);

        // Gerar número da sorte único de 5 dígitos
        let luckyNumber;
        const maxAttempts = 10000; // Limite de tentativas para evitar loop infinito
        let attempts = 0;

        do {
            luckyNumber = Math.floor(Math.random() * 90000) + 10000; // Números entre 10000 e 99999
            attempts++;
            if (attempts > maxAttempts) {
                return res.status(500).send({ error: 'Unable to generate unique lucky number for today.' });
            }
        } while (usedNumbers.includes(luckyNumber));

        const newItem = {
            id: uuidv4(),
            name,
            email,
            extrasInformation,
            score,
            luckyNumber,
            timeStamp: new Date().toISOString()
        };

        const { resource: createdItem } = await container.items.create(newItem);

        res.status(201).send(createdItem);
    } catch (err) {
        console.error(err);
        res.status(500).send({ error: 'An error occurred while registering the user.' });
    }
});

// Endpoint para editar um usuário pelo ID
router.put('/:id', async (req, res) => {
    try {
        const container = await containerPromise;
        const { id } = req.params;
        let updatedFields = req.body;

        // Impede a atualização do id, timeStamp e luckyNumber
        delete updatedFields.id;
        delete updatedFields.timeStamp;
        delete updatedFields.luckyNumber;

        // Busca o item existente
        const { resource: existingItem } = await container.item(id, undefined).read();

        if (!existingItem) {
            return res.status(404).send({ error: 'User not found.' });
        }

        // Atualiza os campos
        const updatedItem = { ...existingItem, ...updatedFields };

        const { resource: replacedItem } = await container.item(id, undefined).replace(updatedItem);

        res.status(200).send(replacedItem);
    } catch (err) {
        console.error(err);
        res.status(500).send({ error: 'An error occurred while updating the user.' });
    }
});

// Endpoint para retornar a quantidade de usuários entre datas
router.get('/count', async (req, res) => {
    try {
        const container = await containerPromise;
        const { startDate, endDate } = req.query;

        // Validação das datas
        if (!startDate || !endDate) {
            return res.status(400).send({ error: 'startDate and endDate query parameters are required.' });
        }

        const querySpec = {
            query: 'SELECT VALUE COUNT(1) FROM c WHERE c.timeStamp >= @startDate AND c.timeStamp <= @endDate',
            parameters: [
                { name: '@startDate', value: startDate },
                { name: '@endDate', value: endDate }
            ]
        };

        const { resources } = await container.items.query(querySpec).fetchAll();
        const count = resources[0] || 0;

        res.status(200).send({ count });
    } catch (err) {
        console.error(err);
        res.status(500).send({ error: 'An error occurred while fetching the user count.' });
    }
});

// Endpoint para retornar uma lista de usuários entre datas
router.get('/', async (req, res) => {
    try {
        const container = await containerPromise;
        const { startDate, endDate } = req.query;

        let querySpec;

        if (startDate && endDate) {
            querySpec = {
                query: 'SELECT * FROM c WHERE c.timeStamp >= @startDate AND c.timeStamp <= @endDate',
                parameters: [
                    { name: '@startDate', value: startDate },
                    { name: '@endDate', value: endDate }
                ]
            };
        } else {
            querySpec = { query: 'SELECT * FROM c' };
        }

        const { resources } = await container.items.query(querySpec).fetchAll();

        res.status(200).send(resources);
    } catch (err) {
        console.error(err);
        res.status(500).send({ error: 'An error occurred while fetching the users.' });
    }
});

// Endpoint para retornar todos os usuários
router.get('/all', async (req, res) => {
    try {
        const container = await containerPromise;

        const querySpec = { query: 'SELECT * FROM c' };

        const { resources } = await container.items.query(querySpec).fetchAll();

        res.status(200).send(resources);
    } catch (err) {
        console.error(err);
        res.status(500).send({ error: 'An error occurred while fetching all users.' });
    }
});

router.get('/ranking', async (req, res) => {
    try {
        const container = await containerPromise;

        // Query para ordenar os usuários pelo score de forma decrescente e limitar o retorno aos 10 primeiros
        const querySpec = {
            query: 'SELECT TOP 10 c.name, c.email, c.score FROM c ORDER BY c.score DESC'
        };

        const { resources: topUsers } = await container.items.query(querySpec).fetchAll();

        res.status(200).send(topUsers);
    } catch (err) {
        console.error(err);
        res.status(500).send({ error: 'An error occurred while fetching the top 10 users.' });
    }
});

router.get('/draw', async (req, res) => {
    try {
        const container = await containerPromise;
        const { date, minScore } = req.query;

        // Validate date query parameter
        if (!date) {
            return res.status(400).send({ error: 'Date query parameter is required.' });
        }

        // Parse and validate the provided date
        const providedDate = new Date(date);
        if (isNaN(providedDate)) {
            return res.status(400).send({ error: 'Invalid date format. Use YYYY-MM-DD.' });
        }

        // Get the start and end of the provided day in UTC
        const startOfDay = new Date(Date.UTC(providedDate.getUTCFullYear(), providedDate.getUTCMonth(), providedDate.getUTCDate(), 0, 0, 0, 0));
        const endOfDay = new Date(Date.UTC(providedDate.getUTCFullYear(), providedDate.getUTCMonth(), providedDate.getUTCDate(), 23, 59, 59, 999));

        // Build the query with time constraints
        let query = 'SELECT * FROM c WHERE c.timeStamp >= @startOfDay AND c.timeStamp <= @endOfDay';
        const parameters = [
            { name: '@startOfDay', value: startOfDay.toISOString() },
            { name: '@endOfDay', value: endOfDay.toISOString() }
        ];

        // If minScore is provided and valid, add the score filter to the query
        if (minScore !== undefined) {
            const parsedScore = Number(minScore);
            if (!isNaN(parsedScore)) {
                query += ' AND c.score >= @minScore';
                parameters.push({ name: '@minScore', value: parsedScore });
            }
        }

        const querySpec = { query, parameters };

        // Query users registered on the given date (and optionally with score filter)
        const { resources: users } = await container.items.query(querySpec).fetchAll();

        if (users.length === 0) {
            return res.status(404).send({ error: 'No users found for the given date (and score criteria).' });
        }

        // Randomly select a winner from the filtered users
        const winner = users[Math.floor(Math.random() * users.length)];

        // Return the winner's information
        res.status(200).send({
            luckyNumber: winner.luckyNumber,
            name: winner.name,
            email: winner.email
        });
    } catch (err) {
        console.error(err);
        res.status(500).send({ error: 'An error occurred while performing the draw.' });
    }
});

module.exports = router;
