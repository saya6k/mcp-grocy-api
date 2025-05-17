/**
 * Version compatibility checker for Grocy API
 */

/**
 * Compares version strings (semantic versioning)
 * @param {string} v1 - Version 1
 * @param {string} v2 - Version 2
 * @returns {number} -1 if v1 < v2, 0 if v1 = v2, 1 if v1 > v2
 */
const compareVersions = (v1, v2) => {
  const parts1 = v1.split('.').map(Number);
  const parts2 = v2.split('.').map(Number);
  
  for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
    const part1 = i < parts1.length ? parts1[i] : 0;
    const part2 = i < parts2.length ? parts2[i] : 0;
    
    if (part1 < part2) return -1;
    if (part1 > part2) return 1;
  }
  
  return 0;
};

/**
 * Checks if the Grocy API version is compatible with our implementation
 * @param {string} grocyVersion - Current Grocy API version
 * @returns {{ isCompatible: boolean, warnings: string[], criticalIssues: string[] }} Compatibility status
 */
const checkGrocyVersion = (grocyVersion) => {
  const warnings = [];
  const criticalIssues = [];
  
  // Current supported version range
  const minVersion = '3.3.0';
  const maxTestedVersion = '4.5.0';
  const dataTypeChangeVersion = '4.0.0';  // Version where numeric data types changed
  
  if (!grocyVersion) {
    criticalIssues.push('Could not determine Grocy version');
    return { isCompatible: false, warnings, criticalIssues };
  }
  
  // Remove any text after the version number
  const numericVersion = grocyVersion.match(/^(\d+\.\d+\.\d+)/);
  const cleanVersion = numericVersion ? numericVersion[1] : grocyVersion;
  
  if (compareVersions(cleanVersion, minVersion) < 0) {
    criticalIssues.push(`Grocy version ${cleanVersion} is older than minimum supported version ${minVersion}`);
  }
  
  if (compareVersions(cleanVersion, maxTestedVersion) > 0) {
    warnings.push(`Grocy version ${cleanVersion} is newer than the highest tested version ${maxTestedVersion}. Some features may not work correctly.`);
  }
  
  // Specific warning about data type changes
  if (compareVersions(cleanVersion, dataTypeChangeVersion) >= 0) {
    warnings.push(`Grocy version ${cleanVersion} uses numeric values without quotes in API responses. Ensure data type handling is implemented.`);
  }
  
  return { 
    isCompatible: criticalIssues.length === 0,
    warnings,
    criticalIssues
  };
};

module.exports = {
  compareVersions,
  checkGrocyVersion
};