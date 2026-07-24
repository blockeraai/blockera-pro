// create-wp-env.js
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const [category] = process.argv.slice(2);
const [blockeraDownloadUrl] = process.argv.slice(3);

const ARTIFACT_URL_PATTERN =
	/^https:\/\/github\.com\/[^/]+\/[^/]+\/actions\/runs\/\d+\/artifacts\/\d+\/?$/;

// GitHub Actions artifact page URLs are not valid wp-env sources.
// Download + extract them to a local path that wp-env can mount.
function resolvePluginSource(pluginSource) {
	if (!ARTIFACT_URL_PATTERN.test(pluginSource)) {
		return pluginSource;
	}

	if (!process.env.GITHUB_TOKEN) {
		throw new Error(
			'GITHUB_TOKEN is required to download GitHub Actions artifacts for wp-env. ' +
				'Set secrets.BLOCKERABOT_PAT on the workflow step that runs create-wp-env.js.'
		);
	}

	const extractDir = '.github/cache/blockera-free';
	const scriptPath = path.join(__dirname, 'download-artifact.sh');

	const resolvedPath = execFileSync(
		'bash',
		[scriptPath, '--url', pluginSource, '--extract-dir', extractDir],
		{
			encoding: 'utf8',
			env: process.env,
			stdio: ['ignore', 'pipe', 'inherit'],
		}
	).trim();

	if (!resolvedPath) {
		throw new Error(
			`Failed to download GitHub Actions artifact: ${pluginSource}`
		);
	}

	console.log(`Resolved artifact to local wp-env source: ${resolvedPath}`);
	return resolvedPath;
}

function resolvePlugins(plugins) {
	return plugins.map(resolvePluginSource);
}

// Read the .pr-env.json file when present (PR-specific free plugin source).
let prEnv = { plugins: [] };
if (fs.existsSync('.pr-env.json')) {
	prEnv = JSON.parse(fs.readFileSync('.pr-env.json', 'utf-8'));
}

let wpEnvFilePath = '.github/wp-env-configs/' + category + '.json';

// While env file not exists we should use of general env file.
if (!fs.existsSync(wpEnvFilePath)) {
	wpEnvFilePath = '.github/wp-env-configs/general.json';
}

// Read the config from wp-env-configs files.
const wpEnvConfig = JSON.parse(fs.readFileSync(wpEnvFilePath, 'utf-8'));

const extraPlugins = blockeraDownloadUrl
	? [blockeraDownloadUrl]
	: prEnv?.plugins || [];

// Create the .wp-env.json content.
const wpEnvContent = {
	...(wpEnvConfig.hasOwnProperty('themes')
		? { themes: wpEnvConfig.themes }
		: {}),
	plugins: [
		...new Set(
			resolvePlugins([...(wpEnvConfig?.plugins || []), ...extraPlugins])
		),
	],
	config: {
		WP_DEBUG: false,
		SCRIPT_DEBUG: false,
		BLOCKERA_TELEMETRY_OPT_IN_OFF: true,
	},
	...(wpEnvConfig.hasOwnProperty('lifecycleScripts')
		? { lifecycleScripts: wpEnvConfig.lifecycleScripts }
		: {}),
};

// Write to .wp-env.json
fs.writeFileSync(
	'.wp-env.json',
	JSON.stringify(wpEnvContent, null, 2),
	'utf-8'
);
