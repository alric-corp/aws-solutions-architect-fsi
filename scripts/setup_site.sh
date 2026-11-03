#!/usr/bin/env bash
set -euo pipefail
source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/site-common.sh"
check_site_account
aws_site cloudformation validate-template --template-body "file://$SITE_ROOT/site/aws-stack.json" --query Description --output text
aws_site cloudformation deploy \
  --stack-name "$SITE_STACK" \
  --template-file "$SITE_ROOT/site/aws-stack.json" \
  --tags Project=aws-solutions-architect-fsi \
  --no-fail-on-empty-changeset
read_site_outputs
printf '\nInfraestrutura pronta: %s\nPublique o conteúdo com: npm run deploy\n' "$SITE_URL"
