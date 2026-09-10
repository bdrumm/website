// Checkout uses server-controlled Stripe Price IDs, never browser amounts.
window.PARAMETRIC_SHOP = {
  "checkoutEndpoint": "",
  "projects": [
    {
      "id": "arowana",
      "title": "Arowana",
      "category": "3D STUDY / 001",
      "summary": "Iridescent form, in motion.",
      "description": [
        "An arowana in coral, mint and violet. Raised scales, sweeping fins and a fan tail turn the reference image into a sculptural study.",
        "This is a photo-inspired 3D concept, not a scan. Shapes and unseen surfaces are approximated from a single photograph."
      ],
      "modelUrl": "assets/models/arowana-concept.glb",
      "available": false
    },
    {
      "id": "modular-garage",
      "experience": "garage",
      "title": "Modular garage",
      "section": "3d",
      "category": "PRINT STUDY / 003",
      "summary": "A rolling door. A folding roof. Room to grow.",
      "description": [
        "A 3D printed garage with twelve articulated door slats, a bottom handle and a folding roof with simple hinges. Open the workshop, separate its parts, or arrange the garage, kitchen and dining modules together.",
        "Based on the supplied Garage_Simple_Roof_Hinges.blend. The original geometry and animation are retained, with physically based materials and studio lighting."
      ],
      "modelUrl": "assets/models/garage-simple-hinges.glb",
      "image": "assets/garage/simple-garage-thumbnail.jpg",
      "imageAlt": "The modular garage with its folding roof open and rolling door partly raised, rendered from the original model.",
      "available": false
    },
    {
      "id": "station",
      "title": "Station",
      "section": "hardware",
      "category": "HARDWARE / 001",
      "action": "station",
      "summary": "A pocket companion for the minute you’re in.",
      "description": [
        "A small aluminum companion for the clock, the weather and the next train. Station brings useful information into the room, with a round AMOLED display, touch and voice.",
        "From the bedside to the kitchen: glance at your commute, start a timer, change a light or settle into a quiet night clock. Station OS brings these everyday interactions together on the Waveshare ESP32-S3-Touch-AMOLED-1.75C.",
        "Explore the app states above. The interactive screen demos pair sample data with expressive lighting and motion, imagining what Station can feel like in everyday use. The device is a visual reconstruction; small exterior details are illustrative, not manufacturing CAD."
      ],
      "specs": [
        [
          "Body",
          "Aluminum · Ø 51 × 12.1 mm"
        ],
        [
          "Display",
          "1.75″ AMOLED · 466 × 466"
        ],
        [
          "Interaction",
          "Two-point touch · dual microphones"
        ],
        [
          "Audio",
          "ES7210 input · ES8311 playback"
        ],
        [
          "Compute",
          "ESP32-S3R8 · 8 MB PSRAM · 16 MB flash"
        ],
        [
          "Connectivity",
          "2.4 GHz Wi-Fi · Bluetooth LE · USB-C"
        ],
        [
          "Sensors",
          "Six-axis IMU · real-time clock"
        ],
        [
          "Carry",
          "Pocket-sized circular enclosure"
        ]
      ],
      "features": [
        [
          "Wake to the day",
          "Time, weather and transit share a glanceable home screen."
        ],
        [
          "Know your next train",
          "Saved subway lines and arrival countdowns, without reaching for your phone."
        ],
        [
          "A voice in the room",
          "Listening, thinking and response states make the conversation visible."
        ],
        [
          "Make the room respond",
          "Timers, lights and scenes with focused, on-screen confirmations."
        ]
      ],
      "modelUrl": "assets/models/station.glb",
      "available": false
    }
  ]
};
