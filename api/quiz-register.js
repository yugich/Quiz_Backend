const express = require('express');
const router = express.Router();
const { CosmosClient } = require('@azure/cosmos');
require('dotenv').config();

// Configurações do CosmosDB
const endpoint = process.env.COSMOSDB_URI;
const key = process.env.COSMOSDB_KEY;
const client = new CosmosClient({ endpoint, key });

const databaseId = process.env.COSMOSDB_DATABASE;
const containerId = process.env.COSMOSDB_CONTAINER;

async function initCosmos() {
    // Definir o throughput no nível do banco de dados (por exemplo, 400 RU/s)
    const { database } = await client.databases.createIfNotExists(
        { id: databaseId },
        { offerThroughput: 400 } // Ajuste esse valor conforme necessário
    );

    // Criar o contêiner sem especificar o throughput (herdará o throughput do banco de dados)
    const { container } = await database.containers.createIfNotExists({ id: containerId });

    return container;
}

const containerPromise = initCosmos();

// Endpoint para registrar um novo quiz
router.post('/register', async (req, res) => {
    try {
        const newQuiz = req.body;

        // Validar o formato do quiz
        if (!newQuiz.quizName || !newQuiz.questions) {
            return res.status(400).json({ error: 'Formato inválido do quiz' });
        }

        const container = await containerPromise;

        // Adicionar um ID único ao quiz
        newQuiz.id = Date.now().toString();

        // Inserir o quiz no CosmosDB
        await container.items.create(newQuiz);

        res.status(201).json({ message: 'Quiz registrado com sucesso!', quizId: newQuiz.id });
    } catch (error) {
        console.error('Erro ao registrar o quiz:', error);
        res.status(500).json({ error: 'Erro ao registrar o quiz' });
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
        console.error('Erro ao obter os quizzes:', error);
        res.status(500).json({ error: 'Erro ao obter os quizzes' });
    }
});

// Endpoint para obter um quiz pelo nome ou ID
router.get('/search', async (req, res) => {
    try {
        const { id, name } = req.query;

        if (!id && !name) {
            return res.status(400).json({ error: 'Por favor, forneça o ID ou o nome do quiz para a busca.' });
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
            return res.status(404).json({ message: 'Quiz não encontrado.' });
        }

        res.json(quizzes[0]);
    } catch (error) {
        console.error('Erro ao buscar o quiz:', error);
        res.status(500).json({ error: 'Erro ao buscar o quiz' });
    }
});

router.put('/edit/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updatedQuiz = req.body;

        // Validar o formato do quiz atualizado
        if (!updatedQuiz.quizName || !updatedQuiz.questions) {
            return res.status(400).json({ error: 'Formato inválido do quiz' });
        }

        const container = await containerPromise;

        // Obter o quiz existente
        const { resource: existingQuiz } = await container.item(id).read();

        if (!existingQuiz) {
            return res.status(404).json({ message: 'Quiz não encontrado.' });
        }

        // Manter o mesmo ID e outras propriedades do sistema
        updatedQuiz.id = id;
        updatedQuiz._etag = existingQuiz._etag;

        // Atualizar o quiz no CosmosDB
        const { resource: replacedQuiz } = await container.item(id).replace(updatedQuiz);

        res.json({ message: 'Quiz atualizado com sucesso!', quiz: replacedQuiz });
    } catch (error) {
        console.error('Erro ao editar o quiz:', error);
        res.status(500).json({ error: 'Erro ao editar o quiz' });
    }
});

router.delete('/delete/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const container = await containerPromise;

        // Tentar ler o item para verificar se existe
        const { resource: quiz } = await container.item(id).read();

        if (!quiz) {
            return res.status(404).json({ message: 'Quiz não encontrado.' });
        }

        // Deletar o item
        await container.item(id).delete();

        res.json({ message: 'Quiz deletado com sucesso!' });
    } catch (error) {
        console.error('Erro ao deletar o quiz:', error);
        res.status(500).json({ error: 'Erro ao deletar o quiz' });
    }
});

module.exports = router;
