// create-wp-env.js
const fs = require('fs');

const [category] = process.argv.slice(2);

// Read the .pr-env.json file.
const prEnv = JSON.parse(fs.readFileSync('.pr-env.json', 'utf-8'));
// Read the config from wp-env-configs files.
const wpEnvConfig = fs.readFileSync(
	'.github/wp-env-configs/' + category + '.json',
	'utf-8'
);

// Create the .wp-env.json content.
const wpEnvContent = {
	...(wpEnvConfig.hasOwnProperty('themes')
		? { themes: wpEnvConfig.themes }
		: {}),
	plugins: [...(wpEnvConfig?.plugins || []), ...(prEnv?.plugins || [])],
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

console.log(
	'Merged plugins between .pr-env.json file and required plugins of matrix category and written to .wp-env.json'
);
