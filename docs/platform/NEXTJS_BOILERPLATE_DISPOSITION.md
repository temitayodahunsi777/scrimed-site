# Legacy `nextjs-boilerplate` Disposition

## Finding

The SCRIMED repository contains no reference to project `prj_dksCaA0qDJOF206DAV99hQlqTqJX`, its deployment domains, or the name `nextjs-boilerplate`. It is not an active SCRIMED source, build, domain, connector, migration, or runtime dependency.

## Disposition

`LEGACY — NO SCRIMED PRODUCTION DEPENDENCY`

- Why it exists: historical Vercel bootstrap project; exact original purpose is not evidenced in this repository.
- Safe to leave: yes, provided it has no secrets, paid resources, traffic, or stale domain authority.
- Runtime: Vercel currently reports Node `22.x`. Updating to Node 24 may remove account-level runtime warnings, but cannot be validated from this repository.
- Security/cost: unresolved owner review should inspect environment variables, domains, traffic, integrations, spend, and access before deciding whether to retain or archive it.
- Deletion: prohibited in this migration. Archive or deletion is an explicit Vercel owner decision.

## Owner Action

The Vercel project owner should inventory the legacy project, remove any unnecessary secrets or domains through a separately approved action, and either update its own source/runtime to Node 24 or formally archive it. Do not attach SCRIMED production domains to it.
