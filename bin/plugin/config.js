/**
 * Internal dependencies
 */
const {
	createPluginCliConfig,
} = require('../../packages/global-packages/packages/dev-tools/bin/plugin/create-config');

const gitRepoOwner = 'blockeraai';

module.exports = createPluginCliConfig({
	slug: 'blockera-pro',
	name: 'Blockera PRO',
	team: 'Blockeraai',
	githubRepositoryOwner: gitRepoOwner,
	githubRepositoryName: 'blockera-pro',
	pluginEntryPoint: 'blockera-pro.php',
	buildZipCommand: '/bin/bash bin/build-plugin-zip.temp.sh',
	githubRepositoryURL:
		'https://github.com/' + gitRepoOwner + '/blockera-pro/',
	wpRepositoryReleasesURL:
		'https://github.com/' + gitRepoOwner + '/blockera-pro/releases/',
	gitRepositoryURL:
		'https://github.com/' + gitRepoOwner + '/blockera-pro.git',
	svnRepositoryURL: 'https://plugins.svn.wordpress.org/blockera',
	changelog: {
		archiveUrl:
			'https://github.com/' + gitRepoOwner + '/blockera-pro/releases',
		archiveLabel: 'Blockera PRO',
		includeCommitCount: true,
	},
});
