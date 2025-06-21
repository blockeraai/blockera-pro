// create-wp-env.js
const fs = require('fs');

const [category] = process.argv.slice(2);

// Read the .pr-env.json file.
const prEnv = JSON.parse(fs.readFileSync('.pr-env.json', 'utf-8'));

let wpEnvFilePath = '.github/wp-env-configs/' + category + '.json';

// While env file not exists we should use of general env file.
if (!fs.existsSync(wpEnvFilePath)) {
	wpEnvFilePath = '.github/wp-env-configs/general.json';
}

// Read the config from wp-env-configs files.
const wpEnvConfig = JSON.parse(fs.readFileSync(wpEnvFilePath, 'utf-8'));

// Create the .wp-env.json content.
const wpEnvContent = {
	...(wpEnvConfig.hasOwnProperty('themes')
		? { themes: wpEnvConfig.themes }
		: {}),
	plugins: [
		...new Set([
			...(wpEnvConfig?.plugins || []),
			...(prEnv?.plugins || []),
		]),
	],
	config: {
		WP_DEBUG: false,
		SCRIPT_DEBUG: false,
		BLOCKERA_TELEMETRY_OPT_IN_OFF: true,
	},
};

// Write to .wp-env.json
fs.writeFileSync(
	'.wp-env.json',
	JSON.stringify(wpEnvContent, null, 2),
	'utf-8'
);
