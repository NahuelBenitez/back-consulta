const express = require('express');
const router = express.Router();
const pool = require('../database');

/**
 * @swagger
 * tags:
 *   name: Artículos
 *   description: Gestión de artículos
 */

/**
 * @swagger
 * /api/articulos:
 *   get:
 *     summary: Obtener todos los artículos
 *     tags: [Artículos]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Número de página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Límite de registros por página
 *     responses:
 *       200:
 *         description: Lista de artículos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 articulos:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Articulo'
 *                 total:
 *                   type: integer
 *                 pagina:
 *                   type: integer
 *                 totalPaginas:
 *                   type: integer
 *       500:
 *         description: Error del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/', async (req, res) => {
  try {
    console.log('🔍 Ejecutando GET /api/articulos');
    
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    // Primero probemos solo obtener los artículos sin COUNT
    const result = await pool.query(
      'SELECT * FROM _articulos ORDER BY codart LIMIT $1 OFFSET $2',
      [limit, offset]
    );

    console.log(`📊 Artículos encontrados: ${result.rows.length}`);

    // Si no hay artículos
    if (result.rows.length === 0) {
      return res.status(404).json({ 
        message: 'No hay artículos disponibles',
        articulos: [],
        total: 0,
        pagina: page,
        totalPaginas: 0
      });
    }

    // Solo si funciona, hacemos el COUNT
    const countResult = await pool.query('SELECT COUNT(*) FROM _articulos');
    const total = parseInt(countResult.rows[0].count);

    res.json({
      articulos: result.rows,
      total,
      pagina: page,
      totalPaginas: Math.ceil(total / limit),
      message: `${result.rows.length} artículos encontrados`
    });

  } catch (error) {
    console.error('❌ Error en GET /api/articulos:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      details: error.message 
    });
  }
});

/**
 * @swagger
 * /api/articulos/{codart}:
 *   get:
 *     summary: Obtener un artículo por código
 *     tags: [Artículos]
 *     parameters:
 *       - in: path
 *         name: codart
 *         required: true
 *         schema:
 *           type: integer
 *         description: Código del artículo
 *     responses:
 *       200:
 *         description: Artículo encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Articulo'
 *       404:
 *         description: Artículo no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Error del servidor
 */
router.get('/:codart', async (req, res) => {
  try {
    const { codart } = req.params;
    const result = await pool.query('SELECT * FROM _articulos WHERE codart = $1', [codart]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Artículo no encontrado' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error al obtener artículo:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

/**
 * @swagger
 * /api/articulos:
 *   post:
 *     summary: Crear un nuevo artículo
 *     tags: [Artículos]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Articulo'
 *     responses:
 *       201:
 *         description: Artículo creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Articulo'
 *       400:
 *         description: Datos inválidos
 *       500:
 *         description: Error del servidor
 */
router.post('/', async (req, res) => {
  try {
    const { codart, npm, stock, pcosto, pordif } = req.body;

    if (!codart) {
      return res.status(400).json({ error: 'El código del artículo es requerido' });
    }

    const result = await pool.query(
      `INSERT INTO _articulos (codart, npm, stock, pcosto, pordif) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING *`,
      [codart, npm, stock, pcosto, pordif]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error al crear artículo:', error);
    if (error.code === '23505') {
      res.status(400).json({ error: 'El código del artículo ya existe' });
    } else {
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }
});

/**
 * @swagger
 * /api/articulos/{codart}:
 *   put:
 *     summary: Actualizar un artículo
 *     tags: [Artículos]
 *     parameters:
 *       - in: path
 *         name: codart
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Articulo'
 *     responses:
 *       200:
 *         description: Artículo actualizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Articulo'
 *       404:
 *         description: Artículo no encontrado
 *       500:
 *         description: Error del servidor
 */
router.put('/:codart', async (req, res) => {
  try {
    const { codart } = req.params;
    const { npm, stock, pcosto, pordif } = req.body;

    const result = await pool.query(
      `UPDATE _articulos 
       SET npm = $1, stock = $2, pcosto = $3, pordif = $4 
       WHERE codart = $5 
       RETURNING *`,
      [npm, stock, pcosto, pordif, codart]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Artículo no encontrado' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error al actualizar artículo:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

/**
 * @swagger
 * /api/articulos/{codart}:
 *   delete:
 *     summary: Eliminar un artículo
 *     tags: [Artículos]
 *     parameters:
 *       - in: path
 *         name: codart
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Artículo eliminado
 *       404:
 *         description: Artículo no encontrado
 *       500:
 *         description: Error del servidor
 */
router.delete('/:codart', async (req, res) => {
  try {
    const { codart } = req.params;
    const result = await pool.query('DELETE FROM _articulos WHERE codart = $1 RETURNING *', [codart]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Artículo no encontrado' });
    }

    res.json({ message: 'Artículo eliminado exitosamente' });
  } catch (error) {
    console.error('Error al eliminar artículo:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

/**
 * @swagger
 * /api/articulos/upsert:
 *   post:
 *     summary: Insertar o actualizar artículos (UPSERT)
 *     description: |
 *       Si el artículo existe (mismo codart), lo actualiza.
 *       Si no existe, lo inserta.
 *       Útil para sincronización desde sistemas legacy como FoxPro.
 *     tags: [Artículos]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               articulos:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/Articulo'
 *     responses:
 *       200:
 *         description: Artículos procesados exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 inserted:
 *                   type: integer
 *                 updated:
 *                   type: integer
 *                 errors:
 *                   type: integer
 *                 detalles:
 *                   type: array
 *                   items:
 *                     type: object
 *       400:
 *         description: Datos inválidos
 *       500:
 *         description: Error del servidor
 */
router.post('/upsert', async (req, res) => {
  try {
    const { articulos } = req.body;

    if (!articulos || !Array.isArray(articulos)) {
      return res.status(400).json({ error: 'Se esperaba un array de artículos en la propiedad "articulos"' });
    }

    let inserted = 0;
    let updated = 0;
    let errors = 0;
    const detalles = [];

    // Procesar cada artículo individualmente
    for (const articulo of articulos) {
      try {
        const { codart, npm, stock, pcosto, pordif } = articulo;

        // Validaciones básicas
        if (!codart) {
          detalles.push({ codart: articulo.codart || 'N/A', status: 'ERROR', error: 'Código de artículo requerido' });
          errors++;
          continue;
        }

        // Verificar si el artículo ya existe
        const existeResult = await pool.query('SELECT 1 FROM _articulos WHERE codart = $1', [codart]);
        
        if (existeResult.rows.length > 0) {
          // UPDATE - El artículo existe
          await pool.query(
            `UPDATE _articulos 
             SET npm = $1, stock = $2, pcosto = $3, pordif = $4 
             WHERE codart = $5`,
            [npm, stock, pcosto, pordif, codart]
          );
          updated++;
          detalles.push({ codart, status: 'UPDATED' });
        } else {
          // INSERT - El artículo no existe
          await pool.query(
            `INSERT INTO _articulos (codart, npm, stock, pcosto, pordif) 
             VALUES ($1, $2, $3, $4, $5)`,
            [codart, npm, stock, pcosto, pordif]
          );
          inserted++;
          detalles.push({ codart, status: 'INSERTED' });
        }

      } catch (error) {
        console.error(`Error procesando artículo ${articulo.codart}:`, error);
        detalles.push({ 
          codart: articulo.codart || 'N/A', 
          status: 'ERROR', 
          error: error.message 
        });
        errors++;
      }
    }

    res.json({
      message: 'Procesamiento completado',
      inserted,
      updated,
      errors,
      total: articulos.length,
      detalles
    });

  } catch (error) {
    console.error('Error en endpoint upsert:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

/**
 * @swagger
 * /api/articulos/upsert/bulk:
 *   post:
 *     summary: UPSERT masivo (más eficiente para muchos registros)
 *     description: Versión optimizada para grandes volúmenes de datos
 *     tags: [Artículos]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               articulos:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/Articulo'
 *     responses:
 *       200:
 *         description: Procesamiento masivo completado
 *       400:
 *         description: Datos inválidos
 *       500:
 *         description: Error del servidor
 */
router.post('/upsert/bulk', async (req, res) => {
  try {
    const { articulos } = req.body;

    if (!articulos || !Array.isArray(articulos)) {
      return res.status(400).json({ error: 'Se esperaba un array de artículos en la propiedad "articulos"' });
    }

    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      for (const articulo of articulos) {
        const { codart, npm, stock, pcosto, pordif } = articulo;

        if (!codart) continue; // Saltar artículos sin código

        // Usar INSERT ... ON CONFLICT para UPSERT (PostgreSQL 9.5+)
        await client.query(
          `INSERT INTO _articulos (codart, npm, stock, pcosto, pordif) 
           VALUES ($1, $2, $3, $4, $5)
           ON CONFLICT (codart) 
           DO UPDATE SET 
             npm = EXCLUDED.npm,
             stock = EXCLUDED.stock,
             pcosto = EXCLUDED.pcosto,
             pordif = EXCLUDED.pordif`,
          [codart, npm, stock, pcosto, pordif]
        );
      }

      await client.query('COMMIT');
      res.json({ 
        message: 'Procesamiento masivo completado',
        total: articulos.length 
      });

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }

  } catch (error) {
    console.error('Error en upsert masivo:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = router;