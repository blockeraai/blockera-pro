#!/usr/bin/env bash

set -euo pipefail

OWNER="blockeraai"
REPO="blockera"
ARTIFACT_NAME="blockera"
BRANCH=""
WORKFLOW=""
OUTPUT=""
TOKEN="${GITHUB_TOKEN:-}"

usage() {
	cat <<EOF
Usage: download-artifact.sh [options]

Download a GitHub Actions artifact from any repository.

Options:
  --owner OWNER       Repository owner (default: blockeraai)
  --repo REPO         Repository name (default: blockera)
  --name NAME         Artifact name (default: blockera)
  --branch BRANCH     Branch name to resolve the latest successful workflow run (optional)
  --workflow FILE     Workflow file name when using --branch (default: build-plugin-zip.yml)
  --output PATH       Output zip file path (default: \$REPO.zip)
  --help              Show this help

Environment:
  GITHUB_TOKEN        GitHub token for API authentication (required for cross-repo access)
EOF
}

while [[ $# -gt 0 ]]; do
	case "$1" in
		--owner)
			OWNER="$2"
			shift 2
			;;
		--repo)
			REPO="$2"
			shift 2
			;;
		--name)
			ARTIFACT_NAME="$2"
			shift 2
			;;
		--branch)
			BRANCH="$2"
			shift 2
			;;
		--workflow)
			WORKFLOW="$2"
			shift 2
			;;
		--output)
			OUTPUT="$2"
			shift 2
			;;
		--help)
			usage
			exit 0
			;;
		*)
			echo "Error: Unknown option '$1'" >&2
			usage >&2
			exit 1
			;;
	esac
done

if [ -z "$TOKEN" ]; then
	echo "Error: GITHUB_TOKEN environment variable is required." >&2
	exit 1
fi

OUTPUT="${OUTPUT:-${REPO}.zip}"
WORKFLOW="${WORKFLOW:-build-plugin-zip.yml}"

api() {
	curl -sfSL \
		-H "Authorization: Bearer $TOKEN" \
		-H "Accept: application/vnd.github+json" \
		-H "X-GitHub-Api-Version: 2022-11-28" \
		"$@"
}

find_artifact_id_from_branch() {
	local encoded_branch
	encoded_branch=$(jq -rn --arg branch "$BRANCH" '$branch|@uri')

	local runs_url="https://api.github.com/repos/$OWNER/$REPO/actions/workflows/$WORKFLOW/runs?branch=${encoded_branch}&status=success&per_page=1"
	local run_id
	run_id=$(api "$runs_url" | jq -r '.workflow_runs[0].id // empty')

	if [ -z "$run_id" ]; then
		echo "Error: No successful '$WORKFLOW' runs found for branch '$BRANCH' in $OWNER/$REPO." >&2
		exit 1
	fi

	echo "Using workflow run ID $run_id from branch '$BRANCH' in $OWNER/$REPO."

	local artifact_id
	artifact_id=$(
		api "https://api.github.com/repos/$OWNER/$REPO/actions/runs/$run_id/artifacts" \
			| jq --arg name "$ARTIFACT_NAME" '.artifacts | map(select(.name == $name and .expired == false)) | .[0].id // empty'
	)

	if [ -z "$artifact_id" ]; then
		echo "Error: Artifact '$ARTIFACT_NAME' not found in workflow run $run_id." >&2
		exit 1
	fi

	echo "$artifact_id"
}

find_latest_artifact_id() {
	local artifact_id
	artifact_id=$(
		api "https://api.github.com/repos/$OWNER/$REPO/actions/artifacts?per_page=100" \
			| jq --arg name "$ARTIFACT_NAME" '
				.artifacts
				| map(select(.name == $name and .expired == false))
				| sort_by(.created_at)
				| reverse
				| .[0].id // empty
			'
	)

	if [ -z "$artifact_id" ]; then
		echo "Error: Artifact '$ARTIFACT_NAME' not found in $OWNER/$REPO." >&2
		exit 1
	fi

	echo "$artifact_id"
}

if [ -n "$BRANCH" ]; then
	ARTIFACT_ID=$(find_artifact_id_from_branch)
else
	ARTIFACT_ID=$(find_latest_artifact_id)
fi

echo "Artifact ID: $ARTIFACT_ID"

api -o "$OUTPUT" \
	"https://api.github.com/repos/$OWNER/$REPO/actions/artifacts/$ARTIFACT_ID/zip"

echo "Downloaded as $OUTPUT"
