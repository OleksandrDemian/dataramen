/**
 * use this for some internal stuff, where the collision probability is low
 */
export const genSimpleId = () => Date.now().toString(36) + Math.random().toString(36).substring(2);
