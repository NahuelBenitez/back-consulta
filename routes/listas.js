const express = require('express');
const router = express.Router();
const pool = require('../database');

/**
 * @swagger
 * tags:
 *   name: Listas
 *   description: Gestión de listas de precios
 */

/**
 * @swagger
 * /api/listas:
 *   get:
 *     summary: Obtener todas las listas
 *     tags: [Listas]
 *     responses:
 *       200:
 *         description: Lista de listas de precios
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Lista'
 *       500:
 *         description: Error del servidor
 */
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM _listas ORDER BY codlis');
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener listas:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

/**
 * @swagger
 * /api/listas/{codlis}:
 *   get:
 *     summary: Obtener una lista por código
 *     tags: [Listas]
 *     parameters:
 *       - in: path
 *         name: codlis
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Lista'
 *       404:
 *         description: Lista no encontrada
 *       500:
 *         description: Error del servidor
 */
router.get('/:codlis', async (req, res) => {
  try {
    const { codlis } = req.params;
    const result = await pool.query('SELECT * FROM _listas WHERE codlis = $1', [codlis]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Lista no encontrada' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error al obtener lista:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = router;