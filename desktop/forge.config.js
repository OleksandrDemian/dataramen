module.exports = {
  packagerConfig: {
    icon: 'assets/icon',
  },
  makers: [
    {
      name: '@electron-forge/maker-dmg',
      config: {},
    },
  ],
};
