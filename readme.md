[![CircleCI][circle-image]][circle-url]
[![codecov][codecov-image]][codecov-url]

## Api gateway for [funny-market](https://github.com/byavv/funny-market) project
## Based on [200loc-gate](https://github.com/byavv/200Loc-gate)

## Basic Usage
```bash
# clone the repo
$ git clone https://github.com/byavv/200Loc-gate.git

# change into the repo directory
$ cd 200Loc-gate

# install 
$ npm install
$ typings install

# build
$ npm run build     

# run
$ npm start              
```
## Development
### Build
Development build (by default):
```bash
$ gulp build
```
### Serve/watch
Start *Gateway server* on 3001 and *Api explorer* on 5601 in development mode:
```bash
$ gulp
```
### Testing
```bash
$ gulp test 
```
[circle-image]: https://circleci.com/gh/byavv/200Loc-gate.svg?style=shield
[circle-url]: https://circleci.com/gh/byavv/200Loc-gate
[codecov-url]: https://codecov.io/gh/byavv/200Loc-gate
[codecov-image]: https://codecov.io/gh/byavv/200Loc-gate/branch/master/graph/badge.svg
