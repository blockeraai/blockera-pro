<?php

namespace Blockera\Auth\Upgrade;

use Blockera\Auth\Config;
use Blockera\Utils\Utils;
use Blockera\Auth\DynamicPropertyTrait;
use Blockera\Auth\Repositories\OptionRepository;

class ProPlugin {


	/**
	 * Use the dynamic property trait.
	 */
	use DynamicPropertyTrait;

	/**
	 * The slug of the pro plugin.
	 *
	 * @var string $slug The slug of the plugin.
	 */
	private string $slug;

	/**
	 * The name of the pro plugin.
	 *
	 * @var string $name The name of the plugin.
	 */
	private string $name;

	/**
	 * The download URL of the pro plugin.
	 *
	 * @var string $link The download URL of the plugin.
	 */
	private string $link;

	/**
	 * The version of the pro plugin.
	 *
	 * @var string $version The version of the plugin.
	 */
	private string $version;

	/**
	 * The license of the pro plugin.
	 *
	 * @var array $license The license of the plugin.
	 */
	private array $license;

	/**
	 * Apply the hooks.
	 *
	 * @return void
	 */
	public function applyHooks(): void
	{
		add_filter('pre_set_site_transient_update_plugins', [ $this, 'setUpdatePluginTransient' ]);
	}

	/**
	 * Set the download link.
	 *
	 * @param string $downloadLink The download link.
	 *
	 * @return void
	 */
	public function setLink( string $downloadLink): void
	{
		$this->link = $downloadLink;
	}

	/**
	 * Sets the update plugin transient.
	 *
	 * @param \stdClass $transient The transient object.
	 *
	 * @return \stdClass The transient object.
	 */
	public function setUpdatePluginTransient( \stdClass $transient): \stdClass
	{
		$id = $this->slug . '/' . $this->slug . '.php';

		// Check if pro version is not activated.
		if (! is_plugin_active($id)) {
			return $transient;
		}

		$this->validator->name($this->slug);

		$result = $this->validator->updateCheck($this->config->getProductIdentifier());

		if (! empty($result['update_available']) && ! empty($result['new_version'])) {
			$plugin_info = new \stdClass();

			$plugin_info->plugin = $id;
			$plugin_info->icons = $this->config->getIcons();
			$plugin_info->slug = $this->slug;
			$plugin_info->package = '';
			$plugin_info->new_version = $result['new_version'];
			$plugin_info->url = $this->config->getPluginUrl();

			$transient->response[ $plugin_info->plugin ] = $plugin_info;
		} else {
			$plugin_info = get_plugin_data(WP_PLUGIN_DIR . '/' . $id);

			$item = (object) array(
				'id'            => $id,
				'slug'          => $this->slug,
				'plugin'        => $id,
				'new_version'   => $plugin_info['Version'],
				'url'           => '',
				'package'       => '',
				'icons'         => array(),
				'banners'       => array(),
				'banners_rtl'   => array(),
				'tested'        => '',
				'requires_php'  => '',
				'compatibility' => new \stdClass(),
			);

			$transient->no_update[ $id ] = $item;
		}

		return $transient;
	}

	/**
	 * Get the pro plugin file.
	 *
	 * @return string The pro plugin file, empty string if no data is found.
	 */
	private function getProPluginFileUrl(): string
	{
		// Create a transient key to store the license temporary data.
		$transient_key = OptionRepository::getPrefixTransientKey() . Utils::snakeCase($this->license['name']);
		$transient = get_transient($transient_key);

		if (empty($transient)) {
			$request = new \WP_REST_Request('POST', '/blockera/v1/auth/licenses');
			$request->set_param('force', true);
			$request->set_param('action', 'licenses');
			$request->set_header('X-Blockera-Nonce', wp_create_nonce('blockera-connect-with-your-account'));

			$response = rest_do_request($request);
			$response = $response->get_data();

			if (empty($response['success'])) {
				return '';
			}

			// Create a transient key to store the license temporary data.
			$transient_key = OptionRepository::getPrefixTransientKey() . Utils::snakeCase($this->license['name']);
			$transient = get_transient($transient_key);

			if (empty($transient)) {
				return '';
			}
		}

		$response = wp_remote_get(
            $this->config->getResourceOwnerDetailsUrl() . '/' . $transient,
            [
				'timeout' => 30,
				'sslverify' => Config::isDev(),
				'headers' => [
					'Authorization' => 'Bearer ' . OptionRepository::getOption('access_token'),
				],
				'body' => [
					'domain' => get_site_url(),
					'license_id' => $this->license['id'],
				],
			]
        );

		if (is_wp_error($response)) {
			return '';
		}

		$response_body = json_decode($response['body'], true);

		if (empty($response_body['success'])) {
			return '';
		}

		return $response_body['data']['fileUrl'] ?? '';
	}
}
