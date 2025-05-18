<?php

namespace Blockera\Auth\Upgrade;

use Blockera\Auth\DynamicPropertyTrait;
use Blockera\Auth\Repositories\OptionRepository;
use stdClass;

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
		add_filter('plugins_api', [ $this, 'getPluginInformation' ], 10, 3);
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
		$plugin_data = get_plugin_data(WP_PLUGIN_DIR . '/' . $id);

		if (! empty($result['update_available']) && ! empty($result['new_version'])) {
			$plugin_info = new \stdClass();

			$plugin_info->id = $this->config->getPluginUrl();
			$plugin_info->plugin = $id;
			$plugin_info->icons = $this->config->getIcons();
			$plugin_info->slug = $this->slug;
			$plugin_info->package = $this->getProPluginFileUrl();
			$plugin_info->new_version = $result['new_version'];
			$plugin_info->url = $this->config->getPluginUrl();
			$plugin_info->requires = $plugin_data['RequiresWP'] ?? '';
			$plugin_info->tested = $plugin_data['TestedUpTo'] ?? '';
			$plugin_info->requires_php = $plugin_data['RequiresPHP'] ?? '';
			$plugin_info->requires_plugins = [];

			$transient->response[ $plugin_info->plugin ] = $plugin_info;
		} else {

			$item = (object) array(
				'id'            => $id,
				'slug'          => $this->slug,
				'plugin'        => $id,
				'new_version'   => $plugin_data['Version'],
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
		$client_info = OptionRepository::getOption();

		if (!isset($client_info['licenses'], $client_info['access_token']) || empty(array_column($client_info['licenses'], 'versionId'))) {
			return '';
		}

		$licenses = $client_info['licenses'];
		$products_licenses = array_column($licenses, 'productName');
		$license_index = array_search($this->config->getProductName(), $products_licenses, true);
		$license = $licenses[ $license_index ];

		$version_id = $license['versionId'] ?? '';

		if (empty($version_id)) {
			return '';
		}

		$response = wp_remote_get(
            $this->config->getResourceOwnerDetailsUrl() . '/' . $version_id,
            [
				'timeout' => 30,
                'redirection' => 5,
                'httpversion' => '1.1',
                'sslverify' => false,
				'headers' => [
					'Authorization' => sprintf('Bearer %s', $client_info['access_token']),
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

	/**
	 * Get the plugin information.
	 *
	 * @param \stdClass|bool  $result The result.
	 * @param string          $action The action.
	 * @param \stdClass|array $args The args.
	 *
	 * @return \stdClass|bool The result.
	 */
	public function getPluginInformation( $result, string $action, \stdClass $args) {
		if ($args->slug !== $this->slug) {
			return $result;
		}

		if ('plugin_information' !== $action) {
			return $result;
		}

		$readme_file = ABSPATH . 'wp-content/plugins/' . $this->slug . '/readme.txt';

		if (! file_exists($readme_file)) {
			return $result;
		}
		
		$readme_content = file_get_contents($readme_file);
		
		if (empty($readme_content)) {
			return $result;
		}

		// Convert readme sections to HTML.
		$sections = [];
		$current_section = '';
		$section_content = '';
		
		foreach (explode("\n", $readme_content) as $line) {
			if (preg_match('/^==\s*(.*?)\s*==/', $line, $matches)) {
				if ('' !== $current_section) {
					$sections[$current_section] = trim($section_content);
				}
				$current_section = strtolower($matches[1]);
				$section_content = '';
			} else {
				$section_content .= $line . "\n";
			}
		}
		
		if ('' !== $current_section) {
			$sections[$current_section] = trim($section_content);
		}

		// Convert markdown to HTML.
		foreach ($sections as $key => $content) {
			$content = preg_replace('/\*(.*?)\*/', '<em>$1</em>', $content);
			$content = preg_replace('/`(.*?)`/', '<code>$1</code>', $content);
			$content = preg_replace('/=(.*?)=/', '<strong>$1</strong>', $content);
			$content = preg_replace('/\[(.*?)\]\((.*?)\)/', '<a href="$2">$1</a>', $content);
			$sections[$key] = wpautop($content);
		}

		$plugin_data = get_plugin_data(WP_PLUGIN_DIR . '/' . $this->slug . '/' . $this->slug . '.php');

		$info = new \stdClass();
		$info->name = $plugin_data['Name'];
		$info->slug = $this->slug;
		$info->version = $plugin_data['Version'];
		$info->author = $plugin_data['Author'];
		$info->author_profile = $plugin_data['AuthorURI'] ?? '';
		$info->requires = $plugin_data['RequiresWP'] ?? '';
		$info->tested = $plugin_data['TestedUpTo'] ?? '';
		$info->requires_php = $plugin_data['RequiresPHP'] ?? '';
		$info->last_updated = $plugin_data['UpdatedTime'] ?? '';
		$info->added = '';
		$info->homepage = $plugin_data['PluginURI'] ?? '';
		$info->sections = $sections;
		$info->download_link = '';
		$info->banners = [];
		$info->contributors = [];

		return $info;
	}
}
