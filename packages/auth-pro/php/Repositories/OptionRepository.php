<?php

namespace Blockera\Auth\Repositories;

use Blockera\Auth\Config;

class OptionRepository {

    /**
     * The option key.
     *
     * @var string $option_key The option key.
     */
    protected static string $option_key = 'blockera-oauth-credentials';

    /**
     * The prefix transient key.
     *
     * @var string $prefix_transient_key The prefix transient key.
     */
    protected static string $prefix_transient_key = '__subscription-';

    /**
     * Get the option key.
     *
     * @return string The option key.
     */
    public static function getOptionKey(): string {
        return self::$option_key;
    }

    /**
     * Get the prefix transient key.
     *
     * @return string The prefix transient key.
     */
    public static function getPrefixTransientKey(): string {
        return self::$prefix_transient_key;
    }

	/**
	 * Set the option.
	 *
	 * @param mixed $value The value to set.
	 *
	 * @return bool true on success, false on failure.
	 */
    public static function setOption( $value): bool {
		return update_option(self::$option_key, $value);
    }

	/**
	 * Get the option.
	 *
	 * @param string $key The key.
	 * @param array  $default The default value.
	 *
	 * @return mixed The option.
	 */
	public static function getOption( string $key = '', array $default = []) {
		$options = get_option(self::$option_key, $default);

		if (empty($key)) {
			return $options;
		}

		return $options[ $key ] ?? null;
	}

	/**
	 * Get the transient.
	 *
	 * @param string $key The key.
	 *
	 * @return mixed The transient.
	 */
	public static function getTransient( string $key = '') {
		$transients = get_transient(self::$prefix_transient_key);

		if (empty($key)) {
			return $transients;
		}

		return $transients[ $key ] ?? null;
	}

	/**
	 * Set the transient.
	 *
	 * @param string $key The key.
	 * @param mixed  $value The value.
	 * @param int    $expiration The expiration time in seconds. default is 1 day.
	 *
	 * @return bool true on success, false on failure.
	 */
	public static function setTransient( string $key, $value, int $expiration = 60 * 60 * 24): bool {
		return set_transient(self::$option_key . self::$prefix_transient_key . $key, $value, $expiration);
	}

	/**
	 * Get the license.
	 *
	 * @return array The license.
	 */
    public static function getLicense( array $oauth_option = []): array {
        $oauth_option      = empty($oauth_option) ? self::getOption() : $oauth_option;
        $products_licenses = array_column($oauth_option['licenses'] ?? [], 'productName');
        $license_index     = array_search(Config::getProductName(), $products_licenses, true);

        return $oauth_option['licenses'][ $license_index ] ?? [];
    }
}
