import type { ProblemRecord } from '@/types/problem'

// Only externally sourced, accepted problems belong in this list.
export const problems: ProblemRecord[] = [
  {
    id: '11O-001',
    slug: 'circuitpython-pico-wifi-ap-info',
    title: 'Connected access-point details missing on Pico W',
    source: 'Adafruit CircuitPython issue #9323',
    sourceUrl: 'https://github.com/adafruit/circuitpython/issues/9323',
    requester: 'CircuitPython community report',
    category: 'Embedded systems',
    difficulty: 'Not rated',
    status: 'PUBLISHED',
    contributors: ['Shantanu (proposal PR #11625)', 'Mikey Sklar (merged upstream PR #11646)'],
    statement: 'On Raspberry Pi Pico W, `wifi.radio.ap_info` was unimplemented, preventing applications from reading connected access-point details. A related Pico 2 W report also identified missing RSSI support.',
    constraints: [
      'The proposal targeted the Raspberry Pi CYW43 radio port.',
      'Access-point information may be absent while disconnected or when the driver cannot provide it.',
    ],
    successCriteria: [
      '`wifi.radio.ap_info` exposes connected access-point details on Pico W.',
      'The result is `None` when disconnected or when the driver cannot provide access-point information.',
    ],
    researchNotes: [
      'Issue #9323 reported `NotImplementedError` for `wifi.radio.ap_info` on Pico W.',
      'Issue #11030 separately reported missing signal-strength reporting on Pico 2 W.',
      'The original proposal PR #11625 closed without merge. A later upstream PR #11646 was merged and credited the same approach.',
    ],
    prototype: [
      'PR #11625 proposed storing the authentication mode after connection and reading BSSID, RSSI, and channel from the CYW43 driver.',
    ],
    validation: [
      'The original PR reported passing `make -C mpy-cross -j4`, `git diff --check`, and pre-commit whitespace and codespell checks. These were not rerun for this record.',
      'The original PR did not have a board or serial device available for hardware testing.',
      'The author of merged PR #11646 reported board-farm validation for Pico W and Pico 2 W; Eleven October did not independently reproduce those results.',
    ],
    results: 'PR #11646 closed issue #9323 as completed on 2026-10-25. It was authored by mikeysklar and credited PR #11625 for taking the same approach. Shantanu’s original PR itself was not merged.',
    limitations: [
      'The merged fix and original proposal are separate contributions.',
      'The board-farm results were reported by the author of PR #11646 and were not independently reproduced by Eleven October.',
      'WPA3, enterprise authentication, and roaming were not tested.',
    ],
    repository: 'https://github.com/ElevenOctober/11O-001-circuitpythonPicoWifi',
    article: '/articles/circuitpython-pico-wifi-reporting',
    licensing: 'MIT for the project record repository.',
    attributionPermission: 'anonymous',
  },
]
