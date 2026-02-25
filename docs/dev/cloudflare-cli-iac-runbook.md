# Cloudflare CLI + IaC Runbook

This project can be operated without using the Cloudflare dashboard for day-to-day changes.

## Required Secrets

Set these in GitHub repository secrets:

- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`
- `CLOUDFLARE_PAGES_PROJECT_NAME`

## Token Scope (Minimum)

- Account: `Cloudflare Pages:Edit`
- Zone: `DNS:Edit`
- Zone: `Zone:Read`

If the same token is used for more resources later, expand scopes then.

## Local Auth

Use environment variables locally:

```bash
export CLOUDFLARE_API_TOKEN="<token>"
export CLOUDFLARE_ACCOUNT_ID="<account_id>"
```

Verify:

```bash
bunx wrangler whoami
```

## Pages Deploy via CLI

```bash
bun run build
bunx wrangler pages deploy dist --project-name "<project_name>" --branch main
```

Production deployments are automated in `.github/workflows/deploy-cloudflare.yml`.

## DNS via Terraform

Directory: `infra/cloudflare`

```bash
cd infra/cloudflare
cp terraform.tfvars.example terraform.tfvars
```

Set API token as Terraform variable:

```bash
export TF_VAR_cloudflare_api_token="$CLOUDFLARE_API_TOKEN"
```

Apply:

```bash
terraform init
terraform plan
terraform apply
```

## One-time Bootstrap Checklist

1. Ensure Cloudflare Pages project already exists.
2. Add repository secrets listed above.
3. Run the deploy workflow manually once (`workflow_dispatch`) to verify.
4. Configure DNS with Terraform.

After this, all regular operations can be done from CLI + GitHub Actions.
