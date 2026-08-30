# Preboarding for Next Project: scope (one-pager)

*Background note, BSO Sunset. Owner: Carl Bäckström. Last updated: 2026-06-12.*

## What we are building

A preboarding flow where the customer prepares on their own, on the web, with no consultant involvement, and where "done" automatically creates a ticket on our side. It covers Next Project and works for both BSO migrations and new customers. The faster the customer finishes, the faster we get going.

## The customer's steps (on the web)

1. Company details: legal name, prefix/acronym, company registration number, plus country and language.
2. Their business and background: type of work, number of office staff and field workers, regions and offices, whether they operate locally/nationally/internationally, and whether they come from Byggsamordnaren (BSO).
3. Superusers with their project role (at least 2).
4. Next Project webinars (three), checked off per person.
5. Responsibility split, plus an optional AI consent for a more efficient migration.
6. Prepare and upload: GI template and supporting files. For BSO customers, also IT contact and confirmed project clean-up.

## BSO branch

If the customer comes from Byggsamordnaren, we collect an IT contact and the customer confirms that project statuses are cleaned up: only projects they are currently working in have status Ongoing. All others have a different status or are closed and will not be included in the import to Next.

## What happens when everything is done (two stages)

BSO customer:
1. Ticket to Aceve Technical Support: the customer is ready for a first data export. The export is placed in the customer folder on SharePoint.
2. When the export is done, the next ticket is created automatically to Next PS: book the kickoff meeting and review the data.

New customer without BSO: a ticket straight to Next PS for a kickoff meeting.

## Development option (widens scope beyond Next)

The tool is built for Aceve, not only Next Project. The next level:

- Product funnel: based on country, region, industry and size, the customer is guided to the right product or products (Next, Entré, Craftnote, and others), not only Next Project.
- Add-ons: for the chosen product, relevant add-ons are listed. If the customer runs Next Project, possible add-ons are suggested.
- Lead generation: the profile questions (industry, type of work, size, geography) qualify the lead and prepare the right setup, in the spirit of customer-prep-briefing.

This has significant room to grow and should be taken as a separate track once the core loop is locked.

## In scope now

The customer's steps, the completion ticket, the two-stage ticket flow for BSO, and reusability for new Next customers.

## Out of scope / parked

- Clean-cut marking in Byggsamordnaren (project manager guide).
- Export tool improvements, filter and error list (owners Jonas/Tomas W).
- Selling templates (decision Dennis/Carina).
- Hosting of the web solution (IT approval; Pierre is building a prototype).

## Next step

Lock the core loop (preboarding to ticket to export to kickoff) as the minimum deliverable. Take the product funnel and add-ons as the next development track.
