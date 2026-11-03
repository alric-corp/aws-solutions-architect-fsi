// One collection boundary shared by the generator, templates and browser.
// Publication is independent: standalone documents remain public at old URLs.
export const caseCollection = Object.freeze({
  id: 'fsi-cases', sourcePrefix: 'cases/', urlPrefix: '/cases/',
  indexUrl: '/cases/index.html', label: 'Cases FSI'
});
export function isStandaloneReference(value) {
  if (typeof value !== 'string') return false;
  let reference = value.replace(/^legacy:/, '').split(/[?#]/, 1)[0];
  try { reference = decodeURIComponent(reference); } catch { return false; }
  return reference.startsWith(caseCollection.sourcePrefix) || reference.startsWith(caseCollection.urlPrefix);
}
export function collectionMetadataFor(source, audience = 'student') {
  const standalone = isStandaloneReference(source);
  return {
    collection: standalone ? caseCollection.id : 'main',
    standalone,
    search: !standalone && audience === 'student',
    progress: !standalone && audience === 'student'
  };
}
export const isStandalone = doc => Boolean(doc?.standalone || doc?.collection === caseCollection.id);
export const participatesInMainStudy = doc => Boolean(doc && !isStandalone(doc) && doc.progress !== false && doc.audience !== 'instructor' && doc.publication === 'public');
export const continuityScopeFor = doc => isStandalone(doc) ? caseCollection.id : doc?.audience === 'instructor' ? 'instructor' : 'student';
export const belongsToMainJourney = doc => Boolean(doc && !isStandalone(doc));
export const mainSections = sections => sections.filter(section => !isStandaloneReference(section.index));
