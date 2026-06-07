# Gavin & Jessica | Digital Wedding Invitation

This is a fresh wedding invitation project created in its own folder. It includes an animated envelope reveal, customizable guest greetings, a story section, and an RSVP data capture form.

## Included files

- `index.html` — animated digital invitation with personalized guest greeting
- `rsvp.html` — RSVP form for attendance, guest count, dietary notes, and messages
- `styles.css` — elegant and responsive typography, layout, and envelope animation
- `script.js` — guest personalization, envelope animation, and RSVP local storage support

## How to use

1. Deploy the `wedding-invitation` folder to any static host (GitHub Pages, Netlify, Vercel, etc.).
2. Share the invitation link with guests.
3. Personalize the guest greeting by appending `?guest=First+Name`.

Example:

`https://your-domain.com/wedding-invitation/?guest=Emma`

## RSVP configuration

- The RSVP form uses a placeholder FormSubmit address: `https://formsubmit.co/your-email@example.com`.
- Replace this with your own email endpoint or backend URL to receive RSVP submissions by email.
- The form also stores responses locally in browser storage under `wedding-rsvps`.

## Customization tips

- Update the wedding venue, date, and time in `index.html`.
- Replace sample photo placeholders with your own images or custom graphic cards.
- Change the contact email in `rsvp.html` to your preferred RSVP destination.
