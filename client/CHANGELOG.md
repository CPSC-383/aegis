# Changelog

## [2.1.0](https://github.com/CPSC-383/aegis/compare/aegis-client-v2.0.0...aegis-client-v2.1.0) (2025-08-11)


### Features

* **build:** compile and zip electron linux ([26003b0](https://github.com/CPSC-383/aegis/commit/26003b08894bfe31d2a364f59b6dc485530f4b26))
* **error check:** error check on map create for the editor ([2dce356](https://github.com/CPSC-383/aegis/commit/2dce35693de9a3c97d2c4e0a34d9d9113747a938))
* **map import:** add map import feature ([03efa99](https://github.com/CPSC-383/aegis/commit/03efa99b93e3e4f68109c4127e281a09c545606d))
* **popup console:** add a expand button for the console to take up the screen when clicked ([7c6eb0c](https://github.com/CPSC-383/aegis/commit/7c6eb0cb49623177f8aa83001c907208d1ec9d79))
* **script and client no venv:** made the client and script work without having the venv activated ([0a4d75c](https://github.com/CPSC-383/aegis/commit/0a4d75caf76044758ca2082fc87cc58682fce20f))
* **setup:** setup script and clean code ([b955c97](https://github.com/CPSC-383/aegis/commit/b955c97517330ac3daec0e77e3e62725bcd863c8))
* **show aegis path:** show the current set path in the settings ([f6692cc](https://github.com/CPSC-383/aegis/commit/f6692ccf7582b110bfeda50eb4d62ad436296961))
* **spawns:** add spawns to info panel, and don't allow content or special on spawns ([a30c8fd](https://github.com/CPSC-383/aegis/commit/a30c8fdb1cb2f1dc5300e764f2d067e44849a2b1))


### Bug Fixes

* **a1 cherry pick broke stuff:** fix allllat ([090a300](https://github.com/CPSC-383/aegis/commit/090a300d272ecf7e04b6a269c7b37e240d738598))
* **agents:** check if agents in agents folder are dirs, this would break if there were files ([edf5125](https://github.com/CPSC-383/aegis/commit/edf512545f652f346b709993dc28a5fadade2cfa))
* **build:** electron build ([b082fc7](https://github.com/CPSC-383/aegis/commit/b082fc7134fc9aa734061b07a7c11b156d068bc1))
* **client:** resolve app icon display issues ([#257](https://github.com/CPSC-383/aegis/issues/257)) ([7f2a10f](https://github.com/CPSC-383/aegis/commit/7f2a10ffb7060e729eeeeea772f95dd710f9817a))
* **client:** round increment ([9d1b167](https://github.com/CPSC-383/aegis/commit/9d1b16750ad7af0bdf7ea4a798dd72ed914cfefe))
* **closing error:** console.log fixes it ???? ([d384aa1](https://github.com/CPSC-383/aegis/commit/d384aa19341f653daf81be4c8a8e4adf6a7ffa7f))
* **data:** fix the other world data imported so it stays the same ([b30f683](https://github.com/CPSC-383/aegis/commit/b30f68340b7c8d8296d0a32abc07daa9a9319d3d))
* **default energy:** set default energy for survivors to 100 instead of 0 ([36bf8d3](https://github.com/CPSC-383/aegis/commit/36bf8d35f5b0af6302ace18c8d3218156a95d349))
* **env:** use cross-env so env var works on windows ([4007f62](https://github.com/CPSC-383/aegis/commit/4007f62e44c998f863cd267982330eb13f16236e))
* **error:** show error message on import fail ([1250464](https://github.com/CPSC-383/aegis/commit/12504644b8a9bd5f226d53a3c67febc3ac5616cd))
* **fix arguments in electron:** change them to the new argparse values ([184948b](https://github.com/CPSC-383/aegis/commit/184948b6d468cb574a304b2c7c5e634bd5a7a070))
* **import:** fix import map issue with importing the same map twice ([563b36e](https://github.com/CPSC-383/aegis/commit/563b36efe11895d03531908460eebf831d16523c))
* **import:** set spawn grids on import ([d9c2bad](https://github.com/CPSC-383/aegis/commit/d9c2badf42b83ca4bcd7b34ae28a8fae2f1aa315))
* **labels and console:** add input labels and bigger console ([86d7ad2](https://github.com/CPSC-383/aegis/commit/86d7ad2f10f32710f8e2a17049fb8112db84fe55))
* **map agent_energy problem:** took it from the object in map creation ([3a2ebd6](https://github.com/CPSC-383/aegis/commit/3a2ebd6d5faafba412e365b8c4e97f434919391f))
* **map agent_energy problem:** took it from the object in map creation ([48b8a6e](https://github.com/CPSC-383/aegis/commit/48b8a6e3d20a447f569b5137623374f8de0b2973))
* **min max stuff:** fix(min max stuff):  ([021d63b](https://github.com/CPSC-383/aegis/commit/021d63bb431777470ca2e3f46d47525acb9f15de))
* **min max stuff fix:** fix(min max stuff fix):  ([42efb4f](https://github.com/CPSC-383/aegis/commit/42efb4f5ec7e3c6b643c4697992c1670e300cee2))
* **remove use client at the top of progress.tsx:** it was giving build errors ([f0db36a](https://github.com/CPSC-383/aegis/commit/f0db36a1786f94eb150bfb776c34ee96ad379fa1))
* **sim:** fix round 0 render and extra round render ([5f4cbd9](https://github.com/CPSC-383/aegis/commit/5f4cbd9f633c23888b8d3ba47428b1c2a7782c8e))
* **spawn group editor:** allow to place multiple groups for a spawn zone again ([31ea95a](https://github.com/CPSC-383/aegis/commit/31ea95a394a8e920a6ce3975279966d8e7cd328f))
* **tailwind export:** fix that annoying build error ([7a5591d](https://github.com/CPSC-383/aegis/commit/7a5591d1d996cbc71a03b083496533d7684489c0))
* **types and typescript errors:** move types to its own folders, and fix some typescript compile issues ([bdbf779](https://github.com/CPSC-383/aegis/commit/bdbf779a519df442f74a05d71b2126569ff12f85))
* **visual bug:** fix visual bug of agent dying ([457bd38](https://github.com/CPSC-383/aegis/commit/457bd386593252b71d9d31a58ae88e94b6004261))
* **workflow:** fix prev workflow ([264b4d0](https://github.com/CPSC-383/aegis/commit/264b4d09b7fce77c59c3d5cd8eb57313afaf546f))


### Miscellaneous Chores

* release 2.1.0 ([#260](https://github.com/CPSC-383/aegis/issues/260)) ([fe2a010](https://github.com/CPSC-383/aegis/commit/fe2a010a66546f27fdb63b3dc2d121f74156a65f))
