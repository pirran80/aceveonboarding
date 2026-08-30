# Backup — aceveonboarding.achiever.se

> Detta projekt backas av **masterbackup** enligt standarden i
> `~/sites/masterbackup/docs/BACKUP-STANDARD.md`.
> Inga projektspecifika backup-lösningar får läggas till.

## Vad som backas

| Data | Var | Mekanism | RPO |
|---|---|---|---|
| SQLite-databasen `portal.db` (bind mount `./data/` i `/home/ubuntu/docker/aceveonboarding/`) | `/home/ubuntu/backups/aceveonboarding/` | masterbackup fil-backup (auto-discovery av projektmappen) | 24 h |

Ingen separat DB-container: appen kör SQLite via Prisma (driver adapter), så
DB-dump-scriptet (`ops/backup-databases.sh`) berör inte projektet. Datat skyddas
helt av fil-backupen — därför MÅSTE SQLite-filen ligga i bind-mounten `./data/`,
aldrig i en anonym volym (masterbackup-krav 4). Byts databasen till PostgreSQL
(planerat, se `docs/ARCHITECTURE.md` §4) ska den ligga i egen container med
officiell image och `POSTGRES_*`-variabler så dump-scriptet hittar den, och den
här filen uppdateras.

## Restore

1. Öppna https://masterbackup.lconsulting.se → projektet `aceveonboarding` →
   välj backup → restore av `data/`.
2. Alternativt manuellt: stoppa containern, lägg tillbaka `data/portal.db`
   (ägare uid 1001), starta igen:
   på produktionsservern (adress och SSH-användare finns i de privata
   infrastrukturinstruktionerna, inte här — repot är publikt):
   `cd docker/aceveonboarding && docker compose -f docker-compose.prod.yml stop app`
   — kopiera in filen — `... up -d app`.
3. Verifiera: startsidan listar ärenden (den läser ur databasen) och
   `docker logs aceveonboarding-app` visar "Existing database — skipping seed".

## Verifierat

- [ ] Projektet syns i masterbackup-UI:t med schema för fil-backup
- [x] DB-dump: N/A (SQLite i fil-backupen)
- Skapad: 2026-08-30 vid första driftsättningen — bocka av första punkten när
  schemat är satt i UI:t.
