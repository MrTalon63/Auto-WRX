# Auto-WRX

## What is this?

Auto-WRX is a piece software that allows for fully automated capture of images transmitted by the LEO (maybe even GEO, i dunno yet) weather satellites. It is designed to be used with a Raspberry Pi and a RTL-SDR dongle. It is written in Node.js and hopefully runs inside a docker container. It uses [SatDump](https://www.satdump.org/) for recording the baseband signal and also for decoding the images. Encounters are calculated (using [satellite-js](https://github.com/shashwatak/satellite-js) library) every 8th hour (0:00, 8:00, 16:00) while TLEs are cached with a TTL of 12 hours (Option to change this will be added later).
Decoded images are saved to an output folder and can be accessed via a web interface.
