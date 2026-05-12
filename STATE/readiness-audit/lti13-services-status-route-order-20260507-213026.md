# LTI 1.3 Services Status Route Order Fix

Date: 20260507-213026

Fixed route order so:

/api/lti13/services-status

is registered before the React SPA static fallback.

Reason:
The endpoint was returning index.html instead of JSON, which means the SPA fallback caught the API route first.
