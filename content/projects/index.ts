import type { ProjectRecord } from '@/types/project'

// Project orbits are generated only from public, validated work.
export const projects: ProjectRecord[] = [
  {
    id: '11O-001',
    slug: 'circuitpython-pico-wifi-reporting',
    title: 'CircuitPython Pico W Wi-Fi reporting',
    status: 'PUBLISHED',
    date: '2026-11-12',
    problemId: '11O-001',
    problem: 'The Pico W did not implement `wifi.radio.ap_info`, so applications could not inspect connected access-point details. A related report identified missing RSSI on Pico 2 W.',
    source: 'Adafruit CircuitPython issue #9323',
    sourceUrl: 'https://github.com/adafruit/circuitpython/issues/9323',
    requester: 'CircuitPython community report',
    whyItMatters: 'Connected access-point details help applications and users understand the network a board is using, including its signal strength.',
    constraints: [
      'Keep the implementation within the Raspberry Pi CYW43 radio port.',
      'Return no access-point information when disconnected or when the driver cannot provide it.',
    ],
    investigation: [
      'Issue #9323 reported that `wifi.radio.ap_info` raised `NotImplementedError` on Pico W.',
      'Issue #11030 separately reported missing RSSI support on Pico 2 W.',
      'Shantanu opened proposal PR #11625. A later PR #11646 closed issue #9323 and credited the proposal for the same approach.',
    ],
    engineering: [
      'The proposal saved the authentication mode after a successful connection.',
      'It combined the connected SSID with CYW43 BSSID, RSSI, and channel information for `wifi.radio.ap_info`.',
      'The original patch changed `Radio.c` and `Radio.h` in the Raspberry Pi common HAL.',
    ],
    prototype: [
      'The original proposal is preserved as PR #11625. The project repository archives that patch and the later upstream patch.',
    ],
    testing: [
      'PR #11625 reported passing `make -C mpy-cross -j4`, `git diff --check`, and pre-commit whitespace and codespell checks. These were not rerun for this record.',
      'The original proposal had no board or serial device available for hardware testing.',
      'PR #11646 reported board-farm tests for Pico W and Pico 2 W. Eleven October did not independently reproduce those results.',
    ],
    failures: [
      'The original proposal PR #11625 was closed without merge.',
      'Translation and formatting checks did not run, and the original firmware build was blocked by its GCC version requirement.',
    ],
    result: 'Adafruit CircuitPython PR #11646, authored by mikeysklar, merged on 2026-10-25 and closed issue #9323. Its description credits PR #11625 for taking the same approach. The original PR was not merged, so this record keeps the two contributions distinct.',
    limitations: [
      'The board-farm results are reported by the author of PR #11646 and were not independently reproduced by Eleven October.',
      'WPA3, enterprise authentication, and roaming were not tested.',
      'The project repository contains documentation and patches; the CircuitPython source remains in the official Adafruit repository.',
    ],
    repository: 'https://github.com/ElevenOctober/11O-001-circuitpythonPicoWifi',
    article: '/articles/circuitpython-pico-wifi-reporting',
    contributors: ['Shantanu (proposal PR #11625)', 'Mikey Sklar (merged upstream PR #11646)'],
    license: 'MIT',
  },
]
