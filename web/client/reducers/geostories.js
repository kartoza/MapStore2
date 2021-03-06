/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { MAPS_LIST_LOADING } from '../actions/maps';

import { LOCATION_CHANGE } from 'connected-react-router';
import { GEOSTORIES_LIST_LOADED, SET_GEOSTORIES_AVAILABLE, LOADING } from '../actions/geostories';
import { set } from '../utils/ImmutableUtils';
import { castArray } from 'lodash';

function geostories(state = {
    enabled: false,
    start: 0,
    limit: 12,
    errors: [],
    searchText: ""
}, action) {
    switch (action.type) {
    case SET_GEOSTORIES_AVAILABLE: {
        return set("available", action.available, state);
    }
    case LOCATION_CHANGE: {
        return set('showModal', {}, state);
    }
    case GEOSTORIES_LIST_LOADED:
        return {
            ...state,
            results: action.results !== "" ? castArray(action.results) : [],
            success: action.success,
            totalCount: action.totalCount,
            start: action.params && action.params.start,
            limit: action.params && action.params.limit,
            searchText: action.searchText,
            options: action.options
        };
    case MAPS_LIST_LOADING:
        return {
            ...state,
            start: action.params && action.params.start,
            limit: action.params && action.params.limit,
            searchText: action.searchText
        };
    case LOADING: {
        // anyway sets loading to true
        return set(action.name === "loading" ? "loading" : `loadFlags.${action.name}`, action.value, set(
            "loading", action.value, state
        ));
    }
    default:
        return state;
    }
}

export default geostories;
