// create-wp-env.js
const fs = require('fs');

const [category] = process.argv.slice(2);

// Read the .pr-env.json file
const prEnv = JSON.parse(fs.readFileSync('.pr-env.json', 'utf-8'));

// Merge the .plugins property with static plugins
let plugins;

switch (category) {
	case 'woocommerce':
		plugins = [
			...(prEnv.plugins || []),
			...[
				'https://downloads.wordpress.org/plugin/woocommerce.latest-stable.zip',
			],
		];
		break;
	case 'freemius':
		plugins = prEnv.plugins;
		break;
	case 'plugins':
		plugins = [
			...(prEnv.plugins || []),
			...[
				'https://downloads.wordpress.org/plugin/icon-block.latest-stable.zip',
			],
		];
		break;
	default:
		plugins = [
			...(prEnv.plugins || []),
			...[
				'https://downloads.wordpress.org/plugin/svg-support.latest-stable.zip',
			],
		];
		break;
}

// Create the .wp-env.json content
const wpEnvContent = {
	plugins,
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
