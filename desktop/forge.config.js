module.exports = {
  packagerConfig: {
    icon: 'assets/icon',
    appBundleId: 'com.dataramen.desktop',

    // disable signing
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
      config: {
        name: 'dataramen-desktop',
      },
    },
    {
      name: '@electron-forge/maker-squirrel',
      platforms: ['win32'],
      config: {
        name: 'dataramen-desktop',
      },
    },
  ],
};
