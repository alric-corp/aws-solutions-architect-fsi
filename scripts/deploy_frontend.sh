#!/usr/bin/env bash
set -euo pipefail
source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/site-common.sh"
cd "$SITE_ROOT"
if [[ $# -gt 1 || ( $# -eq 1 && "$1" != "--dry-run" ) ]]; then
  printf 'Uso: npm run deploy [-- --dry-run]\n' >&2
  exit 1
fi
check_site_account
read_site_outputs
npm run build
npm run check

# Check the exact bucket and distribution before syncing, including when credentials
# or stack overrides change. --delete is confined to this dedicated site's bucket.
aws_site s3api head-bucket --bucket "$SITE_BUCKET" --expected-bucket-owner "$SITE_EXPECTED_ACCOUNT"
origin="$(aws_site cloudfront get-distribution --id "$SITE_DISTRIBUTION" --query 'Distribution.DistributionConfig.Origins.Items[0].DomainName' --output text)"
if [[ "$origin" != "$SITE_BUCKET.s3.$SITE_REGION.amazonaws.com" ]]; then
  printf 'A distribuição não aponta para o bucket esperado. Deploy cancelado.\n' >&2
  exit 1
fi

if [[ "${1:-}" == "--dry-run" ]]; then
  aws_site s3 sync dist/ "s3://$SITE_BUCKET/" --delete --no-follow-symlinks --cache-control 'public,max-age=0,s-maxage=3600,must-revalidate' --dryrun
  printf '\nSimulação concluída. Nenhuma gravação ou invalidação foi realizada.\n'
  exit 0
fi

aws_site s3 sync dist/ "s3://$SITE_BUCKET/" --delete --no-follow-symlinks \
  --cache-control 'public,max-age=0,s-maxage=3600,must-revalidate' --only-show-errors
invalidation="$(aws_site cloudfront create-invalidation --distribution-id "$SITE_DISTRIBUTION" --paths '/*' --query Invalidation.Id --output text)"
printf 'Arquivos publicados. Aguardando invalidação %s...\n' "$invalidation"
aws_site cloudfront wait invalidation-completed --distribution-id "$SITE_DISTRIBUTION" --id "$invalidation"
printf '\nDeploy concluído: %s\n' "$SITE_URL"
