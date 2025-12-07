<?php
/**
 * Debug logger for product set sync debugging
 *
 * @package FacebookCommerce
 */

namespace WooCommerce\Facebook\ProductSets;

defined( 'ABSPATH' ) || exit;

class DebugLogger {

	private static $log_file = '/tmp/fb-product-set-sync-debug.log';

	/**
	 * Log a message to the debug file
	 *
	 * @param string $message The message to log
	 * @param array  $context Additional context data
	 */
	public static function log( $message, $context = array() ) {
		$timestamp = gmdate( 'Y-m-d H:i:s' );
		$log_entry = sprintf(
			"[%s] %s\n",
			$timestamp,
			$message
		);

		if ( ! empty( $context ) ) {
			$log_entry .= "Context: " . wp_json_encode( $context, JSON_PRETTY_PRINT ) . "\n";
		}

		$log_entry .= str_repeat( '-', 80 ) . "\n";

		// Append to file
		file_put_contents( self::$log_file, $log_entry, FILE_APPEND );
	}

	/**
	 * Log an exception
	 *
	 * @param \Exception $exception The exception to log
	 * @param string     $prefix    Optional prefix for the message
	 */
	public static function log_exception( \Exception $exception, $prefix = '' ) {
		$message = $prefix ? $prefix . ': ' : '';
		$message .= sprintf(
			"Exception [%s]: %s",
			get_class( $exception ),
			$exception->getMessage()
		);

		$context = array(
			'code'  => $exception->getCode(),
			'file'  => $exception->getFile(),
			'line'  => $exception->getLine(),
			'trace' => $exception->getTraceAsString(),
		);

		self::log( $message, $context );
	}

	/**
	 * Get the log file path
	 *
	 * @return string
	 */
	public static function get_log_file() {
		return self::$log_file;
	}

	/**
	 * Clear the log file
	 */
	public static function clear() {
		if ( file_exists( self::$log_file ) ) {
			unlink( self::$log_file );
		}
	}
}
