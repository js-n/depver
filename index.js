#!/usr/bin/env node
// @ts-check
const select = require('cssauron-json')
const jsonParse = require('json-parse-stream')
const spawn = require('child_process').spawn
const semver = require('semver')
const through = require('through2').obj
const yargs = require('yargs')

const argv = yargs.argv
argv.selector = argv.selector || argv._[0]
if (argv.selector && !argv.selector.startsWith('.')) {
  argv.selector = '.' + argv.selector
}
const predicate = argv.gt ? 'gt' :
  argv.gte ? 'gte' :
  argv.eq ? 'eq' :
  argv.neq ? 'neq' :
  argv.lt ? 'lt' :
  argv.lte ? 'lte' :
  argv.satisfies ? 'satisfies' :
  null

const quantifier = argv.all ? 'all' :
  argv.every ? 'all' :
  argv.any ? 'any' :
  argv.some ? 'any' :
  null

const verbose = (!predicate && !quantifier) || argv.v || argv.verbose
// console.log(argv, predicate, quantifier, verbose)

const state = {
  any: false,
  all: true,
  count: 0,
  match: 0
}


function match(selector, node) {
  if (!match[selector]) {
    match[selector] = select(selector)
  }
  return match[selector](node)
}

function normalizeSemver(raw) {
  // whatever
  return (new semver.Range(String(raw))).set[0][0].semver.raw
}

const filter = through(function(node, _, cb) {
    let keep = match('.dependencies > *', node)
    state.count += keep ? 1 : 0
    if (argv.selector) {
      keep = keep && match(argv.selector, node)
      state.match += keep ? 1 : 0
    }

    if (keep) {
      this.push(node)
    }
    cb()
  })


spawn('npm', ['ls', '--json'])
  .stdout
  .pipe(jsonParse())
  .pipe(filter)
  .on('data', node => {
    if (predicate) {
      const m = semver[predicate](node.value.version, normalizeSemver(argv[predicate]))
      verbose && console.log(node.key, node.value.version, m)
      state.any = state.any || m
      state.all = state.all && m
    } else {
      state.any = true
      state.all = false
      verbose && console.log(node.key, node.value.version)
    }
  })
  .on('end', () => {
    if (quantifier == 'any' && !state.any) {
      verbose && console.log('none of ' + state.count + ' dependencies matched ' + predicate + ' ' + argv[predicate])
      process.exit(1)
    }
    if (quantifier == 'all' && !state.all) {
      verbose && console.log('not every dependency matched ' + predicate + ' ' + argv[predicate])
      process.exit(1)
    }
  })
