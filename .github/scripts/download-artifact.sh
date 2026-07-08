#!/usr/bin/env bash

set -euo pipefail

OWNER="blockeraai"
REPO="blockera"
ARTIFACT_NAME="blockera"
BRANCH=""
WORKFLOW=""
OUTPUT=""
TOKEN="${GITHUB_TOKEN:-}"
RUN_ID=""
ARTIFACT_ID=""

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

log() {
	echo "$*" >&2
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
			log "Error: Unknown option '$1'"
			usage >&2
			exit 1
			;;
	esac
done

if [ -z "$TOKEN" ]; then
	log "Error: GITHUB_TOKEN environment variable is required."
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

resolve_artifact_from_branch() {
	local encoded_branch
	encoded_branch=$(jq -rn --arg branch "$BRANCH" '$branch|@uri')

	local runs_url="https://api.github.com/repos/$OWNER/$REPO/actions/workflows/$WORKFLOW/runs?branch=${encoded_branch}&status=success&per_page=1"
	RUN_ID=$(api "$runs_url" | jq -r '.workflow_runs[0].id // empty')

	if [ -z "$RUN_ID" ]; then
		log "Error: No successful '$WORKFLOW' runs found for branch '$BRANCH' in $OWNER/$REPO."
		exit 1
	fi

	log "Using workflow run ID $RUN_ID from branch '$BRANCH' in $OWNER/$REPO."

	ARTIFACT_ID=$(
		api "https://api.github.com/repos/$OWNER/$REPO/actions/runs/$RUN_ID/artifacts" \
			| jq --arg name "$ARTIFACT_NAME" '.artifacts | map(select(.name == $name and .expired == false)) | .[0].id // empty'
	)

	if [ -z "$ARTIFACT_ID" ]; then
		log "Error: Artifact '$ARTIFACT_NAME' not found in workflow run $RUN_ID."
		exit 1
	fi
}

resolve_latest_artifact() {
	local artifact
	artifact=$(
		api "https://api.github.com/repos/$OWNER/$REPO/actions/artifacts?per_page=100" \
			| jq --arg name "$ARTIFACT_NAME" '
				.artifacts
				| map(select(.name == $name and .expired == false))
				| sort_by(.created_at)
				| reverse
				| .[0] // empty
			'
	)

	if [ -z "$artifact" ] || [ "$artifact" = "null" ]; then
		log "Error: Artifact '$ARTIFACT_NAME' not found in $OWNER/$REPO."
		exit 1
	fi

	ARTIFACT_ID=$(echo "$artifact" | jq -r '.id')
	RUN_ID=$(echo "$artifact" | jq -r '.workflow_run.id // empty')

	if [ -z "$RUN_ID" ]; then
		log "Error: Could not resolve workflow run ID for artifact $ARTIFACT_ID."
		exit 1
	fi
}

if [ -n "$BRANCH" ]; then
	resolve_artifact_from_branch
else
	resolve_latest_artifact
fi

DOWNLOAD_URL="https://github.com/$OWNER/$REPO/actions/runs/$RUN_ID/artifacts/$ARTIFACT_ID"

log "Run ID: $RUN_ID"
log "Artifact ID: $ARTIFACT_ID"
log "Download URL: $DOWNLOAD_URL"

curl -sfSL \
	-H "Authorization: Bearer $TOKEN" \
	-H "Accept: application/vnd.github+json" \
	-o "$OUTPUT" \
	"$DOWNLOAD_URL"

echo "Downloaded as $OUTPUT"
