// Imports
const Keycloak = require('keycloak-js');

// Utils
const log = require('./logger')('jwt.js');
const utils = require('./utils');

// Insights Specific
const insightsUrl = require('./insights/url');
const insightsUser = require('./insights/user');

const pub = {};
const priv = {};

pub.login = () => {
    log('Logging in');
    // Redirect to login
    priv.keycloak.login({ redirectUri: location.href });
};

pub.init = (options) => {
    log('Initializing');

    // TODO let users override options
    options.url = insightsUrl();

    priv.keycloak = Keycloak(options);

    priv.keycloak.onTokenExpired = pub.updateToken;

    return priv.keycloak.init(options);
};

pub.logout = () => {
    log('Logging out');

    priv.keycloak.clearToken();

    // Redirect to logout
    priv.keycloak.logout(priv.keycloak);
};

pub.getUser = () => {
    log('Getting user');
    return insightsUser(priv.keycloak.tokenParsed);
};

pub.userReady = () => {
    log(`User ready: ${priv.keycloak.authenticated}`);
    return priv.keycloak.authenticated;
};

pub.updateToken = () => {
    log('Trying to update token');
    priv.keycloak.updateToken().success(function(refreshed) {
        if (refreshed) {
            log('Token was successfully refreshed');
        } else {
            log('Token is still valid');
        }
    }).error(function() {
        log('Failed to refresh the token, or the session has expired');
    });
};

module.exports = pub;
utils.exposeTest(priv);
