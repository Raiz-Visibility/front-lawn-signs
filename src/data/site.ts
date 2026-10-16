// OWNER SETTINGS — edit these to update the site.
export const site = {
  name: 'Front Yard Signs',
  title: 'Front Yard Signs | Lawn Displays in Angus, Ontario',
  description:
    'Fun, colourful, personalized lawn displays delivered, set up and picked up for you. Birthdays, anniversaries, new babies and more. Serving Angus and North Simcoe, Ontario.',
  ogDescription:
    'Make any occasion a BIG celebration! Personalized lawn displays delivered, set up and picked up for you in Angus and North Simcoe.',
  url: 'https://frontyardsigns.ca',

  // Contact details shown in the footer. Leave blank to show a "[Add …]" placeholder.
  phone: '',
  email: '',

  instagram: 'https://www.instagram.com/frontyardsigns',
  facebook: 'https://www.facebook.com/profile.php?id=61595078723755',

  // Add ONE of these to start receiving orders:
  // - formEndpoint: a form service address (Formspree, Getform, etc.). Orders are POSTed as JSON.
  //   Can also be set with the PUBLIC_FORM_ENDPOINT env var / GitHub repo variable.
  // - ownerEmail: opens the visitor's email app with the order filled in.
  formEndpoint: import.meta.env.PUBLIC_FORM_ENDPOINT || '', // e.g. "https://formspree.io/f/xxxxxxx"
  ownerEmail: '', // e.g. "orders@frontyardsigns.ca"
};
