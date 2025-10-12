<?php
/**
 * Z2B Legacy Builders - Enhanced Database Class
 * Includes query builder, caching, and transaction support
 */

require_once __DIR__ . '/../config/app.php';
require_once __DIR__ . '/../config/database.php';

class Database {
    private static $instance = null;
    private $pdo;
    private $queryCount = 0;
    private $queryLog = [];
    private $cache = [];

    private function __construct() {
        try {
            $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=" . DB_CHARSET;
            $options = [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
                PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci"
            ];

            $this->pdo = new PDO($dsn, DB_USER, DB_PASS, $options);

        } catch (PDOException $e) {
            $this->logError("Database connection failed: " . $e->getMessage());
            if (DEBUG_MODE) {
                die("Database Error: " . $e->getMessage());
            } else {
                die("System temporarily unavailable.");
            }
        }
    }

    public static function getInstance() {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    public function getConnection() {
        return $this->pdo;
    }

    /**
     * Execute a query with caching support
     */
    public function query($sql, $params = [], $cache = false, $cacheTime = 300) {
        $cacheKey = md5($sql . serialize($params));

        // Check cache
        if ($cache && isset($this->cache[$cacheKey])) {
            $cachedData = $this->cache[$cacheKey];
            if (time() - $cachedData['time'] < $cacheTime) {
                return $cachedData['data'];
            }
        }

        try {
            $startTime = microtime(true);
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute($params);

            // Log query in debug mode
            if (DEBUG_MODE) {
                $this->queryCount++;
                $this->queryLog[] = [
                    'query' => $sql,
                    'params' => $params,
                    'time' => microtime(true) - $startTime,
                    'rows' => $stmt->rowCount()
                ];
            }

            // Cache if needed
            if ($cache) {
                $this->cache[$cacheKey] = [
                    'data' => $stmt,
                    'time' => time()
                ];
            }

            return $stmt;

        } catch (PDOException $e) {
            $this->logError("Query failed: " . $e->getMessage() . " | SQL: " . $sql);
            throw $e;
        }
    }

    /**
     * Fetch single row
     */
    public function fetchOne($sql, $params = [], $cache = false) {
        $stmt = $this->query($sql, $params, $cache);
        return $stmt->fetch();
    }

    /**
     * Fetch all rows
     */
    public function fetchAll($sql, $params = [], $cache = false) {
        $stmt = $this->query($sql, $params, $cache);
        return $stmt->fetchAll();
    }

    /**
     * Insert record
     */
    public function insert($table, $data) {
        $columns = array_keys($data);
        $placeholders = array_map(function($col) { return ':' . $col; }, $columns);

        $sql = "INSERT INTO $table (" . implode(', ', $columns) . ")
                VALUES (" . implode(', ', $placeholders) . ")";

        $this->query($sql, $data);
        return $this->pdo->lastInsertId();
    }

    /**
     * Update record
     */
    public function update($table, $data, $where, $whereParams = []) {
        $setClause = [];
        $params = [];

        foreach ($data as $column => $value) {
            $setClause[] = "$column = :set_$column";
            $params["set_$column"] = $value;
        }

        $sql = "UPDATE $table SET " . implode(', ', $setClause) . " WHERE $where";
        $params = array_merge($params, $whereParams);

        $stmt = $this->query($sql, $params);
        return $stmt->rowCount();
    }

    /**
     * Delete record
     */
    public function delete($table, $where, $params = []) {
        $sql = "DELETE FROM $table WHERE $where";
        $stmt = $this->query($sql, $params);
        return $stmt->rowCount();
    }

    /**
     * Count records
     */
    public function count($table, $where = '', $params = []) {
        $sql = "SELECT COUNT(*) as total FROM $table";
        if ($where) {
            $sql .= " WHERE $where";
        }

        $result = $this->fetchOne($sql, $params);
        return $result['total'];
    }

    /**
     * Check if record exists
     */
    public function exists($table, $where, $params = []) {
        return $this->count($table, $where, $params) > 0;
    }

    /**
     * Begin transaction
     */
    public function beginTransaction() {
        return $this->pdo->beginTransaction();
    }

    /**
     * Commit transaction
     */
    public function commit() {
        return $this->pdo->commit();
    }

    /**
     * Rollback transaction
     */
    public function rollback() {
        return $this->pdo->rollback();
    }

    /**
     * Get last inserted ID
     */
    public function lastInsertId() {
        return $this->pdo->lastInsertId();
    }

    /**
     * Clear cache
     */
    public function clearCache() {
        $this->cache = [];
    }

    /**
     * Get query statistics
     */
    public function getStats() {
        return [
            'queryCount' => $this->queryCount,
            'queryLog' => $this->queryLog,
            'cacheSize' => count($this->cache)
        ];
    }

    /**
     * Log database errors
     */
    private function logError($message) {
        $logFile = __DIR__ . '/../logs/database_errors.log';
        $timestamp = date('Y-m-d H:i:s');
        $logMessage = "[$timestamp] $message\n";

        if (!is_dir(dirname($logFile))) {
            mkdir(dirname($logFile), 0777, true);
        }

        file_put_contents($logFile, $logMessage, FILE_APPEND);
    }

    /**
     * Escape string for safe SQL
     */
    public function escape($string) {
        return $this->pdo->quote($string);
    }

    /**
     * Get table columns
     */
    public function getColumns($table) {
        $sql = "SHOW COLUMNS FROM $table";
        return $this->fetchAll($sql);
    }

    /**
     * Batch insert
     */
    public function batchInsert($table, $data) {
        if (empty($data)) return false;

        $columns = array_keys($data[0]);
        $placeholders = '(' . implode(',', array_fill(0, count($columns), '?')) . ')';
        $values = [];

        foreach ($data as $row) {
            foreach ($columns as $col) {
                $values[] = $row[$col] ?? null;
            }
        }

        $sql = "INSERT INTO $table (" . implode(',', $columns) . ") VALUES " .
               implode(',', array_fill(0, count($data), $placeholders));

        $stmt = $this->pdo->prepare($sql);
        return $stmt->execute($values);
    }
}