# depver
a utility for checking node_modules dependency versions

## usage
```
> npx depver <selector?> <quantifier?> <predicate?> <options?>
```
e.g.
```
> npx depver through --all --gte 2.3.4 --verbose
through 2.2.7 false
through 2.2.7 false
none of 2 dependencies matched lt 2
```

## selector
this can be omitted. if no selector is specified, we'll check over every dependency in the tree.

in the simple case, this is the name of the dependency you're checking for. we can list
every instance of `through` in the tree by running
```
> npx depver through --verbose
through 2.2.7
through 2.2.7
```

for advanced use cases, we support full [cssauron-json selectors](https://www.npmjs.com/package/cssauron-json)
for example, we can list all of the dependencies rooted in `string-width`:
```
> npx . ".string-width *" --verbose
code-point-at 1.1.0
number-is-nan 1.0.1
is-fullwidth-code-point 1.0.0
strip-ansi 3.0.1
code-point-at 1.1.0
is-fullwidth-code-point 1.0.0
strip-ansi 3.0.1
is-fullwidth-code-point 2.0.0
ansi-regex 3.0.0
strip-ansi 4.0.0
```

## quantifier
if a quantifier is specified, `depver` will exit `0` if the test is satisfied, or `1` if the test fails.

- `--any` (alias `--some`): true if at least one dependency matches the test
- `--all` (alias `--every`): true if every dependency matches the test

for example, to test if there is a dependency on `yargs`:
```
> npx depver yargs --any && echo this package depends on yargs || echo yargs not found
this package depends on yargs
```

## predicate
this tests for conditions matched against the dependency versions

supported tests (from the [semver package](https://www.npmjs.com/package/semver):
- gt
- gte
- eq
- neq
- lt
- lte
- satisfies (on a semver range)

e.g. to list all instances of through greater than or equal to 2.0.0:
```
> npx depver through --gt 2 --verbose
through 2.2.7 true
through 2.2.7 true
```

## options

- `--verbose` (alias `-v`)

if a predicate or quantifier is specified, this defaults to `true`, otherwise you must supply this flag if you want printed output. the exit code from `depver` can be useful for scripting.


## note on output format
this may change without warning in the semver of this package. do not write scripts which depend on
the stdout.

the exit codes are supported and will not change, ever, in `depver`. any changes will result i a package name change.

##
thanks for reading this far!

license ISC
