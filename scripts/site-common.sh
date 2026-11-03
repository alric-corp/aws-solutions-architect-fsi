#!/usr/bin/env bash
# Shared AWS selection. Credentials remain in the local AWS provider chain.
set -euo pipefail
SITE_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SITE_PROFILE="${AWS_PROFILE:-default}"
SITE_REGION="${AWS_REGION:-sa-east-1}"
SITE_STACK="${SITE_STACK_NAME:-aws-sa-fsi-site}"
SITE_EXPECTED_ACCOUNT="${SITE_ACCOUNT_ID:-712107929769}"
export AWS_PAGER=""
export AWS_CLI_AUTO_PROMPT=off

aws_site() {
  aws --profile "$SITE_PROFILE" --region "$SITE_REGION" "$@"
}

check_site_account() {
  local actual
  actual="$(aws_site sts get-caller-identity --query Account --output text)"
  if [[ "$actual" != "$SITE_EXPECTED_ACCOUNT" ]]; then
    printf 'Conta AWS incorreta: esperado %s, recebido %s.\n' "$SITE_EXPECTED_ACCOUNT" "$actual" >&2
    exit 1
  fi
  printf 'Conta %s | perfil %s | região %s | stack %s\n' "$actual" "$SITE_PROFILE" "$SITE_REGION" "$SITE_STACK"
}

read_site_outputs() {
  local outputs
  outputs="$(aws_site cloudformation describe-stacks --stack-name "$SITE_STACK" --query 'Stacks[0].Outputs' --output json)"
  SITE_BUCKET="$(node -e 'const o=JSON.parse(process.argv[1]); console.log(o.find(x=>x.OutputKey==="BucketName")?.OutputValue||"")' "$outputs")"
  SITE_DISTRIBUTION="$(node -e 'const o=JSON.parse(process.argv[1]); console.log(o.find(x=>x.OutputKey==="DistributionId")?.OutputValue||"")' "$outputs")"
  SITE_URL="$(node -e 'const o=JSON.parse(process.argv[1]); console.log(o.find(x=>x.OutputKey==="SiteUrl")?.OutputValue||"")' "$outputs")"
  local expected_bucket="${SITE_STACK}-${SITE_EXPECTED_ACCOUNT}-${SITE_REGION}"
  if [[ "$SITE_BUCKET" != "$expected_bucket" || ! "$SITE_DISTRIBUTION" =~ ^[A-Z0-9]+$ || ! "$SITE_URL" =~ ^https://[a-z0-9]+\.cloudfront\.net$ ]]; then
    printf 'Outputs da stack inválidos. Nenhum arquivo será publicado.\n' >&2
    exit 1
  fi
  mkdir -p "$SITE_ROOT/.site"
  node -e 'const fs=require("node:fs"); const [file,account,region,stack,bucket,distribution,url]=process.argv.slice(1); fs.writeFileSync(file,JSON.stringify({account,region,stack,bucket,distribution,url},null,2)+"\n")' \
    "$SITE_ROOT/.site/deployment.json" "$SITE_EXPECTED_ACCOUNT" "$SITE_REGION" "$SITE_STACK" "$SITE_BUCKET" "$SITE_DISTRIBUTION" "$SITE_URL"
}
