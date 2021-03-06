/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';

import PropTypes from 'prop-types';
import { getGoogleMercatorScales } from '../../utils/MapUtils';
import { findDOMNode } from 'react-dom';
import { DropdownList } from 'react-widgets';
import { Row, Col, Overlay, Popover, Label } from 'react-bootstrap';
import { getMessageById } from '../../utils/LocaleUtils';
import Message from '../I18N/Message';

class ScaleDenominator extends React.Component {
    static propTypes = {
        minValue: PropTypes.number,
        maxValue: PropTypes.number,
        onChange: PropTypes.func.isRequired
    };

    static contextTypes = {
        messages: PropTypes.object
    };

    static defaultProps = {
        minValue: null,
        maxValue: null,
        onChange: () => null
    };

    state = {error: false};

    UNSAFE_componentWillMount() {
        let scales = getGoogleMercatorScales(0, 21);
        this.scales = [{value: null, text: getMessageById(this.context.messages, "scaledenominator.none") || 'None'}, ...scales.map((v) => ({value: v, text: `${v.toFixed(0)}`}))];
    }

    onChange = (t, {value: v}) => {
        if (t === 'minDenominator' && this.props.maxValue && v >= this.props.maxValue) {
            this.setState({error: {type: t, msg: "scaledenominator.minerror"}});
        } else if (t === 'maxDenominator' && this.props.minValue && v <= this.props.minValue) {
            this.setState({error: {type: t, msg: "scaledenominator.maxerror"}});
        } else {
            if (this.state.error) {
                this.setState({error: false});
            }
            this.props.onChange(t, v);
        }
    };

    renderErrorPopOver = () => {
        return (
            <Overlay
                target={() => findDOMNode(this.refs[this.state.error.type])}
                show placement="top" >
                <Popover id={`${this.state.error.type}_id`}>
                    <Label bsStyle="danger" > <Message msgId={this.state.error.msg}/></Label>
                </Popover>
            </Overlay>
        );
    };

    render() {
        return (<Row>
            <Col xs={6}>
                <label><Message msgId="scaledenominator.minlabel"/></label>
                <DropdownList
                    ref="minDenominator"
                    data={this.scales}
                    value={this.props.minValue}
                    valueField="value"
                    textField="text"
                    onChange={(v) => this.onChange("minDenominator", v)}
                />
            </Col>
            <Col xs={6}>
                <label><Message msgId="scaledenominator.maxlabel"/></label>
                <DropdownList
                    ref="maxDenominator"
                    data={this.scales}
                    value={this.props.maxValue}
                    valueField="value"
                    textField="text"
                    onChange={(v) => this.onChange("maxDenominator", v)}
                />
            </Col>
            {(this.state.error) ? this.renderErrorPopOver() : null}
        </Row>)
        ;
    }
}

export default ScaleDenominator;
