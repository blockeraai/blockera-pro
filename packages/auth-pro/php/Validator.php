<?php

namespace Blockera\Auth;

use Blockera\Auth\Config;
use Blockera\Bootstrap\Application;
use Blockera\Auth\Repositories\OptionRepository;

class Validator {


	/**
	 * Store the auth module identifier.
	 *
	 * @var string $id The auth module identifier.
	 */
	protected string $id;

	/**
	 * Store the consumer.
	 *
	 * @var string $consumer The consumer.
	 */
	protected string $consumer;

	/**
	 * Store the name.
	 *
	 * @var string $name The name.
	 */
	protected string $name;

	/**
	 * Store the version.
	 *
	 * @var string $version The version.
	 */
	protected string $version;

	/**
	 * Store the status.
	 *
	 * @var string $status The status.
	 */
	protected string $status;

	/**
	 * Store the start date.
	 *
	 * @var string $start The start date.
	 */
	protected string $start;

	/**
	 * Store the end date.
	 *
	 * @var string $end The end date.
	 */
	protected string $end;

	/**
	 * The application instance.
	 *
	 * @var Application $app The application instance.
	 */
	protected Application $app;

	/**
	 * The config instance.
	 *
	 * @var Config $config The config instance.
	 */
	protected Config $config;

	/**
	 * The constructor.
	 *
	 * @param Application $app The application instance.
	 */
	public function __construct( Application $app, Config $config) {
		$this->app = $app;
		$this->config = $config;
	}

	/**
	 * Set the properties.
	 *
	 * @param string $name The name.
	 * @param array  $arguments The arguments.
	 *
	 * @return void
	 */
	public function __call( string $name, array $arguments): void
	{
		if (property_exists($this, $name)) {
			$this->$name = $arguments[0];
		}
	}

	/**
	 * Check if the plan is allowed.
	 *
	 * @param string $plan The plan.
	 *
	 * @return bool True if the plan is allowed, false otherwise.
	 */
	public function isAllowedPlan( string $plan): bool
	{
		if (empty($plan)) {
			return false;
		}

		$transient_key = '__allowed_plans';
		$allowed_plans = OptionRepository::getTransient($transient_key);

		if (! empty($allowed_plans)) {
			return in_array($plan, $allowed_plans, true);
		}

		$response = wp_remote_post(
			$this->config->getAllowedPlansLink(),
			[
				'timeout' => 30,
				'redirection' => 5,
				'httpversion' => '1.1',
				'sslverify' => false,
				'body' => [
					'id' => $this->config->getProductIdentifier(),
				],
			]
		);

		if (is_wp_error($response)) {
			return false;
		}

		$response_body = json_decode(wp_remote_retrieve_body($response), true);

		$allowed_plans = $response_body['data'] ?? [];

		if (empty($allowed_plans)) {
			return false;
		}

		OptionRepository::setTransient($transient_key, $allowed_plans, 60 * 60 * 24 * 30);

		return in_array($plan, $allowed_plans, true);
	}
}
