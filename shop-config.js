// Checkout uses server-controlled Stripe Price IDs, never browser amounts.
window.PARAMETRIC_SHOP = {
  checkoutEndpoint: '',
  projects: [{
    id: 'trout',
    action: 'swim',
    title: 'Trout',
    section: '3d',
    category: 'PRINT STUDY / 001',
    summary: 'Iridescent form, in motion.',
    description: [
      'Articulated Trout V10, assembled and finished in coral, mint and violet silk colors. Explore the detailed scales, sculpted head, rebuilt dorsal attachment and rounded rear fin.',
      'Based on the supplied Articulated_Trout_V10.3mf. The assembled geometry is optimized for the interactive viewer, with a flowing swim action.'
    ],
    modelUrl: 'assets/models/trout-v10.glb',
    available: false
  }, {
    id: 'baguette-holder',
    action: 'open',
    title: 'Baguette holder',
    section: '3d',
    category: 'PRINT STUDY / 002',
    summary: 'A printable baguette case with a hinged lid, integrated latches and carry-strap eyes.',
    description: [
      'Explore the working printable design, with integrated center snaps, a rim hinge, recessed latch grips and strap roots that blend into the body.',
      'Open the lid, inspect the hinge and latch sections, separate the print segments, and review the matching CAD renders and print files.'
    ],
    modelUrl: 'assets/models/baguette-holder.glb',
    available: false
  }, {
    id: 'modular-garage',
    experience: 'garage',
    title: 'Modular garage',
    section: '3d',
    category: 'PRINT STUDY / 003',
    summary: 'A rolling door. A folding roof. Room to grow.',
    description: [
      'The latest garage design combines each floor, rear wall and side walls into one continuous structural shell. Twelve articulated door slats and a two-part roof open the workshop; the roof folds underneath itself and stows behind the rear wall.',
      'September 11 print revision: matching brick exteriors, flat-backed fronts, simpler roller hinges and reviewed print orientations. Explore the assembly or inspect all 43 parts in their supplied print positions.'
    ],
    modelUrl: 'assets/models/garage-simplified-structure.glb?v=927d05540c',
    previewModelUrl: 'assets/models/home/modular-garage-simplified.glb?v=927d05540c',
    image: 'assets/garage/revision-garage.jpg',
    imageAlt: 'The latest garage with its roof half open and rolling door raised, rendered from the September 11 Blender model.',
    available: false
  }, {
    id: 'station',
    title: 'Station',
    section: 'hardware',
    category: 'HARDWARE / 001',
    action: 'station',
    summary: 'A pocket companion for the minute you’re in.',
    description: [
      'A small aluminum companion for the clock, the weather and the next train. Station brings useful information into the room, with a round AMOLED display, touch and voice.',
      'From the bedside to the kitchen: glance at your commute, start a timer, change a light or settle into a quiet night clock. Station OS brings these everyday interactions together on the Waveshare ESP32-S3-Touch-AMOLED-1.75C.',
      'Explore the app states above. The interactive screen demos pair sample data with expressive lighting and motion, imagining what Station can feel like in everyday use. The device is a visual reconstruction; small exterior details are illustrative, not manufacturing CAD.'
    ],
    specs: [['Body','Aluminum · Ø 51 × 12.1 mm'],['Display','1.75″ AMOLED · 466 × 466'],['Interaction','Two-point touch · dual microphones'],['Audio','ES7210 input · ES8311 playback'],['Compute','ESP32-S3R8 · 8 MB PSRAM · 16 MB flash'],['Connectivity','2.4 GHz Wi-Fi · Bluetooth LE · USB-C'],['Sensors','Six-axis IMU · real-time clock'],['Carry','Pocket-sized circular enclosure']],
    features: [
      ['Wake to the day','Time, weather and transit share a glanceable home screen.'],
      ['Know your next train','Saved subway lines and arrival countdowns, without reaching for your phone.'],
      ['A voice in the room','Listening, thinking and response states make the conversation visible.'],
      ['Make the room respond','Timers, lights and scenes with focused, on-screen confirmations.']
    ],
    modelUrl: 'assets/models/station.glb',
    available: false  }, {
    id: 'csi-presence',
    experience: 'radar',
    title: 'CSI Presence',
    section: 'hardware',
    category: 'HARDWARE / 002',
    image: 'assets/csi-topology.svg',
    imageAlt: 'Schematic of eight ESP32 sensing nodes, crossing radio links, and two rooms. An illustrative diagram.',
    summary: 'Presence across every level. Explore a simulated sensor network across two to four floors.',
    description: ['Compare six hardware configurations, sensors at multiple heights, independent presence on each floor, and stairwell transitions in a simulated building.'],
    available: false
  }]
};
