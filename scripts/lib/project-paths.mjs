// The cover keeps its public URL while the source lives with repository assets.
export const coverAssetPath = 'assets/amazon.jpg';

// Historical local audits recorded the old source location. Resolve that path
// centrally and retain the original byte/hash checks at the new location.
export const currentSourcePath = file => file === 'amazon.jpg' ? coverAssetPath : file;
