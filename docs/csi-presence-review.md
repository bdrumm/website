# CSI Presence — technical review and website demo

Reviewed 2026-09-10 against the local csi-presence source and firmware version 1.8.0. This report deliberately omits live configuration, recordings, private addresses, Wi-Fi credentials, and camera imagery. Paths in the audits are relative to the source project.

## Deliverable and integration

The project is added to Parametric Space at `project.html?id=csi-presence`, with a catalogue entry and homepage index link. Native site typography, theme preferences, and navigation are retained. No shopping capability is enabled for this project. No firmware or device configuration is modified.

The current demo retains the source-derived 2D RTI reconstruction and adds six hardware configurations with a separate XYZ estimator. Defaults are 8 perimeter CSI nodes, 28 links, a 10 × 6 × 3 m volume, 67 × 40 floor cells, λ=0.6 m, α=5, threshold .7 and 6 s room holds. The UI now opens in the proposed depth-plus-mmWave configuration across three building floors. See [multi-floor presence setup](csi-building-presence.md) for global height, per-floor evidence, outages and stairwell handoff. Each floor retains the original reconstruction dimensions.

The precision estimator consumes only simulated measured camera rays, ranges or registered 3D points. It does not receive ground truth. Z is one sensed reference point above the floor, not full body height. Flat/coplanar range geometry is rejected when ambiguous; equal-height cameras can still recover Z. The floor/elevation views expose measurement sources, estimated coordinates, modeled spread and error against synthetic truth.

Six versions explore CSI; ESP32 camera/LD2410 geometry; TI 3D radar; Qorvo tagged UWB; RealSense depth with radar; and sixteen synchronized optical marker cameras. Controls include placement at multiple heights, survey-frame bias and sensor loss. Each version has manufacturer sources, a proposed bill of materials, integration requirements and independent model assumptions. Read [hardware research and proposed architecture](csi-hardware-research.md) and the [reference synthetic survey](csi-hardware-survey.json).

The browser does not run firmware, raw I/Q scoring, vendor tracking SDKs, JPEG decoding, actual sensor calibration, multiple-person association, BLE/RSSI localization or OTA. The OTA sequence is an explanatory walkthrough. Camera fields obey the simplified partition/range mask; valid spatial fixes can support occupancy when CSI motion drains. Target semantics change explicitly between disturbance, centroid, keypoint, tag and marker.

### Validation of the current implementation

- Original RTI parity against NumPy was within 5.8e-15 across 4–12 nodes; the RTI equations remain unchanged.
- All **111 site checks passed**: 29 existing checks, 12 simulation/scenario checks, 23 fusion geometry checks, 20 hardware-preset checks and 27 building checks.
- The preset suite exercises 36 hardware/layout/condition combinations across 3,888 synthetic point/time samples, plus live-engine combinations. It covers optical persistence, sensor toggles, height ambiguity, truth separation, calibration bias, point metadata and partition masking.
- The interactive comparison uses 144 shared points/phases per version; reports coverage, median/p95/max XYZ error and the fraction of all points within 1 cm; and exports labeled JSON.
- Optional WebMCP tools share the model's actions and expose hardware, mounting layout, measurement conditions, floor count, viewed floor, local Z and building state. No supported browser WebMCP validation context was available; registration/execution are not independently verified.
- Browser screenshots and interaction QA were not performed. Builds and local static-route checks are documented at handoff.

### Fidelity and remaining limitations

All performance figures in the browser are consequences of chosen deterministic noise and idealized correspondence. They are not validated measurements of the named products. Common registration bias is modeled explicitly; temporal mismatch, NLOS bias, human-point disagreement, calibration drift in individual mounts and multi-target data association remain excluded. The source firmware/operator-console audit below describes the original project and is preserved separately from the new proposed browser capabilities.



---

## Firmware and hardware

# CSI Presence firmware audit

Audit scope: tracked source and defaults in `firmware/csi_node`. No credentials, personal/generated sdkconfigs, build artifacts, vendor source, or live hardware inspected. Paths below are relative to `firmware/csi_node` unless otherwise stated. This audit describes current code and tracked configuration; it does not certify deployed hardware behavior.

## Architecture and build variants

The firmware is version **1.8.0** (`CMakeLists.txt:58`), an ESP-IDF/FreeRTOS C application. Sensing nodes join WiFi as stations, send small ESP-NOW broadcast sensing frames, capture channel state information from a host-provided MAC allowlist, and forward records to the host. AP beacons supply another illumination link (`main/csi_node_main.c:4`).

Five fleet build variants are explicit: **esp32, esp32s3, esp32c6, esp32-cam, esp32p4** (`build-all.sh:19`). Each receives a separate build directory and sdkconfig (`build-all.sh:24`). Project dependencies include the Espressif camera driver for ESP32/S2/S3, hosted WiFi/remote API for P4, and `esp_video 2.4.*` for P4 (`main/idf_component.yml:9`). The build script directs developers to ESP-IDF v5.4 (`build-all.sh:15`); the manifest's permissive `>=4.1.0` must not be interpreted as verified compatibility.

| Variant | Role in tracked defaults |
|---|---|
| ESP32 devkit | CSI + ESP-NOW; full-time foreign-transmitter survey by default; GPIO2 identify LED; radar/camera off by default. `main/Kconfig.projbuild:17`, `:61`, `:220`, `:248`. |
| ESP32-S3 / lonely-binary | CSI + ESP-NOW, LD2410 enabled by default, passive BLE survey, promiscuous WiFi survey 10 seconds per minute, WS2812 identify on GPIO48. `sdkconfig.defaults.esp32s3:6`, `main/Kconfig.projbuild:63`, `:220`, `:250`. |
| ESP32-C6 | Native-radio sensing variant. CSI configuration uses HE-era acquisition API when supported; camera dependency is excluded for C6. `build-all.sh:26`, `main/csi_node_main.c:341`, `main/idf_component.yml:12`. |
| ESP32-CAM | AI-Thinker/OV2640; CSI + camera, QVGA JPEG, 3 fps, quality 15, PSRAM, ESP32 revision 3+, promiscuous survey off; GPIO33 active-low identify; radar off. `sdkconfig.defaults.esp32-cam:5`, `:11`, `:26`, `:34`, `:56`, `:62`, `:68`; `main/camera_dvp.c:41`. |
| ESP32-P4 | Camera/network node and WiFi illuminator, **not a CSI receiver**. Hosted C6 over SDIO does not carry CSI, ESP-NOW, or promiscuous APIs. Camera defaults: 5 fps, 32 MB flash, PSRAM; no radar/identify LED. `main/csi_node_main.c:22`, `sdkconfig.defaults.esp32p4:10`, `:15`, `:26`, `:36`. |

The P4 builds in two boot-probed MIPI sensor options: OV5647 RAW8 800×640 and SC2336 RAW10 640×480 (`sdkconfig.defaults.esp32p4:49`). Its MIPI → ISP exposure/white balance/debayer → RGB565 → hardware JPEG pipeline uses V4L2-style capture (`main/camera_mipi.c:4`, `:71`, `:102`) and two mapped capture buffers (`:34`, `:83`). The board's WiFi6 name does not imply WiFi 6 CSI: default hosted association forces 11b/g/n (`main/Kconfig.projbuild:52`, `main/csi_node_main.c:219`).

## Protocol and timing

All multibyte wire fields are little-endian (`main/csi_node_main.c:12`).

| Stream | Transport | Encoding and behavior |
|---|---|---|
| Heartbeat/discovery | UDP 5566 | Magic `0xC51E`, heartbeat v6; broadcast every 2 s before configuration and 5 s afterward. `main/csi_node_main.c:55`, `:71`, `:696`, `:779`. |
| Configuration | UDP 5567 | Magic `0xC51F`, v5; slot, node count, period, MAC allowlist. Maximum 16 allowed transmitters; incoming period clamped to ≥10 ms. `:91`, `:883`, `:938`. |
| CSI data | UDP 5568 | Magic `0xC51D`, v5; batches ≤1400 B, flush after roughly 50 ms; 32 KB ring buffer. `:88`, `:958`, `:994`, `:1113`. |
| WiFi survey | UDP 5566 | Magic `0xC520`, v5; every 5 s. Tracks 24 transmitters and reports top 12 by packet count, with MAC/count/RSSI/channel. `:85`, `:398`, `:434`. |
| LD2410 radar | UDP 5566 | Magic `0xC522`, v5; default 10 Hz, configurable 1–20 Hz, sends only fresh radar frames. `main/Kconfig.projbuild:279`, `main/csi_node_main.c:1053`, `:1065`. |
| Camera | TCP 5569 | Magic `0xC524`, frame protocol v1; 20 B header containing MAC, sequence, JPEG length, followed by JPEG bytes. Outbound per-node connection, reconnect on failure. `main/camera.c:37`, `:103`. |
| BLE survey | UDP 5566 | Magic `0xC525`, v5; every 2 s, up to 24 advertiser MAC/RSSI/flags entries. `main/ble_scan.c:36`, `:139`, `:161`. |
| Update / identify | UDP 5567 | OTA `0xC521`; identify `0xC523`. OTA command carries URL; identify duration is byte 3. `main/csi_node_main.c:918`. |

A CSI record contains receiving MAC, transmitting MAC, node monotonic timestamp in microseconds, RSSI, noise floor where supported, channel, `first_word_invalid` flag, length, and up to 512 bytes of raw CSI (`main/csi_node_main.c:314`). Noise floor is zero-filled outside ESP32/S2 (`:323`). The callback never blocks: a full ring buffer drops records and increments diagnostics (`:333`).

ESP-NOW payload is 8 bytes: CSPT magic plus sequence. Broadcast PHY is explicitly HT20 / MCS0 / long guard interval because legacy 1 Mbps 802.11b ESP-NOW frames provide no usable long training field for CSI (`main/csi_node_main.c:480`, `:501`). Slot offset is `slot × period / node_count` (`:823`); this is not a globally synchronized precision clock.

## LD2410 radar

The driver supports HLK-LD2410 / LD2410C, 24 GHz, **range-only**. It does not measure angle (`main/ld2410.c:2`). A single sensor yields a range arc; three sensors at known placements can support host-side trilateration. A demo should not show one radar independently generating an exact bearing or point coordinate (`main/ld2410.c:8`).

The UART is UART1, 256000 baud, 8N1, with no flow control (`main/ld2410.c:33`, `:113`). Firmware reads reports but does not send sensitivity/gate configuration commands, preserving previously saved sensor settings (`main/ld2410.c:4`).

Report fields include states 0 none, 1 moving, 2 stationary, 3 both; moving/stationary/detection distances in centimeters; moving/still energy; optional OUT level; and good/bad frame counters (`main/ld2410.h:5`). Default ESP RX/TX/OUT pins are GPIO12/13/14 (`main/Kconfig.projbuild:257`).

There is a power-wiring inconsistency: Kconfig's header note mentions 3V3 (`main/Kconfig.projbuild:264`), while the firmware diagnostic says the radar module is 5V (`main/csi_node_main.c:1041`). Do not present an authoritative power-wiring instruction without checking the actual module documentation and board.

## Camera and BLE

ESP32-CAM uses one PSRAM buffer, captured on demand to reduce camera contention with WiFi (`main/camera_dvp.c:43`). Sensor power-cycle and up to five initialization attempts address warm-boot failures (`:63`, `:94`). Camera initialization runs independently on core 1 so a camera fault should leave radio and heartbeat service usable (`main/camera.c:164`). These are implementation intentions; no bench verification was run in this audit.

Quality conventions differ: DVP lower means better, default 12/range 6–40; P4 higher means better, default 70/range 20–95. Camera FPS option is 1–15 (`main/Kconfig.projbuild:83`, `:92`, `:199`). The explicit ESP32-CAM variant overrides to 3 fps / quality 15. P4 uses 5 fps.

Passive NimBLE scanning listens 30 ms every 200 ms, transmitting no BLE. It keeps strongest RSSI per address within each report window; flag bit0 denotes a non-public/random address (`main/ble_scan.c:73`, `:91`, `:115`). Do not imply stable person identity from rotating BLE addresses.

WiFi survey remains channel constrained, not omnichannel scanning. Its table accumulates counts and reports the top transmitters by packet count; BLE instead resets a fresh table every 2 seconds (`main/csi_node_main.c:267`, `:430`; `main/ble_scan.c:150`).

## Fleet management and observability

Heartbeat contains firmware version, first 8 bytes of ELF hash, board/target, uptime, free heap, RSSI, OTA state/progress, reset reason, WiFi disconnect count, ESP-NOW send counters, camera frame/drop counts, and camera readiness/streaming state (`main/csi_node_main.c:696`). These are appropriate fields for a demo device inspector.

Camera image targets append `-cam` to distinguish camera images from plain chip images during OTA (`main/csi_node_main.c:738`). Config is cached in NVS, rewritten only on change. No config refresh for 60 s returns the node to discovery and stops sensing transmissions (`:681`, `:834`).

OTA pauses the camera, downloads over LAN HTTP, reports progress, reboots, and intends to validate within 120 s. Two 0x1C0000-byte app slots support rollback (`main/csi_node_main.c:569`, `:633`; `partitions_ota.csv:10`).

Identify blinks a GPIO or WS2812 LED at 2.5 Hz for up to 120 s (`main/identify.c:114`, `:137`).

## Current code versus stronger claims

1. **OTA host verification is weaker than its comment promises.** The verification task checks `s_configured`, but applying cached NVS config also sets that flag. Thus it does not strictly prove fresh host contact after upgrade (`main/csi_node_main.c:649`, `:818`, `:871`, `:897`). Describe rollback as implemented, but do not claim proven host reachability.
2. **The 50 ms default sensing period is not used by C code.** `CSI_TX_DEFAULT_PERIOD_MS=50` exists only in `main/Kconfig.projbuild:13`. Actual transmissions begin from host/cached config and use its period (`main/csi_node_main.c:820`, `:943`). A demo's 20 Hz selection must be attributed to host/demo settings, not autonomous pre-adoption firmware behavior.
3. **LAN controls are unauthenticated in the reviewed handler.** UDP configuration/update accepts sender data without authentication (`main/csi_node_main.c:905`, `:923`, `:953`). Firmware enables HTTP and disables HTTPS (`sdkconfig.defaults:24`). Public demo management controls must operate on simulated state, with no native device endpoints exposed.
4. **Hardware support is capability-specific.** P4 is explicitly not a CSI receiver in this firmware, LD2410 provides no angle, and BLE advertisement addresses are not stable identities. Demo interactions should preserve these distinctions.
5. **Comments include bench anecdotes, not independent verification.** Camera defaults describe historical frame-drop/radio-contention measurements (`sdkconfig.defaults.esp32-cam:14`, `:28`, `:70`; `main/camera_dvp.c:43`). These inform engineering decisions but should not be repackaged as audited product performance or accuracy guarantees.
6. **Power-wiring documentation conflicts.** The 3V3/5V inconsistency noted above needs hardware-specific resolution before producing wiring instructions.

## Demo translation

Use synthetic CSI link activity, honest LD2410 range arcs and host fusion, low-resolution camera motion cues, BLE survey observations, and fleet health/identify/OTA simulation. Let viewers inspect independent modality observations before the fused estimate. Clearly distinguish configured sensor positions, simulated ground truth, and estimated position. Include a P4 camera/illuminator node without giving it native CSI receive capability. Annotate all data as simulated and avoid importing personal addresses, credentials, camera frames, or device identifiers.


---

## Signal processing and tests

# CSI Presence processing, simulation, and validation audit

Source root: `csi-presence/`. All source references below are relative to that root. Source files were not edited. Tests were run with `PYTHONDONTWRITEBYTECODE=1` from `/tmp`.

## Exact processing and defaults

- `host/processing.py:18–29`: read at most the first 64 complex CSI samples as signed int8 `(imag, real)` pairs; amplitude is `sqrt(real² + imag²)`. Reject fewer than 16 complex samples, pad short vectors to 64, zero first two complex values when `first_invalid`.
- `host/processing.py:49–74`: normalize each packet by its mean amplitude. Keep a 2 s rolling window, require at least 8 packets and at least 5 packets/s, discard subcarriers with mean amplitude at most 10% of the strongest subcarrier. “Turbulence” is the mean of each retained subcarrier’s temporal population standard deviation.
- `host/processing.py:32–34,76–91`: maintain 90 s turbulence history. Baseline is the 20th percentile after 20 samples; minimum observed value during warm-up. `score = clip((turbulence / max(baseline, 0.0001) − 1) / gain, 0, 1)`, gain default 3.
- `host/processing.py:114–143`: TX→RX directions have separate baseline/sample streams. Undirected display/RTI link merges by maximum score, summed pps, strongest RSSI, and either direction alive. Global presence trips if any link is at least 0.35, clears after 5 s since last active link.
- PPS uses a four-second count window, with deque capped at 256; consequently reported per-direction pps saturates at 64 (`host/processing.py:47,60–62`).
- Current allowlisted config matches defaults: floor 10×6 m, TX period 50 ms; score window 2 s/gain 3/min 5 pps/on 0.35/hold 5 s; RTI λ0.6 m/α5; zone threshold 0.7/hold 6 s; hybrid RF weight 0.85/vision threshold 0.25 (`host/main.py:36–49`). No credentials, device addresses, or unrelated configuration values were extracted.

## RTI and room state

- `host/rti.py:18–23`: automatic grid targets 15 cm cells, each dimension clamped 24–112. Current 10×6 m config with no explicit grid produces **67×40**, not fixed 48×36.
- For link endpoints A/B separated by d, cell P has excess path length `e=|P−A|+|P−B|−d`. Weight is `(1−e/λ)/sqrt(d)` for `e≤λ`, else zero. Ignore links with missing endpoints or length below 0.3 m (`host/rti.py:38–63`).
- Precompute `S=Wᵀ(WWᵀ+αI)⁻¹`; frame solution `x=S y`, clip negative cells, then scale image so its maximum equals maximum link score (`host/rti.py:69–88`).
- This is a disturbance **shape**, not a calibrated occupancy probability or physical reflectivity image.
- Rooms are axis-aligned rectangles. Coverage counts link ellipses touching any cell in a room; level is the room’s 98th-percentile heat. Occupancy trips at configured threshold, latches for six seconds, and is false with zero geometric coverage (`host/zones.py:21–69`).
- Host rooms use hybrid heat where available (`host/main.py:770–774`).
- Coverage is geometric, not live-link availability: the engine retains known links, main passes all link keys into RTI, and coverage counts their weight masks without checking `alive` (`host/processing.py:105,131–138`; `host/main.py:745–751`; `host/zones.py:32–42`). The demo should distinguish geometry coverage from currently reporting links.

## Vision and fusion

- `host/fusion.py:25–34`: camera coverage is a flat floor cone using heading, FOV, and max range. It excludes cells within 15 cm but does **not** raycast against walls.
- Bearing evidence is a Gaussian transverse to the ray, σ0.45 m; if monocular range exists, longitudinal Gaussian σ1.4 m. Evidence capped at strength×0.5 for bearing-only or ×0.8 with range; multiple cameras sum and clip to 1 (`host/fusion.py:61–100`).
- Triangulated fixes add a Gaussian blob σ0.3 m.
- `host/fusion.py:124–133`: if no RF geometry/heat, returns `(None,None)` even if vision exists. Otherwise, choose vision where camera covers and vision is above 0.12; in covered cells without vision use RF×0.85; outside camera coverage retain RF. Agreement is `sqrt(clip(RF)*clip(vision))`.
- Per-room RF/vision corroboration uses 98th percentiles, RF threshold 0.7, vision threshold 0.25; camera coverage under 15% yields “rf-unseen” or “clear”; otherwise confirmed/rf-only/vision-only/clear (`host/fusion.py:136–170`).
- “RF+CAM means a real person” is too strong: these paths detect motion blobs and RF change; there is no person classifier in these modules.

## 3D triangulation

- Closest approach of two forward 3D rays supplies midpoint, miss distance, and ranges (`host/triangulate.py:41–69`).
- Reject nearly parallel rays; intersections within 0.2 m/behind either camera; miss above 0.9 m; XY outside floor ±0.5 m; z outside −0.3 to ceiling 3 m; horizontal subtended angle outside 20°–160° (`host/triangulate.py:26–27,119–132`).
- Greedy closest-miss matching uses each detection at most once. `quality=(1−miss/0.9) × sin(subtended_angle)`; strength is min(camera strengths)×`(0.5+0.5×quality)` (`host/triangulate.py:136–159`).
- Posture is centroid-height thresholding: `<0.45 m low`, `<0.78 m sitting`, else standing (`host/triangulate.py:163–174`). This is a coarse posture cue, not implemented temporal fall detection or identity tracking.

## Simulator and limitations

- `host/tools/simulate.py:26–32`: 10×6 m floor, six perimeter nodes by default, wall x=5.6 m, doorway y2.4–3.6 m, wall-crossing disturbance multiplier 0.45, 64 subcarriers, 50 ms loop.
- `host/tools/simulate.py:85–91`: synthetic disturbance uses the same tapered ellipse forward model but no `1/sqrt(d)` factor; wall-crossing links multiply by 0.45.
- Each directed link has fixed random subcarrier amplitude U(18,42), phase U(0,2π), amplitude noise σ0.7, plus `7×disturbance×sin(2π×0.9×t+k/2.5)` (`host/tools/simulate.py:94–113`).
- One walker follows an 80 s waypoint route with pauses (`host/tools/simulate.py:67–82`). Ripple depends on proximity **even while stationary**, so this simulator cannot demonstrate real still-person fade reliably.
- The right-room pause causes route discontinuities: for `0.48<u<0.60` position abruptly becomes waypoint 4, then reverts to the continuous interpolation after the pause.
- Telemetry is illustrative: fabricated heap/RSSI, 2 s heartbeats, adoption becomes true after three seconds without receiving or parsing configuration. Config socket binds but is never read (`host/tools/simulate.py:116–179`). Therefore README claim that simulation exercises configuration push is incomplete.
- Packet RSSI is constant −48 dBm, noise floor −95, channel 6 (`host/tools/simulate.py:165–168`), so live simulator does not exercise realistic RSSI ranging/wall inference.
- Fake camera renders textured background and a bright rectangular blob, 320×240, added pixel noise σ2; encodes via macOS `sips` (`host/tools/fake_camera.py:30,47–56,67–100`). It does not model interior-wall occlusion.
- Each fake camera and RF simulator initializes its **own start time**, so launching four terminals yields independently phased walkers despite README’s “same simulated person” framing (`host/tools/fake_camera.py:121,129`; `host/tools/simulate.py:145,154`).
- Random noise and process-dependent `hash(key)` make simulator runs non-reproducible (`host/tools/simulate.py:106,164`).

## Evidence maturity and README discrepancies

- README explicitly reports real hardware **two-node presence**, approximately 50 CSI records/s, discovery/adoption, ESP-NOW, OTA rollback, and foreign-transmitter surveys. Multi-node localization numbers are explicitly simulator-only (`README.md:27–40,61–76`). Phrase hardware achievements as “documented hardware results”; this audit did not independently operate hardware.
- Localization table: 4/6/8/10/12 nodes, 6/15/28/45/66 links, median errors 1.46/.64/.28/.23/.20 m; p90 3.26/1.29/.54/.43/.39 m (`README.md:64–70`). Do not present as expected installed-system accuracy.
- Intro diagram says 48×36 grid (`README.md:19`), but current defaults derive 67×40.
- Foreign-transmitter section calls beacons dependable usable illumination (`README.md:328–333`), contradicted by newer hardware notes saying legacy beacon CSI is sparse and poor illumination (`README.md:44–59`).
- README says camera OTA is excluded because cameras run stock firmware (`README.md:786–787`), contradicted by pushed cameras running this project firmware (`README.md:186–192`) and camera-specific firmware variants in `host/main.py:53–59`.
- README’s “still person fades within approximately 90 s” (`README.md:920–922`) conflates baseline history with motion/hold timing. Perfectly static CSI loses temporal variance as its 2 s motion window clears, then global/room holds clear after 5/6 s. There is no explicit 90 s body-presence timer.
- Pipeline labeled “no sockets” (`README.md:104`, `host/tools/test_pipeline.py:1`) is stale: camera push test binds a socket.
- Planned, not implemented in audited pipeline: respiration band-pass, persistent multi-target tracking, MQTT/Home Assistant publishing, exporting CSI into the separate mmWave radar map, Kalman velocity/identity, lens distortion calibration (`README.md:933–944`).

## Actual test results

Executed with `PYTHONDONTWRITEBYTECODE=1` from `/tmp`, source unchanged:

- `host/tools/test_mobiles.py`: **5/5 pass**, unknown-power simulated fix error 0.07 m; rejects two/unplaced observers, clears stale fixes, validates wire parsing.
- `host/tools/test_walls.py`: **4/4 pass**, separates blocked/clear links; sparse geometry returns broad y0.6–5.4 m band; bracketing links yield y2.8–3.2 m around truth y3.0.
- `host/tools/test_localize.py`: **6/6 test functions’ assertions pass**, exit 0; clean fix 0.00 m, noisy worst 2.64 m with 12/12 uncertainty coverage; synthetic router fix 0.47 m with ±7.56 m radius. Two incidental background FrameServer threads failed to bind under sandbox, so suite is not completely clean despite passed assertions.
- `host/tools/test_pipeline.py`: **17/18 named checks verified**, including separately running final three after suite interruption. Push-frame test blocked by sandbox `PermissionError` at `host/tools/test_pipeline.py:714`. All preceding checks passed. Scoring quiet .010→active 1.000; busy-start recovery quiet .005→motion 1.000; RTI crossing test 0.12 m error.
- Pipeline checked protocol round-trip/corruption; heartbeat metadata; device health/reboots; room coverage/hold; JPEG DC gradients and blob placement; bearing/range projection; all corroboration verdicts; crossing camera fields; 3D triangulation and poor-geometry rejection; foreign-transmitter self-calibration; OTA image guards and version/hash verification; LD2410 packet parsing and firmware chip-family matching; pushed-camera inventory; LED identify and camera-scan inputs; signal response and busy-start baseline recovery; and RTI crossing localization.
- These tests validate synthetic geometry/protocol/guard behavior; they do not reproduce all README benchmark sweeps or independently validate real RF accuracy.

## Recommended browser demo

Use deterministic synthetic **post-calibration link scores**, the exact tapered ellipse forward model, and the actual regularized inverse RTI solve. Precompute the matrix inverse when layout/λ/α changes. Offer 4/6/8/10/12 nodes, motion/empty/still scenarios, draggable target, wall attenuation, λ, α, zone threshold, layer switches, and node dropout. Use one shared simulation clock.

Show the target as “ground truth” separately from RTI peak, error, link-score table, geometric coverage, current link count, and per-room hold state. Label imagery, telemetry, camera fixes, BLE positions, and LD2410 readings synthetic whenever represented.

For stillness, explicitly model synthetic motion amplitude decaying/zeroing when the target stops, then retain the source’s 2 s window and 5/6 s holds. Describe this as an educational scenario; do not inherit the current simulator’s perpetual ripple or imply validated breathing detection. Camera fusion should show source cone behavior; if adding wall occlusion, label it as a demo realism enhancement.


---

## Operator UI and demo adaptation

# CSI Presence UI audit and demo adaptation

Read-only source audit of `csi-presence/`. No firmware, project configuration, services, or Site files were changed. Paths and line numbers below are relative to that source root.

The existing interface is a dense operator console with an unusually strong emphasis on showing uncertainty. A public demo should retain the floor map, multimodal layers, coverage diagnostics, and device inspection, while adding a clear guided story and deterministic simulated scenarios.

## Existing interface and behaviors

| Area | Implemented behavior | Evidence |
|---|---|---|
| Visual identity | Single dark theme; green phosphor telemetry, amber warnings, orange activity, blue vision. Monospaced console. Map fills left region; 384 px scrollable sidebar. Stacks below 1080 px. | `host/static/index.html:8–48` |
| Header | Online/total devices, live/total links, packets/s, online/total cameras, occupied rooms, confirmed rooms, 3D fixes, overall presence. | `host/static/index.html:175–186`, `:804–813` |
| View mode | Device dots and AP diamonds, live link strength as color/thickness, dead links dashed. Click device on map or table to dim unrelated links and show telemetry. | `host/static/index.html:500–518`, `:765–789`, `:856`, `:1344–1349` |
| Place devices | Drag devices and cameras; drag camera/radar aim handles; coordinates clamped to floor. Radar heading can also be typed, with beam width. | `host/static/index.html:894–916`, `:1324–1404` |
| Draw rooms | Drag rectangular named rooms; click to remove with confirmation; thresholds distinguish drag from click. | `host/static/index.html:1405–1425` |
| Layer selector | Hybrid, RF, Vision, Agreement choose separate fields. Vision blue; agreement pale white/green; RF/hybrid activity green through red. | `host/static/index.html:376–402`, `:1477–1485` |
| Room panel | Occupancy level, link count, coverage failure, RF+CAM / RF ONLY / CAM ONLY / RF (UNSEEN). | `host/static/index.html:926–942` |
| Link panel | Highest 14 link scores, sorted live, score bars and packets/s. | `host/static/index.html:944–958` |
| Radar | LD2410 range-only sensing cone to 6 m; moving and stationary range arcs colored separately, strength follows energy. No guessed cone if unaimed. | `host/static/index.html:521–592` |
| Cameras | FOV cones, evidence rays and projected fixes; thumbnails, status, FPS, motion %, backend, blobs/errors; add URL, subnet scan, delete, edit heading/FOV. | `host/static/index.html:595–655`, `:1173–1218`, `:1436–1475` |
| 3D fixes | White reticle with estimated posture and height. | `host/static/index.html:657–675` |
| Geometry | Calibrated/default RSSI model, fitted path-loss exponent, residual error, anchor count, inferred layout, disagreement diagnostics, apply-layout action. | `host/static/index.html:1020–1054` |
| Obstructions | Broad shaded regions supported by signal loss; blocked/clear links, distances, excess dB and inferred area. Deliberately avoids crisp invented walls. | `host/static/index.html:430–451`, `:1079–1110` |
| External transmitters | Observer count, RSSI, ranges, inferred coordinates/radius, camera-derived placement when available; Use/Drop promotion. Off-map arrows carry distance beyond floor. | `host/static/index.html:717–761`, `:1113–1171` |
| BLE mobiles | Short-lived advertiser observations, observer count, rotating-address indicator, rough position with large uncertainty circle. | `host/static/index.html:678–694`, `:1057–1077` |
| Firmware/health | Family-specific firmware versions and sizes; staged rollout progress/cancel; identify LED for 15 s; brownout/camera fault badges; heap, reboots, radio failures and Wi-Fi drops. | `host/static/index.html:821–903`, `:960–1018` |

The map uses a labeled metric grid, adaptive spacing, a scale bar, and pointer coordinates (`host/static/index.html:295–360`, `:405–427`). Canvas is scaled to device-pixel ratio and floor aspect ratio. Device status is derived from actual host observations, not merely heartbeat claims: a node is offline after 20 s without a heartbeat, stale data after 5 s, adopting before configuration, and online when configured and delivering CSI (`host/devices.py:10–11`, `:119–130`). Packets/s uses a four-second window (`host/devices.py:114–117`).

## Strengths to preserve

- A room with inadequate sensing reads **NO COVERAGE**, not clear (`host/static/index.html:459–475`, `:932`).
- **Placed** vs **unplaced** nodes separates measured anchors from guesses (`host/static/index.html:838–843`). Applying an inferred layout must not convert estimates into calibration truth (`README.md:442–448`).
- Radar reports an arc because LD2410 measures range without bearing (`host/static/index.html:523–527`, `:559–579`).
- BLE/RSSI positions carry uncertainty rather than pretending to be precise dots (`host/static/index.html:678–739`).
- Hybrid fusion selects vision where vision has evidence, RF elsewhere. It does not average maps or promote agreement into artificial spatial precision (`README.md:373–395`).
- Sensor disagreement has explanatory value: RF outside camera coverage gets its own state (`README.md:400–418`).
- Device health exposes actionable causes, including a reset-register-derived brownout and camera initialization failure, rather than just a generic offline light (`host/static/index.html:829–835`, `:886–893`).
- Camera and radar aim angles share a single floor coordinate frame; pointing a sensor does not silently claim its device position is measured (`host/static/index.html:1385–1390`).

## Concrete issues and adaptation risks

1. **Definite duplicate-ID bug:** `id="fw"` is both firmware content container (`host/static/index.html:261`) and floor width input (`:268`). `getElementById("fw")` resolves the firmware container, so the visible width input is not the control populated/read by `:1224` and `:1429–1432`. Width edits are effectively disconnected. Use unique semantic IDs in any adaptation.

2. **Camera heading can become stale:** camera rows rebuild only when the concatenated camera ID set changes (`host/static/index.html:1179–1210`). Dragging the aim handle updates the state/host but does not update that numeric input when IDs stay the same. Bind values to current state without overwriting an active edit.

3. **Misleading startup status:** initial header says CLEAR (`host/static/index.html:186`) before telemetry exists. After polling errors, HOST UNREACHABLE appears only after more than three failures; old map content persists (`:1232–1244`). Demo should distinguish running, paused, simulated sensor loss, and unavailable.

4. **Visitor overload:** technical inventory, firmware, BLE, foreign RF, camera administration, wall inference, and floor editing share one long sidebar. Strong operator utility, weak first-use story. Introduce progressive disclosure: room outcome, evidence, component details, engineering internals.

5. **Limited accessibility:** map interaction is pointer-based; table rows and camera remove spans have click handlers but no keyboard affordance (`host/static/index.html:856`, `:1187`, `:1204`, `:1324–1427`). Canvas only has a general aria-label (`:204`). The public demo needs keyboard-selectable controls, readable text summaries, visible focus, reduced motion, and non-color status labels.

6. **No visitor demo controls:** no play/pause/reset, timeline, scenario selection, speed control, or clear ground-truth toggle. The polling loop recreates much sidebar DOM every approximately 100 ms and resizes/rebuilds the canvas each render (`host/static/index.html:1228–1244`). Use a dedicated simulation engine and stable component rendering.

7. **Raw operational controls are inappropriate for hosting:** UI POSTs directly to identify, update, camera scan, node/room/floor edit and transmitter promotion endpoints. `host/dashboard.py:72–83` dispatches supplied routes; server binds all interfaces at `:95` and contains no authentication boundary. Build a standalone simulated frontend rather than exposing the local console/server.

8. **README contains older claims contradicted by later corrections:** the older foreign-beacon discussion calls beacons dependable (`README.md:328–331`); the newer hardware correction says router beacons produce little usable CSI and real OFDM traffic is a better illuminator (`README.md:55–59`). Use the newer correction. Do not reproduce every README performance phrase as equally validated.

## Recommended public demo

Frame the project as **ESP32 multimodal presence sensing**. CSI is Wi-Fi channel-state sensing reconstructed into a disturbance field. LD2410 mmWave radar is a separate, optional range sensor; cameras add optical evidence and triangulation. Avoid calling every visualized position “radar.”

Suggested default: invented two-room floor plan, six or eight synthetic nodes, one animated walker, optional camera and mmWave overlays. Lead with the room outcome, let visitors reveal why it occurred, then open detailed component telemetry. Keep all controls local to the browser simulation.

| Scene | Visitor interaction | What it teaches |
|---|---|---|
| Walk between rooms | Play/pause, scrub timeline, move simulated occupant | Link disturbances reconstruct a broad field; room occupancy changes. |
| Compare evidence | Hybrid / RF / Vision / Agreement | Each sensing method has its own coverage and failure modes. |
| Camera blind zone | Toggle camera availability or hide one view | RF (UNSEEN) differs from both clear and RF/camera disagreement. |
| Quiet occupant | Pause the occupant; compare CSI and radar readings | CSI responds to change; range-only radar can expose a separate stationary return. |
| Sensor failure | Toggle one synthetic node offline | Lost links and coverage degradation affect what can be concluded. |
| Placement matters | Select 4 / 6 / 8 simulated nodes; inspect crossing links | Geometry and link count matter more than decorative node count. |
| Aim a radar | Rotate cone; inspect moving/stationary arcs | A range measurement does not imply exact XY coordinates. |
| Engineering drawer | Select synthetic board | Show chip/capability, radio cadence, packets/s, simulated RSSI, heap/reset health, OTA lifecycle. |

The underlying conceptual pipeline is unusually good explainer material: ESP-NOW sensing packets, CSI amplitude vectors, per-link normalized temporal variance, adaptive quiet baseline, motion score, Fresnel sensitivity field, RTI solve, per-room occupancy, optional optical corroboration (`README.md:7–22`, `:833–862`). A linked pipeline diagram can highlight the current selected stage and show corresponding synthetic data.

Useful engineering parameters to surface with explanatory copy rather than bare numbers: number of nodes/links; 2 s score window; 90 s quiet-history baseline using the 20th percentile; gain/threshold and hold time; RTI ellipse width and regularization; node placement; camera pose and FOV; radar aim/range (`README.md:833–893`). These affect different stages and should not be conflated into a generic “sensitivity” slider.

## Truthfulness and public-safe disclosure

- Persistent label: **Interactive simulation — synthetic telemetry, no live devices or camera feeds.**
- Keep **simulated ground truth** (visitor-controlled person) visually separate from **estimated sensing output**. Do not animate an exact target dot and imply the CSI solver found it.
- Label whether demo runs an illustrative browser model or the actual Python processing pipeline. A simplified model must not claim end-to-end firmware/solver execution.
- README states real-hardware validation of two-node presence, discovery/adoption, ESP-NOW, OTA/rollback and transmitter survey; multi-node localization results remain simulator-only (`README.md:27–40`).
- The 4/6/8/10/12-node error table is explicitly **single simulated walker in an 8×6 m space with clean multipath**, not measured field performance (`README.md:61–76`). Keep that qualification immediately attached to any chart.
- CSI detects motion/change, not bodies or identity. Still occupants can fade into the approximately 90 s baseline; two people/dogs are not reliably classified (`README.md:918–925`). “RF+CAM” should read **corroborated motion evidence**, avoiding the README’s overstrong “a real person” phrasing at `:407`.
- Breathing detection, identity/velocity tracking and further multi-target work appear as next steps, not shipped claims (`README.md:933–944`). Coarse posture is not validated fall detection (`README.md:271–275`).
- Do not publish actual `state`, configuration, recordings, MACs, IPs, BSSIDs, camera URLs, thumbnails, room layouts, positions, mobile advertiser addresses, or neighboring transmitter observations. These are surfaced at `host/devices.py:132–149`, `host/static/index.html:849`, `:880`, `:1071`, `:1156`, `:1188`; `/state` exposes the current full state (`host/dashboard.py:50–51`).
- Replace identifiers with `Node A–H`, `Camera A/B`, `Demo AP`, `Synthetic beacon`, and an invented floor plan. Avoid deriving the public dataset from the user’s actual home/network layout.
- Frames in the present local system are intended to stay in memory and only serve the local console (`host/dashboard.py:61–68`, `README.md:420–425`). Synthetic camera diagrams or intentionally rendered scenes are suitable website replacements.
- Survey/mobile features should be presented with entirely synthetic test emitters and short-lived anonymous labels. Do not make the public demonstration a catalog of actual neighboring networks or visitor devices.

## Existing simulation support

The README already documents a no-hardware full-stack path: host plus `host/tools/simulate.py` and two `host/tools/fake_camera.py` processes, with rendered fake camera poses exercising bearing, range and triangulation (`README.md:107–132`). The RF simulator creates six nodes and a walker moving between two rooms and needs approximately 90 s before quiet baselines are meaningful (`README.md:564–584`). Recording/replay exists for offline tuning (`README.md:817–831`), but any public replay must be synthetic or explicitly sanitized; raw user captures are outside the proposed public artifact.

No browser interaction testing was requested for this audit; findings are based on source inspection. The duplicate ID is directly visible in source. Camera-input staleness, interaction accessibility and public-server boundaries are source-derived behavior assessments.
