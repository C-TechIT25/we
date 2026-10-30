# Admin analytics

Open `/admin/analytics` from the admin sidebar. Filter by company and the last 7, 30, or 90 UTC calendar days, including today. Refresh to fetch new activity.

Public profiles write append-only events to `analyticsEvents` in Firestore. Both normal and modern layouts are covered; admin previews are excluded. Profile views count page loads, not unique users. Link impressions count each published link once per page load after at least 50% becomes visible. Clicks include keyboard activation and middle clicks. Multiple placements of the same link share one impression per load. Social platform names are inferred from destination hostnames. No visitor identifiers, contact details, or full URLs are stored in events.

The charts show daily profile views and clicks, plus clicks by platform. The platform table shows impressions and clicks; repeated clicks can make the ratio exceed 100%. These metrics do not measure activity inside external social apps. Old traffic cannot be reconstructed.

## Firebase setup

Merge `analytics-firestore.rules.example` into the deployed Firestore rules under the existing documents block, using your existing admin authorization predicate for reads. No deployed rules or Firebase credentials were available for verification in this workspace; the example is intentionally not a replacement rules file. Do not replace existing company/link rules. Public event creation must be allowed and reads must be restricted to admins. A broader existing wildcard allow rule will still apply; Firestore allows are additive.

The query uses only `createdAt` and its default single-field index, then filters companies in memory. It reads all events in the selected range. At high volume, move to server-side daily aggregation and a validated collection endpoint with abuse controls; client-submitted events can be fabricated and are not billing-grade data.

## Live verification after deploying

Open a public company profile, scroll through links, and click one. In Admin → Analytics, refresh and select that company: expect one new profile view, one impression per visible link, and one click for the selected platform. Repeat with a modern layout and a custom-domain profile. Refresh the public page to confirm a new page view; admin previews should generate no events. Confirm anonymous clients cannot read, modify, or delete events. A failed analytics write must not interrupt public navigation.
