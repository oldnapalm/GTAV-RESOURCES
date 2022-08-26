/**
 * This file is licensed under the MIT License.
 * 
 * Some code taken from https://github.com/actions/upload-release-asset
 */

const core = require("@actions/core");
const { GitHub } = require("@actions/github");
const fs = require("fs");

/**
 * 
 * @param {GitHub} github 
 * @param {*} name 
 */
async function uploadAsset(github, name) {
	const url = core.getInput("upload_url", { required: true });
	const assetPath = name;
	const contentType = core.getInput("asset_content_type", { required: true });

	const contentLength = filePath => fs.statSync(filePath).size;

	const headers = { 'content-type': contentType, 'content-length': contentLength(assetPath) };

	const uploadAssetResponse = await github.repos.uploadReleaseAsset({
		url,
		headers,
		name,
		file: fs.readFileSync(assetPath)
	});

	return uploadAssetResponse.data.browser_download_url;
}

async function run() {
	try {
		const releaseId = core.getInput("release_id", { required: true });
		let path = core.getInput("asset_path", { required: true });
		const github = new GitHub(process.env.GITHUB_TOKEN);
		const repository = process.env.GITHUB_REPOSITORY.split('/');
		const owner = repository[0];
		const repo = repository[1];

		core.info("Checking previous assets");
		let assets = await github.repos.listAssetsForRelease({
			owner: owner,
			repo: repo,
			release_id: parseInt(releaseId),
			per_page: 100
		});

		assets.data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

		fs.readdirSync(path).forEach(async file => {path = file;
			let existingAssetNameId = undefined;
			for (let i = 0; i < assets.data.length; i++) {
				const asset = assets.data[i];
				if (asset.name == path) {
					// not commit hash or date in filename, always force upload here
					existingAssetNameId = asset.id;
				}
			}
			if (existingAssetNameId !== undefined) {
				core.info("Deleting old asset of same name first");
				await github.repos.deleteReleaseAsset({
					owner: owner,
					repo: repo,
					asset_id: existingAssetNameId
				});
			}
			core.info("Uploading asset as file " + path);
			await uploadAsset(github, path);  
		});
	} catch (error) {
		core.setFailed(error.message);
	}
}

function pad2(v) {
	v = v.toString();
	while (v.length < 2) v = "0" + v;
	return v;
}

run();
