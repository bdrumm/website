// Checkout uses server-controlled Stripe Price IDs, never browser amounts.
window.PARAMETRIC_SHOP = {
  checkoutEndpoint: '',
  projects: [{
    id: 'arowana',
    title: 'Arowana',
    category: '3D STUDY / 001',
    summary: 'Iridescent form, in motion.',
    description: [
      'An arowana in coral, mint and violet. Raised scales, sweeping fins and a fan tail turn the reference image into a sculptural study.',
      'This is a photo-inspired 3D concept, not a scan. Shapes and unseen surfaces are approximated from a single photograph.'
    ],
    image: 'assets/arowana-reference.png',
    imageAlt: 'Coral, mint and violet arowana sculpture on a tabletop — original reference photograph',
    modelUrl: 'assets/models/arowana-concept.glb',
    available: false
  }]
};
