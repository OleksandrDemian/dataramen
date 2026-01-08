module.exports = {
  packagerConfig: {
    icon: 'assets/icon',
    osxSign: false,
    osxNotarize: false,

    win32metadata: {
      CompanyName: "DataRamen",
      FileDescription: "DataRamen",
      ProductName: "DataRamen",
    }
  },
  makers: [
    {
      name: '@electron-forge/maker-dmg',
      platforms: ['darwin'],
      config: {},
    },
    {
      name: '@electron-forge/maker-squirrel',
      platforms: ['win32'],
      config: {},
    },
  ],
};
