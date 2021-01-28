export const isBrowser = () => global.hasOwnProperty('window');

const loadUrl = () => {
    if (isBrowser()) {
        console.log(`*************** window`);
        return require('./detail/url');
    } else {
        console.log(`*************** NO window`);
        return require('url');
    }
};

export const { URL } = loadUrl();
