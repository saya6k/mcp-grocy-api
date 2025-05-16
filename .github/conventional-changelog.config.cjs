'use strict';

module.exports = {
  types: [
    { type: 'feat', section: 'Features' },
    { type: 'fix', section: 'Bug Fixes' },
    { type: 'docs', section: 'Documentation' },
    { type: 'style', hidden: true },
    { type: 'refactor', section: 'Code Refactoring' },
    { type: 'perf', section: 'Performance Improvements' },
    { type: 'test', section: 'Tests' },
    { type: 'build', section: 'Build System' },
    { type: 'ci', section: 'Continuous Integration' },
    { type: 'chore', hidden: true },
    { type: 'revert', section: 'Reverts' }
  ]
};
